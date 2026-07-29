"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const pilares = [
  {
    n: "01",
    titulo: "Dados",
    texto: "Capacidade de interpretar cenários e decidir com precisão.",
  },
  {
    n: "02",
    titulo: "Funil",
    texto: "Aquisição e conversão estruturadas como um sistema único.",
  },
  {
    n: "03",
    titulo: "Crescimento",
    texto: "Construção de ativos próprios e motores de aquisição.",
  },
  {
    n: "04",
    titulo: "Resultado",
    texto: "Domínio sobre a receita — mensurável, previsível, escalável.",
  },
];

export default function Sistema() {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".pilar", {
          y: 60,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: ".pilares-grid",
            start: "top 80%", // dispara quando o topo da grade chega a 80% da tela
          },
        });
      });
    },
    { scope: container }
  );

  return (
    <section ref={container} className="relative bg-slate px-6 py-32 md:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 font-sans text-sm uppercase tracking-[0.2em] text-sage">
          Sistema de Domínio
        </p>
        <h2 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-limestone md:text-6xl">
          Domínio sobre dados, funil, crescimento e resultado.
        </h2>

        <div className="pilares-grid mt-20 grid gap-px overflow-hidden rounded-3xl bg-verdant/40 md:grid-cols-2 lg:grid-cols-4">
          {pilares.map((p) => (
            <div key={p.n} className="pilar bg-slate p-8">
              <span className="font-display text-2xl text-sage">{p.n}</span>
              <h3 className="mt-6 font-display text-2xl text-limestone">
                {p.titulo}
              </h3>
              <p className="mt-3 font-sans text-limestone/60">{p.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}