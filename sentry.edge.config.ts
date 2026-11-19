import * as Sentry from "@sentry/nextjs"

// Sentry for the Edge runtime (middleware, edge routes).
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    dataCollection: { userInfo: false, cookies: false, httpBodies: [], urlQueryParams: false },
  })
}
