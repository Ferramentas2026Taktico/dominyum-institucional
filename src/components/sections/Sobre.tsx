"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const valores = [
  {
    n: "01",
    titulo: "Sonhe Grande",
    quote: "Grandes empresas são construídas por quem acredita no impossível.",
    texto:
      "Pensamos grande, enfrentamos desafios e construímos aquilo que outros acreditam não ser possível.",
  },
  {
    n: "02",
    titulo: "O Cliente no Centro",
    quote: "O sucesso do cliente é a nossa principal métrica.",
    texto:
      "Mais que entregar um serviço, geramos confiança, crescimento e experiências que fazem o cliente permanecer por anos.",
  },
  {
    n: "03",
    titulo: "Espírito Empreendedor",
    quote: "Cada pessoa age como protagonista.",
    texto:
      "Assume responsabilidades e transforma os desafios da empresa e dos clientes em soluções.",
  },
  {
    n: "04",
    titulo: "Humildade para Evoluir",
    quote: "O ego impede o aprendizado; a humildade acelera o crescimento.",
    texto:
      "Ninguém sabe tudo. Aprendemos continuamente e mudamos quando os fatos mostram um caminho melhor.",
  },
  {
    n: "05",
    titulo: "Dados Acima de Opiniões",
    quote: "Decidimos com evidências, não com achismos.",
    texto:
      "Validamos com experimentos e medimos o que realmente gera impacto no negócio.",
  },
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
        // Missão + Visão
        gsap.from(".mv-item", {
          y: 40,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: { trigger: ".mv-grid", start: "top 80%" },
        });

        // Valores
        gsap.from(".valor-card", {
          y: 40,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".valores-grid", start: "top 80%" },
        });

        // Marquee do DNA (loop contínuo)
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
        {/* Filosofia (statement de abertura) */}
        <p className="mb-4 font-sans text-sm uppercase tracking-[0.2em] text-sage">
          Sobre
        </p>
        <h2 className="max-w-4xl font-display text-4xl font-semibold leading-tight text-limestone md:text-6xl">
          Marketing não é propaganda.{" "}
          <span className="text-sage">É a engenharia do crescimento.</span>
        </h2>

        {/* Missão + Visão */}
        <div className="mv-grid mt-20 grid gap-12 border-t border-limestone/10 pt-16 md:grid-cols-2">
          <div className="mv-item">
            <span className="font-sans text-sm uppercase tracking-[0.2em] text-limestone/40">
              Missão
            </span>
            <p className="mt-5 font-sans text-lg leading-relaxed text-limestone/70">
              Transformar o marketing em um dos principais pilares estratégicos
              das empresas, projetando estruturas que conectam estratégia, dados,
              marketing e comercial para gerar crescimento previsível, escalável e
              sustentável.
            </p>
          </div>
          <div className="mv-item">
            <span className="font-sans text-sm uppercase tracking-[0.2em] text-limestone/40">
              Visão
            </span>
            <p className="mt-5 font-sans text-lg leading-relaxed text-limestone/70">
              Liderar uma transformação no mercado, formando uma geração de
              empresas que entendem que marketing não é propaganda, mas a
              engenharia do crescimento — responsável por estruturar, impulsionar e
              escalar.
            </p>
          </div>
        </div>

        {/* Valores */}
        <div className="mt-28">
          <h3 className="font-display text-3xl text-limestone md:text-4xl">
            Nossos valores
          </h3>

          <div className="valores-grid mt-14 grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {valores.map((v) => (
              <div key={v.n} className="valor-card border-l border-sage/40 pl-6">
                <span className="font-display text-sm text-sage">{v.n}</span>
                <h4 className="mt-3 font-display text-xl text-limestone">
                  {v.titulo}
                </h4>
                <p className="mt-4 font-sans text-limestone/90">{v.quote}</p>
                <p className="mt-2 font-sans text-sm leading-relaxed text-limestone/50">
                  {v.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marquee do DNA */}
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