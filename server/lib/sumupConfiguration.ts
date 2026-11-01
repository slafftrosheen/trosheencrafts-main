import { createHash } from 'node:crypto';
import {
  SumupError, normalizeApiKey, normalizeDescription, normalizeMerchantCode, normalizeSiteOrigin,
  validSettingsVersion, type SumupAdminSettings, type SumupDraft, type SumupMerchant,
} from '../../shared/sumup';
import { createPaymentSecrets, type PaymentEnvironment } from './sumupSecrets';
import type { SumupGateway } from './sumupGateway';

export interface PaymentSql {
  query<R extends object = Record<string, unknown>>(text: string, values?: unknown[]): Promise<{ rows: R[]; rowCount?: number | null }>;
}
export interface PaymentDatabase extends PaymentSql {
  connect(): Promise<PaymentSql & { release(): void }>;
}
type Config = { version: number; credential_id: number | null; legacy_credential_id: number | null;
  enabled: boolean; site_url: string; description_prefix: string };
type CredentialRow = { id: number; merchant_code: string; api_key_ciphertext: string;
  sandbox: boolean | null; business_name: string | null; country: string | null; checked_at: Date | null };
export type PaymentCredential = { credentialId: number; merchantCode: string; apiKey: string; sandbox: boolean | null };
export type PaymentContext = PaymentCredential & { version: number; siteUrl: string; descriptionPrefix: string };

