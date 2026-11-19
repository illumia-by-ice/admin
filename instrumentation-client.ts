import * as Sentry from "@sentry/nextjs"

/**
 * Sentry in the browser: errors, performance traces and Session Replay.
 * Disabled when NEXT_PUBLIC_SENTRY_DSN is unset.
 *
 * The admin panel shows customer data, so replays mask all text and inputs and
 * block media, and no cookies, bodies or query strings are collected.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const isProd = process.env.NODE_ENV === "production"

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    tracesSampleRate: isProd ? 0.1 : 1.0,
    // Link admin page loads to the API's traces (adds sentry-trace/baggage headers to API calls).
    tracePropagationTargets: process.env.NEXT_PUBLIC_API_URL ? [process.env.NEXT_PUBLIC_API_URL] : [],
    replaysSessionSampleRate: isProd ? 0.05 : 0,
    replaysOnErrorSampleRate: 1.0,
    dataCollection: { userInfo: false, cookies: false, httpBodies: [], urlQueryParams: false },
    integrations: [Sentry.replayIntegration({ maskAllText: true, maskAllInputs: true, blockAllMedia: true })],
  })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
