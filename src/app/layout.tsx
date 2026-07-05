import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import { PaddockmeWorkflowProvider } from "@/lib/paddockmeWorkflow";

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
    "Australian agistment marketplace helping livestock owners, landowners and transport providers coordinate agreements and stock movement.",
  openGraph: {
    title: "PaddockME - Feed. Stock. Freight. Sorted.",
    description:
      "Australia's platform for agistment and livestock transport - agreements, transport and coordination in one place.",
    url: "https://paddockme-oz51.vercel.app",
    siteName: "PaddockME",
    images: [
      {
        url: "/og/paddockme-share-card-v2.png",
        width: 1200,
        height: 630,
        alt: "PaddockME - Feed. Stock. Freight. Sorted.",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PaddockME - Feed. Stock. Freight. Sorted.",
    description:
      "Australia's platform for agistment and livestock transport - agreements, transport and coordination in one place.",
    images: ["/og/paddockme-share-card-v2.png"],
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
        <PaddockmeWorkflowProvider>{children}</PaddockmeWorkflowProvider>
      </body>
    </html>
  );
}
