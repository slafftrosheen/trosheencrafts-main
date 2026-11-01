const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(
  fs.readFileSync(filename, 'utf8'), { fileName: filename, compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText, filename);
let transport;
try { transport = require('../server/lib/workshopTransport.ts'); }
catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
test('delivery transport is implemented', () => assert.ok(transport, 'workshopTransport is missing'));
if (transport) {
  const { telegramRequest, TelegramRequestError, deliveryFailure } = transport;
  const token = '123456789:AA_secret-token-not-for-logs';
  test('transport posts JSON with timeout and returns the Telegram result', async () => {
    const value = await telegramRequest(token, 'sendMessage', { chat_id: '12', text: 'Заказ' }, async (url, init) => {
      assert.ok(url.endsWith('/sendMessage')); assert.equal(init.method, 'POST');
      assert.equal(JSON.parse(init.body).text, 'Заказ'); assert.ok(init.signal);
      return new Response(JSON.stringify({ ok: true, result: { message_id: 42 } }), { status: 200 });
    });
    assert.deepEqual(value, { message_id: 42 });
  });
  test('Telegram flood-control preserves retry_after without exposing the token', async () => {
    await assert.rejects(telegramRequest(token, 'sendMessage', {}, async () => new Response(JSON.stringify({
      ok: false, error_code: 429, description: 'Too many requests ' + token,
      parameters: { retry_after: 7350 },
    }), { status: 429 })), e => {
      assert.ok(e instanceof TelegramRequestError); assert.equal(e.code, 429);
      assert.equal(e.retryAfter, 7350); assert.equal(e.message.includes(token), false);
      const policy = deliveryFailure(e, 200);
      assert.equal(policy.terminal, false); assert.ok(policy.delaySeconds >= 7350);
      assert.equal(policy.cooldown, true); return true;
    });
  });
  test('network exceptions and non-JSON bodies never propagate credential URLs', async () => {
    for (const fetcher of [async () => { throw Error('failed https://api.telegram.org/bot' + token); },
      async () => new Response('proxy failed https://api.telegram.org/bot' + token, { status: 502 })]) {
      await assert.rejects(telegramRequest(token, 'getMe', {}, fetcher), e => {
        assert.ok(e instanceof TelegramRequestError); assert.ok(!String(e).includes(token));
        assert.ok(!String(e).includes('https://')); return true;
      });
    }
  });
  test('400/401/403 are actionable terminal failures, not endless retries', () => {
    for (const code of [400, 401, 403]) {
      const p = deliveryFailure(new TelegramRequestError(code), 1);
      assert.equal(p.terminal, true); assert.equal(p.code, code); assert.ok(p.message.length > 10);
    }
  });
  test('transient failures have capped backoff and stop after twelve consecutive attempts', () => {
    let previous = 0;
    for (let attempt = 1; attempt <= 12; attempt++) {
      const p = deliveryFailure(new TelegramRequestError(503), attempt);
      assert.ok(p.delaySeconds >= previous); assert.ok(p.delaySeconds <= 3600);
      assert.equal(p.terminal, attempt >= 12); previous = p.delaySeconds;
    }
    assert.equal(deliveryFailure(Error('private SQL/customer data'), 1).message.includes('private'), false);
  });
  test('message-is-not-modified remains recognisable and other provider prose is discarded', async () => {
    await assert.rejects(telegramRequest(token, 'editMessageText', {}, async () => new Response(JSON.stringify({
      ok: false, error_code: 400, description: 'Bad Request: message is not modified',
    }), { status: 400 })), /message is not modified/);
  });
  test('malformed successful responses are treated as retryable transport failures', async () => {
    for (const body of ['null', '{}', '{"ok":true}', '{"ok":false,"error_code":"401"}']) {
      await assert.rejects(telegramRequest(token, 'getMe', {}, async () => new Response(body)), TelegramRequestError);
    }
  });
}
let createWorkshopDelivery;
try { ({ createWorkshopDelivery } = require('../server/lib/workshopDelivery.ts')); }
catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
test('delivery worker and recovery service are implemented', () => assert.equal(typeof createWorkshopDelivery, 'function'));

function database(options = {}) {
  const job = { id: '18', order_id: 27, recipient_id: 3, chat_id: '456',
    attempts: 1, attempt_streak: options.attempt || 1, lock_token: 'lease-18' };
  const calls = []; let claims = 0; let released = 0; let sends = 0;
  const query = async (text, values = []) => {
    const tag = /workshop:([\w-]+)/.exec(text)?.[1] || text.trim();
    calls.push({ tag, text, values });
    if (options.fail === tag) throw Error('DB temporarily unavailable');
    switch (tag) {
      case 'lock': return { rows: [{ acquired: !options.locked }], rowCount: 1 };
      case 'unlock': return { rows: [], rowCount: 1 };
      case 'config': return { rows: options.disabled || options.cooldown ? [] : [{ bot_id: '77', bot_token_ciphertext: 'cipher' }], rowCount: 1 };
      case 'claim': return { rows: claims++ === 0 ? [job] : [], rowCount: claims === 1 ? 1 : 0 };
      case 'preflight': return { rows: options.revoked || options.replaced ? [] : [{ status: options.orderStatus || 'processing', payment_method_id: options.unpaid ? null : 'checkout' }], rowCount: 1 };
      case 'sent': return { rows: [], rowCount: options.staleLease ? 0 : 1 };
      case 'skip': case 'release': case 'failure': case 'cooldown': return { rows: [], rowCount: 1 };
      case 'admin': return { rows: options.notAdmin ? [] : [{ id: 2 }], rowCount: options.notAdmin ? 0 : 1 };
      case 'retry-config': return { rows: options.disabled ? [] : [{ id: 1 }], rowCount: options.disabled ? 0 : 1 };
      case 'retry-job': return { rows: options.missing ? [] : [{ id: '18', can_retry: !options.unretryable }], rowCount: options.missing ? 0 : 1 };
      case 'retry': return { rows: [{ id: '18' }], rowCount: 1 };
      case 'BEGIN': case 'COMMIT': case 'ROLLBACK': return { rows: [], rowCount: 0 };
      default: throw Error('Unexpected SQL: ' + tag);
    }
  };
  return {
    pool: { query, connect: async () => {
      if (options.connectFails) throw Error('connect offline');
      return { query, release: () => released++ };
    } },
    deps: {
      decrypt: () => 'secret-token',
      render: async () => options.renderMissing ? null : { text: 'Оплаченный заказ', reply_markup: { inline_keyboard: [] } },
      send: async () => { sends++; if (options.sendError) throw options.sendError; return { message_id: 99 }; },
    },
    inspect: () => ({ calls, released, sends }),
  };
}
if (createWorkshopDelivery && transport) {
  test('records successful send with matching lease, outside the send-error handler', async () => {
    const db = database(); await createWorkshopDelivery(db.pool).deliver(db.deps);
    assert.equal(db.inspect().sends, 1);
    const receipt = db.inspect().calls.find(x => x.tag === 'sent');
    assert.ok(receipt); assert.ok(receipt.text.includes('lock_token'));
    assert.ok(receipt.values.includes('lease-18')); assert.ok(receipt.values.includes(99));
    assert.equal(db.inspect().released, 1);
  });
  test('an unavailable database does not latch the worker permanently', async () => {
    const db = database({ connectFails: true }); const svc = createWorkshopDelivery(db.pool);
    await assert.rejects(svc.deliver(db.deps), /connect offline/);
    await assert.rejects(svc.deliver(db.deps), /connect offline/);
  });
  for (const [name, opts] of [['another worker holds the lock',{locked:true}],['bot disabled',{disabled:true}],['persisted cooldown',{cooldown:true}]]) {
    test('does not send when ' + name, async () => {
      const db = database(opts); await createWorkshopDelivery(db.pool).deliver(db.deps);
      assert.equal(db.inspect().sends, 0); assert.equal(db.inspect().released, 1);
    });
  }
  for (const opts of [{revoked:true},{replaced:true}]) {
    test('rechecks recipient and exact bot credentials before every send ' + JSON.stringify(opts), async () => {
      const db = database(opts); await createWorkshopDelivery(db.pool).deliver(db.deps);
      assert.equal(db.inspect().sends, 0);
      assert.ok(db.inspect().calls.some(x => x.tag === 'release'));
      const check = db.inspect().calls.find(x => x.tag === 'preflight');
      assert.ok(check.text.includes('r.enabled')); assert.ok(check.text.includes('bot_token_ciphertext'));
    });
  }
  for (const opts of [{orderStatus:'cancelled'},{orderStatus:'pending'},{unpaid:true},{renderMissing:true}]) {
    test('skips ineligible notifications instead of retrying forever ' + JSON.stringify(opts), async () => {
      const db = database(opts); await createWorkshopDelivery(db.pool).deliver(db.deps);
      assert.equal(db.inspect().sends, 0);
      assert.ok(db.inspect().calls.some(x => x.tag === 'skip'));
      assert.equal(db.inspect().calls.some(x => x.tag === 'failure'), false);
    });
  }
  test('rate limit persists bot cooldown and ends the batch', async () => {
    const db = database({sendError: new transport.TelegramRequestError(429, 7200)});
    await createWorkshopDelivery(db.pool).deliver(db.deps);
    const c = db.inspect().calls;
    assert.ok(c.find(x => x.tag === 'cooldown').values.includes(7200));
    assert.ok(c.find(x => x.tag === 'failure').values.includes(7200));
    assert.equal(c.filter(x => x.tag === 'claim').length, 1);
    assert.ok(c.some(x => x.tag === 'BEGIN')); assert.ok(c.some(x => x.tag === 'COMMIT'));
  });
  test('permanent failure is marked for intervention without exposing raw error', async () => {
    const db = database({sendError:new transport.TelegramRequestError(403)});
    await createWorkshopDelivery(db.pool).deliver(db.deps);
    const update = db.inspect().calls.find(x => x.tag === 'failure');
    assert.ok(update.values.includes(true)); assert.ok(update.values.includes(403));
    assert.ok(update.text.includes('failed_at'));
  });
  test('receipt database failure remains ambiguous; never recorded as a known transport failure', async () => {
    const db = database({fail:'sent'});
    await assert.rejects(createWorkshopDelivery(db.pool).deliver(db.deps), /DB temporarily/);
    assert.equal(db.inspect().sends, 1);
    assert.equal(db.inspect().calls.some(x => x.tag === 'failure'), false);
    assert.equal(db.inspect().released, 1);
  });
  test('lease fencing applies to every job result and expired leases can be reclaimed', async () => {
    for (const opts of [{}, {revoked:true}, {orderStatus:'cancelled'}, {sendError:Error('offline')}]) {
      const db = database(opts); await createWorkshopDelivery(db.pool).deliver(db.deps);
      for (const c of db.inspect().calls.filter(c => ['sent','skip','release','failure'].includes(c.tag))) {
        assert.ok(c.text.includes('lock_token'), c.tag); assert.ok(c.values.includes('lease-18'), c.tag);
      }
      const claim = db.inspect().calls.find(c => c.tag === 'claim');
      assert.ok(claim.text.includes('SKIP LOCKED')); assert.ok(claim.text.includes('locked_until < NOW()'));
      assert.ok(claim.text.includes('failed_at IS NULL')); assert.ok(claim.text.includes('skipped_at IS NULL'));
    }
  });
  test('admin retry validates role, eligibility and records actor without resetting total attempts', async () => {
    const db = database(); await createWorkshopDelivery(db.pool).retry('18', 2);
    const c = db.inspect().calls;
    assert.equal(c[0].tag, 'BEGIN'); assert.equal(c.at(-1).tag, 'COMMIT');
    const mutation = c.find(x => x.tag === 'retry');
    assert.ok(mutation.values.includes(2)); assert.ok(mutation.text.includes('retry_requested_by'));
    assert.ok(mutation.text.includes('GREATEST(NOW()')); assert.ok(mutation.text.includes('delivery_retry_at'));
    assert.ok(!/\bSET attempts\s*=/.test(mutation.text));
    const guard = c.find(x => x.tag === 'retry-job').text;
    for (const term of ['sent_at IS NULL','skipped_at IS NULL','failed_at IS NOT NULL','locked_until','r.enabled','payment_method_id']) assert.ok(guard.includes(term), term);
    assert.equal(db.inspect().released, 1);
  });
  for (const [name, opts, code] of [['revoked admin',{notAdmin:true},403], ['disabled bot',{disabled:true},409],
    ['sent/active/disabled recipient job',{unretryable:true},409], ['missing job',{missing:true},404]]) {
    test('manual retry rejects ' + name, async () => {
      const db = database(opts);
      await assert.rejects(createWorkshopDelivery(db.pool).retry('18',2), {statusCode:code});
      assert.equal(db.inspect().calls.some(x => x.tag === 'retry'), false);
      assert.equal(db.inspect().calls.at(-1).tag, 'ROLLBACK'); assert.equal(db.inspect().released, 1);
    });
  }
  test('invalid IDs never reach SQL', async () => {
    const db = database(); const s = createWorkshopDelivery(db.pool);
    for (const id of ['0','-1','01','1;DROP TABLE','9223372036854775808']) await assert.rejects(s.retry(id,2), {statusCode:400});
    await assert.rejects(s.retry('18',NaN),{statusCode:400});
    assert.equal(db.inspect().calls.length,0);
  });
  test('delivery listing rejects unbounded or unknown filters before SQL', async () => {
    const db = database(); const s = createWorkshopDelivery(db.pool);
    for (const page of [-1, NaN, 100001]) await assert.rejects(s.list(page,'all'), {statusCode:400});
    await assert.rejects(s.list(0,'DROP TABLE'),{statusCode:400});
    assert.equal(db.inspect().calls.length,0);
  });
}
if (createWorkshopDelivery && transport) {
  test('delivery log paginates, preserves bigint IDs and excludes secret/customer fields', async () => {
    const calls = [];
    const svc = createWorkshopDelivery({ query: async (sql, params = []) => {
      calls.push({sql,params});
      if (sql.includes('workshop:meta')) return {rows:[{enabled:true,cooldown:new Date('2026-11-02T08:00:00Z')}],rowCount:1};
      if (sql.includes('workshop:summary')) return {rows:[{pending:'4',retrying:'2',failed:'1',sent:'22',skipped:'1',last_sent_at:new Date('2026-11-01T08:00:00Z')}],rowCount:1};
      if (sql.includes('workshop:list')) return {rows:Array.from({length:21}, (_,i)=>({
        id:String(9007199254740993n+BigInt(i)),order_id:27,display_name:'Олег',recipient_enabled:true,
        attempts:1,attempt_streak:1,last_error_code:403,has_error:true,can_retry:true,state:'failed',
        available_at:new Date('2026-11-01T09:00:00Z'),sent_at:null,retry_requested_at:null,
        last_error:'https://api.telegram.org/botSECRET CUSTOMER-EMAIL',chat_id:'PRIVATE',bot_token_ciphertext:'PRIVATE',
      })),rowCount:21};
      throw Error('unexpected query');
    }});
    const report = await svc.list(2,'attention');
    assert.equal(report.entries.length,20); assert.equal(report.hasNext,true);
    assert.equal(report.entries[0].id,'9007199254740993'); assert.equal(report.summary.pending,4);
    assert.equal(report.cooldownUntil,'2026-11-02T08:00:00.000Z');
    assert.deepEqual(calls.find(x=>x.sql.includes('workshop:list')).params,[40]);
    for (const secret of ['SECRET','CUSTOMER-EMAIL','PRIVATE','bot_token_ciphertext','chat_id']) assert.ok(!JSON.stringify(report).includes(secret));
    assert.match(report.entries[0].lastError,/разблокировать/);
  });
  test('unconfigured bot and empty log return a usable empty state', async () => {
    const service = createWorkshopDelivery({query:async()=>({rows:[],rowCount:0})});
    const r=await service.list(0,'all');
    assert.equal(r.enabled,false); assert.equal(r.configured,false); assert.equal(r.hasNext,false);
    assert.deepEqual(r.entries,[]); assert.equal(r.summary.pending,0); assert.equal(r.summary.lastSentAt,null);
  });
  test('overlapping ticks in one process do not send the same job twice', async () => {
    const db=database(); let open;
    const barrier = new Promise(resolve=>open=resolve);
    let sends=0;
    db.deps.send=async()=>{sends++;await barrier;return {message_id:99};};
    const service=createWorkshopDelivery(db.pool);
    const first=service.deliver(db.deps);
    while (!sends) await new Promise(resolve=>setImmediate(resolve));
    await service.deliver(db.deps); open(); await first;
    assert.equal(sends,1);
  });
  test('cooldown persistence failure rolls back and releases the worker connection', async () => {
    const db=database({fail:'cooldown',sendError:new transport.TelegramRequestError(429,60)});
    await assert.rejects(createWorkshopDelivery(db.pool).deliver(db.deps),/DB temporarily/);
    assert.ok(db.inspect().calls.some(x=>x.tag==='ROLLBACK'));
    assert.equal(db.inspect().released,1);
  });
  test('delivery recovery routes and admin view are wired, authenticated and confirmation-gated', () => {
    const routes=fs.readFileSync(require('node:path').join(__dirname,'../server/routes/telegramWorkshop.ts'),'utf8');
    assert.ok(routes.indexOf('use(adminAuthMiddleware)') < routes.indexOf('get("/deliveries"'));
    assert.ok(routes.includes('z.literal(true)')); assert.ok(routes.includes('Number(req.user?.id)'));
    assert.ok(routes.includes('Cache-Control')); assert.ok(routes.includes('no-store'));
    const settings=fs.readFileSync(require('node:path').join(__dirname,'../client/src/components/admin/TelegramOrdersSettings.tsx'),'utf8');
    assert.ok(settings.includes('<TelegramDeliveryStatus />'));
    const ui=fs.readFileSync(require('node:path').join(__dirname,'../client/src/components/admin/TelegramDeliveryStatus.tsx'),'utf8');
    for (const text of ['AlertDialog','canConfirm','query.isPlaceholderData','confirm: true','type="button"','Europe/Riga']) assert.ok(ui.includes(text),text);
  });
  test('new SQL migration only adds notification metadata and indexes', () => {
    const migration=fs.readFileSync(require('node:path').join(__dirname,'../migrations/0016_workshop_delivery_recovery.sql'),'utf8');
    assert.ok(!/DROP TABLE|DELETE FROM|UPDATE orders|UPDATE products/.test(migration));
    for(const column of ['failed_at','skipped_at','lock_token','attempt_streak','delivery_retry_at','retry_requested_by']) assert.ok(migration.includes(column));
  });
}
test('all delivery TS/TSX modules parse and transpile', () => {
  for(const path of ['shared/workshopDelivery.ts','server/lib/workshopTransport.ts','server/lib/workshopDelivery.ts',
    'server/lib/telegramWorkshop.ts','server/routes/telegramWorkshop.ts','client/src/components/admin/TelegramOrdersSettings.tsx',
    'client/src/components/admin/TelegramDeliveryStatus.tsx']) {
    const result=ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname,'..',path),'utf8'),{
      fileName:path,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}
    });
    assert.deepEqual((result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error),[],path);
  }
});
