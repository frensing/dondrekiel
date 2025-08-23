import axios from "axios";

const API_BASE_URL = "https://app.dondrekiel.de/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from localStorage on each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    } as typeof config.headers;
  }
  return config;
});

export type LoginResponse = {
  token: string;
};

export async function loginRequest(name: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/rpc/login", { name, password });
  return data;
}
