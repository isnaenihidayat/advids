import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdvIDs - AI Video Creator",
  description: "Create stunning AI-generated videos with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}