import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ThemeInitializer from "@/components/ui/theme-initializer";

// Register SW (client only)
import RegisterServiceWorker from "./service-worker-register";

const vektorSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const vektorMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vektor – Precision Leverage",
  description:
    "Vektor is the 4-step framework for experts, founders, and operators to design precision prompts that turn AI into a strategic asset.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${vektorSans.variable} ${vektorMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <ThemeInitializer />
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
