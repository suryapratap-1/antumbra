/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: false,
  images: { unoptimized: true },
  trailingSlash: true,
  devIndicators: false,
};
export default nextConfig;
