import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { SumupError } from '../../shared/sumup';
export type PaymentEnvironment = Record<string, string | undefined>;
export function createPaymentSecrets(env: PaymentEnvironment) {
  const secret = () => env.PAYMENTS_ENCRYPTION_SECRET || env.SESSION_SECRET || '';
  const ready = () => secret().length >= 32;
  const key = () => {
    if (!ready()) throw new SumupError(503, 'ENCRYPTION_NOT_READY', 'На сервере нужен постоянный SESSION_SECRET или PAYMENTS_ENCRYPTION_SECRET длиной не менее 32 символов.');
    return createHash('sha256').update('trosheen:sumup:credentials:v1:' + secret()).digest();
  };
  return {
    ready,
    seal(value: string, merchant: string): string {
      const iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key(), iv);
      cipher.setAAD(Buffer.from('sumup:' + merchant));
      const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
      return ['v1', iv.toString('base64'), cipher.getAuthTag().toString('base64'), data.toString('base64')].join(':');
    },
    open(value: string, merchant: string): string {
      const encryptionKey = key();
      try {
        const parts = value.split(':');
        if (parts.length !== 4 || parts[0] !== 'v1') throw Error();
        const cipher = createDecipheriv('aes-256-gcm', encryptionKey, Buffer.from(parts[1], 'base64'));
        cipher.setAAD(Buffer.from('sumup:' + merchant));
        cipher.setAuthTag(Buffer.from(parts[2], 'base64'));
        return Buffer.concat([cipher.update(Buffer.from(parts[3], 'base64')), cipher.final()]).toString('utf8');
      } catch {
        throw new SumupError(503, 'CREDENTIAL_DECRYPTION_FAILED', 'Не удалось расшифровать ключ SumUp. Проверьте постоянный секрет сервера; ключ можно ввести заново.');
      }
    },
  };
}
