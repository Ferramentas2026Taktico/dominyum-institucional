/**
 * Regras do formulário de contato — compartilhadas entre o cliente e o servidor.
 *
 * O mesmo `validaContato` roda nos dois lados de propósito: no cliente para dar
 * retorno imediato, no servidor como autoridade (o cliente é contornável). Manter
 * as regras num arquivo só é o que impede as duas validações de divergirem com o
 * tempo — que é o jeito clássico de um formulário passar a aceitar no servidor o
 * que recusa na tela, ou o contrário.
 */

export type DadosContato = {
  nome: string;
  telefone: string;
  email: string;
  mensagem: string;
  consentimento: boolean;
};

export type ErrosContato = Partial<Record<keyof DadosContato, string>>;

/** Tetos de tamanho. O servidor corta o excesso antes de montar o e-mail. */
export const LIMITES = {
  nome: 80,
  telefone: 20,
  email: 160,
  mensagem: 2000,
} as const;

export const campoVazio: DadosContato = {
  nome: "",
  telefone: "",
  email: "",
  mensagem: "",
  consentimento: false,
};

/**
 * E-mail: proposital não tentar validar RFC 5322 com regex — isso é um poço sem
 * fundo e recusa endereços legítimos. Só a forma mínima (algo@algo.tld); quem
 * decide se o endereço existe é o e-mail chegar.
 */
const RE_EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/** Telefone brasileiro: 10 dígitos (fixo) ou 11 (celular). */
const digitos = (v: string) => v.replace(/\D/g, "");

/**
 * Teto de links na mensagem. Link é o sinal mais forte de spam de formulário, e 2
 * é folga: um lead legítimo cola o site dele (1) e no máximo um segundo.
 *
 * Mora aqui, e não só no servidor, porque **é regra de validação** — e regra de
 * validação neste projeto vive num lugar só. Com ela aqui, quem colou três links
 * vê o aviso no próprio campo antes de qualquer requisição; o servidor continua
 * sendo a autoridade. O contrário (só no servidor) fazia o formulário mostrar o
 * erro certo no campo E um banner genérico de "tente de novo" ao mesmo tempo.
 *
 * Conta só link explícito. Domínio cru no meio da frase — "somos a
 * dominyum.com.br" — de propósito NÃO conta: contaria em texto normal.
 */
export const MAX_LINKS = 2;
const contaLinks = (v: string) => (v.match(/https?:\/\/|www\./gi) ?? []).length;

export function validaContato(d: DadosContato): ErrosContato {
  const erros: ErrosContato = {};

  const nome = d.nome.trim();
  if (nome.length < 2) erros.nome = "Diga como podemos te chamar.";
  else if (nome.length > LIMITES.nome) erros.nome = "Nome muito longo.";

  const email = d.email.trim();
  if (!email) erros.email = "Precisamos de um e-mail para responder.";
  else if (email.length > LIMITES.email) erros.email = "E-mail muito longo.";
  else if (!RE_EMAIL.test(email)) erros.email = "Confira o e-mail.";

  // Telefone é opcional — só valida o que foi preenchido.
  const tel = digitos(d.telefone);
  if (tel.length > 0 && (tel.length < 10 || tel.length > 11)) {
    erros.telefone = "Telefone com DDD, 10 ou 11 dígitos.";
  }

  const mensagem = d.mensagem.trim();
  if (mensagem.length < 10) erros.mensagem = "Conte um pouco mais do projeto.";
  else if (mensagem.length > LIMITES.mensagem)
    erros.mensagem = "Mensagem muito longa.";
  else if (contaLinks(mensagem) > MAX_LINKS)
    erros.mensagem = `Muitos links na mensagem — deixe no máximo ${MAX_LINKS}.`;

  if (!d.consentimento) erros.consentimento = "Precisamos do seu aceite.";

  return erros;
}

export const temErro = (e: ErrosContato) => Object.keys(e).length > 0;

/**
 * Máscara progressiva: `(00) 0000-0000` até 10 dígitos, `(00) 00000-0000` no
 * celular. Aplicada a cada tecla, então tem de funcionar em número incompleto —
 * daí montar por fatias em vez de casar um formato fechado.
 */
export function mascaraTelefone(valor: string): string {
  let cru = digitos(valor);
  // Quem cola do WhatsApp cola com +55. Sem isto o código do país viraria o DDD
  // e "+55 (11) 98765-4321" saía como "(55) 11987-6543". Número doméstico nunca
  // passa de 11 dígitos, então o excedente começando em 55 só pode ser o país.
  if (cru.length > 11 && cru.startsWith("55")) cru = cru.slice(2);
  const d = cru.slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  const corte = d.length <= 10 ? 6 : 7; // onde entra o hífen
  if (d.length <= corte) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, corte)}-${d.slice(corte)}`;
}
