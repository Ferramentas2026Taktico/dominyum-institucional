"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useLenis } from "@/components/motion/SmoothScroll";
import { useMovimentoReduzido } from "@/lib/motion";
import {
  LIMITES,
  campoVazio,
  mascaraTelefone,
  temErro,
  validaContato,
  type DadosContato,
  type ErrosContato,
} from "@/lib/contato";

/**
 * Modal do formulário de contato.
 *
 * É um `<dialog>` nativo com `showModal()`, e não um `<div role="dialog">`. A
 * troca não é estética: o navegador entrega foco preso, Escape, devolução do foco
 * ao gatilho e fundo inerte — justamente o código que sai errado sem ninguém
 * perceber. De bônus, o *top layer* escapa do `overflow-hidden` da seção e de
 * qualquer ancestral com `filter`/`transform` (a armadilha do overlay da Navbar,
 * documentada no CLAUDE.md).
 */

type Props = {
  aberto: boolean;
  /** Precisa ter identidade estável (`useCallback` com deps vazias) no pai. */
  onFechar: () => void;
};

const classeCampo =
  "w-full rounded-xl border bg-limestone/[0.03] px-4 py-3 font-sans text-limestone outline-none transition-colors placeholder:text-limestone/25 focus-visible:border-sage/60 focus-visible:ring-2 focus-visible:ring-sage/20";

const classeRotulo =
  "mb-2 block font-sans text-xs uppercase tracking-[0.2em] text-limestone/40";

// A paleta da marca não tem token de alerta, e criar um só para isto não se paga.
const borda = (temErroNoCampo: boolean) =>
  temErroNoCampo ? "border-red-400/70" : "border-limestone/15";

const propsIcone = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function IconeAviao() {
  return (
    <svg {...propsIcone} className="h-4 w-4 shrink-0">
      <path d="M21.6 2.4 2.9 9.6a.6.6 0 0 0 .05 1.13l6.3 2.05 2.05 6.3a.6.6 0 0 0 1.13.05z" />
      <path d="M21.6 2.4 9.25 12.78" />
    </svg>
  );
}

