# Identidade Visual

Tema **dark**. Tokens definidos com Tailwind v4 (CSS-first) no bloco `@theme`
de `src/app/globals.css`.

## Paleta

| Token     | Hex       | Uso                                   |
| --------- | --------- | ------------------------------------- |
| carbon    | `#070707` | fundo principal                       |
| slate     | `#062628` | seções escuras (alterna com carbon)   |
| verdant   | `#084444` | profundidade / seções escuras         |
| sage      | `#9ac7b2` | cor de destaque da marca              |
| limestone | `#d3dddb` | texto claro / blocos claros           |

Gera as utilities correspondentes: `bg-carbon`, `text-sage`, `border-sage`,
`bg-slate`, etc. As cores ficam como CSS variables reais
(`var(--color-sage)`), então **podem ser animadas no GSAP**.

## Ritmo de fundo

As seções alternam carbon / slate para criar contraste ao rolar:

Hero (carbon) → Sistema (slate) → Serviços (carbon) → Método (slate) →
Resultados (carbon) → Sobre (slate) → Contato (carbon).

Ao criar novas seções, manter a alternância.

**A exceção é o Contato**, que faz a transição por gradiente em vez de troca
chapada — ver abaixo.

## Fundo do Contato (gradiente verde → preto)

Único gradiente vertical de marca do projeto. Ele existe para **costurar** o Sobre
(`slate`) ao Footer (`carbon`), e não só para enfeitar: são três camadas
`aria-hidden` sobre uma seção **sem `bg-*`**.

1. **Base:** `linear-gradient(to bottom, #062628 0%, #062628 6%, #070707 100%)`.
   Segura o slate EXATO do Sobre nos primeiros 6% e desce numa rampa longa até o
   carbon EXATO do Footer **em 100%** — o preto fica reservado para o fim.
2. **Brilho:** dois radiais em `50% 50%` (verdant a 0.85 + núcleo sage a 0.14).
   **O ponto mais claro da seção é o meio**, não o topo.
   Não precisa de máscara: com o centro em 50%, a distância elíptica até `y=0` é
   `0.5h / 0.45h = 1.11` do raio, ou seja já passou do stop transparente. (Isso é
   consequência da geometria, e foi medido. Na primeira versão o centro era
   `50% 0%` — força máxima na primeira linha de pixels — e abria 25 de diferença
   por canal na costura; ali a máscara era obrigatória.)
3. **Grade:** dois `repeating-linear-gradient` de 1px a 88px, ecoando a grade do
   Sistema, **ocupando a seção toda**. O fade nos quatro lados vem de duas
   máscaras lineares cruzadas com **`mask-composite: intersect`**. O `intersect`
   é obrigatório: o padrão é `add`, que faz a UNIÃO das duas e deixa a grade
   aparecer até a borda. (Chrome normaliza o valor computado para `source-in`.)

**Medições.** Fronteiras, diferença máxima por canal: **Sobre→Contato = 0** e
**Contato→Footer = 0**, nas três colunas amostradas.

Perfil vertical na coluna central: `#062628` no topo → **pico `#0b4141` em 50%**
→ `#070707` em 100%. Em 390px o pico cai em 45% com o mesmo valor. Contraste do
limestone sobre o brilho: **11,5:1** no desktop, 12,6:1 no mobile — o título passa
folgado em AA e AAA mesmo com o halo atrás dele.

Grade: brilho da linha (on-line menos vizinho) = **10 no miolo, 1 na borda
esquerda, 0 no topo, na base e no canto**. É esse contraste que prova o
`intersect`: na borda esquerda a máscara vertical está aberta e a horizontal
fechada, então união daria 10 e interseção dá 1.

**Uma consequência que vale saber.** Com o topo obrigado a ser o slate do Sobre
(para a costura) e o halo sendo radial, a coluna das **bordas** fica mais verde no
topo do que no meio — só a faixa central tem o pico no meio. Não há como ter as
duas coisas ao mesmo tempo; a escolha foi a favor da costura invisível.

Se quiserem mais impacto, o parâmetro é a opacidade do radial verdant — o resto do
sistema não depende dela.

## Barra de rolagem

Em `globals.css`. Três decisões que não se leem no CSS:

1. **`color-scheme: dark` no `:root` é a linha que mais rende**, e não é sobre a
   barra só: é o que avisa o navegador que a página é escura. Sem ela o UA desenha
   barra, controles de formulário e menus nativos em modo claro sobre um site
   preto, com resultado variando por plataforma.
