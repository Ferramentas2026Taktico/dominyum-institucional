# Estrutura do Sistema

## Rotas (App Router)

- `/` — home (single-page com as seções)
- `/privacidade`, `/termos` — páginas legais no route group `(legal)` (os
  parênteses fazem a pasta não aparecer na URL)
- `robots.ts`, `sitemap.ts` — gerados pelo Next
- `icon.png` — favicon

## Pastas

```
src/
  app/
    layout.tsx        # fontes, metadata/SEO, GTM, providers
    page.tsx          # compõe as seções da home
    globals.css       # @import "tailwindcss" + @theme (tokens) + .legal-content
    icon.png          # favicon
    robots.ts
    sitemap.ts
    (legal)/
      layout.tsx      # moldura das páginas legais (+ "voltar ao site")
      privacidade/page.tsx
      termos/page.tsx
  components/
    sections/         # Hero, Sistema, Servicos, Metodo, Resultados, Sobre, Contato
    motion/           # SmoothScroll (Lenis + contexto useLenis), Prism (fundo WebGL)
    layout/           # Navbar, Footer
  lib/
    gsap.ts           # registro único dos plugins GSAP
public/
  brand/              # Logo_Dominyum.png, og-image.png
```

## Providers (em `layout.tsx`)

`SmoothScroll` envolve tudo. Dentro dele, nesta ordem: `Navbar`, `children`,
`Footer`. O `SmoothScroll` cria a instância do Lenis e a distribui via
`LenisContext` — qualquer componente cliente usa `useLenis()`.

O `GoogleTagManager` é renderizado condicionalmente (`{gtmId && ...}`) na
abertura do `<body>`.

## `lib/gsap.ts`

Registra `ScrollTrigger`, `SplitText` e `useGSAP` **uma vez** e reexporta.
Importar SEMPRE daqui, nunca direto de `gsap`.

## Padrão de seção

Ver "Convenções de animação" no `CLAUDE.md`. Resumo: `"use client"` +
`useRef` container + `useGSAP` com `{ scope: container }` +
`gsap.matchMedia()` respeitando `prefers-reduced-motion`.

## Efeitos por seção

- **Hero:** fundo Prism em WebGL (ver `docs/identidade-visual.md`) + timeline de
  entrada (fade do prisma + SplitText no título) + parallax com scrub no prisma.
  Conteúdo centralizado.
- **Sistema:** reveal com stagger (4 pilares).
- **Serviços:** lista em linhas, reveal com stagger, hover simples.
- **Método:** trilho (`scaleX`) + etapas em stagger, mesmo gatilho de scroll.
- **Resultados:** contadores animados (anima um objeto e escreve no DOM via
  `onUpdate`; o valor final também está no JSX para SEO/fallback).
- **Sobre:** reveal (missão/visão + valores) + marquee infinito (lista
  duplicada, `xPercent: -50`, `repeat: -1`).
- **Contato:** entrada + holofote que segue o cursor + botão magnético (só em
  `(hover: hover) and (pointer: fine)`), via `gsap.quickTo`.

## Navegação cross-page

`Navbar` e `Footer` usam `usePathname()` + helper `anchor(href)`:

- Na home: intercepta o clique (`preventDefault`) e usa `lenis.scrollTo`
  (scroll suave).
- Fora da home: não intercepta; deixa o link `/#id` navegar (jump nativo do
  navegador ao carregar a home).
