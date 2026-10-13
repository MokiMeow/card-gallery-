/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // The gallery used to live at this path; existing embeds and links keep working.
  async redirects() {
    return [{ source: "/gallery-view/:path*", destination: "/", permanent: false }]
  },
}

export default nextConfig
