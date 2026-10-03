import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SPIDER-MAN // Across The Multiverse | The Web of Life and Destiny",
  description:
    "Explore the Spider-Man Multiverse: Peter Parker, Miles Morales, Spider-Man 2099, Spider-Punk, and Spider-Noir. Experience the interactive 18-Suit 4K Armory, web-slinging mechanics, and Web of Destiny lore.",
  keywords: [
    "Spider-Man",
    "Spider-Verse",
    "Peter Parker",
    "Miles Morales",
    "Spider-Man 2099",
    "Spider-Punk",
    "Spider-Man Noir",
    "Web of Destiny",
    "Marvel Spider-Man",
    "Interactive 4K Wallpaper Armory",
  ],
  authors: [{ name: "Spider-Society Multiverse Archives" }],
  openGraph: {
    title: "SPIDER-MAN // Across The Multiverse",
    description:
      "Be Greater. Together. Step across the Web of Life and Destiny into the ultimate interactive Spider-Man multiverse experience.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SPIDER-MAN // Across The Multiverse",
    description: "Swing through the infinite dimensions of the Spider-Verse.",
  },
};

export const viewport: Viewport = {
  themeColor: "#E62429",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable} dark scroll-smooth`}>
      <body className="bg-[#07070B] text-[#F8FAFC] antialiased selection:bg-[#E62429]/40 selection:text-white">
        {children}
      </body>
    </html>
  );
}
