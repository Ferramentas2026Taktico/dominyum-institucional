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
(`/brand/Logo_Dominyum.png`) a partir de 768px, e o símbolo
(`/brand/simbolo.png`) abaixo
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
3. **Recortar pela caixa de tinta antes de montar a grade.** O asset do símbolo
   já vem recortado hoje, mas o recorte no código FICA: é ele que torna a margem
   interna de cada asset irrelevante, e é de onde sai a proporção da banda (da
   tinta, não do arquivo). Histórico que justifica: o `icon.png` original tinha margem
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
10. **`display` no `<dialog>` tem de ser `open:`-gated.** `open:flex`, nunca `flex`
    solto. O navegador esconde diálogo fechado com
    `dialog:not([open]) { display: none }`, e **regra de autor vence regra de UA** —
    um `display: flex` cru mantém o diálogo FECHADO renderizado, e o formulário
    aparece dentro da seção Contato sem ninguém clicar. Chegou a produção assim.
    Sintoma gêmeo: fechado ele não é `:modal`, logo não ganha `position: fixed` nem
    `inset-block: 0`, cai no fluxo e parece "não centralizado" — mesma causa, outra
    aparência.
11. **`sm:h-fit`, nunca `sm:h-auto`, no diálogo centralizado.** O UA põe
    `inset-block: 0 0` no `dialog:modal`, e em posicionamento fixo com as duas
    bordas presas `height: auto` **estica para preencher** — sem espaço sobrando o
    `margin: auto` não tem o que distribuir e o card vira tela cheia, sem
    centralizar. `fit-content` é o que o próprio UA usa. Medido: com `auto`, 900px
    de altura numa viewport de 900; com `fit`, 641px e folga de 130 igual em cima e
    embaixo.
12. **O teto de altura mora no `<dialog>`, NUNCA no painel** — e é `dvh`.
    A primeira versão punha `max-h-[88dvh]` no painel e deixava o diálogo com o
    `max-height` do UA, medido contra o *initial containing block* (a viewport
    GRANDE no iOS): duas restrições em referenciais diferentes, e no celular real o
    painel passava da tela e o botão de enviar sumia. **A culpa era da divisão, não
    da unidade** — e a primeira correção errou o alvo trocando para `svh`, que
    reserva espaço para TODO o chrome (inclusive a barra inferior que pode não estar
    aparecendo) e deixava uma folga morta embaixo da sheet. `dvh` é a viewport
    visível atual, que é o que uma sheet quer.
13. **`min-h-0` no miolo que rola é obrigatório.** Item flex não encolhe abaixo do
    próprio conteúdo sem ele, e aí o `overflow-y-auto` nunca ativa — o conserto
    parece simplesmente não funcionar. Medido: o miolo encolhe de 479 para 195px
    conforme a tela encurta, com o conteúdo fixo em 538.
14. **O botão de enviar vive num rodapé FORA da área que rola**, com
    `env(safe-area-inset-bottom)`. Abaixo de `sm` a modal é uma sheet que ocupa a
    tela visível inteira; card centralizado sempre briga com tela curta.
    **Efeito colateral que vale saber:** com Nome e Telefone empilhados no mobile
    (uma coluna), o formulário mede 538px contra 479 disponíveis no Safari — ou
    seja, ele rola por dentro em QUALQUER altura de celular, não só em tela curta,
    e o aceite de LGPD fica abaixo da dobra sempre. **Não conte com o foco no
    primeiro campo com erro para trazer o aceite** — esta linha já afirmou isso e
    estava errada: `Object.keys(erros)[0]` segue a ordem de inserção de
    `validaContato`, então no caso comum (formulário vazio) o primeiro erro é `nome`
    e o foco vai para o TOPO, com `scrollTop` em 0. O medido `0 → 95` vinha de um
    teste que preenchia tudo menos o aceite, onde o primeiro erro *era* o aceite.
    Quem sustenta a usabilidade é a rolagem funcionar de fato — ver item 16, que é
    de onde vinha a impressão de que o checkbox "desaparecia". Já se cogitou pôr os
    dois campos na mesma linha
    para caber; devolve 94px e faz caber em 664, mas foi revertido por preferência
    visual. Encolher o textarea não é alternativa: corta só ~24px e continua
    rolando.
15. **Honeypot preenchido devolve 200 de mentira.** Dizer "recusado" ensinaria o
    bot a tentar de outro jeito. Nos demais erros vale o oposto — motivo
    explícito, por campo: ali do outro lado pode ter gente, e sumir com a
    mensagem dela em silêncio seria pior que um falso positivo declarado.
