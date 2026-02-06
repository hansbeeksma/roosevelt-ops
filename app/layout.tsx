import type { Metadata } from "next";
import "./globals.css";
import { WebVitals } from "@/components/WebVitals";

export const metadata: Metadata = {
  title: "Roosevelt OPS - Engineering Metrics",
  description: "DORA + SPACE metrics dashboard for Roosevelt OPS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <WebVitals />
        {children}
      </body>
    </html>
  );
}
