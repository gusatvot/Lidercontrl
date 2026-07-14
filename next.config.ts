import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
  // Chat desactivado: sin Socket.io proxy.
  // Para reactivar: descomentar rewrites() abajo y levantar mini-services/chat-service.
  // skipTrailingSlashRedirect: true,
  // skipMiddlewareUrlNormalize: true,
};

export default nextConfig;