16. **`data-lenis-prevent` no miolo que rola — sem ele o dedo não rola nada.**
    `lenis.stop()` (item 4) faz o Lenis dar `preventDefault()` em TODO
    `touchmove`/`wheel` que chega na window, e o listener é `passive: false` na
    window — então ele mata também o gesto que nasce DENTRO do `<dialog>`
    (`lenis.mjs`, o ramo `if (this.isStopped || this.isLocked)`). A área rolável
    existia e estava correta; o gesto morria antes de chegar nela, e o aceite de
    LGPD ficava inalcançável no celular. Chegou a produção assim. O Lenis testa
    esse atributo ANTES do preventDefault, e por ancestralidade ele também devolve
    a rolagem de dentro do `<textarea>`. Sem sufixo (`-touch`/`-wheel`): a roda do
    mouse no desktop morria igual.
    **Quem trava a página atrás não é o `overscroll-contain`** — é o `lenis.css`,
    com `.lenis.lenis-stopped { overflow: clip }` no `<html>`. Medido: forçando
    `overscroll-behavior: auto` em runtime a página segue imóvel, e o `overflow` do
    `<html>` vai de `visible` a `clip` e volta ao fechar. O `overscroll-contain`
    fica como reforço (o próprio `lenis.css` já o aplica a `[data-lenis-prevent]`).
17. **Rolagem só se verifica com GESTO.** `elemento.scrollTop = N` e `campo.focus()`
    são programáticos e passam por cima do `preventDefault` — foi assim que 11
    testes ficaram verdes com o formulário inutilizável no celular. Pior: o
    `modal.mjs` dava uma roda no centro da tela e declarava "fundo travado" quando
    a página não se movia; a página não se movia PORQUE o gesto morria. Era o
    sintoma do bug lido como sucesso. Hoje ele exige as duas coisas no mesmo gesto
    (página parada **e** miolo rolando). E cuidado com o harness:
    `Input.synthesizeScrollGesture` entrega **zero** `touchmove` neste headless —
    um teste que não dispara evento nenhum "passa" pelo motivo errado. O que
    funciona é `Input.dispatchTouchEvent` montando o arrasto à mão; e a medida mais
    direta não é o `scrollTop`, é o `touchmove` sair da window **cancelado** ou não
    (com o par cabeçalho/miolo no mesmo run, um cancelado e outro livre, a asserção
    se prova capaz de falhar sem reverter o código).

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
- **Medir em altura VISÍVEL, nunca na altura física do aparelho.** Um iPhone 14
  tem 844px de tela, mas o Safari entrega ~664 e o Chrome ~628 — o resto é barra
  do navegador; com o teclado aberto sobram ~380. Emular 390×844 é testar uma
  viewport que navegador nenhum oferece, e foi assim que a modal de contato passou
  na verificação e chegou quebrada no celular de verdade.
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
- **Erro de hidratação que só aparece num navegador de celular: suspeitar do
  aplicativo, não do nosso render.** Sintoma real: "some attributes of the server
  rendered HTML didn't match", **no load**, **só no Chrome do iPhone e não no
  Safari**, persistindo em aba anônima. No iOS os dois são o MESMO motor (WebKit) —
  motor igual com comportamento diferente só pode vir do app. Os *data detectors*
  (que envolvem texto em `<a>` antes do React hidratar) são configurados por
  aplicativo no `WKWebView`, e aba anônima descarta extensão (o Chrome do iOS não
  tem). Daí o `formatDetection` no `layout.tsx`. Antes de chegar aqui, foi
  verificado que **nada no nosso render depende de ambiente**: todo
  `window.`/`matchMedia`/`Math.random`/`Date.` do `src/` está dentro de efeito ou
  handler, e o `useMovimentoReduzido` tem `getServerSnapshot` (medido: com
  `prefers-reduced-motion: reduce` emulado não há descasamento). **Não reproduz em
  Chrome headless** em nenhuma combinação — UA de iPhone, 3G + CPU 6×, toque antes
  da hidratação, IP da LAN. Duas hipótese minhas morreram no caminho e ficam
  registradas para ninguém repetir: (a) a corrida "toque antes de hidratar" — medido,
  o toque pré-hidratação é **perdido**, não reexecutado, e não gera descasamento;
  (b) `prefers-reduced-motion`.
- **`allowedDevOrigins` mora no default export do `next.config.ts`.** Ter um
  `module.exports = {...}` ao lado do `export default` deixa a lista MORTA — o Next
  lê o default. Dois mecanismos de export no mesmo arquivo é erro que não dá erro.
  E o casamento é por segmento, então `192.168.67.*` sobrevive ao DHCP trocar o
  último octeto (provado: `192.168.67.9` passa, `192.168.99.9` toma 403).
- **Qualquer área rolável dentro de algo que chama `lenis.stop()` precisa de
  `data-lenis-prevent`.** Vale para modal, overlay, drawer — não é específico do
  formulário. O Lenis parado cancela `touchmove`/`wheel` na window inteira, e sem o
  atributo a área rola no papel e não rola no dedo. Detalhes e medições no item 16
  do formulário de contato. Hoje o overlay do menu mobile não tem container de
  rolagem, então não é afetado; se um dia o menu passar da altura da tela, é aqui
  que a resposta está.
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
- [x] ~~**Logo/símbolo:** o símbolo "D" não existe como SVG.~~ Existe agora em
      `src/app/icon.svg`, exportado do `Logo_Dominyum.ai`. Dele saem o
      `favicon.ico` (16/32/48), o `apple-icon.png` (180) e o
      `public/brand/simbolo.png` (512, máscara do rodapé).

## Docs

- `docs/identidade-visual.md` — paleta e tokens
- `docs/tipografia.md` — fontes
- `docs/estrutura-sistema.md` — arquitetura e organização
- `docs/conteudo.md` — seções e copy
