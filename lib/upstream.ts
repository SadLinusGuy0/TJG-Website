import 'server-only';
export class UpstreamError extends Error {
  constructor(public service: string, public status?: number) { super(`${service} is temporarily unavailable${status ? ` (${status})` : ''}`); }
}
export async function readBoundedJson<T>(response: Response, service: string, maxBytes = 16 * 1024 * 1024): Promise<T> {
  if (!response.ok) throw new UpstreamError(service, response.status);
  if (Number(response.headers.get('content-length')) > maxBytes) throw new UpstreamError(service);
  const reader = response.body?.getReader();
  if (!reader) throw new UpstreamError(service);
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new UpstreamError(service); }
      chunks.push(value);
    }
    const result = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder().decode(result)) as T;
  } catch { throw new UpstreamError(service); }
  finally { reader.releaseLock(); }
}
