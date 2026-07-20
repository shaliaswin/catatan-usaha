import type { Metadata } from "next";
import "./globals.css";
import { BRAND_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: "Pencatatan cash flow dan untung/rugi per proyek",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
