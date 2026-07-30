import type { Metadata } from "next";
import SmoothScroll from "@/components/motion/SmoothScroll";
import { Sora, Roboto } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";
import { GoogleTagManager } from "@next/third-parties/google";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dominyum.com.br"), // TROQUE pelo domínio real
  title: {
    default: "Dominyum — Marketing orientado por dados",
    template: "%s | Dominyum",
  },
  description:
    "A Dominyum transforma marketing e vendas em um único sistema orientado por dados, para negócios que querem escalar com previsibilidade.",
  keywords: [
    "growth marketing",
    "marketing orientado por dados",
    "performance",
    "geração de leads",
    "aquisição de clientes",
    "revenue growth",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.dominyum.com.br",
    siteName: "Dominyum",
    title: "Dominyum — Marketing orientado por dados",
    description:
      "Transformamos marketing e vendas em um único sistema orientado por dados. Escale com previsibilidade.",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1080,
        height: 565,
        alt: "Dominyum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dominyum — Marketing orientado por dados",
    description:
      "Transformamos marketing e vendas em um único sistema orientado por dados.",
    images: ["/brand/og-image.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  return (
    <html lang="pt-BR" className={`${sora.variable} ${roboto.variable}`}>
      <body>
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
        <SmoothScroll>
          <Navbar />
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}