interface ApiClientConfig {
    baseURL: string;
    timeout?: number;
    headers?: Record<string, string>;
}


interface RequestConfig {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    data?: any;
    params?: Record<string, string | number>;
    headers?: Record<string, string>;
    timeout?: number;
}
  
interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
}
  
interface ApiError {
    message: string;
    status?: number;
    code?: string;
    details?: any;
}
  
class ApiClient {
    private baseURL: string;
    private defaultHeaders: Record<string, string>;
    private timeout: number;
  
    constructor(config: ApiClientConfig) {
        this.baseURL = config.baseURL;
        this.timeout = config.timeout || 10000;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...config.headers,
        };
    }
  
    // Interceptor para agregar token de autenticación
    private getAuthHeaders(): Record<string, string> {
        if (typeof window === 'undefined') return {};
        
        try {
            const token = localStorage.getItem('token');
            return token ? { Authorization: `Bearer ${token}` } : {};
        } catch (error) {
            console.error('Error accessing token:', error);
            return {};
        }
    }
  
    // Construir URL con query parameters
    private buildURL(url: string, params?: Record<string, string | number>): string {
      const fullURL = `${this.baseURL}${url}`;
      if (!params) return fullURL;
  
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
  
      return `${fullURL}?${searchParams.toString()}`;
    }
  
    // Manejar errores de la API
    private async handleError(response: Response): Promise<never> {
        let errorMessage = 'Error en la petición';
        let errorDetails: any = null;
  
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
            errorDetails = errorData;
        } catch {
            // Si no se puede parsear el JSON, usar el status text
            errorMessage = response.statusText || errorMessage;
        }
  
        const apiError: ApiError = {
            message: errorMessage,
            status: response.status,
            code: response.status.toString(),
            details: errorDetails,
        };
  
        // Manejar casos específicos
        if (response.status === 401 && typeof window !== 'undefined') {
            // Token expirado o inválido
            try {
                localStorage.removeItem('token');
                window.location.href = '/login';
            } catch (error) {
                console.error('Error handling auth error:', error);
            }
        }
  
        throw apiError;
    }
  
    // Método principal para hacer requests
    async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
        const {
            method,
            url,
            data,
            params,
            headers: requestHeaders = {},
            timeout = this.timeout,
        } = config;
  
        const fullURL = this.buildURL(url, params);
        const headers = {
            ...this.defaultHeaders,
            ...this.getAuthHeaders(),
            ...requestHeaders,
        };
  
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
  
        try {
            const requestInit: RequestInit = {
                method,
                headers,
                signal: controller.signal,
            };
  
            // Solo agregar body para métodos que lo soportan
            if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
                requestInit.body = JSON.stringify(data);
            }
  
            const response = await fetch(fullURL, requestInit);
            clearTimeout(timeoutId);
  
            if (!response.ok) {
                await this.handleError(response);
            }
  
            const responseData = await response.json();
  
            return {
                data: responseData,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
            };
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error instanceof Error && error.name === 'AbortError') {
            throw {
                message: 'Timeout: La petición tardó demasiado',
                code: 'TIMEOUT',
            } as ApiError;
            }
    
            throw error;
        }
    }
  
    // Métodos de conveniencia
    async get<T = any>(url: string, params?: Record<string, string | number>): Promise<ApiResponse<T>> {
      return this.request<T>({ method: 'GET', url, params });
    }
  
    async post<T = any>(url: string, data?: any, params?: Record<string, string | number>): Promise<ApiResponse<T>> {
      return this.request<T>({ method: 'POST', url, data, params });
    }
  
    async put<T = any>(url: string, data?: any, params?: Record<string, string | number>): Promise<ApiResponse<T>> {
      return this.request<T>({ method: 'PUT', url, data, params });
    }
  
    async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
      return this.request<T>({ method: 'PATCH', url, data });
    }
  
    async delete<T = any>(url: string): Promise<ApiResponse<T>> {
      return this.request<T>({ method: 'DELETE', url });
    }
}
  
// Instancia principal del cliente API
export const apiClient = new ApiClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://api-tlm.localhost/api',
    timeout: 10000,
});
  
export { ApiClient };
export type { ApiError, ApiResponse };

