"use client";

import { useRef } from "react";
import { useLenis } from "@/components/motion/SmoothScroll";
import { gsap, useGSAP } from "@/lib/gsap";

export default function Chamada() {
  const container = useRef<HTMLElement>(null);
  const lenis = useLenis();

  // Só renderiza na home (page.tsx), então não precisa do helper anchor()
  // cross-page que Navbar e Footer usam.
  const irParaContato = (e: React.MouseEvent) => {
    e.preventDefault();
    lenis?.scrollTo("#contato", { offset: -80 });
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container.current,
            start: "top top",
            end: "+=100%",
            scrub: true,
            pin: true, // trava a seção enquanto o preto cresce
            anticipatePin: 1,
          },
        });

        // O bloco vira o fundo da seção. Anima as custom properties, NÃO a
        // string do clip-path: o browser colapsa o shorthand do inset() quando
        // os valores são simétricos (`12% 5% 12% 5%` vira `12% 5%`), e aí o GSAP
        // pareia os números da string errado e o `round` se perde.
        tl.to(
          ".chamada-bloco",
          {
            "--recorte-y": "0%",
            "--recorte-x": "0%",
            "--recorte-r": "0px",
            ease: "none",
          },
          0
        )
          // Aproximação sutil: reforça a sensação de entrar no bloco
          .to(".chamada-conteudo", { scale: 1.04, ease: "none" }, 0);
      });
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      className="relative flex min-h-screen items-center overflow-hidden bg-slate px-6 md:px-12"
    >
      {/* Bloco carbon que expande até virar o fundo da seção. O recorte inicial
          vive no style inline: sem animação (reduced motion), o cartão é o
          estado estático válido. */}
      <div
        aria-hidden
        className="chamada-bloco absolute inset-0 bg-carbon"
        style={
          {
            "--recorte-y": "12%",
            "--recorte-x": "5%",
            "--recorte-r": "24px",
            clipPath:
              "inset(var(--recorte-y) var(--recorte-x) round var(--recorte-r))",
          } as React.CSSProperties
        }
      />

      {/* px-4 no mobile: o inset do cartão é percentual (5% ≈ 20px numa tela de
          390px), então sem esse respiro o texto encostaria na borda do bloco. No
          desktop o max-w-5xl centralizado já garante folga de sobra. */}
      <div className="chamada-conteudo relative mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 md:flex-row md:items-end md:justify-between md:px-0">
        <div>
          <span className="font-display text-4xl font-semibold text-limestone md:text-5xl">
            Dominyum
          </span>
          <p className="mt-4 max-w-sm font-sans text-limestone/60">
            Marketing orientado por dados. Crescimento orientado por receita.
          </p>
        </div>

        <a
          href="#contato"
          onClick={irParaContato}
          className="inline-flex w-fit cursor-pointer items-center rounded-full bg-sage px-8 py-4 font-sans font-medium text-carbon transition-colors hover:bg-limestone"
        >
          Vamos escalar
        </a>
      </div>
    </section>
  );
}
