import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DOCTECH",
    template: "%s | DOCTECH",
  },

  description:
    "Votre spécialiste du matériel informatique",

  icons: {
    icon: [
      {
        url: "/images/logo-doctech.webp",
        type: "image/webp",
      },
    ],

    shortcut: "/images/logo-doctech.webp",

    apple: "/images/logo-doctech.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}