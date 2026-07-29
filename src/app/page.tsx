import Hero from "@/components/sections/Hero";
import Sistema from "@/components/sections/Sistema";
import Servicos from "@/components/sections/Servicos";
import Metodo from "@/components/sections/Metodo";
import Resultados from "@/components/sections/Resultados";

export default function Home() {
  return (
    <main>
      <Hero />
      <Sistema />
      <Servicos />
      <Metodo />
      <Resultados />
    </main>
  );
}