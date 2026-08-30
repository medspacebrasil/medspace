import { headers } from "next/headers"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

/**
 * Distributed rate limiting backed by Upstash Redis.
 *
 * Works on serverless/edge (Vercel) where in-memory counters are unreliable
 * because each instance has its own memory. If the Upstash env vars are not
 * configured the limiter "fails open" (allows the request) so local dev and
 * pre-launch environments keep working — but it logs a warning in production
 * so a missing config is noticed.
 *
 * Required env vars:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

let _redis: Redis | null = null
function getRedis(): Redis | null {
  if (_redis) return _redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  _redis = new Redis({ url, token })
  return _redis
}

type Duration = `${number} s` | `${number} m` | `${number} h` | `${number} d`

export type RateLimitConfig = {
  /** Max requests allowed within `window`. */
  tokens: number
  /** Sliding window duration, e.g. "60 s", "1 h". */
  window: Duration
  /** Stable key prefix to namespace this limiter. */
  prefix: string
  /**
   * Limiter de segurança crítico (auth/senha). Quando o limiter não puder ser
   * construído e `RATE_LIMIT_FAIL_CLOSED=true`, estes falham FECHADO (negam)
   * em vez de abrir. Ver `rateLimit()`.
   */
  critical?: boolean
}

/** Centralised limits so they're easy to audit and tune. */
export const RATE_LIMITS = {
  /** Per-IP login attempts (stops single-source brute force / stuffing). */
  login: { tokens: 5, window: "60 s", prefix: "login", critical: true },
  /** Per-account login attempts (stops distributed brute force on one email). */
  loginEmail: { tokens: 10, window: "10 m", prefix: "login-email", critical: true },
  register: { tokens: 3, window: "1 h", prefix: "register", critical: true },
  password: { tokens: 5, window: "1 h", prefix: "password", critical: true },
  /** Password-reset requests, per IP and per email (anti-abuse / anti-enumeration). */
  passwordReset: { tokens: 4, window: "1 h", prefix: "pwreset", critical: true },
  upload: { tokens: 40, window: "1 h", prefix: "upload" },
  /** Exportação de dados (LGPD) — baixa frequência legítima. */
  export: { tokens: 5, window: "1 h", prefix: "export" },
  /** Ações destrutivas (excluir conta/anúncio). */
  destructive: { tokens: 10, window: "1 h", prefix: "destructive" },
  /**
   * Registro de visualização/contato por anúncio. Limite alto porque um mesmo
   * IP pode ser uma clínica inteira atrás de NAT; a proteção real contra
   * inflar número é a deduplicação por visitante/dia, não este limitador.
   */
  metrics: { tokens: 120, window: "1 m", prefix: "metrics" },
  /** Geracao de cobranca. Baixo de proposito: cada tentativa cria cobranca
   * no gateway, e repeticao rapida costuma ser erro de clique ou abuso. */
  checkout: { tokens: 10, window: "10 m", prefix: "checkout" },
} as const satisfies Record<string, RateLimitConfig>

const _limiters = new Map<string, Ratelimit>()
function getLimiter(config: RateLimitConfig): Ratelimit | null {
  const redis = getRedis()
  if (!redis) return null
  let limiter = _limiters.get(config.prefix)
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.tokens, config.window),
      prefix: `medspace:rl:${config.prefix}`,
      analytics: false,
    })
    _limiters.set(config.prefix, limiter)
  }
  return limiter
}

let _warned = false

export type RateLimitResult = {
  success: boolean
  /** Seconds the caller should wait before retrying (best effort). */
  retryAfter: number
}

/**
 * Consume one token for `identifier` against the given limiter config.
 * Returns `{ success: false }` when the limit is exceeded.
 */
export async function rateLimit(
  config: RateLimitConfig,
  identifier: string
): Promise<RateLimitResult> {
  const limiter = getLimiter(config)
  if (!limiter) {
    if (process.env.NODE_ENV === "production" && !_warned) {
      _warned = true
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN not set — requests are NOT being rate limited. " +
          "Configure o Upstash em produção. Defina RATE_LIMIT_FAIL_CLOSED=true para negar " +
          "rotas de autenticação quando o limiter estiver indisponível."
      )
    }
    // Fail-closed opcional: em produção, com a flag ligada, limiters críticos
    // (login/senha/registro/reset) NEGAM quando o Redis não está configurado —
    // assim uma falha de config não deixa a autenticação sem proteção. Ative
    // apenas DEPOIS de provisionar o Upstash, senão ninguém consegue logar.
    if (
      config.critical &&
      process.env.NODE_ENV === "production" &&
      process.env.RATE_LIMIT_FAIL_CLOSED === "true"
    ) {
      return { success: false, retryAfter: 60 }
    }
    return { success: true, retryAfter: 0 }
  }

  try {
    const { success, reset } = await limiter.limit(identifier)
    const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000))
    return { success, retryAfter }
  } catch (error) {
    // Never let a Redis hiccup take down auth — fail open but log it.
    console.error("[rate-limit] limiter error:", error)
    return { success: true, retryAfter: 0 }
  }
}

/**
 * Best-effort client IP from the proxy headers Vercel/Next set.
 * Falls back to a constant so the limiter still groups unknown clients.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers()
  const forwarded = h.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]!.trim()
  return h.get("x-real-ip")?.trim() || "unknown"
}
