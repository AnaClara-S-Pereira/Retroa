// CONFIGURACAO DO NEXT: DOMINIOS PERMITIDOS PARA IMAGENS EXTERNAS.
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "hfjbwtsmoperpsqnbcir.supabase.co" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
    ],
  },
};

export default nextConfig;
