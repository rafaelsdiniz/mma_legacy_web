import { FormularioDeLutador } from "@/components/jogo/formulario-de-lutador";
import { MarcaTexto } from "@/components/jogo/marca";
import { Etiqueta, TituloAngular } from "@/components/jogo/painel";

export default function PaginaCriarLutador() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
      <MarcaTexto className="text-xl" />

      <TituloAngular className="mt-8 self-start text-3xl sm:text-4xl">
        Ficha de inscrição
      </TituloAngular>

      <Etiqueta className="mt-3">
        Quem é o lutador que você vai montar
      </Etiqueta>

      <FormularioDeLutador />
    </main>
  );
}
