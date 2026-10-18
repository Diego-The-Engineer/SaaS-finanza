import { request } from './client';

export const login = (username, password) =>
  request('/login', { method: 'POST', body: { username, password } });
