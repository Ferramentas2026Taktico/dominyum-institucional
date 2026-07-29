"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export default function Contato() {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // (1) Entrada suave do conteúdo — roda em qualquer dispositivo
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".cta-reveal", {
          y: 40,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: container.current, start: "top 65%" },
        });
      });

      // (2) Holofote + botão magnético — só onde há ponteiro de verdade
      mm.add(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const section = container.current!;
          const spot = section.querySelector(".cta-spot") as HTMLElement;
          const btn = section.querySelector(".cta-magnetic") as HTMLElement;
          const zone = section.querySelector(".cta-zone") as HTMLElement;

          // Holofote segue o cursor. xPercent/yPercent centram via GSAP,
          // pra não conflitar com o x/y animado (mesma lição dos blocos).
          gsap.set(spot, { xPercent: -50, yPercent: -50 });
          gsap.to(spot, { autoAlpha: 1, duration: 0.5 });
          const sx = gsap.quickTo(spot, "x", { duration: 0.6, ease: "power3" });
          const sy = gsap.quickTo(spot, "y", { duration: 0.6, ease: "power3" });

          const onMove = (e: MouseEvent) => {
            const r = section.getBoundingClientRect();
            sx(e.clientX - r.left);
            sy(e.clientY - r.top);
          };
          section.addEventListener("mousemove", onMove);

          // Botão magnético: puxado na direção do cursor dentro da "zona"
          const bx = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
          const by = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });

          const onZoneMove = (e: MouseEvent) => {
            const r = btn.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            bx((e.clientX - cx) * 0.4); // 0.4 = força do ímã
            by((e.clientY - cy) * 0.4);
          };
          const onZoneLeave = () => {
            bx(0);
            by(0);
          };
          zone.addEventListener("mousemove", onZoneMove);
          zone.addEventListener("mouseleave", onZoneLeave);

          return () => {
            section.removeEventListener("mousemove", onMove);
            zone.removeEventListener("mousemove", onZoneMove);
            zone.removeEventListener("mouseleave", onZoneLeave);
          };
        }
      );
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      id="contato"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-carbon px-6"
    >
      {/* Holofote — começa invisível (fica assim em touch/reduzir movimento) */}
      <div
        aria-hidden
        className="cta-spot pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] opacity-0"
        style={{
          background:
            "radial-gradient(circle, rgba(154,199,178,0.22), transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="cta-reveal mb-6 font-sans text-sm uppercase tracking-[0.25em] text-sage">
          Vamos conversar
        </p>
        <h2 className="cta-reveal max-w-3xl font-display text-4xl font-semibold leading-[1.05] text-limestone md:text-7xl">
          Escale com <span className="text-sage">previsibilidade.</span>
        </h2>

        {/* Zona magnética: área maior que o botão, pra ele "sentir" o cursor antes */}
        <div className="cta-zone cta-reveal mt-12 p-10">
          
            <a href="mailto:contato@dominyum.com"
            className="cta-magnetic inline-flex items-center rounded-full bg-sage px-10 py-5 font-sans text-lg font-medium text-carbon transition-colors hover:bg-limestone"
          >
            Fale com a gente
          </a>
        </div>

        <p className="cta-reveal font-sans text-limestone/50">
          contato@dominyum.com
        </p>
      </div>
    </section>
  );
}