import { NextResponse } from 'next/server';
import { getAuthURL } from '@/lib/mercadolibre';

export async function GET() {
  const { url, codeVerifier } = getAuthURL();

  const response = NextResponse.redirect(url);

  // Store code_verifier in a cookie
  response.cookies.set('code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}
