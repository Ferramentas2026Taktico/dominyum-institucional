"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const etapas = [
  {
    n: "01",
    titulo: "Dados",
    texto: "Centralizamos os sinais de aquisição, conversão e receita em um só lugar.",
  },
  {
    n: "02",
    titulo: "Decisão",
    texto: "Cada métrica responde a uma pergunta: como ela impacta a receita?",
  },
  {
    n: "03",
    titulo: "Receita",
    texto: "Executamos e otimizamos por resultado — crescimento previsível e escalável.",
  },
];

export default function Metodo() {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ".metodo-flow", start: "top 75%" },
        });

        tl.from(".metodo-rail", { scaleX: 0, duration: 1, ease: "power2.out" })
          .from(
            ".metodo-step",
            {
              y: 50,
              autoAlpha: 0,
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.2,
            },
            "-=0.6" // etapas começam a entrar antes do trilho terminar
          );
      });
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      id="metodo"
      className="relative bg-slate px-6 py-20 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 font-sans text-sm uppercase tracking-[0.2em] text-sage">
          Método
        </p>
        <h2 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-limestone md:text-6xl">
          De dados a receita, sem achismo.
        </h2>

        <div className="metodo-flow relative mt-24">
          {/* trilho horizontal que conecta as 3 etapas (só desktop) */}
          <div className="metodo-rail absolute inset-x-0 top-3 hidden h-px origin-left bg-limestone/15 md:block" />

          <div className="grid gap-12 md:grid-cols-3">
            {etapas.map((e) => (
              <div key={e.n} className="metodo-step relative">
                {/* nó sobre o trilho */}
                <span className="relative z-10 block h-6 w-6 rounded-full border-2 border-sage bg-slate" />
                <span className="mt-8 block font-display text-sm text-sage">
                  {e.n}
                </span>
                <h3 className="mt-2 font-display text-2xl text-limestone md:text-3xl">
                  {e.titulo}
                </h3>
                <p className="mt-3 font-sans text-limestone/60">{e.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}