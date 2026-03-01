import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { getOrderByCode, updateOrder } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { code, prompt, image } = await request.json();

    if (!code || (!prompt && !image)) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const order = getOrderByCode(code);

    if (!order) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 404 });
    }

    if (order.credits <= 0) {
      return NextResponse.json({ error: 'Sin créditos disponibles' }, { status: 403 });
    }

    if (order.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'La orden no está activa' }, { status: 403 });
    }

    const model = "tencent/hunyuan3d-2:latest"; 
    
    const input: { prompt?: string; image?: string } = {};
    if (prompt) input.prompt = prompt;
    if (image) input.image = image;

    const output = await replicate.run(model, { input });

    order.credits -= 1;
    
    const generation = {
      id: uuidv4(),
      prompt,
      imageUrl: image,
      modelUrl: String(output),
      createdAt: new Date().toISOString(),
      status: 'PENDING' as const,
    };
    
    order.generations.push(generation);
    updateOrder(order);

    return NextResponse.json({ 
      success: true, 
      credits: order.credits,
      modelUrl: generation.modelUrl,
      generationId: generation.id 
    });

  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: 'Error en la forja arcana' }, { status: 500 });
  }
}
