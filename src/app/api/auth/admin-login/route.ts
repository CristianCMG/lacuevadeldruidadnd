import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();
    const validSecret = process.env.ADMIN_SECRET;

    if (secret === validSecret) {
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

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
