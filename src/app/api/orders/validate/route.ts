import { NextRequest, NextResponse } from 'next/server';
import { getOrderByCode } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    const order = getOrderByCode(code);

    if (!order) {
      return NextResponse.json({ valid: false, message: 'Código no encontrado' }, { status: 404 });
    }

    if (order.status !== 'ACTIVE') {
      return NextResponse.json({ valid: false, message: 'Código inactivo o reembolsado' }, { status: 403 });
    }

    if (order.credits <= 0) {
      return NextResponse.json({ valid: false, message: 'Sin créditos restantes' }, { status: 403 });
    }

    return NextResponse.json({ 
      valid: true, 
      credits: order.credits,
      purchaseDate: order.purchaseDate
    });

  } catch (error) {
    return NextResponse.json({ error: 'Error validating code' }, { status: 500 });
  }
}
