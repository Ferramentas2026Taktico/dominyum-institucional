"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const valores = [
  { titulo: "Marketing é vendas", texto: "Tudo precisa gerar impacto direto em receita. Vaidade não paga conta." },
  { titulo: "Orientado por dados", texto: "Estratégia baseada em evidências, não em achismos." },
  { titulo: "Foco em performance", texto: "O que importa é resultado. O que não performa é otimizado ou descartado." },
  { titulo: "Responsabilidade por resultado", texto: "Comprometimento com crescimento real, não só execução." },
  { titulo: "Evolução constante", texto: "Testar, aprender, iterar e melhorar continuamente." },
  { titulo: "Mentalidade de dono", texto: "Atuação estratégica com responsabilidade sobre o negócio." },
];

const dna = [
  "Crescimento previsível", "Receita", "Dados", "Sistema", "Performance",
  "Escala", "Fluxo", "Precisão", "Estrutura", "Conversão", "Domínio",
];

export default function Sobre() {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // reveal dos valores no scroll
        gsap.from(".sobre-reveal", {
          y: 40,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".sobre-valores", start: "top 80%" },
        });

        // marquee infinito do DNA (loop contínuo, sem gatilho de scroll)
        gsap.to(".dna-track", {
          xPercent: -50,
          duration: 24,
          ease: "none",
          repeat: -1,
        });
      });
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      id="sobre"
      className="relative overflow-hidden bg-slate px-6 py-32 md:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 font-sans text-sm uppercase tracking-[0.2em] text-sage">
          Sobre
        </p>
        <h2 className="max-w-3xl font-display text-4xl font-semibold leading-tight text-limestone md:text-6xl">
          Existimos para transformar dados em crescimento previsível.
        </h2>

        <div className="sobre-valores mt-20 grid gap-x-12 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {valores.map((v) => (
            <div key={v.titulo} className="sobre-reveal border-t border-limestone/10 pt-6">
              <h3 className="font-display text-xl text-limestone">{v.titulo}</h3>
              <p className="mt-2 font-sans text-limestone/60">{v.texto}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee do DNA — sangra de ponta a ponta */}
      <div className="mt-28 flex overflow-hidden">
        <div className="dna-track flex w-max shrink-0">
          {[...dna, ...dna].map((palavra, i) => (
            <span key={i} className="flex shrink-0 items-center">
              <span className="px-8 font-display text-3xl text-limestone/30 md:text-5xl">
                {palavra}
              </span>
              <span className="h-2 w-2 rounded-full bg-sage/60" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}