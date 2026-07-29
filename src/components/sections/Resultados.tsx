"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const stats = [
  {
    target: 52,
    decimals: 0,
    suffix: "%",
    label: "da jornada de compra acontece antes do primeiro contato com vendas",
  },
  {
    target: 3.2,
    decimals: 1,
    suffix: "x",
    label: "de ROAS médio nas campanhas que gerimos",
  },
  {
    target: 41,
    decimals: 0,
    suffix: "%",
    label: "de redução no CAC após estruturar o funil",
  },
  {
    target: 2.5,
    decimals: 1,
    suffix: "x",
    label: "mais leads qualificados em seis meses",
  },
];

const format = (val: number, decimals: number, suffix: string) =>
  val.toFixed(decimals) + suffix;

export default function Resultados() {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".stat-num").forEach((el) => {
          const target = Number(el.dataset.target);
          const decimals = Number(el.dataset.decimals) || 0;
          const suffix = el.dataset.suffix || "";
          const obj = { val: 0 };

          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
            onUpdate: () => {
              el.textContent = format(obj.val, decimals, suffix);
            },
          });
        });
      });
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      id="resultados"
      className="relative bg-carbon px-6 py-32 md:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 font-sans text-sm uppercase tracking-[0.2em] text-sage">
          Resultados
        </p>
        <h2 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-limestone md:text-6xl">
          Marketing que responde por receita.
        </h2>

        <div className="mt-20 grid gap-x-12 gap-y-16 sm:grid-cols-2">
          {stats.map((s, i) => (
            <div key={i} className="border-t border-limestone/10 pt-8">
              <span
                className="stat-num block font-display text-7xl font-semibold leading-none text-sage md:text-8xl"
                data-target={s.target}
                data-decimals={s.decimals}
                data-suffix={s.suffix}
              >
                {format(s.target, s.decimals, s.suffix)}
              </span>
              <p className="mt-5 max-w-xs font-sans text-limestone/60">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}