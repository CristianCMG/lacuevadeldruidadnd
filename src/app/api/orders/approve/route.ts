import { NextRequest, NextResponse } from 'next/server';
import { getOrderByCode, updateOrder } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { code, generationId } = await request.json();
    const order = getOrderByCode(code);

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Mark generation as approved
    const gen = order.generations.find(g => g.id === generationId);
    if (gen) gen.status = 'APPROVED';

    // Update order status to PRINTING
    order.status = 'PRINTING';
    
    updateOrder(order);

    // TODO: Send email notification to admin with model URL

    return NextResponse.json({ success: true, message: 'Modelo enviado a la cola de impresión' });
  } catch (error) {
    return NextResponse.json({ error: 'Error approving model' }, { status: 500 });
  }
}
