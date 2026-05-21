import type { Metadata, Viewport } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { OrganicBackground } from "@/components/layout/OrganicBackground";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Reserved for the STK logo / wordmark — never used as a body font. */
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Apprendre du Vivant — STK Architecture",
    template: "%s · Apprendre du Vivant",
  },
  description:
    "Explorez les liens entre le vivant et les innovations humaines. Un jeu pédagogique conçu par STK Architecture autour du biomimétisme.",
  applicationName: "STK · Apprendre du Vivant",
  authors: [{ name: "STK Architecture" }],
};

export const viewport: Viewport = {
  themeColor: "#f6f1e6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${geist.variable} ${playfair.variable} h-full`}>
      <body className="relative flex h-dvh w-full flex-col overflow-x-hidden overflow-y-auto antialiased safe-top safe-bottom">
        <OrganicBackground />
        {children}
      </body>
    </html>
  );
}
