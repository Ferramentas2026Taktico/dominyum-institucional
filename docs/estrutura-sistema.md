# Estrutura do Sistema

## Rotas (App Router)

- `/` — home (single-page com as seções)
- `/privacidade`, `/termos` — páginas legais no route group `(legal)` (os
  parênteses fazem a pasta não aparecer na URL)
- `robots.ts`, `sitemap.ts` — gerados pelo Next
- `icon.png` — favicon
- `POST /api/contato` — recebe o formulário de contato e envia por e-mail

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
    api/
      contato/route.ts  # POST do formulário -> e-mail via Resend
  components/
    sections/         # Hero, Sistema, Servicos, Metodo, Resultados, Sobre, Contato
    motion/           # SmoothScroll (Lenis), Prism (fundo WebGL do Hero),
                      #   MarcaCaracteres (marca em caracteres do footer)
    layout/           # Navbar, Footer
    forms/            # ModalContato (o <dialog> com o formulário)
  lib/
    gsap.ts           # registro único dos plugins GSAP
    nav.ts            # links de navegação (fonte única p/ Navbar e Footer)
    motion.ts         # useMovimentoReduzido() — prefers-reduced-motion no render
    contato.ts        # validação + máscara do formulário (cliente E servidor)
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

## `lib/motion.ts`

`useMovimentoReduzido()` — `prefers-reduced-motion` como estado de React
(`useSyncExternalStore`), para quando o **render** precisa da preferência: montar
ou não um canvas, animar ou não a entrada da modal. Consumidores:
`MarcaCaracteres` e `ModalContato`.

Para animação de scroll o caminho continua sendo `gsap.matchMedia()` — ver
"Convenções de animação" no `CLAUDE.md`.

## `lib/contato.ts`

`validaContato`, `mascaraTelefone` e `LIMITES`. A mesma `validaContato` roda no
cliente (retorno imediato) e no route handler (autoridade — o cliente é
contornável). Ficar num arquivo só é o que impede as duas de divergirem.

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
- **Contato:** só a entrada em stagger. É a seção com **menos** JS de animação —
  o holofote que seguia o cursor e o botão magnético foram removidos, e com eles
  o bloco inteiro condicionado a `(hover: hover) and (pointer: fine)` e os dois
  `gsap.quickTo`. O CTA cresce no hover por CSS
  (`transition duration-300 motion-safe:hover:scale-[1.03]`); como o GSAP não toca
  mais no transform do botão, o `scale` em classe não disputa a propriedade com
  ninguém — a entrada anima `y` no wrapper, não no botão.
  O fundo é o gradiente verde→preto com o brilho no meio (ver
  `docs/identidade-visual.md`) e o CTA abre `forms/ModalContato`.

## Formulário de contato

Três peças: o gatilho na seção `Contato`, a modal `forms/ModalContato` e o
`POST /api/contato`. Ver "Formulário de contato" no `CLAUDE.md` para as decisões
que não se leem no código (por que `<dialog>` nativo, por que texto puro no
e-mail, por que sem SDK da Resend).

## Navegação cross-page

`Navbar` e `Footer` usam `usePathname()` + helper `anchor(href)`:

- Na home: intercepta o clique (`preventDefault`) e usa `lenis.scrollTo`
  (scroll suave).
- Fora da home: não intercepta; deixa o link `/#id` navegar (jump nativo do
  navegador ao carregar a home).
