import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hey-mark.vercel.app"),
  title: "Hey Mark",
  description: "Mark-powered marketing strategy workspace",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/mark.png",
    shortcut: "/mark.png",
    apple: "/mark.png"
  },
  openGraph: {
    title: "Hey Mark",
    description: "Mark-powered marketing strategy workspace",
    images: ["/mark.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Hey Mark",
    description: "Mark-powered marketing strategy workspace",
    images: ["/mark.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
