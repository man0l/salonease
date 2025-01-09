declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    NEXT_PUBLIC_BACKEND_URL: string
    BACKEND_URL: string
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string
    STRIPE_SECRET_KEY?: string
    NEXT_PUBLIC_APP_URL: string
  }
} 