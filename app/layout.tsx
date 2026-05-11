import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuticulome.org",
  description:
    "A curated database of arthropod cuticular proteins, classifications, references, downloads, and sequence analysis tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