export function createSumupConfiguration(database: PaymentDatabase, gateway: SumupGateway, env: PaymentEnvironment = process.env) {
  const crypt = createPaymentSecrets(env);
  const defaults = () => ({ siteUrl: env.SITE_URL || env.FRONTEND_URL || 'https://trosheen.shop', descriptionPrefix: 'Trosheen order' });
  const environmentCredential = () => env.SUMUP_API_KEY?.trim() && env.SUMUP_MERCHANT_CODE?.trim()
    ? { apiKey: env.SUMUP_API_KEY.trim(), merchantCode: env.SUMUP_MERCHANT_CODE.trim().toUpperCase() } : null;
  const read = async (sql: PaymentSql = database) => (await sql.query<Config>(
    '/*sumup:settings*/ SELECT version, credential_id, legacy_credential_id, enabled, site_url, description_prefix FROM sumup_payment_config WHERE id = 1'
  )).rows[0] ?? null;
  const credential = async (id: number, sql: PaymentSql = database) => {
    const row = (await sql.query<CredentialRow>('/*sumup:credential*/ SELECT * FROM sumup_credentials WHERE id = $1', [id])).rows[0];
    if (!row) throw new SumupError(503, 'CREDENTIAL_MISSING', 'Сохранённый аккаунт SumUp недоступен. Проверьте настройки.');
    return row;
  };
  const unpack = (row: CredentialRow): PaymentCredential => ({
    credentialId: row.id, merchantCode: row.merchant_code, apiKey: crypt.open(row.api_key_ciphertext, row.merchant_code), sandbox: row.sandbox,
  });
  const profileOf = (row: CredentialRow | null): SumupMerchant | null => row && typeof row.sandbox === 'boolean'
    ? { merchantCode: row.merchant_code, businessName: row.business_name || row.merchant_code, country: row.country || '', currency: 'EUR', sandbox: row.sandbox } : null;

  async function archive(sql: PaymentSql, apiKey: string, merchantCode: string, profile: SumupMerchant | null): Promise<CredentialRow> {
    const ciphertext = crypt.seal(apiKey, merchantCode);
    const fingerprint = createHash('sha256').update('sumup:' + merchantCode + ':' + apiKey).digest('hex');
    const { rows } = await sql.query<CredentialRow>(`
      /*sumup:archive*/ INSERT INTO sumup_credentials
        (merchant_code, api_key_ciphertext, key_fingerprint, sandbox, business_name, country, checked_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (merchant_code, key_fingerprint) DO UPDATE SET
        api_key_ciphertext = EXCLUDED.api_key_ciphertext,
        sandbox = COALESCE(EXCLUDED.sandbox, sumup_credentials.sandbox),
        business_name = COALESCE(EXCLUDED.business_name, sumup_credentials.business_name),
        country = COALESCE(EXCLUDED.country, sumup_credentials.country),
        checked_at = COALESCE(EXCLUDED.checked_at, sumup_credentials.checked_at)
      RETURNING *
    `, [merchantCode, ciphertext, fingerprint, profile?.sandbox ?? null, profile?.businessName ?? null, profile?.country ?? null, profile ? new Date() : null]);
    return rows[0];
  }
  function sameVersion(config: Config | null, expected: number) {
    if (!validSettingsVersion(expected)) throw new SumupError(400, 'INVALID_VERSION', 'Некорректная версия настроек.');
    if ((config?.version ?? 0) !== expected) throw new SumupError(409, 'SETTINGS_CHANGED', 'Настройки уже изменены. Обновите страницу и повторите действие.');
  }
  async function requireAdmin(sql: PaymentSql, actorId: string) {
    if (!/^[1-9][0-9]{0,9}$/.test(actorId) || Number(actorId) > 2147483647) throw new SumupError(403, 'ADMIN_REQUIRED', 'Доступ закрыт.');
    const { rows } = await sql.query('/*sumup:admin*/ SELECT id FROM users WHERE id = $1 AND role = \'admin\' FOR SHARE', [Number(actorId)]);
    if (!rows.length) throw new SumupError(403, 'ADMIN_REQUIRED', 'Доступ администратора отозван.');
  }
  async function mutate<T>(actorId: string, expected: number, write: (sql: PaymentSql, config: Config | null) => Promise<T>): Promise<T> {
    const client = await database.connect();
    try {
      await client.query('BEGIN');
      await requireAdmin(client, actorId);
      // The singleton may not exist yet; an advisory transaction lock also serialises first setup.
      await client.query('/*sumup:lock*/ SELECT pg_advisory_xact_lock($1)', [920261102]);
      const config = await read(client); sameVersion(config, expected);
      const result = await write(client, config);
      await client.query('COMMIT'); return result;
    } catch (error) { await client.query('ROLLBACK').catch(() => undefined); throw error; }
    finally { client.release(); }
  }
  async function getSettings(): Promise<SumupAdminSettings> {
    const config = await read();
    const row = config?.credential_id ? await credential(config.credential_id) : null;
    const legacy = environmentCredential();
    const base = defaults();
    const siteUrl = config?.site_url || base.siteUrl;
    let origin = ''; try { origin = normalizeSiteOrigin(siteUrl); } catch { /* Allow an administrator to repair an old invalid URL. */ }
    return {
      version: config?.version ?? 0, source: config ? 'database' : legacy ? 'environment' : 'none',
      keyConfigured: Boolean(row || legacy), encryptionReady: crypt.ready(), enabled: config?.enabled ?? Boolean(legacy),
      merchantCode: row?.merchant_code || legacy?.merchantCode || '', siteUrl,
      descriptionPrefix: config?.description_prefix || base.descriptionPrefix, profile: profileOf(row),
      checkedAt: row?.checked_at?.toISOString() ?? null,
      webhookUrl: origin ? origin + '/api/checkout/webhook' : '',
      returnUrl: origin ? origin + '/order-confirmation' : '',
    };
  }
  async function candidate(draft: SumupDraft) {
    const config = await read(); sameVersion(config, draft.expectedVersion);
    const merchantCode = normalizeMerchantCode(draft.merchantCode);
    let key = draft.apiKey?.trim();
    if (!key) key = config?.credential_id ? unpack(await credential(config.credential_id)).apiKey : environmentCredential()?.apiKey;
    if (!key) throw new SumupError(400, 'API_KEY_REQUIRED', 'Введите секретный API key SumUp.');
    return { apiKey: normalizeApiKey(key), merchantCode, siteUrl: normalizeSiteOrigin(draft.siteUrl),
      descriptionPrefix: normalizeDescription(draft.descriptionPrefix) };
  }
  async function check(draft: SumupDraft) {
    const input = await candidate(draft);
    return gateway.checkMerchant(input.apiKey, input.merchantCode);
  }
  async function save(draft: SumupDraft, actorId: string) {
    const input = await candidate(draft);
    // Validate before opening a transaction; a failed check never replaces a working key.
    const profile = await gateway.checkMerchant(input.apiKey, input.merchantCode);
    await mutate(actorId, draft.expectedVersion, async (sql, current) => {
      let legacyId = current?.legacy_credential_id ?? null;
      const legacy = environmentCredential();
      if (!legacyId && legacy) legacyId = (await archive(sql, legacy.apiKey, legacy.merchantCode, null)).id;
      const row = await archive(sql, input.apiKey, input.merchantCode, profile);
      await sql.query(`/*sumup:save-settings*/ INSERT INTO sumup_payment_config
        (id,version,credential_id,legacy_credential_id,site_url,description_prefix,enabled,updated_by)
        VALUES (1,$1,$2,$3,$4,$5,FALSE,$6)
        ON CONFLICT (id) DO UPDATE SET version=EXCLUDED.version, credential_id=EXCLUDED.credential_id,
          legacy_credential_id=EXCLUDED.legacy_credential_id, site_url=EXCLUDED.site_url,
          description_prefix=EXCLUDED.description_prefix, enabled=FALSE, updated_by=EXCLUDED.updated_by, updated_at=NOW()
      `, [draft.expectedVersion + 1, row.id, legacyId, input.siteUrl, input.descriptionPrefix, Number(actorId)]);
    });
    return getSettings();
  }
  async function setEnabled(enabled: boolean, expectedVersion: number, actorId: string) {
    const current = await read(); sameVersion(current, expectedVersion);
    let checked: { value: PaymentCredential; profile: SumupMerchant } | null = null;
    if (enabled) {
      if (!current?.credential_id) throw new SumupError(409, 'SAVE_REQUIRED', 'Сначала сохраните и проверьте настройки SumUp.');
      normalizeSiteOrigin(current.site_url);
      const value = unpack(await credential(current.credential_id));
      const profile = await gateway.checkMerchant(value.apiKey, value.merchantCode);
      if (profile.sandbox) throw new SumupError(409, 'SANDBOX_NOT_LIVE', 'Тестовый аккаунт нельзя включить для оплаты заказов покупателей.');
      checked = { value, profile };
    }
    await mutate(actorId, expectedVersion, async (sql, config) => {
      if (checked) await archive(sql, checked.value.apiKey, checked.value.merchantCode, checked.profile);
      if (!config) {
        const base = defaults();
        await sql.query(`/*sumup:pause-env*/ INSERT INTO sumup_payment_config
          (id,version,site_url,description_prefix,enabled,updated_by) VALUES (1,1,$1,$2,FALSE,$3)`,
        [base.siteUrl, base.descriptionPrefix, Number(actorId)]);
      } else {
        await sql.query('/*sumup:toggle*/ UPDATE sumup_payment_config SET enabled=$1, version=version+1, updated_by=$2, updated_at=NOW() WHERE id=1', [enabled, Number(actorId)]);
      }
    });
    return getSettings();
  }
  async function runtimeContext(): Promise<PaymentContext> {
    const config = await read();
    if (config) {
      if (!config.enabled || !config.credential_id) throw new SumupError(503, 'PAYMENTS_DISABLED', 'Оплата на сайте временно отключена.');
      const value = unpack(await credential(config.credential_id));
      if (value.sandbox !== false) throw new SumupError(503, 'SANDBOX_NOT_LIVE', 'Для оплаты покупателей нужен проверенный рабочий аккаунт.');
      return { ...value, version: config.version, siteUrl: normalizeSiteOrigin(config.site_url), descriptionPrefix: config.description_prefix };
    }
    const legacy = environmentCredential();
    if (!legacy) throw new SumupError(503, 'PAYMENTS_DISABLED', 'Оплата на сайте ещё не настроена.');
    const profile = await gateway.checkMerchant(legacy.apiKey, legacy.merchantCode);
    if (profile.sandbox) throw new SumupError(503, 'SANDBOX_NOT_LIVE', 'Тестовые ключи не подходят для оплаты заказов покупателей.');
    const row = await archive(database, legacy.apiKey, legacy.merchantCode, profile);
    const base = defaults();
    return { ...unpack(row), version: 0, siteUrl: normalizeSiteOrigin(base.siteUrl), descriptionPrefix: base.descriptionPrefix };
  }
  async function assertCurrent(context: PaymentContext) {
    const config = await read(); sameVersion(config, context.version);
    if (config && (!config.enabled || config.credential_id !== context.credentialId)) throw new SumupError(503, 'PAYMENTS_DISABLED', 'Настройки оплаты изменены. Попробуйте оформить заказ позже.');
  }
  async function verificationCredential(id: number): Promise<PaymentCredential> {
    const original = await credential(id);
    // A rotated key for the SAME merchant can verify old sessions; never use a different merchant's key.
    const latest = (await database.query<CredentialRow>(`/*sumup:latest-credential*/ SELECT * FROM sumup_credentials
      WHERE merchant_code=$1 AND sandbox IS NOT DISTINCT FROM $2 AND checked_at IS NOT NULL
      ORDER BY checked_at DESC, id DESC LIMIT 1`, [original.merchant_code, original.sandbox ?? false])).rows[0];
    return unpack(latest || original);
  }
  async function legacyCredential(): Promise<PaymentCredential | null> {
    const config = await read();
    if (config?.legacy_credential_id) return verificationCredential(config.legacy_credential_id);
    const legacy = environmentCredential();
    return legacy ? { ...legacy, credentialId: 0, sandbox: null } : null;
  }
  async function sandboxContext(expectedVersion: number, actorId: string): Promise<PaymentContext> {
    const config = await read(); sameVersion(config, expectedVersion);
    if (!config?.credential_id) throw new SumupError(409, 'SAVE_REQUIRED', 'Сначала сохраните тестовые ключи.');
    // Role recheck is performed before creating any remote test resource.
    await mutate(actorId, expectedVersion, async () => undefined);
    const value = unpack(await credential(config.credential_id));
    const profile = await gateway.checkMerchant(value.apiKey, value.merchantCode);
    if (!profile.sandbox || value.sandbox !== true) throw new SumupError(409, 'SANDBOX_REQUIRED', 'Проверочная оплата доступна только с аккаунтом Sandbox. Реальное списание здесь не создаётся.');
    return { ...value, version: config.version, siteUrl: normalizeSiteOrigin(config.site_url), descriptionPrefix: config.description_prefix };
  }
  async function availability() {
    const config = await read();
    if (config) {
      const row = config.credential_id ? await credential(config.credential_id) : null;
      return { available: Boolean(config.enabled && row?.sandbox === false && crypt.ready()), currency: 'EUR' as const };
    }
    return { available: Boolean(environmentCredential() && crypt.ready()), currency: 'EUR' as const };
  }
  return { getSettings, check, save, setEnabled, runtimeContext, assertCurrent, verificationCredential, legacyCredential, sandboxContext, availability };
}
export type SumupConfiguration = ReturnType<typeof createSumupConfiguration>;
