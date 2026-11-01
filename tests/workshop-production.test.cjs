const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
// The project already has TypeScript. No Telegram token or database is needed.
require.extensions['.ts'] = (module, file) => {
  const result = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: file,
  });
  module._compile(result.outputText, file);
};
const domainPath = '../shared/workshopProduction.ts';
let domain;
try { domain = require(domainPath); } catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
}
test('production domain is implemented', () => assert.ok(domain, 'production domain is missing'));
if (domain) {
  test('manufacturing has three explicit forward steps and a correction path', () => {
    assert.equal(domain.productionTarget('not_started', 'start'), 'in_progress');
    assert.equal(domain.productionTarget('in_progress', 'finish'), 'completed');
    assert.equal(domain.productionTarget('completed', 'ready'), 'ready_to_ship');
    assert.equal(domain.productionTarget('completed', 'reopen'), 'in_progress');
    assert.equal(domain.productionTarget('ready_to_ship', 'reopen'), 'in_progress');
    for (const [status, action] of [['not_started','ready'],['not_started','finish'],['completed','start'],['in_progress','reopen'],['ready_to_ship','ready'],['unknown','start']]) {
      assert.equal(domain.productionTarget(status, action), null);
    }
  });
  test('only verified, processing orders can change manufacturing', () => {
    assert.equal(domain.canManufacture('processing', 'checkout-id'), true);
    assert.equal(domain.canManufacture('processing', null), false);
    for (const status of ['pending', 'payment_review', 'payment_confirming', 'cancelled', 'shipped', 'delivered']) {
      assert.equal(domain.canManufacture(status, 'checkout-id'), false);
    }
  });
  test('callbacks are exact, bounded and fit the Telegram byte limit', () => {
    for (const action of ['start','finish','ready','reopen']) {
      const data = domain.productionCallback(2147483647, 'confirm', action, 2147483646);
      assert.ok(Buffer.byteLength(data, 'utf8') <= 64);
      assert.deepEqual(domain.parseProductionCallback(data), { orderId: 2147483647, mode: 'confirm', action, version: 2147483646 });
    }
    assert.deepEqual(domain.parseProductionCallback('wp:27:view'), { orderId: 27, mode: 'view' });
    assert.deepEqual(domain.parseProductionCallback('wp:27:history:2'), { orderId: 27, mode: 'history', page: 2 });
    for (const data of ['wp:0:view','wp:-1:view','wp:1:confirm:start:-1','wp:1:confirm:paid:0','wp:1:confirm:start:0:extra','wp:2147483648:view','wp:1:history:NaN','wp:1:history:100001']) {
      assert.equal(domain.parseProductionCallback(data), null, data);
    }
  });
}
let createWorkshopProduction;
try { ({ createWorkshopProduction } = require('../server/lib/workshopProduction.ts')); } catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
}
test('transactional manufacturing service is implemented', () => assert.equal(typeof createWorkshopProduction, 'function'));

