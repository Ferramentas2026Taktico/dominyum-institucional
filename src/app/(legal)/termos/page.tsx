import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
};

const ultimaAtualizacao = "30/07/2026";

export default function Termos() {
  return (
    <>
      <h1>Termos de Uso</h1>
      <p>Última atualização: {ultimaAtualizacao}</p>

      <h2>1. Aceitação dos termos</h2>
      <p>
        Ao acessar e utilizar este site, você concorda com estes Termos de Uso.
        Caso não concorde com qualquer disposição, recomendamos que não utilize o
        site.
      </p>

      <h2>2. Uso do site</h2>
      <p>
        Você pode navegar e utilizar este site para fins legítimos e pessoais. É
        vedado utilizá-lo para qualquer finalidade ilícita, tentar comprometer
        sua segurança ou disponibilidade, ou reproduzir seu conteúdo sem
        autorização prévia.
      </p>

      <h2>3. Propriedade intelectual</h2>
      <p>
        A marca Dominyum, o logotipo, os textos, o layout, o código e os demais
        materiais deste site pertencem à Dominyum e são protegidos pela
        legislação de propriedade intelectual. Nenhum conteúdo pode ser
        utilizado, copiado ou distribuído sem autorização prévia e por escrito.
      </p>

      <h2>4. Limitação de responsabilidade</h2>
      <p>
        O site é fornecido no estado em que se encontra. A Dominyum não garante
        que ele estará sempre disponível, ininterrupto ou livre de erros, e não
        se responsabiliza por danos decorrentes do seu uso. O conteúdo tem
        caráter informativo e não constitui garantia de resultado.
      </p>

      <h2>5. Links de terceiros</h2>
      <p>
        Este site pode conter links para páginas de terceiros. A Dominyum não se
        responsabiliza pelo conteúdo, pelas práticas de privacidade ou pelos
        serviços oferecidos por esses sites externos.
      </p>

      <h2>6. Alterações nos termos</h2>
      <p>
        Estes Termos de Uso podem ser atualizados a qualquer momento. O uso
        continuado do site após eventuais alterações representa a concordância
        com os termos revisados.
      </p>

      <h2>7. Legislação aplicável</h2>
      <p>
        Estes termos são regidos pelas leis da República Federativa do Brasil.
        Fica eleito o foro da comarca de Toledo-PR para dirimir quaisquer
        controvérsias, com renúncia a qualquer outro, por mais privilegiado que
        seja.
      </p>

      <h2>8. Contato</h2>
      <p>
        Em caso de dúvidas sobre estes termos, entre em contato pelo e-mail{" "}
        <a href="mailto:contato@dominyum.com.br">contato@dominyum.com.br</a>.
      </p>
    </>
  );
}