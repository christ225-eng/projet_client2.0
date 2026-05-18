import type { Metadata, Viewport } from "next";
import { Inter, Permanent_Marker } from "next/font/google";
import { OrganicBackground } from "@/components/layout/OrganicBackground";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Display font for the celebratory "GAGNÉ!!" headline (and similar accents). */
const display = Permanent_Marker({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
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
  // Keeps the layout stable when the iOS Safari URL bar slides; pairs with
  // min-h-screen below so the organic background never gets cropped.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} ${display.variable} h-full`}>
      <body className="relative flex min-h-dvh w-full flex-col overflow-x-hidden antialiased safe-top safe-bottom">
        <OrganicBackground />
        {children}
      </body>
    </html>
  );
}
