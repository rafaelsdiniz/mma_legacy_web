import { ListaDeLutadores } from "@/components/jogo/lista-de-lutadores";
import { Etiqueta, TituloAngular } from "@/components/jogo/painel";

export const metadata = {
  title: "Lutadores · MMA Legacy",
  description: "Todos os atletas do acervo, com as notas usadas no draft.",
};

export default function PaginaDeLutadores() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <TituloAngular className="text-3xl sm:text-4xl">Acervo</TituloAngular>
      <Etiqueta className="mt-3">
        Todos os atletas que podem cair no seu draft
      </Etiqueta>

      <ListaDeLutadores />
    </main>
  );
}
