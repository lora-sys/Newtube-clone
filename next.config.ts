import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  images :{
   remotePatterns : [
    {
      protocol : "https",
      hostname : "image.mux.com"
    }
   ]
  }
};

export default nextConfig;
