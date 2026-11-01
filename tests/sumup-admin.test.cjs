const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => {
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  module._compile(compiled.outputText, file);
};
function optional(path) { try { return require(path); } catch(e) { if(e.code !== 'MODULE_NOT_FOUND') throw e; return {}; } }
const rules = optional('../shared/sumup.ts');
const secrets = optional('../server/lib/sumupSecrets.ts');
const transport = optional('../server/lib/sumupGateway.ts');
const settings = optional('../server/lib/sumupConfiguration.ts');
const payments = optional('../server/lib/sumupPayments.ts');
test('admin SumUp modules are implemented', () => {
  for (const fn of [rules.normalizeSiteOrigin, secrets.createPaymentSecrets, transport.createSumupGateway, settings.createSumupConfiguration, payments.createSumupPayments]) assert.equal(typeof fn, 'function');
});
const KEY = 'sup_sk_' + 's'.repeat(40);
const ENV = { SESSION_SECRET: 'server-only-encryption-secret-'.repeat(3) };
test('site origin requires a public HTTPS domain and rejects arbitrary callback paths', () => {
  assert.equal(rules.normalizeSiteOrigin('https://trosheen.shop/'), 'https://trosheen.shop');
  for (const value of ['http://trosheen.shop', 'https://user:pass@trosheen.shop', 'https://localhost', 'https://127.0.0.1', 'https://192.168.1.2', 'https://[::1]', 'https://trosheen.shop/a', 'https://trosheen.shop?token=x', 'https://trosheen.shop/#x', 'https://foo.local']) {
    assert.throws(() => rules.normalizeSiteOrigin(value), { code: 'INVALID_SITE_URL' }, value);
  }
});
test('money validation is exact and rejects rounded mismatches', () => {
  assert.equal(rules.eurCents('12.30'), 1230); assert.equal(rules.eurCents(12.3), 1230);
  for (const value of [NaN,Infinity,-1,0,'1.001','1e2',true,null,'12foo']) assert.equal(rules.eurCents(value), null);
});
test('public API keys and header control characters cannot be saved', () => {
  assert.equal(rules.normalizeApiKey(' '+KEY+' '), KEY);
  for(const value of ['sup_pk_'+ 'a'.repeat(30), 'abc', KEY+'\nX-Secret: x']) assert.throws(() => rules.normalizeApiKey(value));
});
test('credentials use authenticated encryption scoped to the merchant', () => {
  const crypt = secrets.createPaymentSecrets(ENV);
  const sealed = crypt.seal(KEY, 'M1234567');
  assert.equal(crypt.open(sealed, 'M1234567'), KEY);
  assert.notEqual(sealed, crypt.seal(KEY, 'M1234567'));
  assert.equal(sealed.includes(KEY), false);
  assert.throws(() => crypt.open(sealed, 'M9999999'), { code: 'CREDENTIAL_DECRYPTION_FAILED' });
  assert.throws(() => secrets.createPaymentSecrets({SESSION_SECRET:'short'}).seal(KEY,'M1234567'), {code:'ENCRYPTION_NOT_READY'});
});
const merchant = (sandbox=false) => ({ merchant_code:'M1234567', default_currency:'EUR', sandbox, country:'LV', business_profile:{name:'Trosheen'} });
const response = (body, status=200) => ({ok:status>=200&&status<300,status,json:async()=>body});
test('merchant connection test only calls the authenticated read endpoint', async () => {
  const calls=[];
  const gateway=transport.createSumupGateway(async(url,options)=>{calls.push({url,options}); return response(merchant());});
  const profile=await gateway.checkMerchant(KEY, 'M1234567');
  assert.deepEqual(profile,{merchantCode:'M1234567',currency:'EUR',sandbox:false,country:'LV',businessName:'Trosheen'});
  assert.equal(calls.length,1); assert.equal(calls[0].url,'https://api.sumup.com/v1/merchants/M1234567');
  assert.equal(calls[0].options.method,'GET'); assert.equal(calls[0].options.headers.Authorization, 'Bearer '+KEY);
  assert.equal(calls[0].options.redirect, 'error');
});
test('merchant mismatches, unknown environment and non-EUR accounts fail closed', async () => {
  for(const bad of [{...merchant(),merchant_code:'MOTHER'}, {...merchant(),sandbox:undefined}, {...merchant(),default_currency:'USD'}]) {
    await assert.rejects(transport.createSumupGateway(async()=>response(bad)).checkMerchant(KEY,'M1234567'));
  }
});
test('upstream errors never include keys, response bodies or customer data', async () => {
  for(const status of [400,401,403,429,500]) {
    const gateway=transport.createSumupGateway(async()=>response({message:KEY+' customer@example.com'},status));
    await assert.rejects(gateway.checkMerchant(KEY,'M1234567'), e => {
      assert.equal(e instanceof rules.SumupError,true);
      assert.equal(JSON.stringify(e).includes(KEY),false); assert.equal(e.message.includes('customer@'),false);
      return true;
    });
  }
});
test('network errors are sanitized and creating a checkout is never automatically retried', async () => {
  let count=0;
  const gateway=transport.createSumupGateway(async()=>{count++;throw Error(KEY);});
  await assert.rejects(gateway.createCheckout(KEY,{amount:1}), {code:'SUMUP_UNREACHABLE'});
  assert.equal(count,1);
});
function fakeStore() {
  let state = {config:null, credentials:[], bindings:[], orders:[], admin:true};
  const calls=[]; let backup; let releaseCount=0;
  const query=async(sql, values=[])=> {
    calls.push({sql,values});
    const tag=/\/\*sumup:([a-z-]+)\*\//.exec(sql)?.[1];
    if(sql==='BEGIN') {backup=structuredClone(state);return {rows:[]};}
    if(sql==='ROLLBACK') {state=backup;return {rows:[]};}
    if(sql==='COMMIT') return {rows:[]};
    if(tag==='lock') return {rows:[]};
    if(tag==='admin') return {rows:state.admin?[{id:1}]:[]};
    if(tag==='settings') return {rows:state.config?[{...state.config}]:[]};
    if(tag==='credential') return {rows:state.credentials.filter(c=>c.id===Number(values[0])).map(c=>({...c}))};
    if(tag==='latest-credential') return {rows:state.credentials.filter(c=>c.merchant_code===values[0] && c.sandbox===values[1] && c.checked_at).slice().sort((a,b)=>b.checked_at-a.checked_at || b.id-a.id).slice(0,1)};
    if(tag==='archive') {
      let row=state.credentials.find(c=>c.merchant_code===values[0]&&c.key_fingerprint===values[2]);
      const attrs={merchant_code:values[0],api_key_ciphertext:values[1],key_fingerprint:values[2],sandbox:values[3],business_name:values[4],country:values[5],checked_at:values[6]};
      if(!row){row={id:state.credentials.length+1,...attrs};state.credentials.push(row);} else if(attrs.checked_at)Object.assign(row,attrs);
      return {rows:[{...row}],rowCount:1};
    }
    if(tag==='save-settings') {
      state.config={id:1,version:values[0],credential_id:values[1],legacy_credential_id:values[2],site_url:values[3],description_prefix:values[4],enabled:false};
      return {rows:[],rowCount:1};
    }
    if(tag==='toggle') {state.config={...state.config,enabled:values[0],version:state.config.version+1};return {rows:[],rowCount:1};}
    if(tag==='pause-env') {state.config={id:1,version:1,credential_id:null,legacy_credential_id:null,site_url:values[0],description_prefix:values[1],enabled:false};return {rows:[],rowCount:1};}
    if(tag==='binding')return {rows:state.bindings.filter(b=>b.checkout_id===values[0]).map(b=>({...b}))};
    if(tag==='order-by-checkout') return {rows:state.orders.filter(o=>o.payment_method_id===values[0])};
    if(tag==='order')return {rows:state.orders.filter(o=>o.id===values[0]).map(o=>({...o}))};
    if(tag==='bind'){
      const b={checkout_id:values[0],order_id:values[1],credential_id:values[2],merchant_code:values[3],amount:values[4],currency:'EUR',kind:values[5],hosted_url:values[6],checkout_reference:values[7]};
      if(state.bindings.some(v=>v.checkout_id===b.checkout_id||b.order_id&&v.order_id===b.order_id))throw Error('unique conflict');
      state.bindings.push(b);return {rows:[],rowCount:1};
    }
    if(tag==='attach') {const o=state.orders.find(o=>o.id===values[0]); o.payment_method_id=values[1];return {rows:[],rowCount:1};}
    throw Error('Unexpected SQL tag: '+tag+' / '+sql);
  };
  return { db:{query,connect:async()=>({query,release:()=>releaseCount++})}, inspect:()=>state, calls, mutate:(f)=>f(state), released:()=>releaseCount };
}
function fixture(env=ENV, sandbox=false) {
  const store=fakeStore();const gateway={
    checkMerchant:async(_key,code)=>({...merchant(sandbox),merchantCode:code,currency:'EUR',businessName:'Trosheen',country:'LV',sandbox}),
    createCheckout:async(_key,payload)=>({...payload,id:'checkout-123',status:'PENDING',hosted_checkout_url:'https://checkout.sumup.com/pay/checkout-123'}),
    getCheckout:async()=>({id:'checkout-123',checkout_reference:'27',merchant_code:'M1234567',amount:12.3,currency:'EUR',status:'PAID'}),
  };
  const service=settings.createSumupConfiguration(store.db,gateway,env);
  const draft={expectedVersion:0,merchantCode:'M1234567',apiKey:KEY,siteUrl:'https://trosheen.shop',descriptionPrefix:'Trosheen'};
  return {store,gateway,service,draft};
}
test('save encrypts the key, returns no secret and keeps new setup disabled', async()=> {
  const {store,service,draft}=fixture();
  const result=await service.save(draft,'1');
  assert.equal(result.enabled,false);assert.equal(result.profile.sandbox,false);assert.equal(result.version,1);
  assert.equal(result.keyConfigured,true);assert.equal(JSON.stringify(result).includes(KEY),false);
  assert.equal(JSON.stringify(store.inspect()).includes(KEY),false);
  assert.equal(store.released(),1);
});
test('check accepts a draft but does not save, create a checkout or toggle payments', async()=>{
  const {service,store,draft,gateway}=fixture();
  gateway.createCheckout=async()=>{throw Error('must not create');};
  assert.equal((await service.check(draft)).merchantCode,'M1234567');
  assert.equal(store.inspect().config,null);assert.equal(store.inspect().credentials.length,0);
});
test('blank key preserves saved key; rejected replacement does not alter configuration', async()=>{
  const {service,store,draft,gateway}=fixture();await service.save(draft,'1');
  let received;gateway.checkMerchant=async(key)=>{received=key;return {merchantCode:'M1234567',currency:'EUR',sandbox:false,country:'LV',businessName:'Trosheen'};};
  await service.save({...draft,apiKey:'',expectedVersion:1},'1');assert.equal(received,KEY);
  gateway.checkMerchant=async()=>{throw new rules.SumupError(502,'SUMUP_UNAUTHORIZED','Rejected');};
  await assert.rejects(service.save({...draft,apiKey:KEY+'new',expectedVersion:2},'1'));
  assert.equal(store.inspect().config.version,2);assert.equal(store.inspect().credentials.length,1);
});
test('stale settings or revoked administrators cannot write',async()=>{
  const {service,store,draft}=fixture();await service.save(draft,'1');
  await assert.rejects(service.save(draft,'1'),{code:'SETTINGS_CHANGED'});
  store.mutate(s=>s.admin=false);
  await assert.rejects(service.save({...draft,expectedVersion:1},'1'),{statusCode:403});
  assert.equal(store.inspect().config.version,1);
});
test('live activation rechecks merchant; disabling works without contacting SumUp',async()=>{
  const {service,gateway,draft}=fixture();await service.save(draft,'1');
  assert.equal((await service.setEnabled(true,1,'1')).enabled,true);
  gateway.checkMerchant=async()=>{throw Error('offline');};
  assert.equal((await service.setEnabled(false,2,'1')).enabled,false);
  await assert.rejects(service.runtimeContext(),{code:'PAYMENTS_DISABLED'});
});
test('sandbox credentials cannot enable or reach public checkout',async()=>{
  const {service,draft}=fixture(ENV,true);await service.save(draft,'1');
  await assert.rejects(service.setEnabled(true,1,'1'),{code:'SANDBOX_NOT_LIVE'});
  await assert.rejects(service.runtimeContext(),{code:'PAYMENTS_DISABLED'});
});
test('environment fallback is preserved for old orders when admin changes merchant',async()=>{
  const {service,draft}=fixture({...ENV,SUMUP_API_KEY:KEY+'legacy',SUMUP_MERCHANT_CODE:'MOLD1234'});
  assert.equal((await service.getSettings()).source,'environment');
  await service.save(draft,'1');
  const previous=await service.legacyCredential();assert.equal(previous.merchantCode,'MOLD1234');assert.equal(previous.apiKey,KEY+'legacy');
});
test('legacy environment payments can be paused even if SumUp is offline',async()=>{
  const {service,gateway}=fixture({...ENV,SUMUP_API_KEY:KEY,SUMUP_MERCHANT_CODE:'M1234567'});
  gateway.checkMerchant=async()=>{throw Error('offline');};
  assert.equal((await service.setEnabled(false,0,'1')).enabled,false);
  await assert.rejects(service.runtimeContext(),{code:'PAYMENTS_DISABLED'});
});
async function paymentFixture(sandbox=false) {
  const f=fixture(ENV,sandbox);await f.service.save(f.draft,'1');
  if(!sandbox)await f.service.setEnabled(true,1,'1');
  f.store.mutate(s=>s.orders.push({id:27,status:'pending',total_amount:'12.30',payment_method_id:null}));
  f.payment=payments.createSumupPayments(f.store.db,f.service,f.gateway);
  return f;
}
const checkoutInput=(context)=>({amount:12.3,orderId:'27',context,successUrl:'https://trosheen.shop/order-confirmation?order_id=27',callbackUrl:'https://trosheen.shop/api/checkout/webhook'});
test('checkout stores merchant and credential binding atomically before returning payment URL',async()=>{
  const {payment,service,store}=await paymentFixture();
  const result=await payment.createCheckout(checkoutInput(await service.runtimeContext()));
  assert.equal(result.id,'checkout-123');assert.equal(store.inspect().orders[0].payment_method_id,result.id);
  assert.equal(store.inspect().bindings[0].merchant_code,'M1234567');assert.equal(store.inspect().bindings[0].kind,'order');
  assert.equal(store.inspect().orders[0].status,'pending');
  assert.equal(store.calls.some(c=>/DELETE FROM orders/.test(c.sql)),false);
});
test('disabling prevents new issuance but not verification of an issued payment',async()=>{
  const {payment,service}=await paymentFixture();const context=await service.runtimeContext();
  await payment.createCheckout(checkoutInput(context));await service.setEnabled(false,2,'1');
  await assert.rejects(payment.createCheckout(checkoutInput(context)),{code:'SETTINGS_CHANGED'});
  assert.equal((await payment.verifyPayment('checkout-123')).status,'PAID');
});
test('merchant switch preserves old checkout verification with its original account',async()=>{
  const {payment,service,gateway,draft}=await paymentFixture();
  await payment.createCheckout(checkoutInput(await service.runtimeContext()));
  await service.save({...draft,expectedVersion:2,merchantCode:'MOTHER99',apiKey:KEY+'other'},'1');
  const get=gateway.getCheckout;let used;
  gateway.getCheckout=async(key,id)=>{used=key;return get(key,id);};
  assert.equal((await payment.verifyPayment('checkout-123')).merchant_code,'M1234567');assert.equal(used,KEY);
});
test('rotated key for the same merchant verifies previously issued checkouts',async()=>{
  const {payment,service,gateway,draft}=await paymentFixture();
  await payment.createCheckout(checkoutInput(await service.runtimeContext()));
  await service.save({...draft,expectedVersion:2,apiKey:KEY+'rotated'},'1');
  const get=gateway.getCheckout;let used;gateway.getCheckout=async(key,id)=>{used=key;return get(key,id);};
  await payment.verifyPayment('checkout-123');assert.equal(used,KEY+'rotated');
});
test('mismatched checkout ID, merchant, reference, currency or amount never passes verification',async()=>{
  const {payment,service,gateway}=await paymentFixture();
  await payment.createCheckout(checkoutInput(await service.runtimeContext()));const original=await gateway.getCheckout();
  for(const change of [{id:'wrong'},{merchant_code:'MOTHER99'},{checkout_reference:'27x'},{currency:'USD'},{amount:12.301},{amount:0},{amount:12.31}]) {
    gateway.getCheckout=async()=>({...original,...change});assert.equal(await payment.verifyPayment('checkout-123'),null,JSON.stringify(change));
  }
});
test('unknown or malformed webhook IDs cause no upstream calls',async()=>{
  const {payment,gateway}=await paymentFixture();gateway.getCheckout=async()=>{throw Error('must not call');};
  assert.equal(await payment.verifyPayment('unknown-123'),null);assert.equal(await payment.verifyPayment('../me'),null);
});
test('remote creation failure retains pending order and does not silently retry',async()=>{
  const {payment,service,store,gateway}=await paymentFixture();let calls=0;
  gateway.createCheckout=async()=>{calls++;throw new rules.SumupError(502,'SUMUP_UNREACHABLE','Unreachable');};
  await assert.rejects(payment.createCheckout(checkoutInput(await service.runtimeContext())));
  assert.equal(calls,1);assert.equal(store.inspect().orders.length,1);assert.equal(store.inspect().bindings.length,0);
});
test('untrusted checkout redirect cannot be returned to a buyer',async()=>{
  const {payment,service,gateway}=await paymentFixture();const create=gateway.createCheckout;
  gateway.createCheckout=async(...args)=>({...await create(...args),hosted_checkout_url:'https://checkout.sumup.com.attacker.invalid/pay'});
  await assert.rejects(payment.createCheckout(checkoutInput(await service.runtimeContext())),{code:'INVALID_CHECKOUT_RESPONSE'});
});
test('sandbox setup checkout is isolated and cannot fulfil any shop order',async()=>{
  const {payment,service,store,gateway}=await paymentFixture(true);
  const result=await payment.createSandboxCheckout(1,'1');
  assert.equal(result.amount,1);assert.equal(store.inspect().bindings[0].kind,'setup');assert.equal(store.inspect().bindings[0].order_id,null);
  assert.equal(store.inspect().orders[0].payment_method_id,null);assert.equal(await payment.verifyPayment(result.id),null);
  const binding=store.inspect().bindings[0];
  gateway.getCheckout=async()=>({id:result.id,checkout_reference:binding.checkout_reference,merchant_code:'M1234567',currency:'EUR',amount:1,status:'PAID'});
  assert.equal((await payment.getSandboxCheckout(result.id)).status,'PAID');
  assert.equal(store.inspect().orders[0].status,'pending');
});
test('sandbox test resource cannot be created with live credentials or stale settings',async()=>{
  const {payment,gateway}=await paymentFixture();gateway.createCheckout=async()=>{throw Error('must not create');};
  await assert.rejects(payment.createSandboxCheckout(2,'1'),{code:'SANDBOX_REQUIRED'});
  await assert.rejects(payment.createSandboxCheckout(0,'1'),{code:'SETTINGS_CHANGED'});
});
test('legacy order verification uses preserved environment merchant, not newly selected merchant',async()=>{
  const {service,draft,store,gateway}=fixture({...ENV,SUMUP_API_KEY:KEY+'legacy',SUMUP_MERCHANT_CODE:'MOLD1234'});
  store.mutate(s=>s.orders.push({id:27,status:'pending',total_amount:'12.30',payment_method_id:'legacy-123'}));
  await service.save(draft,'1');let used;
  gateway.getCheckout=async(key)=>{used=key;return {id:'legacy-123',merchant_code:'MOLD1234',amount:12.3,currency:'EUR',checkout_reference:'27',status:'PAID'};};
  const payment=payments.createSumupPayments(store.db,service,gateway);
  assert.equal((await payment.verifyPayment('legacy-123')).status,'PAID');assert.equal(used,KEY+'legacy');
});
test('public availability contains no merchant, profile, API key or ciphertext',async()=>{
  const {service,draft}=fixture();await service.save(draft,'1');await service.setEnabled(true,1,'1');
  assert.deepEqual(await service.availability(),{available:true,currency:'EUR'});
});
test('settings changed during upstream validation are rejected on transactional recheck',async()=>{
  const {service,gateway,store,draft}=fixture();await service.save(draft,'1');
  const check=gateway.checkMerchant;gateway.checkMerchant=async(...args)=>{store.mutate(s=>s.config.version=2);return check(...args);};
  await assert.rejects(service.save({...draft,expectedVersion:1},'1'),{code:'SETTINGS_CHANGED'});
  assert.equal(store.inspect().credentials.length,1);
});
test('credential persistence failure rolls back the configuration and releases connection',async()=>{
  const {store,gateway,draft}=fixture();const original=store.db.connect;
  store.db.connect=async()=>{const client=await original();return {...client,query:async(sql,values)=>{
    if(sql.includes('sumup:save-settings'))throw Error('disk full');return client.query(sql,values);
  }};};
  const service=settings.createSumupConfiguration(store.db,gateway,ENV);
  await assert.rejects(service.save(draft,'1'),/disk full/);
  assert.equal(store.inspect().config,null);assert.equal(store.inspect().credentials.length,0);assert.equal(store.released(),1);
});
test('legacy sandbox payments cannot fulfil a real order',async()=>{
  const {store,service,gateway}=fixture({...ENV,SUMUP_API_KEY:KEY,SUMUP_MERCHANT_CODE:'M1234567'},true);
  store.mutate(s=>s.orders.push({id:27,status:'pending',total_amount:'12.30',payment_method_id:'legacy-123'}));
  gateway.getCheckout=async()=>{throw Error('must not use sandbox for fulfilment');};
  assert.equal(await payments.createSumupPayments(store.db,service,gateway).verifyPayment('legacy-123'),null);
});
test('replaced account amount in the order cannot pass a stale binding',async()=>{
  const {payment,service,store}=await paymentFixture();await payment.createCheckout(checkoutInput(await service.runtimeContext()));
  store.mutate(s=>s.orders[0].total_amount='1.00');assert.equal(await payment.verifyPayment('checkout-123'),null);
});
test('checkout binding and order reference roll back together on database failure',async()=>{
  const {payment,service,store}=await paymentFixture();const original=store.db.connect;
  store.db.connect=async()=>{const client=await original();return {...client,query:async(sql,values)=>{
    if(sql.includes('sumup:attach'))throw Error('lost database');return client.query(sql,values);
  }};};
  await assert.rejects(payment.createCheckout(checkoutInput(await service.runtimeContext())),/lost database/);
  assert.equal(store.inspect().bindings.length,0);assert.equal(store.inspect().orders[0].payment_method_id,null);
});
test('checkout route uses dynamic configuration and keeps atomic stock/outbox integration',()=>{
  const code=fs.readFileSync(require('node:path').join(__dirname,'../server/routes/checkout.ts'),'utf8');
  assert.match(code,/getSumupCheckoutContext\(\)/);assert.match(code,/context: paymentContext/);
  assert.doesNotMatch(code,/process\.env\.SUMUP_MERCHANT_CODE|db\.delete\(orders\)/);
  assert.match(code,/queuePaidWorkshopOrder\(tx, orderId, "paid"\)/);
  assert.match(code,/queuePaidWorkshopOrder\(tx, orderId, "payment_review"\)/);
  assert.match(code,/eq\(orders\.paymentMethodId, checkoutId\)/);
});
test('admin setup routes are private, no-store and require explicit confirmation for enable/test',()=>{
  const code=fs.readFileSync(require('node:path').join(__dirname,'../server/routes/sumup.ts'),'utf8');
  assert.match(code,/use\(adminAuthMiddleware\)/);assert.match(code,/Cache-Control.*no-store/);
  assert.ok((code.match(/confirm: z.literal\(true\)/g)||[]).length===2);
  assert.doesNotMatch(code,/res\.json\(req\.body\)|console\.(log|error)\([^\n]*req\.body/);
});
test('all changed TS and TSX modules parse without diagnostics',()=>{
  const path=require('node:path');const root=path.join(__dirname,'..');
  for(const file of ['shared/sumup.ts','server/lib/sumup.ts','server/lib/sumupGateway.ts','server/lib/sumupConfiguration.ts','server/lib/sumupPayments.ts','server/lib/sumupSecrets.ts','server/routes/sumup.ts','server/routes/checkout.ts','server/routes/index.ts','client/src/components/admin/SumupSettings.tsx','client/src/components/checkout/SumupAvailability.tsx','client/src/pages/admin/Settings.tsx','client/src/pages/checkout.tsx']) {
    const result=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}});
    const errors=(result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
    assert.equal(errors.length,0,file+': '+errors.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join('; '));
  }
});
function checkoutHandlers(overrides={}) {
  const handlers={};let claimed=false;let notifications=0;let verifyCalls=0;
  const schema=new Proxy(function(){return schema;},{get:()=>schema,apply:()=>schema});
  const table={id:'id',status:'status',paymentMethodId:'payment_method_id',totalAmount:'total_amount'};
  const tx={
    update:()=>({set:(values)=>({where:()=>({then:(ok)=>Promise.resolve(ok(undefined)),returning:async()=>{
      if(values.status==='payment_confirming'){if(claimed)return [];claimed=true;return [{id:27}];}return [];
    }})})}),
    select:()=>({from:()=>({where:async()=>[]})}),
  };
  const sumup={verifySumupCheckout:async()=>{verifyCalls++;return {id:'checkout-123',checkout_reference:'27',merchant_code:'M1234567',currency:'EUR',amount:12.3,status:'PAID'};},
    getSumupCheckoutContext:async()=>{throw new rules.SumupError(503,'PAYMENTS_DISABLED','Secret '+KEY);},...overrides};
  const module={exports:{}};const filename=require('node:path').join(__dirname,'../server/routes/checkout.ts');
  const code=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const imports=(name)=>{
    if(name==='express')return {Router:()=>({get:(path,...fn)=>{handlers['GET '+path]=fn.at(-1);},post:(path,...fn)=>{handlers['POST '+path]=fn.at(-1);}})};
    if(name==='zod')return {z:schema};
    if(name==='../db')return {db:{transaction:async(fn)=>{const before=claimed;try{return await fn(tx);}catch(error){claimed=before;throw error;}}}};
    if(name==='../db/schema')return {orders:table,orderItems:table,products:table,constructorOptions:table};
    if(name==='drizzle-orm')return {eq:()=>{},and:()=>{},inArray:()=>{},gte:()=>{},sql:()=>{}};
    if(name==='../middleware/validation')return {validateRequest:()=>()=>{}};
    if(name==='../lib/sumup')return sumup;
    if(name==='../lib/telegramWorkshop')return {queuePaidWorkshopOrder:async()=>{notifications++;}};
    if(name==='../../shared/sumup')return rules;
    return require(name);
  };
  new Function('require','module','exports','console',code)(imports,module,module.exports,{error(){}});
  return {async call(path,body={}){const response={statusCode:200,body:null,status(code){this.statusCode=code;return this;},end(){return this;},json(data){this.body=data;return this;}};await handlers[path]({body},response,()=>{throw Error('unexpected next');});return response;},inspect:()=>({claimed,notifications,verifyCalls})};
}
test('repeated verified paid callbacks queue production notification once',async()=>{
  const harness=checkoutHandlers();
  assert.equal((await harness.call('POST /webhook',{event_type:'CHECKOUT_STATUS_CHANGED',id:'checkout-123'})).statusCode,204);
  await harness.call('POST /webhook',{id:'checkout-123'});
  assert.equal(harness.inspect().notifications,1);
});
test('unrecognised or rejected callbacks cannot reach stock or Telegram',async()=>{
  const harness=checkoutHandlers({verifySumupCheckout:async()=>null});
  assert.equal((await harness.call('POST /webhook',{event_type:'OTHER_EVENT',id:'checkout-123'})).statusCode,204);
  await harness.call('POST /webhook',{id:'checkout-123'});
  assert.equal(harness.inspect().notifications,0);assert.equal(harness.inspect().claimed,false);
});
test('unpaid callback does not claim order or queue notifications',async()=>{
  const harness=checkoutHandlers({verifySumupCheckout:async()=>({checkout_reference:'27',status:'PENDING'})});
  await harness.call('POST /webhook',{id:'checkout-123'});assert.equal(harness.inspect().notifications,0);
});
test('provider verification outage returns retryable non-2xx instead of acknowledgement',async()=>{
  const harness=checkoutHandlers({verifySumupCheckout:async()=>{throw Error(KEY);}});
  const result=await harness.call('POST /webhook',{id:'checkout-123'});
  assert.equal(result.statusCode,503);assert.equal(result.body,null);assert.equal(harness.inspect().notifications,0);
});
test('disabled checkout fails before creating an order and exposes no internal credential error',async()=>{
  const result=await checkoutHandlers().call('POST /create-session');
  assert.equal(result.statusCode,503);assert.equal(result.body.code,'PAYMENT_UNAVAILABLE');assert.equal(JSON.stringify(result.body).includes(KEY),false);
});
