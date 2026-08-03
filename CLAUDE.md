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

## Formulário de contato

Três peças: o botão na seção `Contato`, a modal `components/forms/ModalContato` e
o `POST /api/contato`. Decisões que custaram análise — não desfazer sem motivo:

1. **`<dialog>` nativo com `showModal()`**, não um `<div role="dialog">`. O
   navegador entrega foco preso, Escape, devolução de foco ao gatilho e fundo
   inerte de graça — é a classe de código que sai errada sem ninguém notar. E o
   *top layer* escapa do `overflow-hidden` da seção e de ancestral com
   `filter`/`transform`, o que mata de véspera a armadilha do overlay da Navbar.
2. **Abrir o diálogo e animar a entrada no MESMO efeito.** O GSAP só pode tocar o
   painel depois do `showModal()`, e `useGSAP` roda em *layout effect* — separar
   em dois efeitos inverte a ordem (o layout effect roda antes do `useEffect`).
3. **O GSAP anima um div INTERNO, nunca o `<dialog>`** — o `display` dele é
   alternado pelo navegador. Já o `::backdrop` é pseudo-elemento e o GSAP não
   alcança: a entrada dele é `@keyframes` no `globals.css`.
4. **`lenis.stop()` enquanto aberta não é decorativo.** O top layer torna o fundo
   inerte para *clique*, mas a roda do mouse continua chegando na window e o Lenis
   rolaria a página atrás.
5. **Reset de estado no fechamento, não em efeito.** O `<dialog>` fecha no mesmo
   commit, então a troca de conteúdo não é pintada. Em efeito, além de piscar, o
   ESLint barra (`react-hooks/set-state-in-effect`).
6. **E-mail em `text:`, nunca `html:`.** O corpo vem de estranho na internet; em
   HTML seria injeção de markup na caixa de entrada. O nome vai no assunto, então
   passa por um achatamento de `\s` — quebra de linha em cabeçalho é injeção de
   header.
7. **`reply_to` é o e-mail de quem preencheu**, para "responder" ir ao lead e não
   ao remetente.
8. **`RESEND_API_KEY` sem `NEXT_PUBLIC_`** — com o prefixo a chave iria para o
   bundle do navegador. O `from` TEM de morar no domínio verificado na Resend
   (`suporte.taktico.com.br`); qualquer outro a API recusa.
9. **Sem SDK `resend` e sem `zod`.** É um POST só, para o mesmo endpoint que o SDK
   chama por dentro; e a validação de 5 campos à mão custa menos que a
   dependência. Mesma escolha do Prism, que foi portado em vez de instalado.
10. **Honeypot preenchido devolve 200 de mentira.** Dizer "recusado" ensinaria o
    bot a tentar de outro jeito. Nos demais erros vale o oposto — motivo
    explícito, por campo: ali do outro lado pode ter gente, e sumir com a
    mensagem dela em silêncio seria pior que um falso positivo declarado.

## Antispam do formulário (modelo de ameaça)

**O `to:` é constante no código, então isto não é relay aberto** — não dá para
usar o endpoint para spammar terceiros. O pior caso é a caixa da Dominyum encher e
a cota da Resend queimar, e **é a cota que importa: quando ela acaba, lead de
verdade para de chegar**. Por isso as defesas aqui limitam VOLUME; identificar bot
é outro problema (ver "não está aqui" no fim).

1. **`x-forwarded-for` é header do CLIENTE.** Ler o **primeiro** item — como era
   até aqui — deixa qualquer um ganhar cota nova mandando um valor diferente a
   cada requisição. Furo real, demonstrado em teste. Ler o **último** é correto
   independente do host: se o proxy sobrescreve, primeiro e último são iguais; se
   acrescenta, o último é a visão do proxy, não a do cliente. Antes disso, tentar
   `x-vercel-forwarded-for`/`cf-connecting-ip`, que o cliente não põe.
   **No primeiro deploy, conferir quais desses headers chegam de fato** — sem isso
   a contagem por IP é teoria.
2. **O teto global por hora (`MAX_GLOBAL`) é o que protege a cota**, e portanto os
   leads. Vale mesmo se a contagem por IP for contornada. O slot é reservado
   **antes** do `fetch` para a Resend, não depois do sucesso: chamada recusada
   também consumiu cota de API — e de bônus é o que permite testar o teto com uma
   chave inválida, sem entregar e-mail nenhum.
3. **Contadores em memória:** em serverless o teto real é `MAX_GLOBAL ×
   instâncias`, e tudo zera a cada cold start. Continua sendo teto, só não exato.
   Trocar por Redis/KV quando o tráfego legítimo começar a encostar nele.
4. **O teto de links mora em `lib/contato.ts`, não na rota** — é regra de
   validação, e regra de validação vive num lugar só. Com ela lá, quem colou três
   links vê o aviso no campo antes de qualquer requisição. Deixá-la só no servidor
   fazia o formulário mostrar o erro certo no campo **e** um banner genérico de
   "tente de novo" ao mesmo tempo, sugerindo falha temporária quando o problema
   era o conteúdo.
5. **Erro por campo não acumula banner** no `ModalContato` (`corpo.erros` presente
   ⇒ `erroGeral` só se o servidor mandar um). É o outro lado da lição acima.
6. **Anti-duplicata existe pela interação com o teto global:** sem ela um bot de
   payload fixo consumiria o teto da hora sozinho. A impressão é **liberada** se a
   Resend falhar — a mensagem não chegou, logo a pessoa tem de poder repetir. O
   slot global fica consumido de propósito.
7. **Recusar por tamanho, não cortar com `.slice()`.** Cortar a mensagem de alguém
   sem avisar é armadilha; e era o que tornava inalcançáveis pelo servidor as
   mensagens "muito longo" de `validaContato`.
8. **Não está aqui, de propósito:** desafio (Cloudflare Turnstile) e limite
   durável (Redis/KV). Turnstile é o que de fato barra bot, mas custa script de
   terceiro, dependência de conta e uma consideração de LGPD — **gatilho para
   entrar: a primeira mensagem de spam na caixa.** Limite conhecido que fica:
   `mensagem` exige 10 caracteres, e `"aaaaaaaaaa"` satisfaz; heurística de texto
   além disso erra com gente de verdade.

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
- Navbar: menu hambúrguer + overlay abaixo de `md`.
- **Nenhuma seção tem mais efeito preso a ponteiro fino.** O Contato tinha
  holofote que seguia o cursor e botão magnético (`(hover:hover)/(pointer:fine)`);
  os dois saíram. O crescimento do CTA no hover é CSS
  (`motion-safe:hover:scale-[1.03]`), que já não faz nada em touch. Se voltar a
  precisar de um efeito assim, o padrão era `gsap.matchMedia` com essa consulta.

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
- [ ] **`RESEND_API_KEY`:** colar a chave no `.env.local` (e no painel de deploy).
      Sem ela o formulário responde 500 com mensagem amigável e o console avisa —
      então a ausência é visível, mas o formulário não envia.
- [ ] **A caixa `contato@dominyum.com.br` precisa existir.** A Resend aceita o
      envio de qualquer jeito; se o destino não existe, a falha aparece só no
      painel dela e **o lead desaparece em silêncio**. Conferir antes de publicar.
- [ ] **Texto legal:** `/privacidade` e `/termos` são scaffolds com `[...]` —
      preencher (LGPD), idealmente com apoio jurídico. **O aceite do formulário
      de contato já linka para `/privacidade`**, então hoje ele aponta para uma
      página de texto vazio.
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
