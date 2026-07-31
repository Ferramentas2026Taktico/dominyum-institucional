"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const servicos = [
  {
    n: "01",
    titulo: "Diagnóstico",
    texto: "Mapeamos onde sua operação de marketing está e o que trava a previsibilidade.",
    tags: ["Mapa da operação", "Gargalos", "Metas"],
  },
  {
    n: "02",
    titulo: "Estrutura",
    texto: "Desenhamos processos replicáveis, funil e integração entre marketing e comercial.",
    tags: ["Processos", "Funil", "Integração comercial"],
  },
  {
    n: "03",
    titulo: "Capacitação",
    texto: "Preparamos o time interno para operar a estratégia com autonomia.",
    tags: ["Time preparado", "Playbooks", "Rituais"],
  },
  {
    n: "04",
    titulo: "Governança",
    texto: "Indicadores, responsabilidades e ritmo de gestão para crescimento contínuo.",
    tags: ["Indicadores", "Responsabilidades", "Cadência"],
  },
];

export default function Servicos() {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".servico-row", {
          y: 50,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: ".servicos-list",
            start: "top 75%",
          },
        });
      });
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      id="servicos"
      className="relative bg-carbon px-6 py-20 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 font-sans text-sm uppercase tracking-[0.2em] text-sage">
          O que fazemos
        </p>
        <h2 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-limestone md:text-6xl">
          Transformamos sua operação, não substituímos seu time.
        </h2>

        <div className="servicos-list mt-16 flex flex-col">
          {servicos.map((s) => (
            <div
              key={s.n}
              className="servico-row group grid grid-cols-1 gap-6 border-t border-limestone/10 py-10 transition-colors hover:bg-slate/40 md:grid-cols-[auto_1fr_1.4fr] md:items-center md:gap-12"
            >
              <span className="font-display text-3xl text-sage md:text-4xl">
                {s.n}
              </span>

              <h3 className="font-display text-2xl text-limestone transition-transform duration-300 group-hover:translate-x-2 md:text-3xl">
                {s.titulo}
              </h3>

              <div>
                <p className="font-sans text-limestone/60">{s.texto}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-limestone/15 px-3 py-1 font-sans text-xs text-limestone/70"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          {/* fecha a última linha com a borda inferior */}
          <div className="border-t border-limestone/10" />
        </div>
      </div>
    </section>
  );
}