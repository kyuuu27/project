/** @type {import('next').NextConfig} */
const nextConfig = {
  // 允许所有 HTTPS 域名加载图片 (用于文章中的外部图片)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
