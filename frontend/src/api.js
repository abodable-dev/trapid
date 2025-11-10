const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

export const api = {
  async get(endpoint, options = {}) {
    // Build query string from params if provided
    let url = `${API_URL}${endpoint}`;
    if (options.params) {
      const queryString = new URLSearchParams(options.params).toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async postFormData(endpoint, formData) {
    const token = localStorage.getItem('token');
    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async put(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async patch(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async delete(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    return response.json();
  },

  // Xero Integration APIs
  xero: {
    getAuthUrl: () => api.get('/api/v1/xero/auth_url'),
    callback: (code) => api.post('/api/v1/xero/callback', { code }),
    getStatus: () => api.get('/api/v1/xero/status'),
    disconnect: () => api.delete('/api/v1/xero/disconnect'),
  },
};
