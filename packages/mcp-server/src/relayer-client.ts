export interface RelayerError {
  error: string;
  message?: string;
  issues?: unknown;
}

export class RelayerHttpError extends Error {
  constructor(public status: number, public body: RelayerError | unknown) {
    super(`relayer ${status}: ${JSON.stringify(body)}`);
  }
}

export async function relayerGet<T>(baseUrl: string, path: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`);
  const body = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) throw new RelayerHttpError(res.status, body);
  return body as T;
}

export async function relayerPost<T>(baseUrl: string, path: string, body: unknown): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const json = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) throw new RelayerHttpError(res.status, json);
  return json as T;
}

export function formatRelayerError(e: unknown): string {
  if (e instanceof RelayerHttpError) {
    const b = e.body as RelayerError;
    return `Relayer error ${e.status}: ${b.error ?? "unknown"}${b.message ? " — " + b.message : ""}`;
  }
  return (e as Error)?.message ?? String(e);
}
