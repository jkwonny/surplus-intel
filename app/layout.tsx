import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Surplus Intelligence — Market",
  description: "Live spot market for surplus AI inference capacity",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
