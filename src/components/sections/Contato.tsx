"use client";

import { useCallback, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import ModalContato from "@/components/forms/ModalContato";

// Import estático, e não `dynamic`: a modal não traz dependência nova nenhuma
// (gsap e Lenis já estão na página), então lazy-load só compraria uma espera de
// rede no primeiro clique.

export default function Contato() {
  const container = useRef<HTMLElement>(null);
  const [modalAberta, setModalAberta] = useState(false);

  // Identidade estável de propósito: com uma arrow inline, o efeito da modal
  // remontaria a cada render do pai.
  const fecharModal = useCallback(() => setModalAberta(false), []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Entrada do conteúdo. É a única animação em JS da seção — o holofote e o
      // botão magnético saíram, e com eles todo o bloco condicionado a ponteiro
      // fino. O crescimento do CTA no hover é CSS puro.
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
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      id="contato"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 md:px-12"
    >
      {/* Fundo em três camadas, sem `bg-*` na seção: o gradiente é o fundo.
          Segura o slate EXATO do Sobre nos primeiros 6% e desce numa rampa longa
          até o carbon EXATO do Footer em 100% — as duas fronteiras deixam de
          existir, em vez de trocar um degrau de cor por outro. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background:
            "linear-gradient(to bottom, #062628 0%, #062628 6%, #070707 100%)",
        }}
      />

      {/* O brilho é a força visual da seção, e fica no MEIO: é ali que o fundo
          fica mais claro, com o preto reservado para o fim.

          Centrado em `50% 50%`, ele não precisa de máscara para poupar a costura
          do topo: a distância elíptica até y=0 é 0.5h/0.45h = 1.11 do raio, logo
          já passou do stop transparente. (Foi medido — ver identidade-visual.md.
          Com o centro em `50% 0%`, que era o valor antigo, a primeira linha de
          pixels pegava força máxima e abria 25 de diferença por canal.) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(70% 45% at 50% 50%, rgba(8,68,68,0.85), transparent 70%), radial-gradient(38% 24% at 50% 50%, rgba(154,199,178,0.14), transparent 72%)",
        }}
      />

      {/* Grade fina ocupando a seção toda — ecoa a grade de 1px do Sistema.

          Duas máscaras cruzadas com `intersect` dão o fade nos quatro lados de
          uma vez. O `intersect` é obrigatório: o padrão do `mask-composite` é
          `add`, que faz a UNIÃO das duas e deixa a grade aparecer até a borda.
          O fade também é o que impede a primeira linha do gradiente vertical
          (que cai em y=0) de virar um fio atravessando a fronteira com o Sobre. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, rgba(211,221,219,0.05) 0 1px, transparent 1px 88px), repeating-linear-gradient(to bottom, rgba(211,221,219,0.05) 0 1px, transparent 1px 88px)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          maskComposite: "intersect",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskComposite: "source-in",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="cta-reveal mb-6 font-sans text-sm uppercase tracking-[0.25em] text-sage">
          Vamos conversar
        </p>
        <h2 className="cta-reveal max-w-3xl font-display text-4xl font-semibold leading-[1.05] text-limestone md:text-7xl">
          Escale com <span className="text-sage">previsibilidade.</span>
        </h2>
        <p className="cta-reveal mx-auto mt-8 max-w-xl font-sans text-lg leading-relaxed text-limestone/70">
          Conte onde você quer chegar. A gente devolve o desenho da estrutura que
          sustenta o caminho.
        </p>

        {/* As margens aqui absorvem o `p-10` da antiga zona magnética, para o
            ritmo vertical não mudar com a saída dela. */}
        <div className="cta-reveal mb-10 mt-20">
          {/* Sem ref para devolver o foco: o `<dialog>` nativo já devolve ao
              elemento que estava focado quando abriu.

              O `scale` mora em classe porque o GSAP não toca mais no transform
              deste botão — a entrada anima `y` no wrapper, não aqui, então os
              dois não disputam a propriedade (armadilha do CLAUDE.md). O
              `motion-safe:` dispensa quem pediu menos movimento sem precisar de
              JS, e `transition` (em vez de `transition-colors`) é o que faz a
              cor E o crescimento animarem. */}
          <button
            type="button"
            onClick={() => setModalAberta(true)}
            aria-haspopup="dialog"
            aria-expanded={modalAberta}
            className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-sage px-10 py-5 font-sans text-lg font-medium text-carbon transition duration-300 hover:bg-limestone motion-safe:hover:scale-[1.03]"
          >
            Fale com a gente
            <span aria-hidden>→</span>
          </button>
        </div>

        {/* O botão depende de JS; este link não. Fica como saída garantida. */}
        <p className="cta-reveal font-sans text-limestone/50">
          ou escreva para{" "}
          <a
            href="mailto:contato@dominyum.com.br"
            className="text-limestone/70 transition-colors hover:text-sage"
          >
            contato@dominyum.com.br
          </a>
        </p>
      </div>

      <ModalContato aberto={modalAberta} onFechar={fecharModal} />
    </section>
  );
}
