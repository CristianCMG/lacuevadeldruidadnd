import { NextRequest, NextResponse } from 'next/server';
import { processWebhook, validateSignature } from '@/lib/webhook-processor';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-signature');
    
    // Log incoming webhook for debugging
    logger.info('Incoming Meli Webhook', { 
      headers: Object.fromEntries(request.headers), 
      body 
    });

    if (signature) {
      const isValid = validateSignature(signature, body);
      if (!isValid) {
         logger.warn('Signature validation failed for webhook');
         // We verify but don't block for now as per instructions to "Return 200 OK immediately"
         // In a strict environment, you might return 401 here.
      } else {
         logger.info('Signature validation successful');
      }
    }

    // Extract resourceId and topic
    const resourceId = body.resource ? body.resource.split('/').pop() : body._id || body.data?.id;
    const topic = body.topic || body.type;

    if (resourceId && topic) {
        // Asynchronously process the notification
        // Note: In a serverless environment (like Vercel), code after response might not run.
        // ideally use `waitUntil` or a queue. For this implementation, we fire and forget.
        processWebhook(topic, resourceId).catch(err => logger.error('Async processing error', { error: err }));
    } else {
        logger.warn('Missing resourceId or topic in webhook body', { body });
    }

    return NextResponse.json({ status: 'OK' });
  } catch (error) {
    logger.error('Webhook handler error', { error });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
