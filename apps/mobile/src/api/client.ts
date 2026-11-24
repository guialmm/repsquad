import type { paths } from "./schema";

/**
 * Endereço da API. No celular (Expo Go) "localhost" é o próprio celular,
 * então use o IP do seu computador na rede: EXPO_PUBLIC_API_URL no .env.
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

const HEALTH_TIMEOUT_MS = 10_000;

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }
  return fetch(`${API_URL}${path}`, { ...init, headers });
}

type HealthResponse =
  paths["/health"]["get"]["responses"][200]["content"]["application/json"];

export async function getHealth(): Promise<{ status: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  try {
    const response = await apiFetch("/health", {
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`API respondeu ${response.status}`);
    }
    const body = (await response.json()) as HealthResponse;
    return { status: body.status ?? "desconhecido" };
  } finally {
    clearTimeout(timeoutId);
  }
}
