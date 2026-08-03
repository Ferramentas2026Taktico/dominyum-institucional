import { createHash } from "node:crypto";
import { temErro, validaContato, type DadosContato } from "@/lib/contato";

/**
 * Recebe o formulário da modal de contato e despacha por e-mail via Resend.
 *
 * Sem o SDK `resend`: é um POST só, para o mesmo endpoint que o SDK chama por
 * dentro. Uma dependência menos para versionar.
 *
 * MODELO DE AMEAÇA (o que este arquivo tenta e o que NÃO tenta impedir)
 *
 * O `to:` é constante aqui embaixo, então isto **não é um relay aberto**: não dá
 * para usar este endpoint para spammar terceiros. O pior caso é a caixa da
 * Dominyum encher e a cota da Resend queimar — e é a cota que importa, porque
 * quando ela acaba **lead de verdade para de chegar**.
 *
 * Logo a prioridade das defesas aqui é limitar VOLUME, não identificar bot. Quem
 * de fato barra bot é um desafio (Turnstile e afins); não está aqui de propósito,
 * o gatilho para entrar está registrado no CLAUDE.md.
 */

// Domínio verificado na Resend. O `from` TEM de morar nele — qualquer outro
// domínio a API recusa.
const REMETENTE = "Site Dominyum <site@suporte.taktico.com.br>";
const DESTINO = "contato@dominyum.com.br";

const ENDPOINT_RESEND = "https://api.resend.com/emails";

// --------------------------------------------------------------------- limites

const JANELA_IP_MS = 60_000;
const MAX_POR_IP = 5;

// Teto de envios por hora, somando todo mundo. É esta linha que protege a cota da
// Resend — e portanto os leads legítimos — mesmo que a contagem por IP seja
// contornada. Generoso de propósito: 30 contatos reais em uma hora seria um
// evento extraordinário para este site. Subir aqui se um dia for.
const JANELA_GLOBAL_MS = 3_600_000;
const MAX_GLOBAL = 30;

// Mesma mensagem enviada de novo em 10min é retentativa ou bot de payload fixo.
const JANELA_DUPLICATA_MS = 600_000;

/**
 * Contadores em MEMÓRIA. A limitação é real e vale escrever: em serverless cada
 * instância tem o seu, então o teto global efetivo é `MAX_GLOBAL × instâncias`, e
 * tudo zera a cada cold start. Continua sendo um teto — só não é um teto exato.
 * Trocar por Redis/KV quando o tráfego legítimo começar a encostar nele.
 */
const porIp = new Map<string, number[]>();
const enviosGlobais: number[] = [];
const duplicatas = new Map<string, number>();

/** Remove marcas fora da janela. Devolve o que sobrou. */
function podaLista(marcas: number[], agora: number, janela: number) {
  let i = 0;
  while (i < marcas.length && agora - marcas[i]! >= janela) i++;
  if (i > 0) marcas.splice(0, i);
  return marcas;
}

function excedeuPorIp(ip: string, agora: number) {
  const marcas = podaLista(porIp.get(ip) ?? [], agora, JANELA_IP_MS);
  if (marcas.length >= MAX_POR_IP) {
    porIp.set(ip, marcas);
    return true;
  }
  marcas.push(agora);
  porIp.set(ip, marcas);

  // Poda geral: sem isso os Maps crescem sem teto num processo de vida longa.
  if (porIp.size > 5000) {
    for (const [chave, m] of porIp) {
      if (m.every((t) => agora - t >= JANELA_IP_MS)) porIp.delete(chave);
    }
  }
  if (duplicatas.size > 5000) {
    for (const [chave, t] of duplicatas) {
      if (agora - t >= JANELA_DUPLICATA_MS) duplicatas.delete(chave);
    }
  }
  return false;
}

/**
 * Reserva um slot do teto global. Chamado ANTES do fetch para a Resend, não
 * depois do sucesso: uma chamada que a Resend recusa também consumiu cota de API.
 * (De bônus, é o que permite testar o teto sem entregar e-mail nenhum — basta uma
 * chave inválida.)
 */
function reservouEnvioGlobal(agora: number) {
  podaLista(enviosGlobais, agora, JANELA_GLOBAL_MS);
  if (enviosGlobais.length >= MAX_GLOBAL) return false;
  enviosGlobais.push(agora);
  return true;
}

/**
 * IP de origem.
 *
 * ATENÇÃO: `x-forwarded-for` é enviado pelo CLIENTE. A versão anterior deste
 * arquivo lia o PRIMEIRO item dele, o que deixava qualquer um ganhar cota nova
 * mandando um valor diferente a cada requisição — furo demonstrado em teste.
 *
 * O **último** item é a escolha certa independente do host: se o proxy sobrescreve
 * o header, primeiro e último são o mesmo valor; se ele acrescenta, o último é a
 * visão do proxy, e não a do cliente.
 *
 * Se nenhum header confiável chegar, a contagem por IP perde a base — e quem
 * segura é o teto global. Conferir no deploy real quais headers chegam de fato.
 */
function ipDaRequisicao(req: Request) {
  // Postos por proxy da plataforma, não pelo cliente.
  const daPlataforma =
    req.headers.get("x-vercel-forwarded-for") ??
    req.headers.get("cf-connecting-ip");
  if (daPlataforma) return daPlataforma.trim();

  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const itens = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    if (itens.length > 0) return itens[itens.length - 1]!;
  }
  return req.headers.get("x-real-ip") ?? "desconhecido";
}

// ------------------------------------------------------------------------ POST

const texto = (v: unknown) => (typeof v === "string" ? v : "");

