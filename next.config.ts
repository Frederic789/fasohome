
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pxmaejblmomhoioeebgw.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/property-images/**",
      },
      {
        protocol: "https",
        hostname: "pxmaejblmomhoioeebgw.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/agency-logos/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
