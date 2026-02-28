import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { logger } from './logger';
import { IRateLimiter } from './interfaces';

interface RateLimiterConfig {
  maxRetries?: number;
  baseDelay?: number;
}

export class RateLimiter implements IRateLimiter {
  private client: AxiosInstance;
  private maxRetries: number;
  private baseDelay: number;

  constructor(config: RateLimiterConfig = {}) {
    this.client = axios.create();
    this.maxRetries = config.maxRetries ?? 3;
    this.baseDelay = config.baseDelay ?? 1000;
  }

  async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        return await this.client.request<T>(config);
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          attempt++;
          if (attempt > this.maxRetries) {
            throw error;
          }

          const retryAfter = error.response.headers['retry-after'];
          let delay = this.baseDelay * Math.pow(2, attempt - 1);

          if (retryAfter) {
            const seconds = parseInt(retryAfter, 10);
            if (!isNaN(seconds)) {
              delay = seconds * 1000;
            }
          }

          // Add a small jitter to avoid thundering herd
          delay += Math.random() * 100;

          logger.warn(`Rate limit hit. Retrying in ${delay}ms (Attempt ${attempt}/${this.maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }
    
    throw new Error('Max retries exceeded');
  }
  
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}

export const meliRateLimiter = new RateLimiter();
