/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "collegetable.vercel.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tools.applemediaservices.com",
        pathname: "/**",
      },
    ],
  },
};
// images: {
//   remotePatterns: [
//     {
//       protocol: "https",
//       hostname: "is3-ssl.mzstatic.com",
//       port: "443",
//       pathname: "/image/**",
//     },
//     {
//       protocol: "https",
//       hostname: "tools.applemediaservices.com",
//       port: "443",
//       pathname: "/api/**",
//     },
//   ],
// },
module.exports = nextConfig;
