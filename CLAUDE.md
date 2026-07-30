# Dominyum — Site Institucional

Site institucional da Dominyum, agência de growth marketing (marketing orientado
por dados / performance / revenue growth). Site em **português**, single-page com
foco em animações cinematográficas estilo Awwwards. Responsivo (mobile-first nos
tamanhos/espacamentos).

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4** (CSS-first, `@theme` em `globals.css`)
- **TypeScript**
- **GSAP** + ScrollTrigger + SplitText + `@gsap/react` (`useGSAP`) — animações
- **Lenis** — smooth scroll (exposto via contexto React)
- **@next/third-parties** — Google Tag Manager

## Comandos

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run start` — roda o build
- `npm run lint` — ESLint

## Convenções de animação (IMPORTANTE)

Toda seção animada segue o MESMO padrão. Siga-o ao criar ou editar seções:

1. `"use client"` no topo (a animação roda no client).
2. `const container = useRef<HTMLElement>(null)` + `{ scope: container }` no
   `useGSAP` — o escopo limita os seletores e cuida da limpeza.
3. Envolver as animações em `gsap.matchMedia()` com
   `(prefers-reduced-motion: no-preference)`. Quem pediu menos movimento vê tudo
   estático e visível.
4. Importar sempre de `@/lib/gsap` (registro único dos plugins). Nunca importar
   direto de `gsap`.
5. Conteúdo (texto/dados) renderiza no HTML mesmo sem animação (SEO + fallback);
   a animação só sobrepõe. Nunca deixar texto invisível sem uma animação que o
   traga de volta.

## Padrões de scroll

- **Reveal ao entrar:** `scrollTrigger: { trigger, start: "top 80%" }`, sem
  scrub (toca uma vez).
- **Scrub (amarrado ao scroll):** `scrub: true` + `ease: "none"`.
- **Smooth scroll:** Lenis via provider `SmoothScroll`; usar `useLenis()` para
  `scrollTo`.

## Responsividade (mobile-first)

- Padrão: valor base = mobile; prefixes `sm:`/`md:`/`lg:` crescem pra telas
  maiores. Ex.: `text-4xl md:text-7xl`, `py-20 md:py-32`.
- Seções de conteúdo usam `py-20 md:py-32`. Hero e Contato usam `min-h-screen`
  (não têm `py-32`).
- Navbar: menu hambúrguer + overlay abaixo de `md`. Efeitos de ponteiro do
  Contato (holofote/botão magnético) só ligam em `(hover:hover)/(pointer:fine)`.

## Navegação

- Âncoras via `lenis.scrollTo("#id", { offset: -80 })` (o -80 compensa a navbar
  fixa).
- **Cross-page:** helper `anchor(href)` — na home usa `#id`; fora da home usa
  `/#id`. Ver `Navbar` e `Footer`.

## Armadilhas já resolvidas (não reintroduzir)

- **Overlay do menu mobile fica FORA do `<header>`** (é irmão dele). O header tem
  `backdrop-blur`, e `backdrop-filter`/`filter`/`transform` num ancestral fazem
  um filho `fixed` se ancorar nele em vez da viewport — o que encolhia o overlay
  pra faixa do topo.
- **No menu mobile, chamar `lenis.start()` ANTES do `scrollTo`.** Ao abrir o
  menu chamamos `lenis.stop()` (trava o fundo); um Lenis parado tem o loop
  suspenso e ignora o `scrollTo`. Religar explicitamente no mesmo clique resolve.
- **Transform e blocos:** ao animar `scale`/`x`/`y` no GSAP, não deixar a
  centralização/rotação do elemento também no transform via classe — separar
  (ex.: rotação em `style` inline, centralização por `inset-0 m-auto`).

## Pendências (TODO)

- [ ] **Placeholders de conteúdo:**
  - Resultados: ROAS/CAC/leads são inventados; só o 52% é real. Trocar pelos
    dados reais.
  - Contato: e-mail `contato@dominyum.com` é placeholder; formulário real
    precisa de backend.
  - Footer: links de Instagram/LinkedIn são placeholders.
- [ ] **Texto legal:** `/privacidade` e `/termos` são scaffolds com `[...]` —
      preencher (LGPD), idealmente com apoio jurídico.
- [ ] **GTM:** definir `NEXT_PUBLIC_GTM_ID` no `.env.local` (e no painel de
      deploy).
- [ ] **Domínio real:** trocar `https://www.dominyum.com.br` em `layout.tsx`,
      `robots.ts` e `sitemap.ts`.
- [ ] **Sitemap:** adicionar `/privacidade` e `/termos` ao `sitemap.ts`.
- [ ] **Consentimento de cookies (LGPD):** banner + bloqueio condicional do GTM.
- [ ] **Logo/símbolo:** o "D" do Hero é tipográfico (placeholder); trocar por SVG
      quando o símbolo estiver disponível.

## Docs

- `docs/identidade-visual.md` — paleta e tokens
- `docs/tipografia.md` — fontes
- `docs/estrutura-sistema.md` — arquitetura e organização
- `docs/conteudo.md` — seções e copy
