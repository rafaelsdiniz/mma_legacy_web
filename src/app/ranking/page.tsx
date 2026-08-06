import { Etiqueta, TituloAngular } from "@/components/jogo/painel";
import { TabelasDoRanking } from "@/components/jogo/tabelas-do-ranking";

export const metadata = {
  title: "Ranking · MMA Legacy",
  description: "O ranking das oito divisões e a escada que sua carreira vai subir.",
};

export default function PaginaDeRanking() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <TituloAngular className="text-3xl sm:text-4xl">Ranking</TituloAngular>
      <Etiqueta className="mt-3">
        As oito divisões · é por esta escada que sua carreira sobe
      </Etiqueta>

      <TabelasDoRanking />
    </main>
  );
}
