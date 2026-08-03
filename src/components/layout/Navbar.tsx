"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useGSAP, ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "@/components/motion/SmoothScroll";
import { navLinks } from "@/lib/nav";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  const pathname = usePathname();
  const isHome = pathname === "/";
  const anchor = (href: string) => (isHome ? href : `/${href}`);

  const handleClick = (e: React.MouseEvent, href: string) => {
    setOpen(false);
    if (isHome) {
      e.preventDefault();
      lenis?.start();                     // religa o loop ANTES de rolar
      lenis?.scrollTo(href, { offset: -80 });
    }
  };

  useGSAP(() => {
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => setScrolled(self.scroll() > 60),
    });
  });

  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [open, lenis]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => e.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || open
            ? "border-b border-limestone/10 bg-carbon/80 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav
          className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-300 md:px-12 ${
            scrolled ? "py-4" : "py-6"
          }`}
        >
          {/* Logo */}
          
          <a  href="/"
            onClick={(e) => {
            setOpen(false);
            if (isHome) {
              e.preventDefault();
              lenis?.start();
              lenis?.scrollTo(0);
            }
          }}
            className="relative z-50 cursor-pointer"
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

          {/* Links desktop */}
          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <li key={l.href}>
                
                <a  href={anchor(l.href)}
                  onClick={(e) => handleClick(e, l.href)}
                  className="cursor-pointer font-sans text-sm text-limestone/70 transition-colors hover:text-sage"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Botão desktop */}
          
          <a  href={anchor("#contato")}
            onClick={(e) => handleClick(e, "#contato")}
            className="hidden cursor-pointer rounded-full bg-sage px-6 py-2.5 font-sans text-sm font-medium text-carbon transition-colors hover:bg-limestone md:inline-flex"
          >
            Fale com a gente
          </a>

          {/* Hambúrguer (mobile) */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[7px] md:hidden"
          >
            <span
              className={`h-0.5 w-6 bg-limestone transition-all duration-300 ${
                open ? "translate-y-[4.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-limestone transition-all duration-300 ${
                open ? "-translate-y-[4.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </nav>
      </header>

      {/* Overlay mobile — FORA do header, pra não sofrer com o backdrop-blur */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-carbon transition-all duration-300 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {navLinks.map((l) => (

          <a  key={l.href}
            href={anchor(l.href)}
            onClick={(e) => handleClick(e, l.href)}
            className="cursor-pointer font-display text-3xl text-limestone transition-colors hover:text-sage"
          >
            {l.label}
          </a>
        ))}
        
        <a href={anchor("#contato")}
          onClick={(e) => handleClick(e, "#contato")}
          className="mt-4 cursor-pointer rounded-full bg-sage px-8 py-4 font-sans font-medium text-carbon"
        >
          Fale com a gente
        </a>
      </div>
    </>
  );
}