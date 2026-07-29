"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

export default function Hero() {
    const container = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();

            // Só anima se o usuário NÃO pediu "reduzir movimento" no sistema
            mm.add("(prefers-reduced-motion: no-preference)", () => {
                const split = new SplitText(".hero-title", {
                    type: "lines",
                    mask: "lines", // cria a máscara de overflow p/ o efeito de "subir"
                });

                const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

                tl.from(".hero-block", {
                    scale: 0.6,
                    autoAlpha: 0,
                    duration: 1,
                    stagger: 0.12,
                    ease: "power2.out",
                })
                    .from(".hero-eyebrow", { y: 20, autoAlpha: 0, duration: 0.6 }, "-=0.7")
                    .from(
                        split.lines,
                        { yPercent: 110, autoAlpha: 0, duration: 0.9, stagger: 0.15 },
                        "-=0.3"
                    )
                    .from(".hero-sub", { y: 20, autoAlpha: 0, duration: 0.6 }, "-=0.4")
                    .from(".hero-cta", { y: 20, autoAlpha: 0, duration: 0.6 }, "-=0.3")
                    .from(".hero-scroll", { autoAlpha: 0, duration: 0.6 }, "-=0.2");

                // Parallax no scroll — blocos e "D" derivam em ritmos diferentes
                gsap.to(".hero-d", {
                    yPercent: -12,
                    ease: "none",
                    scrollTrigger: {
                        trigger: container.current,
                        start: "top top",
                        end: "bottom top",
                        scrub: true,
                    },
                });

                gsap.utils.toArray<HTMLElement>(".hero-block").forEach((block) => {
                    gsap.to(block, {
                        yPercent: Number(block.dataset.speed) || 0,
                        ease: "none",
                        scrollTrigger: {
                            trigger: container.current,
                            start: "top top",
                            end: "bottom top",
                            scrub: true,
                        },
                    });
                });

                return () => split.revert(); // desfaz o split ao desmontar
            });
        },
        { scope: container }
    );

    return (
        <section
            ref={container}
            className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 md:px-12"
        >
            {/* Blocos flutuantes — rotação via style inline p/ não conflitar com o transform do GSAP */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <span
                    data-speed="-30"
                    style={{ rotate: "-8deg" }}
                    className="hero-block absolute left-[8%] top-[18%] h-28 w-44 rounded-2xl bg-sage/80"
                />
                <span
                    data-speed="20"
                    style={{ rotate: "6deg" }}
                    className="hero-block absolute right-[10%] top-[22%] h-32 w-52 rounded-2xl bg-verdant"
                />
                <span
                    data-speed="-50"
                    style={{ rotate: "-4deg" }}
                    className="hero-block absolute bottom-[16%] right-[22%] h-24 w-40 rounded-2xl bg-limestone/90"
                />
            </div>

            <span
                aria-hidden
                className="hero-d pointer-events-none absolute -right-10 bottom-[-6rem] -z-10 select-none font-display text-[26rem] leading-none text-verdant/50"
            >
                D
            </span>

            <div className="relative z-10 max-w-4xl">
                <p className="hero-eyebrow mb-6 flex items-center gap-3 font-sans text-sm uppercase tracking-[0.2em] text-sage">
                    <span className="inline-block h-px w-8 bg-sage" />
                    Mais que marketing
                </p>

                <h1 className="hero-title font-display text-5xl font-semibold leading-[1.05] text-limestone md:text-7xl lg:text-8xl">
                    Um motor de <br />
                    <span className="text-sage">crescimento.</span>
                </h1>

                <p className="hero-sub mt-8 max-w-xl font-sans text-lg leading-relaxed text-limestone/70">
                    Transformamos marketing e vendas em um único sistema orientado por
                    dados — para escalar com previsibilidade.
                </p>

                <div className="hero-cta mt-10">

                    <a href="#contato"
                        className="inline-flex items-center rounded-full bg-sage px-8 py-4 font-sans font-medium text-carbon transition-colors hover:bg-limestone"
                    >
                        Vamos escalar
                    </a>
                </div>
            </div>

            <div className="hero-scroll absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-limestone/50">
                <span className="font-sans text-xs uppercase tracking-widest">
                    Role para explorar
                </span>
                <span className="h-10 w-px bg-limestone/30" />
            </div>
        </section>
    );
}