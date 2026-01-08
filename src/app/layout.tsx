import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Family Roots - Preserve Your Family's Stories",
  description: "Capture and preserve your family's stories through AI-guided video interviews. A gift for generations to come.",
  keywords: ["family history", "oral history", "video interview", "family stories", "genealogy"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased min-h-screen bg-stone-950">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
