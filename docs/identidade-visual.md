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

## Marca

- **Logo (wordmark):** `public/brand/Logo_Dominyum.png` — usado na navbar via
  `next/image`.
- **Favicon:** `src/app/icon.png` (convenção do App Router; gerado
  automaticamente).
- **OG image:** `public/brand/og-image.png` (1080×630).
- **Símbolo "D":** tem um recorte/gap característico. No Hero há um "D"
  tipográfico como placeholder — trocar por SVG quando o arquivo do símbolo
  estiver disponível.
