import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { TokenData } from './types';

export interface ITokenStorage {
  save(tokens: TokenData): Promise<void>;
  get(): Promise<TokenData | null>;
}

export interface IRateLimiter {
  request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}

export interface ILogger {
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, context?: Record<string, any>): void;
  debug(message: string, context?: Record<string, any>): void;
  child(context: Record<string, any>): ILogger;
}

export interface IMeliClient {
  getAuthURL(): { url: string; codeVerifier: string };
  exchangeCodeForToken(code: string, codeVerifier: string): Promise<any>;
  refreshAccessToken(currentTokens: TokenData): Promise<string>;
  getValidAccessToken(): Promise<string | null>;
  getUserItems(): Promise<any[]>;
}
