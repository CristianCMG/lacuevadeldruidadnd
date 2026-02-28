import axios from 'axios';
import { performance } from 'perf_hooks';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function measureLatency(url: string, name: string) {
  const start = performance.now();
  try {
    await axios.get(url);
    const end = performance.now();
    const duration = end - start;
    console.log(`[PASS] ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  } catch (error) {
    console.error(`[FAIL] ${name}: Error`, error instanceof Error ? error.message : String(error));
    return -1;
  }
}

async function runPerformanceTests() {
  console.log('Starting Performance Tests...');
  console.log(`Base URL: ${BASE_URL}`);

  const endpoints = [
    { url: `${BASE_URL}/`, name: 'Homepage' },
    { url: `${BASE_URL}/api/auth/login`, name: 'Auth Redirect' },
    // Add more endpoints as needed
  ];

  let totalDuration = 0;
  let successCount = 0;

  for (const endpoint of endpoints) {
    const duration = await measureLatency(endpoint.url, endpoint.name);
    if (duration !== -1) {
      totalDuration += duration;
      successCount++;
    }
  }

  if (successCount > 0) {
    const avg = totalDuration / successCount;
    console.log(`Average Latency: ${avg.toFixed(2)}ms`);
    if (avg > 500) {
      console.warn('WARNING: Average latency exceeds 500ms threshold');
      process.exit(1);
    }
  } else {
    console.error('All tests failed');
    process.exit(1);
  }
}

runPerformanceTests();
