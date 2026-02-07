import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import axiosInstance from '@base/interceptors/axios.instance';
import { BaseResponse } from '@base/models/base';
import { BasePaginatedResponse } from '@base/models/basePaginated';

type Primitive = string | number | boolean | null | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryParams = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Body = Record<string, any> | FormData | null | undefined;

export class HttpError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(message: string, opts?: { status?: number; code?: string; details?: unknown }) {
    super(message);
    this.name = 'HttpError';
    this.status = opts?.status;
    this.code = opts?.code;
    this.details = opts?.details;
  }
}

class HttpService {
  private readonly axios: AxiosInstance;

  constructor(instance: AxiosInstance = axiosInstance) {
    this.axios = instance;
  }

  private async _request<R>(
    method: Method,
    url: string,
    options?: {
      params?: QueryParams;
      data?: Body;
      signal?: AbortSignal;
      config?: AxiosRequestConfig;
    },
  ): Promise<R> {
    try {
      const response = await this.axios.request<R>({
        method,
        url,
        params: options?.params,
        data: options?.data ?? undefined,
        signal: options?.signal,
        ...(options?.config ?? {}),
      });
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const ax = err as AxiosError<unknown>;
        const status = ax.response?.status;
        const code = ax.code;
        const serverMessage =
          (ax.response?.data &&
          typeof ax.response.data === 'object' &&
          ax.response.data !== null &&
          'message' in ax.response.data &&
          typeof (ax.response.data as { message?: unknown }).message === 'string'
            ? (ax.response.data as { message: string }).message
            : undefined) ||
          ax.message ||
          'Request failed';
        throw new HttpError(serverMessage, {
          status,
          code,
          details: ax.response?.data ?? ax.toJSON?.(),
        });
      }
      throw new HttpError((err as Error)?.message ?? 'Unknown error');
    }
  }

  public get<T>(
    url: string,
    params?: QueryParams | null,
    opts?: { signal?: AbortSignal; config?: AxiosRequestConfig },
  ): Promise<BaseResponse<T>> {
    return this._request<BaseResponse<T>>('GET', url, {
      params: params ?? undefined,
      signal: opts?.signal,
      config: opts?.config,
    });
  }

  public getPaginated<T>(
    url: string,
    params?: QueryParams | null,
    opts?: { signal?: AbortSignal; config?: AxiosRequestConfig },
  ): Promise<BasePaginatedResponse<T>> {
    return this._request<BasePaginatedResponse<T>>('GET', url, {
      params: params ?? undefined,
      signal: opts?.signal,
      config: opts?.config,
    });
  }

  public post<T>(
    url: string,
    payload?: Body,
    opts?: { signal?: AbortSignal; config?: AxiosRequestConfig },
  ): Promise<BaseResponse<T>> {
    return this._request<BaseResponse<T>>('POST', url, {
      data: payload,
      signal: opts?.signal,
      config: opts?.config,
    });
  }

  public upload<T>(
    url: string,
    payload: FormData,
    opts?: { signal?: AbortSignal; config?: AxiosRequestConfig },
  ): Promise<T> {
    return this._request<T>('POST', url, {
      data: payload,
      signal: opts?.signal,
      config: {
        headers: { 'Content-Type': 'multipart/form-data' },
        ...(opts?.config ?? {}),
      },
    });
  }

  public put<T>(
    url: string,
    payload?: Body,
    opts?: { signal?: AbortSignal; config?: AxiosRequestConfig },
  ): Promise<BaseResponse<T>> {
    return this._request<BaseResponse<T>>('PUT', url, {
      data: payload,
      signal: opts?.signal,
      config: opts?.config,
    });
  }

  public patch<T>(
    url: string,
    payload?: Body,
    opts?: { signal?: AbortSignal; config?: AxiosRequestConfig },
  ): Promise<BaseResponse<T>> {
    return this._request<BaseResponse<T>>('PATCH', url, {
      data: payload,
      signal: opts?.signal,
      config: opts?.config,
    });
  }

  public delete<T>(
    url: string,
    opts?: { signal?: AbortSignal; config?: AxiosRequestConfig },
  ): Promise<T> {
    return this._request<T>('DELETE', url, {
      signal: opts?.signal,
      config: opts?.config,
    });
  }
}

export default HttpService;
