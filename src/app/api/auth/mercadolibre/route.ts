import { NextRequest, NextResponse } from 'next/server';
import { meliClient } from '@/lib/mercadolibre';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const codeVerifier = request.cookies.get('code_verifier')?.value;

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  if (!codeVerifier) {
    return NextResponse.json({ error: 'Missing code_verifier' }, { status: 400 });
  }

  try {
    const data = await meliClient.exchangeCodeForToken(code, codeVerifier);
    
    // Create a response to clear the cookie
    const response = NextResponse.json({
      message: 'Authentication successful. Tokens stored securely.',
      // Optionally return tokens if user still wants to see them, but better not to expose them
      // MELI_ACCESS_TOKEN: data.access_token,
      // MELI_REFRESH_TOKEN: data.refresh_token,
      // MELI_USER_ID: data.user_id,
      // expires_in: data.expires_in,
    });
    
    // Clear the code_verifier cookie
    response.cookies.delete('code_verifier');
    
    return response;
  } catch (error) {
    console.error('Exchange error:', error);
    return NextResponse.json({ error: 'Failed to exchange token' }, { status: 500 });
  }
}
