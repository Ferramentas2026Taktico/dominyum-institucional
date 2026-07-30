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
