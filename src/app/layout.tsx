import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import { PaddockmeWorkflowProvider } from "@/lib/paddockmeWorkflow";
import { resolveSiteUrl } from "@/lib/siteUrl";

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

// Resolved per deployment. Hardcoding the main site here meant the showroom
// demo told search engines and every share card that its canonical home was
// paddockme-oz51.vercel.app — a different deployment.
const siteUrl = resolveSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "PaddockME - Agistment coordination for livestock, land and transport",
  description:
    "Australian agistment marketplace helping livestock owners, landowners and transport providers coordinate agreements and stock movement.",
  openGraph: {
    title: "PaddockME - Australian agistment coordination",
    description:
      "Investor-ready MVP for coordinating agistment agreements and stock transport across regional Australia.",
    url: siteUrl,
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
    title: "PaddockME - Australian agistment coordination",
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
        {/* WCAG 2.4.1 Bypass Blocks (Level A): a keyboard or screen-reader
            user had no way past the header on any page. Invisible until it
            takes focus, where it becomes the first thing in the tab order. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-md focus:bg-pm-green-900 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white focus:outline-none focus:ring-2 focus:ring-pm-gold-500"
        >
          Skip to main content
        </a>
        {/* Lives here rather than on each page's own <main> so every route
            gets a valid skip target. tabIndex allows the anchor to move
            focus, not just the viewport. */}
        <div id="main-content" tabIndex={-1} className="flex flex-1 flex-col">
          <PaddockmeWorkflowProvider>{children}</PaddockmeWorkflowProvider>
        </div>
      </body>
    </html>
  );
}