2. **Nunca declarar `scrollbar-color`/`scrollbar-width` junto dos
   `::-webkit-scrollbar-*`.** Desde o Chrome 121 as propriedades padrão têm
   PRECEDÊNCIA e desligam todo o desenho fino. A divisão é por capacidade
   (`@supports not selector(::-webkit-scrollbar)`), não por navegador: Chrome,
   Edge e Safari pegam os pseudo-elementos; Firefox cai nas padrão.
3. **`border: 2px solid transparent` + `background-clip: padding-box`** é o que faz
   o polegar parecer fino sem perder área de arrasto — medido: pintura de 6px
   dentro de um elemento de 10px. E como `background:` (atalho) reseta o
   `background-clip`, ele é repetido em `:hover` e `:active`.

`scrollbar-gutter: stable` no `:root` **não é cosmético**: o Lenis põe
`overflow: clip` no `<html>` quando a modal abre (`.lenis-stopped`), a barra
desaparece e o conteúdo centralizado deslocava **7px** — medido antes e depois,
agora 0. Em mobile a barra é sobreposta (largura 0) e a canaleta não reserva nada,
então não custa largura em tela estreita.

## Formulário (modal de contato)

Primeiros campos de formulário do projeto, então as convenções nascem aqui
(`components/forms/ModalContato.tsx`, constantes `classeCampo` e `classeRotulo`):

- **Rótulo:** `text-xs uppercase tracking-[0.2em] text-limestone/40` — o mesmo
  vocabulário dos eyebrows das seções, um passo menor.
- **Campo:** `rounded-xl border border-limestone/15 bg-limestone/[0.03]`, com
  `placeholder:text-limestone/25` e foco em `border-sage/60` + `ring-sage/20`.
- **Erro:** `red-400`/`red-300` do Tailwind. **A paleta não tem token de alerta** e
  criar um só para isto não se paga — se aparecer um segundo uso, vira token.

## Fundo do Hero (Prism)

O Hero usa o **Prism** (`src/components/motion/Prism.tsx`), um prisma
renderizado em WebGL — porte do componente do
[React Bits](https://reactbits.dev/backgrounds/prism).

O shader original devolve um espectro arco-íris. Aqui a luminância de cada pixel
é remapeada para a paleta da marca, via a prop `brandTint` (0 = espectro
original, 1 = marca):

```
carbon → verdant → sage → limestone
(sombra)  (meio)   (luz)  (estouro)
```

Os hex dessa rampa são defaults da prop `palette` do componente — se um token do
`@theme` mudar, atualizar lá também.

Sobre o canvas há um véu (`radial-gradient` de carbon) que protege o contraste do
texto contra o núcleo do feixe, e uma faixa inferior que assenta o indicador de
scroll acima da barra de luz. Quem pede `prefers-reduced-motion` não recebe
canvas nenhum: fica só um gradiente estático sage/verdant.

## Marca

- **Logo (wordmark):** `public/brand/Logo_Dominyum.png` — usado na navbar via
  `next/image`.
- **Favicon:** `src/app/icon.png` (convenção do App Router; gerado
  automaticamente).
- **OG image:** `public/brand/og-image.png` (1080×630).
- **Símbolo "D":** tem um recorte/gap característico. Ainda não existe como SVG
  no projeto — adicionar quando o arquivo estiver disponível. (O "D" tipográfico
  que servia de placeholder no Hero foi removido junto com a entrada do Prism.)

## Marca em caracteres do footer

O rodapé fecha com a marca desenhada por uma grade de caracteres
(`src/components/motion/MarcaCaracteres.tsx`), com campo de repulsão no ponteiro e
clique que bagunça/remonta.

A forma vem dos **arquivos reais da marca**, não de texto na fonte:

- a partir de 768px: `public/brand/Logo_Dominyum.png` (o wordmark)
- abaixo de 768px: `src/app/icon.png` (só o símbolo, servido em `/icon.png`)

Isso **não depende** do símbolo existir em SVG: a máscara é reamostrada numa grade
de ~22 linhas de caractere, então 1080px de raster é folga de sobra. Se um dia o
SVG entrar, basta trocar a `src`.

Se a imagem não carregar, o componente cai no wordmark em texto — nunca banda
vazia. Sob `prefers-reduced-motion` o canvas desenha um único frame estático.
