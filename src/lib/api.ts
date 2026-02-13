import { store } from '@/store';
import { refreshAccessToken, logout, setAccessToken } from '@/store/slices/authSlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let { accessToken, refreshToken } = store.getState().auth;

  // Helper: fetch with token
  const makeRequest = async (token: string | null) => {
    const headers: HeadersInit = {
      ...(options.headers || {}),
    };

    // Agar JSON body bo‘lsa va FormData emas
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };

  let response = await makeRequest(accessToken);

  // 🔁 401 -> refresh token flow
  if (response.status === 401 && refreshToken) {
    try {
      const result = await store.dispatch(refreshAccessToken(refreshToken));

      if (refreshAccessToken.fulfilled.match(result)) {
        accessToken = result.payload.accessToken;
        store.dispatch(setAccessToken(accessToken));

        // Retry original request
        response = await makeRequest(accessToken);
      } else {
        throw new Error('Session expired');
      }
    } catch (err) {
      store.dispatch(logout());
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw err;
    }
  }

  // ❌ Error handling
  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData?.message || errorMessage;
    } catch {
      // fallback: response not JSON
    }
    throw new Error(errorMessage);
  }

  // ✅ Return JSON or any type
  return response.json() as Promise<T>;
}
