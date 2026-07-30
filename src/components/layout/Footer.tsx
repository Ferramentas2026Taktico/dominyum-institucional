"use client";

import { useLenis } from "@/components/motion/SmoothScroll";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Sistema", href: "#sistema" },
  { label: "Serviços", href: "#servicos" },
  { label: "Método", href: "#metodo" },
  { label: "Resultados", href: "#resultados" },
  { label: "Sobre", href: "#sobre" },
];

const social = [
  { label: "Instagram", href: "https://instagram.com/dominyum" },
  { label: "LinkedIn", href: "#" },
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
    <footer className="relative bg-carbon px-6 pb-10 pt-24 md:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Chamada final + marca */}
        <div className="flex flex-col gap-10 border-b border-limestone/10 pb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-display text-4xl font-semibold text-limestone md:text-5xl">
              Dominyum
            </span>
            <p className="mt-4 max-w-sm font-sans text-limestone/60">
              Marketing orientado por dados. Crescimento orientado por receita.
            </p>
          </div>
          
          <a href={anchor("#contato")}
            onClick={(e) => handleAnchor(e, "#contato")}
            className="inline-flex w-fit items-center rounded-full bg-sage px-8 py-4 font-sans font-medium text-carbon transition-colors hover:bg-limestone cursor-pointer"
          >
            Vamos escalar
          </a>
        </div>

        {/* Colunas de links */}
        <div className="grid gap-10 py-14 sm:grid-cols-3">
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
                
                <a  href="mailto:contato@dominyum.com"
                  className="font-sans text-limestone/70 transition-colors hover:text-sage"
                >
                  contato@dominyum.com
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
                  
                  <a  href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-limestone/70 transition-colors hover:text-sage"
                  >
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
    </footer>
  );
}