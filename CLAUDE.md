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
- **ogl** — WebGL mínimo, usado só pelo fundo Prism do Hero
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

## Fundos em WebGL (canvas)

O Hero usa `src/components/motion/Prism.tsx` (porte do Prism do React Bits, sobre
`ogl`). Regras ao mexer nele ou criar outro fundo em canvas:

1. Montar via `dynamic(() => import(...), { ssr: false })` **de dentro de um
   client component** — `page.tsx` é Server Component e não aceita `ssr: false`.
2. O render loop entra no `gsap.ticker`, nunca num `requestAnimationFrame`
   próprio: a página tem um loop só (é o mesmo que move o Lenis). Para pausar,
   use uma flag dentro do callback — **não** remova o listener de dentro do
   dispatch do ticker, senão o GSAP pula o listener seguinte naquele frame.
3. `suspendWhenOffscreen` ligado. O shader faz 100 passos de raymarch por pixel;
   deixar rodando depois que a seção sai da tela queima GPU e bateria.
4. DPR com teto (1.5), e 1 abaixo de 768px.
5. Sob `prefers-reduced-motion` o canvas **não monta** — sempre ter um fallback
   estático em CSS atrás dele (que também cobre falha de contexto WebGL).
   **Exceção deliberada:** canvas 2D barato (ver `MarcaCaracteres`) pode montar e
   desenhar UM frame estático, sem entrar no ticker. A regra existe pelo custo do
   shader, não pelo `<canvas>` em si.
6. O enquadramento do Prism deriva da altura; a correção por aspecto em
   `resize()` é o que impede o feixe de engolfar a tela no mobile.

## Marca em caracteres do footer

`src/components/motion/MarcaCaracteres.tsx` desenha a marca como uma grade de
caracteres (canvas 2D). A forma vem dos **assets da marca**: o wordmark
(`/brand/Logo_Dominyum.png`) a partir de 768px, e o símbolo (`/icon.png`) abaixo
disso. Lições que custaram uma volta cada — não reintroduzir:

1. **A célula não é quadrada.** Um glifo monoespaçado é mais alto que largo. Em
   grade quadrada os caracteres se tocam na vertical e sobra vão na horizontal —
   os traços da forma viram pontos e ela dissolve. `cellW` acompanha o avanço
   medido do glifo; o `drawImage` da máscara recebe o destino já **em células**
   (largura em `cellW`, altura em `cellH`), então a proporção sai certa sem truque.
2. **Célula acesa = alpha > 128 E luminância > 128.** Os dois assets são
   construídos de formas opostas: o wordmark é glifo claro sobre **transparente**,
   o ícone é branco sobre **preto opaco**. Testar só alpha acende todas as células
   do ícone e a banda vira um retângulo maciço. (Medido: com o teste combinado,
   5,5% dos pixels do ícone acendem.)
3. **Recortar pela caixa de tinta antes de montar a grade.** `icon.png` tem margem
   preta enorme — o D ocupa ~35% do quadro de 1080px. Sem recorte ele sai
   minúsculo. Com recorte, a margem interna de cada asset deixa de importar, e a
   proporção da banda também deriva da tinta, não do arquivo.
4. **Glifos vêm de um atlas + `drawImage`**, não de `fillText` por caractere. É o
   que sustenta ~900 caracteres a 60fps.
5. **Callback de fora vai para um ref, nunca para as dependências do efeito.** Uma
   arrow inline troca de identidade a cada render; no clique o efeito remontava e
   desfazia a animação no mesmo frame. (Hoje a dica mora dentro do componente, o
   que remove a classe do bug — não reintroduzir prop de callback aqui.)
6. **`linhasAlvo` é por asset.** Granularidade não é global: uma forma cheia (o
   símbolo) fecha bem com ~22 linhas, um wordmark de traço fino em caixa baixa
   pede mais, senão as hastes viram pontos soltos.
7. **O fallback em texto é para falha da imagem** (404/rede), não para tela
   estreita — o símbolo quadrado resolveu o mobile, porque a altura da forma passou
   a ser `largura × preenchimento`, e não `largura / 8.8` como no wordmark inteiro.

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
  - Contato: e-mail `contato@dominyum.com.br` é placeholder; formulário real
    precisa de backend.
- [ ] **Texto legal:** `/privacidade` e `/termos` são scaffolds com `[...]` —
      preencher (LGPD), idealmente com apoio jurídico.
- [ ] **GTM:** definir `NEXT_PUBLIC_GTM_ID` no `.env.local` (e no painel de
      deploy).
- [ ] **Domínio real:** trocar `https://www.dominyum.com.br` em `layout.tsx`,
      `robots.ts` e `sitemap.ts`.
- [ ] **Sitemap:** adicionar `/privacidade` e `/termos` ao `sitemap.ts`.
- [ ] **Consentimento de cookies (LGPD):** banner + bloqueio condicional do GTM.
- [ ] **Logo/símbolo:** o símbolo "D" ainda não existe como SVG no projeto
      (o placeholder tipográfico do Hero saiu junto com a entrada do Prism).

## Docs

- `docs/identidade-visual.md` — paleta e tokens
- `docs/tipografia.md` — fontes
- `docs/estrutura-sistema.md` — arquitetura e organização
- `docs/conteudo.md` — seções e copy
