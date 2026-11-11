/**
 * AppConfig
 * Central configuration loader from environment variables.
 * All env values are validated and typed here — no direct process.env access elsewhere.
 *
 * Related: src/app.module.ts
 * Pattern: NestJS ConfigModule with factory function
 */
export const appConfig = () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  database: {
    url: process.env.DATABASE_URL ?? '',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'access-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret-change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  clerk: {
    secretKey: process.env.CLERK_SECRET_KEY ?? '',
    jwtKey: process.env.CLERK_JWT_KEY ?? '',
  },

  stripe: {
    secretKey: process.env.SECRET_STRIPE_KEY ?? '',
    publishableKey: process.env.PUBLISHABLE_STRIPE_KEY ?? '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  },

  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD ?? '',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    model: process.env.OPENAI_MODEL ?? 'gpt-4o',
    embeddingModel:
      process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-ada-002',
  },

  emailjs: {
    serviceId: process.env.EMAILJS_SERVICE_ID ?? '',
    templateId: process.env.EMAILJS_TEMPLATE_ID ?? '',
    confirmTemplateId: process.env.EMAILJS_CONFIRM_TEMPLATE_ID ?? '',
    publicKey: process.env.EMAILJS_PUBLIC_KEY ?? '',
    privateKey: process.env.EMAILJS_PRIVATE_KEY ?? '',
  },

  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS ?? '',
  },
});
