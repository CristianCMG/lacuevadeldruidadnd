import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { RateLimiter } from './rate-limiter';

vi.mock('axios');

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  const mockAxios: { request: ReturnType<typeof vi.fn> } = {
    request: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(axios.create).mockReturnValue(mockAxios as unknown as ReturnType<typeof axios.create>);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    rateLimiter = new RateLimiter({
      maxRetries: 3,
      baseDelay: 10,
    });
  });

  it('should make a successful request', async () => {
    const mockResponse = { data: 'success', status: 200 };
    mockAxios.request.mockResolvedValue(mockResponse);

    const response = await rateLimiter.request({ url: '/test' });

    expect(response).toBe(mockResponse);
    expect(mockAxios.request).toHaveBeenCalledTimes(1);
  });

  it('should retry on 429 error and succeed', async () => {
    const error429 = {
      response: {
        status: 429,
        headers: {},
      },
    };
    const successResponse = { data: 'success', status: 200 };

    mockAxios.request
      .mockRejectedValueOnce(error429)
      .mockRejectedValueOnce(error429)
      .mockResolvedValue(successResponse);

    const response = await rateLimiter.request({ url: '/test' });

    expect(response).toBe(successResponse);
    expect(mockAxios.request).toHaveBeenCalledTimes(3);
  });

  it('should respect Retry-After header', async () => {
    const error429 = {
      response: {
        status: 429,
        headers: {
          'retry-after': '1',
        },
      },
    };
    const successResponse = { data: 'success', status: 200 };

    mockAxios.request
      .mockRejectedValueOnce(error429)
      .mockResolvedValue(successResponse);

    const startTime = Date.now();
    await rateLimiter.request({ url: '/test' });
    const endTime = Date.now();

    expect(mockAxios.request).toHaveBeenCalledTimes(2);
    expect(endTime - startTime).toBeGreaterThan(900); 
  });

  it('should throw error after max retries exceeded', async () => {
    const error429 = {
      isAxiosError: true,
      response: {
        status: 429,
        headers: {},
      },
    };

    mockAxios.request.mockRejectedValue(error429);

    await expect(rateLimiter.request({ url: '/test' })).rejects.toEqual(error429);
    expect(mockAxios.request).toHaveBeenCalledTimes(4);
  });

  it('should throw immediately for non-429 errors', async () => {
    const error500 = {
      response: {
        status: 500,
      },
      message: 'Server Error',
    };

    mockAxios.request.mockRejectedValue(error500);

    await expect(rateLimiter.request({ url: '/test' })).rejects.toEqual(error500);
    expect(mockAxios.request).toHaveBeenCalledTimes(1);
  });
});
