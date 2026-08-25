/**
 * Minimal fixed-window rate limiter backed by Upstash Redis's REST API (no SDK dependency —
 * just fetch, so it works without any package install). Reads UPSTASH_REDIS_REST_URL /
 * UPSTASH_REDIS_REST_TOKEN, which are already provisioned in .env.example but were never
 * wired up to anything. If those env vars aren't set, this always allows the request rather
 * than breaking the flow it's protecting — so it's safe to deploy before Upstash is configured,
 * but you should set the env vars promptly (see the setup guidance you were given).
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return { allowed: true, remaining: limit }
  }

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['INCR', `ratelimit:${key}`],
        ['EXPIRE', `ratelimit:${key}`, String(windowSeconds), 'NX'],
      ]),
    })
    if (!res.ok) {
      console.error('Rate limit check failed (Upstash request error):', res.status)
      return { allowed: true, remaining: limit }
    }
    const [incrResult] = (await res.json()) as Array<{ result: number }>
    const count = incrResult?.result ?? 0
    return { allowed: count <= limit, remaining: Math.max(0, limit - count) }
  } catch (err) {
    console.error('Rate limit check failed:', err)
    return { allowed: true, remaining: limit }
  }
}