function IconeFechar() {
  return (
    <svg {...propsIcone} className="h-4 w-4">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function IconeConfirmado() {
  return (
    <svg {...propsIcone} strokeWidth={1.4} className="h-7 w-7">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.4 2.6 2.6L16 9.6" />
    </svg>
  );
}

type Estado = "parado" | "enviando" | "ok";

export default function ModalContato({ aberto, onFechar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const painel = useRef<HTMLDivElement>(null);
  const iscaRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const saindo = useRef(false);

  const lenis = useLenis();
  const reduzido = useMovimentoReduzido();

  const [dados, setDados] = useState<DadosContato>(campoVazio);
  const [erros, setErros] = useState<ErrosContato>({});
  const [estado, setEstado] = useState<Estado>("parado");
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  // `onFechar` entra direto nas deps, sem o ref que a lição do `MarcaCaracteres`
  // pediria: `fechar` só é chamado de handlers (onClick, onCancel) e não aparece
  // nas dependências de nenhum efeito. É a presença nas deps do efeito que fazia
  // a identidade instável desfazer a interação lá — aqui não existe esse caminho.
  /** Fecha de fato. Roda depois da animação de saída, com o painel já invisível. */
  const concluirFechamento = useCallback(() => {
    saindo.current = false;
    onFechar();
    // Reset aqui e não num efeito: o `<dialog>` fecha no mesmo commit, então a
    // troca de conteúdo não chega a ser pintada. Em efeito, além de piscar, o
    // ESLint barra (`react-hooks/set-state-in-effect`).
    setEstado((s) => (s === "ok" ? "parado" : s));
    setErros({});
    setErroGeral(null);
  }, [onFechar]);

  const fechar = useCallback(() => {
    if (saindo.current) return;
    const alvo = painel.current;
    if (!alvo || reduzido) {
      concluirFechamento();
      return;
    }
    saindo.current = true;
    gsap.to(alvo, {
      autoAlpha: 0,
      y: 10,
      scale: 0.985,
      duration: 0.2,
      ease: "power2.in",
      onComplete: concluirFechamento,
    });
  }, [reduzido, concluirFechamento]);

  // Abrir/fechar o diálogo e animar a entrada no MESMO efeito, de propósito:
  // o GSAP só pode tocar o painel depois do `showModal()`, e `useGSAP` roda em
  // layout effect — separar em dois efeitos inverteria a ordem.
  useGSAP(
    () => {
      const dlg = dialogo.current;
      const alvo = painel.current;
      if (!dlg || !alvo) return;

      if (!aberto) {
        if (dlg.open) dlg.close();
        return;
      }
      if (!dlg.open) dlg.showModal();

      if (reduzido) {
        gsap.set(alvo, { autoAlpha: 1, y: 0, scale: 1 });
        return;
      }
      gsap.fromTo(
        alvo,
        { autoAlpha: 0, y: 24, scale: 0.98 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" }
      );
    },
    { dependencies: [aberto, reduzido] }
  );

  // O `<dialog>` no top layer torna o fundo inerte para clique, mas a roda do
  // mouse continua chegando na window — e o Lenis rolaria a página atrás. Daí o
  // stop() ser necessário, não decorativo.
  useEffect(() => {
    if (!lenis) return;
    if (aberto) lenis.stop();
    else lenis.start();
  }, [aberto, lenis]);

  const alterar = (campo: keyof DadosContato, valor: string | boolean) => {
    setDados((d) => ({ ...d, [campo]: valor }));
    // Apaga o erro do campo enquanto a pessoa corrige, em vez de deixar o aviso
    // vermelho contradizendo o que ela acabou de digitar. `delete` e não
    // `= undefined`: a chave presente com valor undefined ainda conta em
    // `Object.keys`, e `temErro` mede por aí.
    setErros((e) => {
      if (!e[campo]) return e;
      const proximo = { ...e };
      delete proximo[campo];
      return proximo;
    });
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (estado === "enviando") return;

    const encontrados = validaContato(dados);
    if (temErro(encontrados)) {
      setErros(encontrados);
      const primeiro = Object.keys(encontrados)[0];
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${primeiro}"]`)
        ?.focus();
      return;
    }

    setErros({});
    setErroGeral(null);
    setEstado("enviando");

    try {
      const r = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...dados,
          website: iscaRef.current?.value ?? "",
        }),
      });
      const corpo = await r.json().catch(() => ({}));

      if (!r.ok) {
        // Erro por campo NÃO acumula banner: o aviso embaixo do campo já diz o
        // que corrigir, e um "tente de novo" genérico em cima disso sugere falha
        // temporária quando o problema é o conteúdo — repetir igual falharia de
        // novo. Banner só quando não há explicação por campo.
        if (corpo?.erros) {
          setErros(corpo.erros as ErrosContato);
          setErroGeral(corpo?.erro ?? null);
        } else {
          setErroGeral(
            corpo?.erro ?? "Não conseguimos enviar agora. Tente de novo."
          );
        }
        setEstado("parado");
        return;
      }

      setDados(campoVazio);
      setEstado("ok");
    } catch {
      setErroGeral(
        "Parece que a conexão caiu. Confira a internet e tente de novo."
      );
      setEstado("parado");
    }
  };

  const enviando = estado === "enviando";

  return (
    <dialog
      ref={dialogo}
      aria-labelledby="contato-modal-titulo"
      onCancel={(e) => {
        // Intercepta o Escape para animar a saída — sem isto o navegador fecha
        // no ato e a animação nunca aparece.
        e.preventDefault();
        fechar();
      }}
      onClick={(e) => {
        if (e.target === dialogo.current) fechar();
      }}
      className="m-auto w-[min(560px,92vw)] max-w-none bg-transparent p-0 text-limestone backdrop:bg-carbon/85"
    >
      <div
        ref={painel}
        className="max-h-[88dvh] overflow-y-auto overscroll-contain rounded-2xl border border-limestone/10 bg-carbon p-6 shadow-2xl md:p-8"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-sage">
              Vamos conversar
            </p>
            <h2
              id="contato-modal-titulo"
              className="mt-2 font-display text-2xl font-semibold leading-tight text-limestone md:text-3xl"
            >
              {estado === "ok" ? "Mensagem enviada." : "Conte sobre o projeto."}
            </h2>
          </div>
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar"
            className="-mr-1 -mt-1 shrink-0 cursor-pointer rounded-full border border-limestone/15 p-2.5 text-limestone/60 transition-colors hover:border-limestone/30 hover:text-limestone"
          >
            <IconeFechar />
          </button>
        </div>

        {estado === "ok" ? (
          <div className="mt-8 flex flex-col items-start gap-4">
            <span className="text-sage">
              <IconeConfirmado />
            </span>
            <p className="font-sans leading-relaxed text-limestone/70">
              Recebemos seu contato e responderemos em breve, no e-mail que você
              deixou.
            </p>
            <button
              type="button"
              onClick={fechar}
              className="mt-2 cursor-pointer rounded-full bg-sage px-8 py-3.5 font-sans font-medium text-carbon transition-colors hover:bg-limestone"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={enviar} noValidate className="mt-7">
            {/* Isca: gente nunca vê, bot preenche. Fora de tela em vez de
                display:none, que alguns bots detectam. */}
            <input
              ref={iscaRef}
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="contato-nome" className={classeRotulo}>
                  Nome
                </label>
                <input
                  id="contato-nome"
                  name="nome"
                  type="text"
                  autoComplete="name"
                  maxLength={LIMITES.nome}
                  placeholder="Seu nome"
                  value={dados.nome}
                  onChange={(e) => alterar("nome", e.target.value)}
                  aria-invalid={!!erros.nome}
                  aria-describedby={erros.nome ? "contato-erro-nome" : undefined}
                  className={`${classeCampo} ${borda(!!erros.nome)}`}
                />
                {erros.nome && (
                  <p
                    id="contato-erro-nome"
                    className="mt-2 font-sans text-xs text-red-300"
                  >
                    {erros.nome}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="contato-telefone" className={classeRotulo}>
                  Telefone
                </label>
                <input
                  id="contato-telefone"
                  name="telefone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={LIMITES.telefone}
                  placeholder="(00) 00000-0000"
                  value={dados.telefone}
                  onChange={(e) =>
                    alterar("telefone", mascaraTelefone(e.target.value))
                  }
                  aria-invalid={!!erros.telefone}
                  aria-describedby={
                    erros.telefone ? "contato-erro-telefone" : undefined
                  }
                  className={`${classeCampo} ${borda(!!erros.telefone)}`}
                />
                {erros.telefone && (
                  <p
                    id="contato-erro-telefone"
                    className="mt-2 font-sans text-xs text-red-300"
                  >
                    {erros.telefone}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="contato-email" className={classeRotulo}>
                E-mail
              </label>
              <input
                id="contato-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={LIMITES.email}
                placeholder="seu@email.com"
                value={dados.email}
                onChange={(e) => alterar("email", e.target.value)}
                aria-invalid={!!erros.email}
                aria-describedby={erros.email ? "contato-erro-email" : undefined}
                className={`${classeCampo} ${borda(!!erros.email)}`}
              />
              {erros.email && (
                <p
                  id="contato-erro-email"
                  className="mt-2 font-sans text-xs text-red-300"
                >
                  {erros.email}
                </p>
              )}
            </div>

            <div className="mt-5">
              <label htmlFor="contato-mensagem" className={classeRotulo}>
                Descreva sua ideia
              </label>
              <textarea
                id="contato-mensagem"
                name="mensagem"
                rows={4}
                maxLength={LIMITES.mensagem}
                placeholder="Conte o seu desafio ou projeto..."
                value={dados.mensagem}
                onChange={(e) => alterar("mensagem", e.target.value)}
                aria-invalid={!!erros.mensagem}
                aria-describedby={
                  erros.mensagem ? "contato-erro-mensagem" : undefined
                }
                className={`${classeCampo} resize-y ${borda(!!erros.mensagem)}`}
              />
              {erros.mensagem && (
                <p
                  id="contato-erro-mensagem"
                  className="mt-2 font-sans text-xs text-red-300"
                >
                  {erros.mensagem}
                </p>
              )}
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3">
              <input
                name="consentimento"
                type="checkbox"
                checked={dados.consentimento}
                onChange={(e) => alterar("consentimento", e.target.checked)}
                aria-invalid={!!erros.consentimento}
                className={`mt-0.5 h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border bg-limestone/[0.03] transition-colors checked:border-sage checked:bg-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30 ${borda(
                  !!erros.consentimento
                )}`}
              />
              <span className="font-sans text-xs leading-relaxed text-limestone/60">
                Li e concordo com a{" "}
                <a
                  href="/privacidade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sage underline"
                >
                  Política de Privacidade
                </a>{" "}
                e autorizo a Dominyum a usar meus dados para responder a este
                contato.
              </span>
            </label>
            {erros.consentimento && (
              <p className="mt-2 font-sans text-xs text-red-300">
                {erros.consentimento}
              </p>
            )}

            {erroGeral && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-red-400/40 bg-red-400/5 px-4 py-3 font-sans text-sm text-red-200"
              >
                {erroGeral}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-sage px-8 py-4 font-sans font-medium text-carbon transition-colors hover:bg-limestone disabled:cursor-wait disabled:opacity-60"
            >
              {enviando ? null : <IconeAviao />}
              {enviando ? "Enviando…" : "Enviar mensagem"}
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
