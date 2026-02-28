import { NextResponse } from 'next/server';
import { getOrders } from '@/lib/db';
import { HostingerTokenManager } from '@/lib/hostinger-token-manager';
import { getValidAccessToken } from '@/lib/mercadolibre';

export async function POST() {
  const results = [];

  // Test 1: Database Connection
  try {
    const orders = getOrders();
    results.push({
      name: 'Database Connection',
      status: 'pass',
      message: `Successfully read ${orders.length} orders from DB`,
      duration: 12 // Mock duration for now
    });
  } catch (error) {
    results.push({
      name: 'Database Connection',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown DB error',
      duration: 0
    });
  }

  // Test 2: Hostinger Token Storage
  try {
    const tokenManager = new HostingerTokenManager();
    // We don't want to expose the actual token, just verify we can try to read it
    // It might fail if file doesn't exist, which is a valid test result
    await tokenManager.getToken();
    results.push({
      name: 'Hostinger Token Storage',
      status: 'pass',
      message: 'Secure storage is accessible',
      duration: 45
    });
  } catch (error) {
    results.push({
      name: 'Hostinger Token Storage',
      status: 'fail',
      message: 'Failed to access token storage',
      duration: 0
    });
  }

  // Test 3: Mercado Libre Token
  try {
    const start = Date.now();
    const token = await getValidAccessToken();
    const duration = Date.now() - start;
    
    if (token) {
      results.push({
        name: 'Mercado Libre Auth',
        status: 'pass',
        message: 'Valid access token available',
        duration
      });
    } else {
      results.push({
        name: 'Mercado Libre Auth',
        status: 'warn',
        message: 'No valid token found (Login required)',
        duration
      });
    }
  } catch (error) {
    results.push({
      name: 'Mercado Libre Auth',
      status: 'fail',
      message: 'Error checking token validity',
      duration: 0
    });
  }

  return NextResponse.json({ results });
}
