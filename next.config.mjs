import { withSentryConfig } from "@sentry/nextjs/config"

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Lint errors fail the build (warnings don't). Run `npm run lint` locally.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // The build fails on type errors (run `npm run typecheck` locally).
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default withSentryConfig(nextConfig, {
  org: "illuma-by-ice",
  project: "aje-admin",
  // Source maps upload only when SENTRY_AUTH_TOKEN is set (CI / production builds).
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Send browser events through this app so ad blockers don't drop them.
  tunnelRoute: "/monitoring",
})
