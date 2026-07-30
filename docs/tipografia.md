# Tipografia

Duas fontes carregadas via `next/font/google` no `layout.tsx`, ligadas a CSS
variables e consumidas no bloco `@theme` do `globals.css`.

- **Sora** — títulos / display. Var `--font-sora` → utility `font-display`.
- **Roboto** — corpo. Var `--font-roboto` → utility `font-sans`. Pesos
  400 / 500 / 700.

As duas partes precisam bater: a `variable` de cada fonte no `layout.tsx` e o
mapeamento no `@theme` (`--font-display: var(--font-sora)` etc.).

## Escala em uso (referência, mobile-first)

- **Hero h1:** `text-4xl sm:text-5xl md:text-7xl lg:text-8xl`
- **Título de seção (h2):** `text-4xl md:text-6xl`
- **Números de Resultados:** `text-7xl md:text-8xl`
- **Eyebrow (rótulo):** `text-sm uppercase tracking-[0.2em] text-sage`
- **Corpo:** `text-limestone/60` a `/70` para texto secundário.

Os tamanhos grandes já têm valor base reduzido pra mobile (o valor sem prefixo é
o do celular; os prefixes crescem). Ao criar novos títulos grandes, seguir o
mesmo padrão pra não estourar a largura em telas pequenas.
