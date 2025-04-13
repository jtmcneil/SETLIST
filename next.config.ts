import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "p16-common-sign-va.tiktokcdn-us.com",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
