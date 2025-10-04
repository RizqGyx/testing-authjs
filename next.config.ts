import type { NextConfig } from "next";

const hostnames = ["images.unsplash.com", "img.freepik.com"];

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: hostnames.map((hostname) => ({
      protocol: "https",
      hostname: hostname,
      port: "",
      pathname: "/**",
    })),
  },
};

export default nextConfig;
