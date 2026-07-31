# Conteúdo

Ordem das seções na home:

Hero → Serviços → Sistema → Chamada → Método → Resultados → Sobre → Contato

Cada seção é um componente em `src/components/sections/`, composto em
`src/app/page.tsx`.

## Fonte da copy

- **Posicionamento e serviços:** PDF de identidade visual da Dominyum.
- **Missão, visão, valores, filosofia:** PDF "Cultura Organizacional Dominyum"
  (oficial).

## Resumo por seção

- **Hero:** statement da marca ("Um motor de crescimento") + CTA.
- **Sistema:** "Sistema de Domínio" — 4 pilares (Dados, Funil, Crescimento,
  Resultado).
- **Serviços:** 4 frentes — Aquisição, Conversão, Inteligência, Crescimento
  (com sub-itens/tags).
- **Chamada:** interrupção com a marca + CTA, sobre um bloco que abre em tela
  cheia ao rolar.
- **Método:** engine em 3 etapas — Dados → Decisão → Receita.
- **Resultados:** estatísticas com contadores animados.
- **Sobre:** filosofia + missão + visão + 5 valores + marquee do DNA.
- **Contato:** CTA final + formulário na modal.
  - Eyebrow: "Vamos conversar"
  - Título: "Escale com **previsibilidade**."
  - Subtítulo: "Conte onde você quer chegar. A gente devolve o desenho da
    estrutura que sustenta o caminho."
  - Botão: "Fale com a gente →" (abre a modal). Abaixo, "ou escreva para
    contato@dominyum.com.br" — o `mailto:` é a saída para quem está sem JS.
  - **Modal:** "Conte sobre o projeto." / campos Nome, Telefone (opcional),
    E-mail, "Descreva sua ideia" / aceite de LGPD / "Enviar mensagem".
  - **Aceite (LGPD):** "Li e concordo com a [Política de Privacidade] e autorizo a
    Dominyum a usar meus dados para responder a este contato."
  - **Sucesso:** "Mensagem enviada." / "Recebemos seu contato e respondemos em
    breve, no e-mail que você deixou." — de propósito **sem prometer prazo**.

## Valores oficiais (seção Sobre)

1. Sonhe Grande
2. O Cliente no Centro
3. Espírito Empreendedor
4. Humildade para Evoluir
5. Dados Acima de Opiniões

**Filosofia:** "Marketing não é propaganda. É a engenharia do crescimento
empresarial."

## Placeholders a substituir (ATENÇÃO)

- **Resultados:** o 52% é real (vem do branding); ROAS 3.2x, CAC -41% e 2.5x de
  leads são **inventados** — trocar pelos números reais (editar o array `stats`
  em `Resultados.tsx`).
- **Contato:** o formulário envia de verdade (`POST /api/contato` → Resend), mas
  depende de duas coisas fora do código: a `RESEND_API_KEY` no ambiente e a caixa
  `contato@dominyum.com.br` existir. Sem a caixa, a Resend aceita o envio e o
  lead se perde em silêncio.
- **Legais:** o texto entre `[...]` em `/privacidade` e `/termos` é scaffold —
  preencher com apoio jurídico (LGPD). O aceite do formulário já linka para
  `/privacidade`.
