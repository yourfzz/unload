import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/layout/app-header";
import AppNavigation from "@/components/layout/app-navigation";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unload — Your mind deserves a little breathing room.",
  description:
    "Ruang digital untuk menuliskan isi pikiran, mengenali perasaan, dan melakukan refleksi ringan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[#F4F0E8] text-[#29282D] antialiased">
        <AppHeader />
        <main className="flex-1 pb-12">{children}</main>
        <AppNavigation />
      </body>
    </html>
  );
}