/**
 * Achata o nome numa linha só — ele entra no ASSUNTO do e-mail, e quebra de
 * linha em cabeçalho é a receita de injeção de header. `\s` cobre CR, LF e TAB,
 * que é justamente o que precisa cair; hífen e acento seguem intactos.
 */
const umaLinha = (v: string) => v.replace(/\s+/g, " ").trim();

/**
 * Chave de duplicata. `sha256` do `node:crypto` em vez de um hash à mão: colisão
 * aqui viria como "essa mensagem já foi enviada" para quem escreveu algo
 * diferente — erro que confunde de verdade. Builtin do Node, dependência nenhuma.
 */
const chaveDuplicata = (email: string, mensagem: string) =>
  createHash("sha256")
    .update(`${email.toLowerCase()}|${mensagem}`)
    .digest("base64url");

export async function POST(req: Request) {
  const agora = Date.now();

  if (excedeuPorIp(ipDaRequisicao(req), agora)) {
    return Response.json(
      { erro: "Muitos envios seguidos. Tente de novo em um minuto." },
      { status: 429 }
    );
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return Response.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const bruto = (corpo ?? {}) as Record<string, unknown>;

  // Honeypot: campo fora de tela que gente nunca vê e bot preenche. Devolve
  // sucesso de mentira — dizer "recusado" só ensinaria o bot a tentar de outro
  // jeito. Aqui enganar é o certo porque do outro lado não tem gente.
  if (texto(bruto.website).trim() !== "") {
    return Response.json({ ok: true });
  }

  const dados: DadosContato = {
    nome: texto(bruto.nome).trim(),
    telefone: texto(bruto.telefone).trim(),
    email: texto(bruto.email).trim(),
    mensagem: texto(bruto.mensagem).trim(),
    consentimento: bruto.consentimento === true,
  };

  // Validação (incluindo o teto de links) vem inteira do módulo compartilhado, e
  // sem `.slice()` antes: recusar por tamanho é melhor que cortar a mensagem de
  // alguém em silêncio, e é o que torna alcançáveis as mensagens "muito longo".
  //
  // Erro por campo e EXPLÍCITO, ao contrário do honeypot logo acima: ali do outro
  // lado é bot e enganar é o certo; aqui pode ser gente, e sumir com a mensagem
  // dela seria péssimo. Dizendo o motivo, o falso positivo é recuperável.
  const erros = validaContato(dados);
  if (temErro(erros)) {
    return Response.json({ erros }, { status: 400 });
  }

  const chave = process.env.RESEND_API_KEY;
  if (!chave) {
    // Falha de configuração, não do visitante — por isso o console fala com quem
    // faz o deploy e a resposta fala com quem preencheu.
    console.error(
      "[api/contato] RESEND_API_KEY ausente: o formulário não pode enviar."
    );
    return Response.json(
      {
        erro: `O envio está indisponível agora. Escreva para ${DESTINO} que responderemos na sequência.`,
      },
      { status: 500 }
    );
  }

  // Anti-duplicata. Existe pela interação com o teto global: sem isso, um bot com
  // payload fixo consumiria o teto da hora inteira sozinho.
  const impressao = chaveDuplicata(dados.email, dados.mensagem);
  const visto = duplicatas.get(impressao);
  if (visto !== undefined && agora - visto < JANELA_DUPLICATA_MS) {
    return Response.json(
      { erro: "Essa mensagem já foi enviada. Já estamos com ela." },
      { status: 429 }
    );
  }

  if (!reservouEnvioGlobal(agora)) {
    console.warn(
      `[api/contato] teto global atingido (${MAX_GLOBAL}/h). Envio recusado.`
    );
    return Response.json(
      {
        erro: `Estamos recebendo muitas mensagens agora. Escreva para ${DESTINO} que responderemos na sequência.`,
      },
      { status: 429 }
    );
  }

  duplicatas.set(impressao, agora);

  // Corpo em TEXTO PURO, nunca HTML: o conteúdo vem de estranho na internet, e
  // em HTML isso seria injeção de markup direto na caixa de entrada.
  const linhas = [
    `Nome: ${dados.nome}`,
    `E-mail: ${dados.email}`,
    `Telefone: ${dados.telefone || "(não informado)"}`,
    "",
    "Mensagem:",
    dados.mensagem,
    "",
    "—",
    "Enviado pelo formulário de contato do site da Dominyum.",
    "Responder este e-mail vai direto para quem preencheu.",
  ];

  const falhaNoEnvio = `Não conseguimos enviar sua mensagem. Tente de novo ou escreva para ${DESTINO}.`;

  try {
    const resposta = await fetch(ENDPOINT_RESEND, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${chave}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: REMETENTE,
        to: [DESTINO],
        // Responder no cliente de e-mail vai para o lead, não para o remetente.
        reply_to: dados.email,
        subject: `Novo contato do site — ${umaLinha(dados.nome)}`,
        text: linhas.join("\n"),
      }),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text().catch(() => "");
      console.error(
        `[api/contato] Resend respondeu ${resposta.status}: ${detalhe}`
      );
      // Libera a impressão: a mensagem NÃO chegou, então a pessoa tem de poder
      // tentar de novo. O slot global fica consumido de propósito — a chamada de
      // API aconteceu.
      duplicatas.delete(impressao);
      return Response.json({ erro: falhaNoEnvio }, { status: 502 });
    }
  } catch (e) {
    console.error("[api/contato] falha de rede ao chamar a Resend:", e);
    duplicatas.delete(impressao);
    return Response.json({ erro: falhaNoEnvio }, { status: 502 });
  }

  return Response.json({ ok: true });
}
