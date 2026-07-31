import { useSyncExternalStore } from "react";

/**
 * `prefers-reduced-motion` como estado de React.
 *
 * Para animação de scroll o caminho é `gsap.matchMedia()` (ver CLAUDE.md). Este
 * hook serve ao outro caso: quando o **render** precisa saber da preferência —
 * montar ou não um canvas, animar ou não a entrada de uma modal.
 *
 * `useSyncExternalStore` em vez de `useState` + efeito por dois motivos: reage a
 * mudança de preferência em tempo real, e não dispara o `set-state-in-effect` do
 * ESLint (que já barrou a primeira versão disto).
 */

const CONSULTA = "(prefers-reduced-motion: reduce)";

const assina = (avisar: () => void) => {
  const mq = window.matchMedia(CONSULTA);
  mq.addEventListener("change", avisar);
  return () => mq.removeEventListener("change", avisar);
};

const le = () => window.matchMedia(CONSULTA).matches;

// No servidor não há preferência para ler. `false` mantém o HTML igual ao de
// quem aceita movimento, e o cliente corrige na hidratação se for o caso.
const leNoServidor = () => false;

export function useMovimentoReduzido() {
  return useSyncExternalStore(assina, le, leNoServidor);
}
