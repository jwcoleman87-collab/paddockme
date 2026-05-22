import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://paddockme-oz51.vercel.app"),
  title: "PaddockME - Agistment coordination for livestock, land and transport",
  description:
    "Australian agistment marketplace replacing phone tag with one workflow for livestock owners, landowners and stock transport.",
  openGraph: {
    title: "PaddockME - Feed, paddocks and trucks in one room",
    description:
      "Investor-ready MVP for coordinating agistment agreements and stock transport across regional Australia.",
    url: "https://paddockme-oz51.vercel.app",
    siteName: "PaddockME",
    images: [
      {
        url: "/demo/workspace.png",
        width: 1248,
        height: 720,
        alt: "PaddockME agreement workspace screenshot",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PaddockME - Feed, paddocks and trucks in one room",
    description:
      "Australian agistment coordination for livestock owners, landowners and stock transport.",
    images: ["/demo/workspace.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-warm-white text-bark">
        {children}
      </body>
    </html>
  );
}
