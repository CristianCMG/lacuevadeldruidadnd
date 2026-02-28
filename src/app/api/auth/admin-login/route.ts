import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();
    const validSecret = process.env.ADMIN_SECRET;

    if (!validSecret) {
      console.error('ADMIN_SECRET is not defined in environment variables');
      return NextResponse.json({ 
        error: 'Server misconfiguration: ADMIN_SECRET not set',
        debug: { envVars: Object.keys(process.env).filter(k => !k.includes('KEY') && !k.includes('SECRET')) } 
      }, { status: 500 });
    }

    // Compare trimmed strings to avoid whitespace issues
    const received = secret.trim();
    const expected = validSecret.trim();
    
    console.log(`[Auth Debug] Attempting login. Received length: ${received.length}, Expected length: ${expected.length}`);
    
    if (received === expected) {
      const response = NextResponse.json({ success: true });
      
      // Set a cookie that expires in 24 hours
      response.cookies.set('admin_token', 'valid', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24,
      });

      return response;
    }

    // Special check for common issues
    let hint = "";
    if (expected.length < 5 && received.length > 5) {
      hint = " (Check if your secret contains special characters like '&' that might be cutting it off)";
    }

    return NextResponse.json({ 
      error: `Invalid credentials. Expected length: ${expected.length}, Received length: ${received.length}${hint}`,
      debug: {
        expectedStart: expected.substring(0, 2) + '...',
        receivedStart: received.substring(0, 2) + '...'
      }
    }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
