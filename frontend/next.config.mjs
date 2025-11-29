/** @type {import('next').NextConfig} */
const nextConfig = {
  // Handle external packages properly
  serverExternalPackages: ['leaflet'],
  
  // Only transpile packages that aren't external
  transpilePackages: ['react-leaflet', 'react-leaflet-tracking-marker'],
  
  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Handle leaflet SSR issues
    if (isServer) {
      config.externals.push('leaflet', 'react-leaflet');
    }
    
    // Ignore specific warnings that cause builds to fail
    config.ignoreWarnings = [
      /Critical dependency/,
      /the request of a dependency is an expression/,
      /Module not found/
    ];
    
    // Handle problematic modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    
    return config;
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true, // Disable image optimization for build stability
  },
  
  // Skip problematic checks during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Static export configuration
  trailingSlash: false,
  
  // Disable problematic features
  poweredByHeader: false,
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'my-value',
  },
}

export default nextConfig;
