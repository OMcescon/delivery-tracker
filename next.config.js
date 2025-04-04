/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración básica para Vercel
  reactStrictMode: true,
  swcMinify: true,
  // Ignorar advertencias de ESLint durante la construcción
  eslint: {
    ignoreDuringBuilds: true
  },
  // Configuración de imágenes optimizada
  images: {
    domains: ['*'],
    formats: ['image/avif', 'image/webp']
  },
  // Optimizaciones de compilación
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // Configuración de webpack
  webpack: (config, { isServer }) => {
    return config
  }
};

// Esta configuración se utilizará tanto en desarrollo como en producción
// En producción, optimiza el rendimiento y tamaño del bundle

module.exports = nextConfig;
