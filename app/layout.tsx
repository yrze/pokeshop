import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import { ToastProvider } from "@/components/ToastContext";
import { WishlistProvider } from "@/components/WishlistContext";
import { RecentlyViewedProvider } from "@/components/RecentlyViewedContext";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PokéShop — Pokemon Card Store",
  description: "Buy Pokemon cards online — authentic cards, fast shipping, great prices",
  openGraph: {
    title: "PokéShop — Pokemon Card Store",
    description: "Buy Pokemon cards online — authentic cards, fast shipping, great prices",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PokéShop — Pokemon Card Store",
    description: "Buy Pokemon cards online — authentic cards, fast shipping, great prices",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} antialiased bg-gray-50 dark:bg-gray-950 min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CartProvider>
            <WishlistProvider>
              <RecentlyViewedProvider>
                <ToastProvider>
                  <Navbar />
                  <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
                </ToastProvider>
              </RecentlyViewedProvider>
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
