// Cienki klient fetch dla API. Rzuca błędem z komunikatem serwera.

export async function api<T = any>(
  path: string,
  opts?: RequestInit & { json?: unknown }
): Promise<T> {
  const { json, headers, ...rest } = opts ?? {};
  const res = await fetch(path, {
    ...rest,
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Błąd ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
