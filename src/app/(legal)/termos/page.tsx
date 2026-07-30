import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
};

const ultimaAtualizacao = "[30/07/2026]";

export default function Termos() {
  return (
    <>
      <h1>Termos de Uso</h1>
      <p>Última atualização: {ultimaAtualizacao}</p>

      <h2>1. Aceitação dos termos</h2>
      <p>[Explique que, ao acessar o site, o usuário concorda com estes
        termos.]</p>

      <h2>2. Uso do site</h2>
      <p>[Descreva os usos permitidos e as condutas proibidas.]</p>

      <h2>3. Propriedade intelectual</h2>
      <p>[Informe que o conteúdo, a marca e os materiais do site pertencem à
        Dominyum e não podem ser usados sem autorização.]</p>

      <h2>4. Limitação de responsabilidade</h2>
      <p>[Descreva os limites de responsabilidade da Dominyum quanto ao uso do
        site.]</p>

      <h2>5. Links de terceiros</h2>
      <p>[Informe que o site pode conter links externos, pelos quais a Dominyum
        não se responsabiliza.]</p>

      <h2>6. Alterações nos termos</h2>
      <p>[Explique que os termos podem ser atualizados a qualquer momento.]</p>

      <h2>7. Legislação aplicável</h2>
      <p>[Indique a legislação aplicável e o foro eleito para dirimir
        conflitos.]</p>

      <h2>8. Contato</h2>
      <p>
        [Canal de contato — ex.:]{" "}
        <a href="mailto:contato@dominyum.com.br">contato@dominyum.com.br</a>
      </p>
    </>
  );
}