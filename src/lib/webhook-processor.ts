
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getOrderByCode, updateOrder, Order } from './db';
import { logger } from './logger';
import crypto from 'crypto';

const accessToken = process.env.MP_ACCESS_TOKEN || "TEST-00000000-0000-0000-0000-000000000000";
const client = new MercadoPagoConfig({ accessToken });
const payment = new Payment(client);

export function validateSignature(signature: string, body: any): boolean {
  try {
    const parts = signature.split(',');
    let ts = '';
    let v1 = '';

    parts.forEach(part => {
      const [key, value] = part.split('=');
      if (key && value) {
        if (key.trim() === 'ts') ts = value.trim();
        if (key.trim() === 'v1') v1 = value.trim();
      }
    });

    if (!ts || !v1) return false;

    // Template: id:{data.id};topic:{topic};ts:{ts}
    // Meli notification body usually contains `resource` (e.g. "/orders/123") and `topic`.
    const resourceId = body.resource ? body.resource.split('/').pop() : body._id || body.data?.id;
    const topic = body.topic || body.type;
    
    if (!resourceId || !topic) return false;

    const manifest = `id:${resourceId};topic:${topic};ts:${ts}`;
    const secret = process.env.MELI_CLIENT_SECRET || '';
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const calculatedSignature = hmac.digest('hex');

    return calculatedSignature === v1;
  } catch (e) {
    logger.error('Validation logic error', { error: e });
    return false;
  }
}

export async function processWebhook(topic: string, resourceId: string) {
  logger.info(`Processing webhook: ${topic} - ${resourceId}`);

  try {
    if (topic === 'payment') {
      const paymentData = await payment.get({ id: resourceId });
      
      if (!paymentData) {
        logger.warn(`Payment not found: ${resourceId}`);
        return;
      }

      const { external_reference, status, id: paymentId } = paymentData;

      if (!external_reference) {
        logger.warn(`Payment ${resourceId} has no external_reference`);
        return;
      }

      const order = getOrderByCode(external_reference);

      if (!order) {
        logger.warn(`Order not found for external_reference: ${external_reference}`);
        return;
      }

      logger.info(`Updating order ${external_reference} with payment status: ${status}`);

      let newStatus: Order['status'] = order.status;

      if (status === 'approved') {
        newStatus = 'ACTIVE';
      } else if (status === 'refunded' || status === 'cancelled') {
        newStatus = 'REFUNDED'; // or CANCELLED if added to types
      } else if (status === 'rejected') {
          // keep as pending or set to expired/cancelled? 
          // usually pending orders stay pending until timeout or explicit failure
          // but if payment is rejected, maybe we should leave it as is or mark as failed
      }

      const updatedOrder: Order = {
        ...order,
        status: newStatus,
        paymentId: paymentId?.toString() || '',
      };

      const success = updateOrder(updatedOrder);

      if (success) {
        logger.info(`Order ${external_reference} updated successfully`);
      } else {
        logger.error(`Failed to update order ${external_reference}`);
      }
    } else {
        logger.info(`Topic ${topic} ignored`);
    }
  } catch (error) {
    logger.error('Error processing webhook', { error });
    throw error;
  }
}
