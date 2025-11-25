"use client";

import { parseCookies } from "nookies";
import { AUTH_COOKIE } from "./auth";

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
};

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  }

  private _getHeaders() {
    const cookies = parseCookies();
    const token = cookies[AUTH_COOKIE];

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async _request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        headers: {
          ...this._getHeaders(),
          ...(options.headers || {}),
        },
      });

      const status = res.status;

      let json: any = null;
      try {
        json = await res.json();
      } catch (_) {
        json = null;
      }

      if (!res.ok) {
        return {
          success: false,
          error: json?.message || json || res.statusText,
          status,
        };
      }

      return {
        success: true,
        data: json,
        status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Network error",
        status: 500,
      };
    }
  }

  get<T = any>(url: string): Promise<ApiResponse<T>> {
    return this._request<T>(url, { method: "GET" });
  }

  post<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    return this._request<T>(url, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    return this._request<T>(url, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  del<T = any>(url: string): Promise<ApiResponse<T>> {
    return this._request<T>(url, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
