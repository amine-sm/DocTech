import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import LocaleProvider from "@/components/LocaleProvider";

export const metadata: Metadata = {
  title: {
    default: "DOCTECH",
    template: "%s | DOCTECH",
  },
  description: "Votre spécialiste du matériel informatique",
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

const localeBootScript = `
(function () {
  try {
    var locale = localStorage.getItem("doctech_locale");
    if (locale !== "ar" && locale !== "fr") locale = "fr";
    var root = document.documentElement;
    root.lang = locale;
    root.dir = locale === "ar" ? "rtl" : "ltr";
    root.dataset.locale = locale;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: localeBootScript }} />
      </head>
      <body suppressHydrationWarning>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
