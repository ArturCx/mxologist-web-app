import type { Metadata } from "next";
import { Poiret_One, Jost } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

// Display face — logo, headlines, monograms, big numerals.
const poiretOne = Poiret_One({
  variable: "--font-poiret-one",
  weight: "400",
  subsets: ["latin"],
});

// Body/UI face.
const jost = Jost({
  variable: "--font-jost",
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mxologist",
  description: "Find cocktails you can make with the bottles you already have.",
  // Served from public/icons (not the app/icon.png convention, which would
  // take precedence over this): transparent favicon + apple-touch icon with
  // the brand background baked in, since iOS composites alpha over black.
  icons: {
    icon: "/icons/icon.png",
    apple: "/icons/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The Mxologist app owns its own chrome (landing + sticky nav), so the
  // root layout stays minimal — fonts + ClerkProvider only.
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${poiretOne.variable} ${jost.variable} h-full antialiased`}
      >
        <body className="min-h-full">{children}</body>
      </html>
    </ClerkProvider>
  );
}
