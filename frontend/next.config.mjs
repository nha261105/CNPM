/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    forceSwcTransforms: false,
  },
  transpilePackages: ['leaflet', 'react-leaflet'],
  webpack: (config, { isServer }) => {
    // Fix for leaflet in SSR
    if (isServer) {
      config.externals.push('leaflet');
    }
    
    // Ignore specific warnings that cause build failures
    config.ignoreWarnings = [
      /Critical dependency/,
      /the request of a dependency is an expression/
    ];
    
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during build
  },
  typescript: {
    ignoreBuildErrors: false, // Keep TypeScript checking
  },
  // Optimize static generation
  output: 'standalone',
  trailingSlash: false,
};

export default nextConfig;
