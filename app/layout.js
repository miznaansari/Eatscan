import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "EatScan - Smart QR Menu & Instant Table Ordering",
  description: "Scan, order, and track food instantly at your restaurant table. Real-time manager mobile PWA order notifications for modern dining.",
  keywords: ["EatScan", "QR Menu", "Table Ordering System", "Restaurant POS PWA", "Contactless Dining"],
  metadataBase: new URL("https://eatscan.online"),
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#7C3AED",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-purple-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
