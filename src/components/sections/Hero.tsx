"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useLenis } from "@/components/motion/SmoothScroll";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

// Fundo em WebGL: fica fora do bundle inicial e nunca renderiza no servidor.
const Prism = dynamic(() => import("@/components/motion/Prism"), { ssr: false });

export default function Hero() {
    const container = useRef<HTMLElement>(null);
    const lenis = useLenis();

    // Só monta o canvas se o usuário não pediu "reduzir movimento" — quem pediu
    // fica com o gradiente estático abaixo.
    const [motionOk, setMotionOk] = useState(false);

    // Sem isto o navegador dá o salto nativo até a âncora e o Lenis fica de fora
    // — era o único link de âncora do projeto sem interceptação.
    // Só renderiza na home (page.tsx), então não precisa do helper anchor()
    // cross-page que Navbar e Footer usam.
    const irParaContato = (e: React.MouseEvent) => {
        e.preventDefault();
        lenis?.scrollTo("#contato", { offset: -80 });
    };

    useGSAP(
        () => {
            const mm = gsap.matchMedia();

            // Só anima se o usuário NÃO pediu "reduzir movimento" no sistema
            mm.add("(prefers-reduced-motion: no-preference)", () => {
                setMotionOk(true);

                const split = new SplitText(".hero-title", {
                    type: "lines",
                    mask: "lines", // cria a máscara de overflow p/ o efeito de "subir"
                });

                const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

                // O prisma entra em fade junto do texto — esconde o primeiro frame do canvas
                tl.from(".hero-prism", { autoAlpha: 0, duration: 1.6, ease: "power2.out" }, 0)
                    .from(".hero-eyebrow", { y: 20, autoAlpha: 0, duration: 0.6 }, 0)
                    .from(
                        split.lines,
                        { yPercent: 110, autoAlpha: 0, duration: 0.9, stagger: 0.15 },
                        "-=0.3"
                    )
                    .from(".hero-sub", { y: 20, autoAlpha: 0, duration: 0.6 }, "-=0.4")
                    .from(".hero-cta", { y: 20, autoAlpha: 0, duration: 0.6 }, "-=0.3")
                    .from(".hero-scroll", { autoAlpha: 0, duration: 0.6 }, "-=0.2");

                // Parallax: o prisma anda um pouco mais que o scroll.
                // O curso (56px) tem de ser MENOR que a folga vertical do wrapper
                // (-inset-y-16 = 64px), senão a aresta do canvas entra em quadro.
                gsap.to(".hero-prism", {
                    y: -56,
                    ease: "none",
                    scrollTrigger: {
                        trigger: container.current,
                        start: "top top",
                        end: "bottom top",
                        scrub: true,
                    },
                });

                return () => {
                    split.revert(); // desfaz o split ao desmontar
                    setMotionOk(false);
                };
            });
        },
        { scope: container }
    );

    return (
        <section
            ref={container}
            className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center md:px-12"
        >
            {/* Fallback estático: vale para "reduzir movimento" e para falha de WebGL */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-20"
                style={{
                    background:
                        "radial-gradient(55% 45% at 50% 88%, rgba(154,199,178,0.20), transparent 72%), radial-gradient(45% 55% at 50% 58%, rgba(8,68,68,0.55), transparent 75%)",
                }}
            />

            {/* Prisma em WebGL. A folga vertical (-inset-y-16) é o que o parallax
                consome ao transladar — sem ela, a aresta do canvas viraria uma
                linha visível. O overflow-hidden da seção recorta a sobra. */}
            <div
                aria-hidden
                className="hero-prism pointer-events-none absolute inset-x-0 -inset-y-16 -z-10"
            >
                {motionOk && (
                    <Prism
                        animationType="rotate"
                        timeScale={0.4}
                        height={3.2}
                        baseWidth={6.5}
                        scale={2.2}
                        glow={0.5}
                        bloom={0.85}
                        noise={0.05}
                        offset={{ x: 0, y: -130 }}
                        transparent={false}
                        brandTint={1}
                        suspendWhenOffscreen
                    />
                )}
            </div>

            {/* Véu por cima do prisma: o radial protege o texto do núcleo do feixe;
                a faixa linear assenta o indicador de scroll acima da barra de luz */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[-5]"
                style={{
                    background:
                        "radial-gradient(55% 42% at 50% 42%, rgba(7,7,7,0.68), transparent 80%), linear-gradient(to top, rgba(7,7,7,0.9) 0%, rgba(7,7,7,0.5) 8%, transparent 16%)",
                }}
            />

            <div className="relative z-10 mx-auto max-w-4xl">
                <p className="hero-eyebrow mb-6 flex items-center justify-center gap-3 font-sans text-sm uppercase tracking-[0.2em] text-sage">
                    <span className="h-px w-8 bg-sage" />
                    Mais que marketing
                    <span className="h-px w-8 bg-sage" />
                </p>

                <h1 className="hero-title font-display text-4xl font-semibold leading-[1.05] text-limestone sm:text-5xl md:text-7xl lg:text-8xl">
                    Um motor de <br />
                    <span className="text-sage">crescimento.</span>
                </h1>

                <p className="hero-sub mx-auto mt-8 max-w-xl font-sans text-lg leading-relaxed text-limestone/70">
                    Transformamos marketing e vendas em um único sistema orientado por
                    dados para escalar com previsibilidade.
                </p>

                <div className="hero-cta mt-10">

                    <a href="#contato"
                        onClick={irParaContato}
                        className="inline-flex cursor-pointer items-center rounded-full bg-sage px-8 py-4 font-sans font-medium text-carbon transition-colors hover:bg-limestone"
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
