"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const etapas = [
  { n: "01", titulo: "Estratégia", texto: "Onde jogar, para quem, por quais canais e com quais metas." },
  { n: "02", titulo: "Estrutura", texto: "A operação de marketing desenhada como um sistema replicável." },
  { n: "03", titulo: "Processos", texto: "Fluxos claros de geração de demanda, qualificação e passagem para vendas." },
  { n: "04", titulo: "Integração", texto: "Marketing e comercial operando juntos, sem ruído entre as pontas." },
  { n: "05", titulo: "Inteligência", texto: "Dados confiáveis conectando investimento, pipeline, vendas e receita." },
  { n: "06", titulo: "Governança", texto: "Indicadores, responsabilidades e ritmo de gestão do crescimento." },
  { n: "07", titulo: "Previsibilidade", texto: "Marketing como motor previsível de vendas, crescimento e escala." },
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

        tl.from(".metodo-rail", { scaleY: 0, duration: 1, ease: "power2.out" })
          .from(
            ".metodo-step",
            {
              y: 40,
              autoAlpha: 0,
              duration: 0.6,
              ease: "power3.out",
              stagger: 0.12,
            },
            "-=0.7"
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
          Da estratégia à previsibilidade.
        </h2>

        <div className="metodo-flow relative mt-16 max-w-3xl">
          {/* trilho vertical à esquerda */}
          <div className="metodo-rail absolute bottom-2 left-[11px] top-2 w-px origin-top bg-limestone/15" />

          <div className="flex flex-col gap-10">
            {etapas.map((e) => (
              <div key={e.n} className="metodo-step relative pl-12">
                {/* nó sobre o trilho */}
                <span className="absolute left-0 top-1 block h-6 w-6 rounded-full border-2 border-sage bg-slate" />
                <span className="font-display text-sm text-sage">{e.n}</span>
                <h3 className="mt-1 font-display text-2xl text-limestone md:text-3xl">
                  {e.titulo}
                </h3>
                <p className="mt-2 font-sans text-limestone/60">{e.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}