function fakeDatabase(options = {}) {
  let state = { status: options.status || 'not_started', version: options.version || 0 };
  let events = [];
  const calls = [];
  let backup;
  let released = 0;
  const query = async (sql, values = []) => {
    const text = sql.replace(/\s+/g, ' ').trim();
    calls.push({ text, values });
    if (text === 'BEGIN') { backup = { state: { ...state }, events: [...events] }; return { rows: [], rowCount: 0 }; }
    if (text === 'ROLLBACK') { state = backup.state; events = backup.events; return { rows: [], rowCount: 0 }; }
    if (text === 'COMMIT') return { rows: [], rowCount: 0 };
    if (text.includes('FROM users') || text.includes('FROM telegram_workshop_recipients')) return { rows: options.revoked ? [] : [{ name: 'Олег <Мастер>' }], rowCount: options.revoked ? 0 : 1 };
    if (text.includes('FROM telegram_workshop_config')) return { rows: options.botDisabled ? [] : [{ id: 1 }], rowCount: options.botDisabled ? 0 : 1 };
    if (text.includes('FOR UPDATE OF o')) return { rows: options.missing ? [] : [{ status: options.orderStatus || 'processing', payment_method_id: options.unpaid ? null : 'checkout-id' }], rowCount: options.missing ? 0 : 1 };
    if (text.startsWith('INSERT INTO order_production (')) return { rows: [], rowCount: 0 };
    if (text.startsWith('SELECT status, version FROM order_production')) return { rows: [{ ...state }], rowCount: 1 };
    if (text.startsWith('UPDATE order_production SET')) {
      state = { status: values[1], version: state.version + 1 };
      return { rows: [{ ...state, updated_at: new Date('2026-11-01T07:00:00Z') }], rowCount: 1 };
    }
    if (text.startsWith('INSERT INTO order_production_events')) {
      if (options.auditFails) throw Error('audit storage unavailable');
      events.push(values); return { rows: [], rowCount: 1 };
    }
    throw new Error('Unexpected SQL: ' + text);
  };
  return {
    pool: { query, connect: async () => {
      if (options.connectFails) throw Error('database offline');
      return { query, release: () => { released++; } };
    } },
    inspect: () => ({ state, events, calls, released }),
  };
}
if (createWorkshopProduction) {
  const actor = { kind: 'telegram', id: '123456', botId: '99999' };
  test('successful change records actor and revision in one transaction without changing payment', async () => {
    const db = fakeDatabase();
    await createWorkshopProduction(db.pool).change(27, 'start', 0, actor);
    const { state, events, calls, released } = db.inspect();
    assert.deepEqual(state, { status: 'in_progress', version: 1 });
    assert.equal(events.length, 1);
    assert.ok(events[0].includes('Олег <Мастер>'));
    assert.equal(calls[0].text, 'BEGIN');
    assert.equal(calls.at(-1).text, 'COMMIT');
    assert.equal(released, 1);
    assert.equal(calls.some(({text}) => /UPDATE orders|UPDATE products/.test(text)), false);
    assert.ok(calls.some(({text}) => text.includes('FOR UPDATE OF o')));
  });
  test('repeat tap/stale version does not record another event or advance twice', async () => {
    const db = fakeDatabase(); const service = createWorkshopProduction(db.pool);
    await service.change(27, 'start', 0, actor);
    await assert.rejects(service.change(27, 'start', 0, actor), { statusCode: 409 });
    assert.equal(db.inspect().events.length, 1);
    assert.deepEqual(db.inspect().state, { status: 'in_progress', version: 1 });
  });
  test('audit insert failure rolls back state and releases the same connection', async () => {
    const db = fakeDatabase({ auditFails: true });
    await assert.rejects(createWorkshopProduction(db.pool).change(27, 'start', 0, actor), /audit storage/);
    assert.deepEqual(db.inspect().state, { status: 'not_started', version: 0 });
    assert.equal(db.inspect().calls.at(-1).text, 'ROLLBACK');
    assert.equal(db.inspect().released, 1);
  });
  for (const [label, options, code] of [
    ['revoked Telegram staff', { revoked: true }, 403],
    ['disabled or replaced bot', { botDisabled: true }, 403],
    ['pending order', { orderStatus: 'pending' }, 409],
    ['stock review', { orderStatus: 'payment_review' }, 409],
    ['shipped order', { orderStatus: 'shipped' }, 409],
    ['missing payment reference', { unpaid: true }, 409],
    ['missing order', { missing: true }, 404],
  ]) {
    test('rejects ' + label + ' without mutation', async () => {
      const db = fakeDatabase(options);
      await assert.rejects(createWorkshopProduction(db.pool).change(27, 'start', 0, actor), { statusCode: code });
      assert.equal(db.inspect().events.length, 0);
      assert.deepEqual(db.inspect().state, { status: 'not_started', version: 0 });
      assert.equal(db.inspect().released, 1);
    });
  }
  test('rejects step skipping and invalid input', async () => {
    const db = fakeDatabase(); const service = createWorkshopProduction(db.pool);
    await assert.rejects(service.change(27, 'ready', 0, actor), { statusCode: 409 });
    await assert.rejects(service.change(-1, 'start', 0, actor), { statusCode: 400 });
    await assert.rejects(service.change(27, 'start', NaN, actor), { statusCode: 400 });
    assert.equal(db.inspect().events.length, 0);
  });
  test('administrator authority is independently rechecked', async () => {
    const db = fakeDatabase({ revoked: true });
    await assert.rejects(createWorkshopProduction(db.pool).change(27, 'start', 0, {kind:'admin',id:'1'}), { statusCode: 403 });
    assert.ok(db.inspect().calls.some(({text}) => text.includes('FROM users')));
  });
  test('connection acquisition failure does not execute an update', async () => {
    const db = fakeDatabase({ connectFails: true });
    await assert.rejects(createWorkshopProduction(db.pool).change(27, 'start', 0, actor), /database offline/);
    assert.equal(db.inspect().events.length, 0);
  });
}
let handleProductionCommand;
try { ({ handleProductionCommand } = require('../server/lib/workshopTelegram.ts')); } catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
}
test('Telegram manufacturing controller is implemented', () => assert.equal(typeof handleProductionCommand, 'function'));
if (handleProductionCommand) {
  const actor = {kind:'telegram',id:'123',botId:'999'};
  const snapshot = () => ({ orderId: 27, orderStatus:'processing', status:'not_started', version:0, editable:true, updatedAt:null, history:[], historyPage:0, historyHasMore:false });
  test('opening confirmation does not change state; confirm sends original version', async () => {
    let changes = 0; let state = snapshot();
    const service = { get: async () => state, change: async (...args) => {
      changes++; assert.deepEqual(args, [27,'start',0,actor]);
      state = {...state,status:'in_progress',version:1};
    }};
    const asked = await handleProductionCommand(service, 'wp:27:ask:start:0', actor);
    assert.equal(changes,0);
    assert.match(asked.text, /Начать изготовление/);
    assert.ok(asked.buttons.flat().some(b => b.callback_data === 'wp:27:confirm:start:0'));
    const changed = await handleProductionCommand(service, 'wp:27:confirm:start:0', actor);
    assert.equal(changes,1); assert.match(changed.text,/В работе/);
  });
  test('stale confirmation is read-only and offers current state', async () => {
    let changes = 0;
    const service = { get: async () => ({...snapshot(),status:'in_progress',version:1}), change: async () => changes++ };
    const result = await handleProductionCommand(service,'wp:27:confirm:start:0',actor);
    assert.equal(changes,0); assert.match(result.text,/уже изменён/);
    assert.ok(result.buttons.flat().some(b => b.callback_data === 'wp:27:ask:finish:1'));
  });
  test('stock-review cards never offer manufacturing actions', async () => {
    const result = await handleProductionCommand({get:async()=>({...snapshot(),orderStatus:'payment_review',editable:false})},'wp:27:view',actor);
    assert.equal(result.buttons.flat().some(b => b.callback_data.includes(':ask:')), false);
    assert.match(result.text,/проверки/);
  });
  test('revocation during confirmation does not reveal production history', async () => {
    const service = {get:async()=>snapshot(),change:async()=>{throw new domain.WorkshopError(403,'Доступ закрыт.');}};
    const result = await handleProductionCommand(service,'wp:27:confirm:start:0',actor);
    assert.match(result.text,/Доступ закрыт/); assert.doesNotMatch(result.text,/Ожидает изготовления/);
  });
  test('history escapes names, paginates and stays inside message bounds', async () => {
    const state = {...snapshot(),historyPage:1,historyHasMore:true,history:[{
      id:'1',fromStatus:'not_started',toStatus:'in_progress',actorType:'telegram',
      actorName:'<b>Олег & сын</b>',createdAt:'2026-11-01T07:00:00Z'
    }]};
    const result = await handleProductionCommand({get:async(_,page)=>{assert.equal(page,1);return state;}},'wp:27:history:1',actor);
    assert.match(result.text,/&lt;b&gt;Олег &amp; сын&lt;\/b&gt;/);
    assert.ok(result.buttons.flat().some(b=>b.callback_data==='wp:27:history:2'));
    assert.ok(result.text.length < 4096);
  });
  test('invalid command cannot invoke a manufacturing write', async () => {
    let called = false;
    await assert.rejects(handleProductionCommand({get:async()=>{called=true;}},'wp:27:confirm:paid:0',actor), {statusCode:400});
    assert.equal(called,false);
  });
}
if (createWorkshopProduction) {
  test('state and paged history are read together and do not create records', async () => {
    const calls = [];
    const history = Array.from({length:9}, (_,i)=>({id:String(i), actorName:'Олег'}));
    const service = createWorkshopProduction({ query:async(sql,params)=>{
      calls.push({sql,params});
      return {rows:[{id:27,order_status:'processing',payment_method_id:'checkout',status:'in_progress',version:3,updated_at:new Date('2026-11-01T07:00:00Z'),history}]};
    }});
    const result = await service.get(27, 2);
    assert.equal(calls.length,1);
    assert.deepEqual(calls[0].params,[27,9,16]);
    assert.equal(result.history.length,8); assert.equal(result.historyHasMore,true);
    assert.equal(result.historyPage,2); assert.equal(result.editable,true);
    assert.equal(result.updatedAt,'2026-11-01T07:00:00.000Z');
    assert.doesNotMatch(calls[0].sql,/INSERT|UPDATE|DELETE/);
  });
  test('invalid history pages and missing orders have deliberate API errors', async () => {
    const service = createWorkshopProduction({query:async()=>({rows:[]})});
    await assert.rejects(service.get(1,-1),{statusCode:400});
    await assert.rejects(service.get(1,0),{statusCode:404});
  });
}
function loadBotInternals(pool) {
  const filename = require('node:path').join(__dirname, '../server/lib/telegramWorkshop.ts');
  const code = ts.transpileModule(fs.readFileSync(filename,'utf8'), {
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},fileName:filename,
  }).outputText;
  const module = {exports:{}};
  const requireBot = (name) => {
    if (name === '../db') return {pool,db:{}};
    if (name === '../db/schema') return {};
    if (name === 'drizzle-orm') return {eq:()=>{},sql:()=>{}};
    if (name === './workshopProduction') return require('../server/lib/workshopProduction.ts');
    if (name === './workshopTelegram') return require('../server/lib/workshopTelegram.ts');
    if (name === '../../shared/workshopProduction') return domain;
    return require(name);
  };
  new Function('require','module','exports','console', code + '\nexports.internals = {poll, listOrders};')(
    requireBot,module,module.exports,{log(){},error(){}}
  );
  return module.exports.internals;
}
test('Telegram polling recovers after pool.connect rejects instead of staying latched', async () => {
  let connected=0, released=0;
  const pool = {connect:async()=>{
    connected++; if(connected===1) throw Error('database temporarily offline');
    return {query:async()=>({rows:[{acquired:false}]}),release:()=>released++};
  }};
  const bot = loadBotInternals(pool);
  await bot.poll(); await bot.poll();
  assert.equal(connected,2); assert.equal(released,1);
});
test('changed TypeScript/TSX modules parse and transpile', () => {
  const root = require('node:path').join(__dirname, '..');
  const paths = ['shared/workshopProduction.ts','server/lib/workshopProduction.ts',
    'server/lib/workshopTelegram.ts','server/lib/telegramWorkshop.ts','server/routes/telegramWorkshop.ts',
    'client/src/components/admin/OrderProduction.tsx','client/src/pages/admin/Orders.tsx'];
  for (const path of paths) {
    const result = ts.transpileModule(fs.readFileSync(root+'/'+path,'utf8'), {
      fileName:path, reportDiagnostics:true,
      compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX},
    });
    const errors = (result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
    assert.equal(errors.length,0,path+': '+errors.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join('; '));
  }
});
