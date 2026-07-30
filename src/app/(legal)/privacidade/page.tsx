import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
};

const ultimaAtualizacao = "[30/07/2026]";

export default function Privacidade() {
  return (
    <>
      <h1>Política de Privacidade</h1>
      <p>Última atualização: {ultimaAtualizacao}</p>

      <h2>1. Introdução</h2>
      <p>
        [Descreva quem é a Dominyum e o compromisso com a privacidade e a
        proteção de dados dos usuários, em conformidade com a LGPD (Lei nº
        13.709/2018).]
      </p>

      <h2>2. Dados que coletamos</h2>
      <p>[Liste os dados coletados — ex.: nome, e-mail e telefone informados
        em formulários; dados de navegação coletados por cookies e ferramentas
        de análise.]</p>

      <h2>3. Como usamos os dados</h2>
      <p>[Explique as finalidades — ex.: responder contatos, enviar
        comunicações, medir e melhorar o desempenho do site — e a base legal de
        cada tratamento.]</p>

      <h2>4. Cookies e rastreamento</h2>
      <p>[Descreva o uso de cookies e ferramentas de análise/marketing (ex.:
        Google Tag Manager, Google Analytics) e como o usuário pode gerenciar o
        consentimento.]</p>

      <h2>5. Compartilhamento com terceiros</h2>
      <p>[Informe com quais categorias de terceiros os dados podem ser
        compartilhados e com qual finalidade.]</p>

      <h2>6. Direitos do titular</h2>
      <p>[Liste os direitos garantidos pela LGPD — acesso, correção, exclusão,
        portabilidade, revogação de consentimento — e como exercê-los.]</p>

      <h2>7. Segurança</h2>
      <p>[Descreva as medidas de segurança adotadas para proteger os dados.]</p>

      <h2>8. Encarregado (DPO) e contato</h2>
      <p>
        [Informe o canal de contato para questões de privacidade — ex.:]{" "}
        <a href="mailto:privacidade@dominyum.com.br">
          privacidade@dominyum.com.br
        </a>
      </p>

      <h2>9. Alterações nesta política</h2>
      <p>[Explique que a política pode ser atualizada e como o usuário será
        informado.]</p>
    </>
  );
}