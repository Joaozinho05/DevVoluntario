const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors; // [{ field, message }] vindo da validação Zod do back-end
  }
}

// O AuthContext registra aqui o que fazer quando a API responde 401 com um token enviado.
let unauthorizedHandler = null;
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique se a API está no ar.', 0);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && token && unauthorizedHandler) unauthorizedHandler();
    throw new ApiError(data?.message || 'Erro inesperado.', response.status, data?.errors);
  }

  return data;
}

export const authApi = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),
};

// Monta ?a=1&b=2 ignorando valores vazios.
function toQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

export const usersApi = {
  updateMe: (token, body) => request('/users/me', { method: 'PATCH', body, token }),
};

export const jobsApi = {
  list: (params) => request(`/jobs${toQuery(params)}`),
  mine: (token) => request('/jobs/mine', { token }),
  create: (token, body) => request('/jobs', { method: 'POST', body, token }),
  apply: (token, jobId) => request(`/jobs/${jobId}/apply`, { method: 'POST', token }),
};

export const applicationsApi = {
  mine: (token) => request('/applications/mine', { token }),
};

export const adminApi = {
  users: (token) => request('/admin/users', { token }),
  deleteUser: (token, id) => request(`/admin/users/${id}`, { method: 'DELETE', token }),
  deleteJob: (token, id) => request(`/admin/jobs/${id}`, { method: 'DELETE', token }),
};
