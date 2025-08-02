import { API_BASE_URL } from '../config/api';

/**
 * Constructs a full API URL from an endpoint
 * @param endpoint - The API endpoint (e.g., '/users', '/auth/login')
 * @returns The full URL
 */
export const buildApiUrl = (endpoint: string): string => {
  // Ensure endpoint starts with '/'
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`;
};

/**
 * Creates request options with common headers
 * @param options - Additional request options
 * @param includeAuth - Whether to include authorization header
 * @returns RequestInit object
 */
export const createRequestOptions = (
  options: RequestInit = {},
  includeAuth: boolean = false
): RequestInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return {
    ...options,
    headers,
  };
};

/**
 * Handles API errors consistently
 * @param response - Fetch response object
 * @returns Parsed response data or throws error
 */
export const handleApiResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.error || `HTTP error! status: ${response.status}`);
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }
  
  return data;
};

/**
 * Makes an API request with automatic error handling
 * @param endpoint - API endpoint
 * @param options - Request options
 * @param includeAuth - Whether to include authorization
 * @returns Promise with response data
 */
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  includeAuth: boolean = false
) => {
  const url = buildApiUrl(endpoint);
  const requestOptions = createRequestOptions(options, includeAuth);
  
  const response = await fetch(url, requestOptions);
  return handleApiResponse(response);
};

/**
 * Makes a GET request
 * @param endpoint - API endpoint
 * @param includeAuth - Whether to include authorization
 * @returns Promise with response data
 */
export const apiGet = (endpoint: string, includeAuth: boolean = false) => {
  return apiRequest(endpoint, { method: 'GET' }, includeAuth);
};

/**
 * Makes a POST request
 * @param endpoint - API endpoint
 * @param data - Request body data
 * @param includeAuth - Whether to include authorization
 * @returns Promise with response data
 */
export const apiPost = (endpoint: string, data: any, includeAuth: boolean = false) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }, includeAuth);
};

/**
 * Makes a PUT request
 * @param endpoint - API endpoint
 * @param data - Request body data
 * @param includeAuth - Whether to include authorization
 * @returns Promise with response data
 */
export const apiPut = (endpoint: string, data: any, includeAuth: boolean = false) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, includeAuth);
};

/**
 * Makes a DELETE request
 * @param endpoint - API endpoint
 * @param includeAuth - Whether to include authorization
 * @returns Promise with response data
 */
export const apiDelete = (endpoint: string, includeAuth: boolean = false) => {
  return apiRequest(endpoint, { method: 'DELETE' }, includeAuth);
}; 