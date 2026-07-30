import Hero from "@/components/sections/Hero";
import Sistema from "@/components/sections/Sistema";
import Servicos from "@/components/sections/Servicos";
import Metodo from "@/components/sections/Metodo";
import Chamada from "@/components/sections/Chamada";
import Resultados from "@/components/sections/Resultados";
import Sobre from "@/components/sections/Sobre";
import Contato from "@/components/sections/Contato";

export default function Home() {
  return (
    <main>
      <Hero />
      <Servicos />
      <Sistema />
      <Chamada />
      <Metodo />
      <Resultados />
      <Sobre />
      <Contato />
    </main>
  );
}