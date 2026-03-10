import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enterprise HRMS",
  description: "Production-grade HRMS"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
