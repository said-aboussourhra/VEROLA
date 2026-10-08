import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Syne, Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { resolveBrand, brandCss } from "@/lib/tenant";
import { TenantProvider } from "@/components/tenant";
import { I18nProvider } from "@/lib/i18n";
import { Navbar, Footer, WhatsAppFloat } from "@/components/chrome";
import { BrandyCursor } from "@/components/cursor";
import { LogoIntro } from "@/components/logo";
import { ToastProvider, AuthProvider } from "@/components/notify";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VÉLORA — Print the Unimaginable | Studio d'imprimerie premium, Maroc",
  description:
    "Premium digital printing studio in Morocco. Upload or design online, configure paper & finish, pay, and get it delivered in 24–48h. Print the unimaginable.",
  keywords: [
    "printing studio Morocco",
    "imprimerie Casablanca",
    "print on demand",
    "business cards",
    "استوديو طباعة",
  ],
  openGraph: {
    title: "VÉLORA — Print the Unimaginable",
    description:
      "The printing studio that feels like a design studio. 24h express, FSC papers, premium finishes.",
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const hdrs = await headers();
  const brand = await resolveBrand({ host: hdrs.get("host") });

  return (
    <html lang="en" dir="ltr" className={`${syne.variable} ${inter.variable} ${arabic.variable}`} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: brandCss(brand) }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("verola-theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}})();`,
          }}
        />
      </head>
      <body className="grain font-body">
        <I18nProvider>
          <TenantProvider brand={brand}>
            <ToastProvider>
              <AuthProvider>
                <LogoIntro />
                <BrandyCursor />
                <Navbar />
                <main>{children}</main>
                <Footer />
                <WhatsAppFloat />
              </AuthProvider>
            </ToastProvider>
          </TenantProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
