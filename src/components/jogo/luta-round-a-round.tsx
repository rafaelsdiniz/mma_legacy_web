"use client";

import { useEffect, useState } from "react";

import { Botao } from "@/components/jogo/botao";
import { Etiqueta, Painel } from "@/components/jogo/painel";
import type { DesfechoDaUltimaLuta, RoundDaLuta } from "@/lib/api/tipos";
import { METODOS, METODOS_CURTOS } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

/** Quanto tempo cada round fica sozinho na tela antes do seguinte. */
const INTERVALO_ENTRE_ROUNDS = 900;

/**
 * A luta que acabou de acontecer, revelada round a round.
 *
 * O motor já produzia todo esse detalhe — quem levou cada round, quem buscou
 * queda, quanto dano acumulou — e a tela despejava tudo de uma vez junto com o
 * resultado. Era a parte mais importante do jogo resolvida em um piscar.
 *
 * Aqui os rounds aparecem um a um e o placar final só entra quando o último
 * cai. Nenhum dado novo: a mesma resposta da API, entregue no ritmo em que ela
 * vira uma luta em vez de uma tabela.
 *
 * O componente é remontado a cada luta pela `key` de quem o usa, e é isso que
 * zera a contagem — nada de reiniciar estado dentro de efeito.
 */
export function LutaRoundARound({ desfecho }: { desfecho: DesfechoDaUltimaLuta }) {
  const total = desfecho.rounds.length;
  const [revelados, setRevelados] = useState(0);
  const terminou = revelados >= total;

  useEffect(() => {
    if (revelados >= total) {
      return;
    }

    const relogio = setTimeout(
      () => setRevelados((quantos) => quantos + 1),
      INTERVALO_ENTRE_ROUNDS,
    );

    return () => clearTimeout(relogio);
  }, [revelados, total]);

  const venceu = desfecho.luta.resultado === "Vitoria";

  return (
    <Painel destaque={desfecho.luta.valendoCinturao} className="animate-entrada shrink-0">
      <div className="p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Etiqueta>Última luta</Etiqueta>
            <h2 className="text-xl leading-none">vs. {desfecho.luta.adversario}</h2>
          </div>

          {terminou ? (
            <span
              className={cn(
                "font-display animate-entrada px-3 py-1 text-sm font-bold uppercase",
                venceu ? "bg-vitoria/15 text-vitoria" : "bg-fight/15 text-fight-claro",
              )}
            >
              {venceu ? "Vitória" : desfecho.luta.resultado} ·{" "}
              {METODOS_CURTOS[desfecho.luta.metodo]}{" "}
              {desfecho.luta.metodo !== "Decisao" && `R${desfecho.luta.roundDoEncerramento}`}
            </span>
          ) : (
            <span className="font-display text-aco-claro animate-pulse px-3 py-1 text-sm font-bold uppercase">
              Round {Math.min(revelados + 1, total)} de {total}
            </span>
          )}
        </div>

        <ol className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
          {desfecho.rounds.slice(0, revelados).map((round) => (
            <Round key={round.numero} round={round} />
          ))}
        </ol>

        {!terminou && (
          <Botao
            variante="fantasma"
            className="mt-3 w-full px-4 py-1.5"
            onClick={() => setRevelados(total)}
          >
            <span className="text-sm">Ver o resultado</span>
          </Botao>
        )}
      </div>
    </Painel>
  );
}

function Round({ round }: { round: RoundDaLuta }) {
  const venceu = round.vencedor === "Lutador";
  const detalhes = [
    round.lutadorControlou && "você controlou",
    round.adversarioControlou && "rival controlou",
    round.lutadorBuscouQueda && "buscou queda",
    round.adversarioBuscouQueda && "defendeu quedas",
  ].filter(Boolean);

  return (
    <li
      className={cn(
        "animate-entrada border p-2",
        venceu
          ? "border-vitoria/50"
          : round.vencedor === "Empate"
            ? "border-grafite-borda"
            : "border-fight/50",
      )}
    >
      <div className="flex justify-between">
        <Etiqueta>Round {round.numero}</Etiqueta>
        <span
          className={cn("font-display font-bold", venceu ? "text-vitoria" : "text-fight-claro")}
        >
          {venceu ? "10–9" : round.vencedor === "Empate" ? "10–10" : "9–10"}
        </span>
      </div>
      <p className="text-aco mt-1.5 min-h-7 text-[9px] leading-snug">
        {detalhes.join(" · ") || "trocação equilibrada"}
      </p>
      <p className="mt-1.5 text-[9px]">
        Dano: <span className="text-fight-claro">{round.danoDoLutador}</span> /{" "}
        {round.danoDoAdversario}
      </p>
      {round.encerramento && (
        <p className="text-legado-claro mt-1 text-[9px] font-bold uppercase">
          {METODOS[round.encerramento]}
        </p>
      )}
    </li>
  );
}
