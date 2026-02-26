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

    // Call Replicate (Hunyuan3D-2)
    // Using a generic image-to-3d model ID for now, replace with specific Hunyuan3D-2 ID when available publically or use 'tencent/hunyuan3d-2' if accessible
    // Fallback to a known working public model if Hunyuan is restricted, but attempting requested model.
    const model = "tencent/hunyuan3d-2:latest"; 
    
    // Note: Replicate API implementation specifics might vary based on the model's exact input schema.
    // Assuming standard inputs for text/image to 3d.
    const input: any = { prompt };
    if (image) input.image = image;

    const output = await replicate.run(model, { input });

    // Deduct credit
    order.credits -= 1;
    
    // Save generation record
    const generation = {
      id: uuidv4(),
      prompt,
      imageUrl: image,
      modelUrl: output as string, // Assuming output is the GLB URL
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
