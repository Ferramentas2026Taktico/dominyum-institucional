/**
 * Links de navegação da home — fonte única para a Navbar e o Footer.
 *
 * A ordem espelha a ordem das seções em `src/app/page.tsx`. Ao reordenar seções
 * lá, reordenar aqui: era a divergência entre as duas listas duplicadas que fazia
 * os menus anunciarem uma ordem que a página não tinha.
 *
 * A seção `Chamada` fica de fora de propósito — é um interstício de conversão,
 * não um destino de navegação (não tem `id`).
 */
export const navLinks = [
  { label: "Serviços", href: "#servicos" },
  { label: "Sistema", href: "#sistema" },
  { label: "Método", href: "#metodo" },
  { label: "Resultados", href: "#resultados" },
  { label: "Sobre", href: "#sobre" },
];
