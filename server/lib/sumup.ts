import { pool } from '../db';
import { createSumupGateway } from './sumupGateway';
import { createSumupConfiguration } from './sumupConfiguration';
import { createSumupPayments } from './sumupPayments';

// Credentials are resolved per operation, not captured in an environment-only singleton.
const gateway = createSumupGateway();
export const sumupConfiguration = createSumupConfiguration(pool, gateway);
export const sumupPayments = createSumupPayments(pool, sumupConfiguration, gateway);
export const getSumupCheckoutContext = sumupConfiguration.runtimeContext;
export const createSumupCheckout = sumupPayments.createCheckout;
export const verifySumupCheckout = sumupPayments.verifyPayment;
