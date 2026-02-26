import { NextResponse } from 'next/server';

// Secure endpoint to verify environment configuration via secure tunnel
// Access requires 'Authorization: Bearer <ADMIN_SECRET>'

// Simple in-memory rate limiter
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;
const requestLog: { [ip: string]: { count: number; windowStart: number } } = {};

export async function GET(request: Request) {
  // 1. Rate Limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  if (!requestLog[ip]) {
    requestLog[ip] = { count: 0, windowStart: now };
  }
  
  const record = requestLog[ip];
  if (now - record.windowStart > RATE_LIMIT_WINDOW) {
    record.count = 0;
    record.windowStart = now;
  }
  
  record.count++;
  if (record.count > MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Too Many Requests', message: 'Please wait before retrying.' },
      { status: 429 }
    );
  }

  // 2. Authentication
  const authHeader = request.headers.get('authorization');
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return NextResponse.json(
      { error: 'Configuration Error', message: 'ADMIN_SECRET is not set in environment variables.' },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing Authorization header.' },
      { status: 401 }
    );
  }

  // 3. Environment Configuration Retrieval
  // Returning full values as requested to verify correctness via secure tunnel
  const config = {
    app: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    },
    mercado_pago: {
      MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN || 'MISSING',
    },
    mercado_libre: {
      MELI_APP_ID: process.env.MELI_APP_ID || 'MISSING',
      MELI_CLIENT_SECRET: process.env.MELI_CLIENT_SECRET || 'MISSING',
      MELI_REDIRECT_URI: process.env.MELI_REDIRECT_URI || 'MISSING',
      MELI_WEBHOOK_SECRET: process.env.MELI_WEBHOOK_SECRET || 'MISSING',
    },
    replicate: {
      REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN || 'MISSING',
    },
    admin: {
      ADMIN_SECRET: process.env.ADMIN_SECRET ? '***SET***' : 'MISSING', // Don't expose the secret itself
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(config);
}
