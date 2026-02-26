import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createOrder, Order } from '@/lib/db';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

// Using a test access token if the environment variable is not set
// In production, this MUST be set in environment variables
const accessToken = process.env.MP_ACCESS_TOKEN || "TEST-00000000-0000-0000-0000-000000000000";

const client = new MercadoPagoConfig({ accessToken });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      logger.warn('Checkout attempt with no items');
      return Response.json({ error: 'No items provided' }, { status: 400 });
    }

    const orderId = uuidv4();
    const newOrder: Order = {
      code: orderId,
      purchaseDate: new Date().toISOString(),
      credits: 0, // TODO: Calculate credits based on items if applicable
      status: 'PENDING',
      paymentId: '', // Will be updated via webhook
      generations: [],
    };

    createOrder(newOrder);
    logger.info('Order created', { orderId, items });

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        external_reference: orderId,
        items: items.map((item: any) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: Number(item.price),
          currency_id: 'ARS',
          picture_url: item.image,
        })),
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/failure`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pending`,
        },
        auto_return: 'approved',
      },
    });

    logger.info('Preference created', { orderId, preferenceId: result.id });
    return Response.json({ url: result.init_point });
  } catch (error) {
    logger.error('Error creating preference', { error });
    return Response.json({ error: 'Error creating preference' }, { status: 500 });
  }
}
