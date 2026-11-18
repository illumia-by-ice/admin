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

export default nextConfig
