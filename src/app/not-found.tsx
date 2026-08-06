import { BotaoLink } from "@/components/jogo/botao";
import { Etiqueta } from "@/components/jogo/painel";

/**
 * 404.
 *
 * O caso mais comum aqui não é link quebrado: é jogador voltando a uma partida
 * antiga cujo link ele guardou. Por isso o texto fala em partida, e não em
 * "página não encontrada" genérico.
 */
export default function NaoEncontrado() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(193,18,31,0.14),transparent_70%)] blur-2xl"
      />

      <div className="relative flex flex-col items-center">
        <p className="font-display text-fight text-7xl leading-none font-bold sm:text-8xl">
          404
        </p>

        <h1 className="mt-4 text-2xl leading-tight sm:text-3xl">
          Esta luta não está no cartel
        </h1>

        <p className="text-aco-claro mt-3 max-w-md text-sm leading-relaxed">
          O endereço não existe, ou a partida que estava aqui não foi encontrada.
          Carreiras ficam guardadas pelo link — se você perdeu o endereço, não há
          como recuperá-la.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <BotaoLink href="/criar" apoio="Leva menos de um minuto">
            Montar um lutador
          </BotaoLink>
          <BotaoLink href="/lutadores" variante="contorno">
            Ver o acervo
          </BotaoLink>
        </div>

        <Etiqueta className="mt-12">MMA Legacy</Etiqueta>
      </div>
    </main>
  );
}
