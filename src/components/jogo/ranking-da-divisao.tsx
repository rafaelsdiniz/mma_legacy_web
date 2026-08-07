"use client";

import { Etiqueta } from "@/components/jogo/painel";
import { RostoDoAtleta } from "@/components/jogo/rosto-do-atleta";
import type { LinhaDoRanking } from "@/lib/api/tipos";
import { cn } from "@/lib/utils";

/**
 * A tabela da divisão, sempre visível durante a carreira.
 *
 * É o painel que dá sentido a cada luta: você não vence "um adversário", você
 * toma a vaga do décimo segundo colocado e vê o nome dele descer uma linha. Por
 * isso fica na tela o tempo todo, e não só depois de uma vitória.
 *
 * O ranking é privado da partida — o acervo oficial nunca muda. Você aparece
 * encaixado na sua posição e todo mundo dali para baixo desce um degrau, com o
 * antigo décimo quinto caindo fora.
 */
export function RankingDaDivisao({
  linhas,
  categoria,
  posicaoAnterior,
  className,
}: {
  linhas: LinhaDoRanking[];
  categoria: string;
  posicaoAnterior: number | null;
  className?: string;
}) {
  if (linhas.length === 0) return null;

  const suaPosicao = linhas.find((linha) => linha.ehOJogador)?.posicao ?? null;

  return (
    <section
      className={cn(
        "border-grafite-borda bg-grafite-claro/70 flex flex-col border",
        className,
      )}
    >
      <header className="border-grafite-borda flex items-baseline justify-between border-b px-4 py-3">
        <Etiqueta className="text-[10px]">Ranking · {categoria}</Etiqueta>
        <span className="font-display text-fight-claro text-xs font-bold tabular-nums">
          {suaPosicao === null
            ? "Fora do ranking"
            : suaPosicao === 0
              ? "Campeão"
              : `Você é #${suaPosicao}`}
        </span>
      </header>

      <ol className="flex flex-col">
        {linhas.map((linha) => (
          <LinhaDaTabela
            key={`${linha.posicao}-${linha.nome}`}
            linha={linha}
            subiu={
              linha.ehOJogador &&
              posicaoAnterior !== null &&
              linha.posicao < posicaoAnterior
            }
          />
        ))}
      </ol>
    </section>
  );
}

function LinhaDaTabela({ linha, subiu }: { linha: LinhaDoRanking; subiu: boolean }) {
  const ehCampeao = linha.posicao === 0;

  return (
    <li
      className={cn(
        "flex items-center gap-2.5 px-3 py-1.5 text-sm",
        // A sua linha é a única com preenchimento: a tabela inteira existe para
        // você achar onde está sem procurar.
        linha.ehOJogador && "bg-fight/15 border-fight border-l-2",
        !linha.ehOJogador && "border-l-2 border-transparent",
        subiu && "animate-entrada",
      )}
    >
      <span
        className={cn(
          "font-display w-6 shrink-0 text-right text-xs font-bold tabular-nums",
          ehCampeao ? "text-legado-claro" : "text-aco",
        )}
      >
        {ehCampeao ? "C" : linha.posicao}
      </span>

      {linha.slug ? (
        <RostoDoAtleta slug={linha.slug} nome={linha.nome} tamanho={26} />
      ) : (
        <span className="recorte-octogonal bg-fight/70 flex size-[26px] shrink-0 items-center justify-center">
          <span className="font-display text-[9px] font-bold">VC</span>
        </span>
      )}

      <span
        className={cn(
          "flex-1 truncate",
          linha.ehOJogador ? "text-gelo font-semibold" : "text-aco-claro",
        )}
      >
        {linha.nome}
      </span>

      {linha.overall > 0 && (
        <span className="text-aco hidden text-xs tabular-nums sm:inline">
          {linha.overall}
        </span>
      )}
    </li>
  );
}
