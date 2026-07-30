"use client";

import { useState } from "react";
import { useGSAP, ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "@/components/motion/SmoothScroll";
import Image from "next/image";

const links = [
  { label: "Sistema", href: "#sistema" },
  { label: "Serviços", href: "#servicos" },
  { label: "Método", href: "#metodo" },
  { label: "Resultados", href: "#resultados" },
  { label: "Sobre", href: "#sobre" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  const lenis = useLenis();

  const handleClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    lenis?.scrollTo(href, { offset: -80 }); // -80 compensa a altura da navbar fixa
  };

  useGSAP(() => {
    // Dispara sempre que o scroll passa/volta dos 60px
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => setScrolled(self.scroll() > 60),
    });
  });

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-limestone/10 bg-carbon/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-300 md:px-12 ${
          scrolled ? "py-4" : "py-6"
        }`}
      >
        <a href="#top"
          onClick={(e) => {
            e.preventDefault();
            lenis?.scrollTo(0);
          }}
          className="cursor-pointer"
        >
          <Image
            src="/brand/Logo_Dominyum.png"
            alt="Dominyum"
            width={853}
            height={152}
            priority
            className="h-8 w-auto"
          />
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              
                <a href={l.href}
                onClick={(e) => handleClick(e, l.href)}
                className="font-sans text-sm text-limestone/70 transition-colors hover:text-sage cursor-pointer"
                >
                {l.label}
                </a>
            </li>
          ))}
        </ul>

        
          <a href="#contato"
            onClick={(e) => handleClick(e, "#contato")}
        className="rounded-full bg-sage px-6 py-2.5 font-sans text-sm font-medium text-carbon transition-colors hover:bg-limestone cursor-pointer"
        >
        Fale com a gente
        </a>
      </nav>
    </header>
  );
}