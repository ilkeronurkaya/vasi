/**
 * Cloudflare Workers bindings — wrangler.toml ile eşleşmeli
 */
export interface Env {
  DB: D1Database
  BUCKET: R2Bucket
  QUEUE: Queue
  JWT_SECRET: string
  ENCRYPTION_KEY: string
  RESEND_API_KEY: string
  EMAIL_FROM?: string
  APP_URL?: string
  NETGSM_USER: string
  NETGSM_PASS: string
  IYZICO_API_KEY: string
  IYZICO_SECRET_KEY: string
  IYZICO_MODE: string
  IYZICO_BASE_URL?: string
}
