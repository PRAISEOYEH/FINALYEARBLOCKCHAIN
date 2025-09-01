/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable SWC minifier to use Terser instead
  swcMinify: false,
  // Disable SWC transforms to use Babel as fallback
  experimental: {
    forceSwcTransforms: false,
    // Disable turbo mode to prevent SWC issues
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Webpack configuration for better compatibility
  webpack: (config, { dev, isServer }) => {
    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    // Handle SWC binary issues gracefully
    if (!dev) {
      config.optimization.minimize = true
      config.optimization.minimizer = config.optimization.minimizer.filter(
        (plugin) => plugin.constructor.name !== 'SwcMinify'
      )
    }
    
    return config
  },
  // Compiler options for better stability
  compiler: {
    // Disable emotion if causing issues
    emotion: false,
  },
  // Build configuration
  distDir: '.next',
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

export default nextConfig
