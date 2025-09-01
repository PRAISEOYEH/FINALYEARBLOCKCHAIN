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
  output: 'standalone',
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
  // Webpack configuration for better compatibility and blockchain integration
  webpack: (config, { dev, isServer }) => {
    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      assert: false,
      http: false,
      https: false,
      os: false,
      buffer: false,
    }
    
    // Handle SWC binary issues gracefully
    if (!dev) {
      config.optimization.minimize = true
      config.optimization.minimizer = config.optimization.minimizer.filter(
        (plugin) => plugin.constructor.name !== 'SwcMinify'
      )
    }
    
    // Ensure blockchain-related modules are properly bundled
    config.resolve.alias = {
      ...config.resolve.alias,
      // Ensure proper resolution of blockchain modules
      '@wagmi/core': require.resolve('@wagmi/core'),
      'wagmi': require.resolve('wagmi'),
      'viem': require.resolve('viem'),
    }
    
    return config
  },
  // Compiler options for better stability
  compiler: {
    // Disable emotion if causing issues
    emotion: false,
  },
  // Build configuration - prevent caching of provider components
  distDir: '.next',
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Disable static optimization for pages that require dynamic blockchain functionality
  trailingSlash: false,
  // Ensure proper handling of dynamic imports for blockchain modules
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
}

export default nextConfig
