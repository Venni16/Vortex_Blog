import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { CommentProvider } from "@/lib/CommentContext";
import { PopupProvider } from "@/lib/PopupContext";
import CommentSidebar from "@/components/CommentSidebar";
import CustomPopup from "@/components/CustomPopup";

export const metadata: Metadata = {
  title: "Vortex Blog",
  description: "A professional black and white blog platform",
  icons: {
    icon: "/Vortex_Blog_icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300`}
      >
        <PopupProvider>
          <CommentProvider>
            <div className="min-h-screen flex flex-col">
              {children}
              <CommentSidebar />
              <CustomPopup />
            </div>
          </CommentProvider>
        </PopupProvider>
      </body>
    </html>
  );
}
