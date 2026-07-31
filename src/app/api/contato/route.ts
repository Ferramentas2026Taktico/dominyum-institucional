import {
  LIMITES,
  temErro,
  validaContato,
  type DadosContato,
} from "@/lib/contato";

/**
 * Recebe o formulário da modal de contato e despacha por e-mail via Resend.
 *
 * Sem o SDK `resend`: é um POST só, para o mesmo endpoint que o SDK chama por
 * dentro. Uma dependência menos para versionar.
 */

// Domínio verificado na Resend. O `from` TEM de morar nele — qualquer outro
// domínio a API recusa.
const REMETENTE = "Site Dominyum <site@suporte.taktico.com.br>";
const DESTINO = "contato@dominyum.com.br";

const ENDPOINT_RESEND = "https://api.resend.com/emails";

// ---------------------------------------------------------------- limite por IP
// Em memória: reinicia a cada cold start e não vale entre instâncias. É um
// obstáculo para bot bobo e para dedo nervoso, não uma defesa de verdade.
const JANELA_MS = 60_000;
const MAX_POR_JANELA = 5;
const historico = new Map<string, number[]>();

function excedeuLimite(ip: string, agora: number) {
  const recentes = (historico.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
  if (recentes.length >= MAX_POR_JANELA) {
    historico.set(ip, recentes);
    return true;
  }
  recentes.push(agora);
  historico.set(ip, recentes);

  // Poda: sem isso o Map cresce sem teto num processo de vida longa.
  if (historico.size > 5000) {
    for (const [chave, marcas] of historico) {
      if (marcas.every((t) => agora - t >= JANELA_MS)) historico.delete(chave);
    }
  }
  return false;
}

function ipDaRequisicao(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
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

export async function POST(req: Request) {
  const agora = Date.now();

  if (excedeuLimite(ipDaRequisicao(req), agora)) {
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
  // jeito.
  if (texto(bruto.website).trim() !== "") {
    return Response.json({ ok: true });
  }

  const dados: DadosContato = {
    nome: texto(bruto.nome).slice(0, LIMITES.nome).trim(),
    telefone: texto(bruto.telefone).slice(0, LIMITES.telefone).trim(),
    email: texto(bruto.email).slice(0, LIMITES.email).trim(),
    mensagem: texto(bruto.mensagem).slice(0, LIMITES.mensagem).trim(),
    consentimento: bruto.consentimento === true,
  };

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
        erro: `O envio está indisponível agora. Escreva para ${DESTINO} que respondemos na sequência.`,
      },
      { status: 500 }
    );
  }

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
      return Response.json({ erro: falhaNoEnvio }, { status: 502 });
    }
  } catch (e) {
    console.error("[api/contato] falha de rede ao chamar a Resend:", e);
    return Response.json({ erro: falhaNoEnvio }, { status: 502 });
  }

  return Response.json({ ok: true });
}
