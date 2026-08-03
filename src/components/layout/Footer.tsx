"use client";

import dynamic from "next/dynamic";
import { useLenis } from "@/components/motion/SmoothScroll";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/nav";

// Canvas: fora do bundle inicial e nunca no servidor
const MarcaCaracteres = dynamic(
  () => import("@/components/motion/MarcaCaracteres"),
  { ssr: false }
);

/**
 * Ícones em contorno e com `currentColor`: herdando a cor, o
 * `transition-colors hover:text-sage` do link já arrasta o ícone junto, sem
 * código a mais. Contorno nos dois (o mark oficial do LinkedIn é sólido) para os
 * glifos não ficarem com pesos visuais diferentes lado a lado.
 */
const propsIcone = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className: "h-5 w-5 shrink-0",
};

function IconeInstagram() {
  return (
    <svg {...propsIcone}>
      <rect x="3" y="3" width="18" height="18" rx="5.2" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconeLinkedIn() {
  return (
    <svg {...propsIcone}>
      <rect x="3" y="3" width="18" height="18" rx="3.2" />
      {/* o "i" */}
      <circle cx="7.6" cy="7.7" r="0.95" fill="currentColor" stroke="none" />
      <path d="M7.6 10.7v6.1" />
      {/* o "n" */}
      <path d="M11.4 16.8v-6.1" />
      <path d="M11.4 13.4a2.7 2.7 0 0 1 5.3 0v3.4" />
    </svg>
  );
}

// Só do footer — não vai para lib/nav.ts
const social = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/dominyumbr/",
    Icone: IconeInstagram,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/dominyum/",
    Icone: IconeLinkedIn,
  },
];

export default function Footer() {
  const lenis = useLenis();

  const pathname = usePathname();
  const isHome = pathname === "/";
  const anchor = (href: string) => (isHome ? href : `/${href}`);

  const handleAnchor = (e: React.MouseEvent, href: string) => {
    if (isHome) {
      e.preventDefault();
      lenis?.scrollTo(href, { offset: -80 });
    }
  };

  return (
    <footer className="relative bg-carbon px-6 pb-10 pt-20 md:px-12">
      <div className="mx-auto max-w-6xl">
        {/* A chamada final + marca virou a seção Chamada (src/components/sections) */}

        {/* Colunas de links */}
        <div className="grid gap-10 pb-14 sm:grid-cols-3">
          <div>
            <span className="font-sans text-sm uppercase tracking-[0.2em] text-limestone/40">
              Navegação
            </span>
            <ul className="mt-5 flex flex-col gap-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  
                  <a href={anchor(l.href)}
                    onClick={(e) => handleAnchor(e, l.href)}
                    className="cursor-pointer font-sans text-limestone/70 transition-colors hover:text-sage"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="font-sans text-sm uppercase tracking-[0.2em] text-limestone/40">
              Contato
            </span>
            <ul className="mt-5 flex flex-col gap-3">
              <li>
                
                <a  href="mailto:contato@dominyum.com.br"
                  className="font-sans text-limestone/70 transition-colors hover:text-sage"
                >
                  contato@dominyum.com.br
                </a>
              </li>
            </ul>
          </div>

          <div>
            <span className="font-sans text-sm uppercase tracking-[0.2em] text-limestone/40">
              Redes
            </span>
            <ul className="mt-5 flex flex-col gap-3">
              {social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 font-sans text-limestone/70 transition-colors hover:text-sage"
                  >
                    <s.Icone />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Rodapé legal */}
        <div className="flex flex-col gap-4 pt-8 text-limestone/40 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-sm">
            © {new Date().getFullYear()} Dominyum. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 font-sans text-sm">
            <a href="/privacidade" className="transition-colors hover:text-sage">
              Privacidade
            </a>
            <a href="/termos" className="transition-colors hover:text-sage">
              Termos
            </a>
          </div>
        </div>
      </div>

      {/* Assinatura de fechamento: irmã do max-w-6xl e com o padding do footer
          cancelado, para sangrar de ponta a ponta. */}
      <div className="-mx-6 mt-6 md:-mx-12">
        <MarcaCaracteres />
      </div>
    </footer>
  );
}