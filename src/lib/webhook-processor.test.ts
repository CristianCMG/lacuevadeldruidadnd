import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateSignature, processWebhook } from './webhook-processor';
import * as db from './db';
import crypto from 'crypto';

// Hoist the mock function so it's available in the factory
const { mockGet } = vi.hoisted(() => {
  return { mockGet: vi.fn() };
});

// Mock dependencies
vi.mock('mercadopago', () => {
  return {
    MercadoPagoConfig: class {},
    Payment: class {
      get = mockGet;
    }
  };
});

vi.mock('./db', () => ({
  getOrderByCode: vi.fn(),
  updateOrder: vi.fn(),
}));

vi.mock('./logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}));

describe('Webhook Processor', () => {
  const SECRET = 'test-secret';
  
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MELI_CLIENT_SECRET = SECRET;
  });

  afterEach(() => {
    delete process.env.MELI_CLIENT_SECRET;
  });

  describe('validateSignature', () => {
    it('should validate a correct signature', () => {
      const body = {
        resource: '/orders/123',
        topic: 'orders',
      };
      const ts = Date.now().toString();
      const manifest = `id:123;topic:orders;ts:${ts}`;
      const hmac = crypto.createHmac('sha256', SECRET);
      hmac.update(manifest);
      const v1 = hmac.digest('hex');
      const signature = `ts=${ts},v1=${v1}`;

      expect(validateSignature(signature, body)).toBe(true);
    });

    it('should fail with incorrect signature', () => {
      const body = {
        resource: '/orders/123',
        topic: 'orders',
      };
      const ts = Date.now().toString();
      const signature = `ts=${ts},v1=invalid_signature`;

      expect(validateSignature(signature, body)).toBe(false);
    });

    it('should fail if parts are missing', () => {
      const body = { resource: '/orders/123', topic: 'orders' };
      const signature = `v1=some_signature`; // Missing ts

      expect(validateSignature(signature, body)).toBe(false);
    });

    it('should fail if body is missing resource or topic', () => {
      const body = {}; // Missing resource and topic
      const ts = Date.now().toString();
      const manifest = `id:undefined;topic:undefined;ts:${ts}`;
      const hmac = crypto.createHmac('sha256', SECRET);
      hmac.update(manifest);
      const v1 = hmac.digest('hex');
      const signature = `ts=${ts},v1=${v1}`;

      expect(validateSignature(signature, body)).toBe(false);
    });
  });

  describe('processWebhook', () => {
    it('should process approved payment and activate order', async () => {
      const paymentId = '123456';
      const orderCode = 'ORDER-123';
      
      mockGet.mockResolvedValue({
        id: paymentId,
        external_reference: orderCode,
        status: 'approved',
      } as any);

      vi.mocked(db.getOrderByCode).mockReturnValue({
        code: orderCode,
        status: 'PENDING',
        paymentId: '',
        generations: [],
        purchaseDate: '',
        credits: 0
      } as any);

      vi.mocked(db.updateOrder).mockReturnValue(true);

      await processWebhook('payment', paymentId);

      expect(mockGet).toHaveBeenCalledWith({ id: paymentId });
      expect(db.getOrderByCode).toHaveBeenCalledWith(orderCode);
      expect(db.updateOrder).toHaveBeenCalledWith(expect.objectContaining({
        code: orderCode,
        status: 'ACTIVE',
        paymentId: paymentId
      }));
    });

    it('should process refunded payment and refund order', async () => {
      const paymentId = '123456';
      const orderCode = 'ORDER-123';
      
      mockGet.mockResolvedValue({
        id: paymentId,
        external_reference: orderCode,
        status: 'refunded',
      } as any);

      vi.mocked(db.getOrderByCode).mockReturnValue({
        code: orderCode,
        status: 'ACTIVE',
        paymentId: paymentId,
        generations: [],
        purchaseDate: '',
        credits: 0
      } as any);

      vi.mocked(db.updateOrder).mockReturnValue(true);

      await processWebhook('payment', paymentId);

      expect(db.updateOrder).toHaveBeenCalledWith(expect.objectContaining({
        code: orderCode,
        status: 'REFUNDED',
      }));
    });

    it('should ignore non-payment topics', async () => {
      await processWebhook('orders', '123');

      expect(mockGet).not.toHaveBeenCalled();
    });

    it('should handle payment not found', async () => {
      mockGet.mockResolvedValue(null as any);

      await processWebhook('payment', '999');

      expect(db.updateOrder).not.toHaveBeenCalled();
    });

    it('should handle order not found', async () => {
      mockGet.mockResolvedValue({
        id: '123',
        external_reference: 'NON_EXISTENT',
        status: 'approved',
      } as any);

      vi.mocked(db.getOrderByCode).mockReturnValue(undefined);

      await processWebhook('payment', '123');

      expect(db.updateOrder).not.toHaveBeenCalled();
    });
  });
});
