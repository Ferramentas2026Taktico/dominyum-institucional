import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
};

const ultimaAtualizacao = "30/07/2026";

export default function Privacidade() {
  return (
    <>
      <h1>Política de Privacidade</h1>
      <p>Última atualização: {ultimaAtualizacao}</p>

      <h2>1. Introdução</h2>
      <p>
        Esta Política de Privacidade descreve como a Dominyum [RAZÃO SOCIAL
        COMPLETA], inscrita no CNPJ sob nº [CNPJ], trata os dados pessoais dos
        usuários deste site. Levamos a privacidade a sério e atuamos em
        conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 -
        LGPD). Ao utilizar este site, você declara estar ciente das práticas
        aqui descritas.
      </p>

      <h2>2. Dados que coletamos</h2>
      <p>Coletamos dois tipos de dados:</p>
      <ul>
        <li>
          <strong>Dados fornecidos por você:</strong> nome, e-mail, telefone,
          empresa e o conteúdo da mensagem, quando você entra em contato conosco
          por formulário ou e-mail.
        </li>
        <li>
          <strong>Dados coletados automaticamente:</strong> informações de
          navegação como endereço IP, tipo de dispositivo e navegador, páginas
          acessadas e origem do acesso, obtidas por meio de cookies e
          ferramentas de análise.
        </li>
      </ul>

      <h2>3. Como usamos os dados</h2>
      <p>Utilizamos os dados para as seguintes finalidades:</p>
      <ul>
        <li>responder solicitações e dar seguimento a contatos comerciais;</li>
        <li>
          enviar comunicações relacionadas aos nossos serviços, quando houver
          autorização;
        </li>
        <li>medir, entender e melhorar o desempenho e a experiência do site;</li>
        <li>cumprir obrigações legais e regulatórias.</li>
      </ul>
      <p>
        Conforme a finalidade, cada tratamento se apoia em uma base legal
        prevista na LGPD, como o consentimento, a execução de procedimentos
        preliminares a um contrato, o legítimo interesse ou o cumprimento de
        obrigação legal.
      </p>

      <h2>4. Cookies e rastreamento</h2>
      <p>
        Utilizamos cookies e o Google Tag Manager, que pode carregar ferramentas
        de análise e marketing (como o Google Analytics, quando ativas), para
        entender como o site é utilizado. Você pode gerenciar ou desativar
        cookies nas configurações do seu navegador; a desativação pode afetar
        algumas funcionalidades. Quando disponível, o gerenciamento de
        consentimento também pode ser feito pelo aviso de cookies do site.
      </p>

      <h2>5. Compartilhamento com terceiros</h2>
      <p>
        Não vendemos dados pessoais. Podemos compartilhá-los com prestadores de
        serviço que viabilizam a operação do site (por exemplo, hospedagem e
        ferramentas de análise), estritamente para as finalidades desta
        política, bem como quando exigido por obrigação legal ou determinação de
        autoridade competente.
      </p>

      <h2>6. Direitos do titular</h2>
      <p>Nos termos da LGPD, você pode a qualquer momento solicitar:</p>
      <ul>
        <li>confirmação da existência de tratamento e acesso aos seus dados;</li>
        <li>correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>
          anonimização, bloqueio ou eliminação de dados desnecessários ou
          tratados em desconformidade com a lei;
        </li>
        <li>portabilidade e informação sobre compartilhamento;</li>
        <li>revogação do consentimento.</li>
      </ul>
      <p>
        Para exercer esses direitos, entre em contato pelo canal indicado abaixo.
      </p>

      <h2>7. Segurança</h2>
      <p>
        Adotamos medidas técnicas e organizacionais razoáveis para proteger os
        dados pessoais contra acesso não autorizado, perda ou uso indevido.
        Nenhum método de transmissão ou armazenamento é 100% seguro, mas
        trabalhamos continuamente para preservar a integridade das informações.
      </p>

      <h2>8. Encarregado (DPO) e contato</h2>
      <p>
        Para questões relacionadas a privacidade e proteção de dados, entre em
        contato com nosso encarregado pelo e-mail{" "}
        <a href="mailto:privacidade@dominyum.com.br">
          privacidade@dominyum.com.br
        </a>
        . [Confirmar a nomeação de um encarregado e o e-mail de contato.]
      </p>

      <h2>9. Alterações nesta política</h2>
      <p>
        Esta política pode ser atualizada periodicamente. A data da última
        revisão é indicada no topo desta página, e recomendamos que você a
        consulte com regularidade.
      </p>
    </>
  );
}