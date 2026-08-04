import type { Metadata, Viewport } from "next";
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

/**
 * `interactiveWidget: "resizes-content"` faz o teclado do celular encolher a
 * viewport de LAYOUT, e não só a visual. Sem isto, um `position: fixed` (a modal
 * de contato) continua do tamanho da tela inteira e o rodapé dela fica debaixo do
 * teclado, fora de alcance.
 *
 * `maximumScale`/`userScalable` ficam de fora de propósito: travar zoom quebra
 * acessibilidade, e o default do Next já é o correto.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dominyum.com.br"), // TROQUE pelo domínio real
  title: {
    default: "Dominyum | Marketing orientado por dados",
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
    title: "Dominyum | Marketing orientado por dados",
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
    title: "Dominyum | Marketing orientado por dados",
    description:
      "Transformamos marketing e vendas em um único sistema orientado por dados.",
    images: ["/brand/og-image.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  /**
   * Desliga os *data detectors* do iOS, que reescrevem o DOM (envolvem texto em
   * `<a>`) ANTES do React hidratar — e aí o React acusa
   * "some attributes of the server rendered HTML didn't match".
   *
   * Por que a suspeita cai neles: o erro aparece **no load**, **só no Chrome do
   * iPhone e não no Safari**, e persiste em aba anônima. No iOS os dois navegadores
   * são o MESMO motor (WebKit), então motor igual com comportamento diferente só
   * pode vir do aplicativo — e os data detectors são configurados por app, no
   * `WKWebView`, não pela página. Aba anônima descarta extensão (o Chrome do iOS
   * não tem extensões). E nada no nosso render depende de ambiente: todo
   * `window.`/`matchMedia`/`Math.random` vive dentro de efeito, verificado.
   *
   * Não reproduz em Chrome headless em nenhuma combinação testada (UA de iPhone,
   * 3G + CPU 6×, toque antes da hidratação, `prefers-reduced-motion`), então a
   * confirmação tem de vir do aparelho.
   */
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false,
  },
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