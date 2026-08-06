"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Botao, BotaoLink } from "@/components/jogo/botao";
import { Etiqueta, Painel } from "@/components/jogo/painel";
import { api } from "@/lib/api/cliente";
import type { Carreira, Luta } from "@/lib/api/tipos";
import { METODOS_CURTOS, ORGANIZACOES } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

/** Intervalo entre uma luta e a seguinte na animação. */
const MS_POR_LUTA = 420;

/**
 * A simulação da carreira, revelada luta a luta.
 *
 * O resultado inteiro chega do servidor de uma vez — a animação é só de
 * apresentação. Mas é ela que transforma um JSON em uma história: o jogador vê
 * a sequência de vitórias crescer, o cinturão chegar e a idade cobrar o preço.
 * O botão de pular fica sempre visível, porque na décima partida ninguém quer
 * assistir de novo.
 */
export function TelaDeSimulacao({ partidaId }: { partidaId: string }) {
  const router = useRouter();
  const [reveladas, setReveladas] = useState(0);
  const [pulou, setPulou] = useState(false);

  const simular = useMutation({
    mutationFn: () => api.simularCarreira(partidaId),
  });

  const disparado = useRef(false);

  useEffect(() => {
    if (disparado.current) return;
    disparado.current = true;
    simular.mutate();
  }, [simular]);

  const carreira = simular.data;
  const totalDeLutas = carreira?.lutas.length ?? 0;

  useEffect(() => {
    if (!carreira || pulou) return;
    if (reveladas >= totalDeLutas) return;

    const temporizador = setTimeout(() => setReveladas((atual) => atual + 1), MS_POR_LUTA);

    return () => clearTimeout(temporizador);
  }, [carreira, reveladas, totalDeLutas, pulou]);

  if (simular.isPending) {
    return <Centro>Simulando a carreira...</Centro>;
  }

  if (simular.isError || !carreira) {
    return <Centro>Não foi possível simular a carreira desta partida.</Centro>;
  }

  const visiveis = pulou ? carreira.lutas : carreira.lutas.slice(0, reveladas);
  const terminou = pulou || reveladas >= totalDeLutas;
  const parcial = calcularParcial(visiveis);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <Etiqueta>Carreira</Etiqueta>
          <p className="font-display text-3xl leading-none font-bold tabular-nums">
            {parcial.vitorias}-{parcial.derrotas}-{parcial.empates}
          </p>
        </div>

        <div className="text-right">
          <Etiqueta>Idade</Etiqueta>
          <p className="font-display text-3xl leading-none font-bold tabular-nums">
            {parcial.idade ?? carreira.idadeDeEstreia}
          </p>
        </div>
      </header>

      <div className="bg-grafite-borda mt-4 h-1 overflow-hidden">
        <div
          className="bg-fight h-full transition-[width] duration-300"
          style={{ width: `${totalDeLutas ? (visiveis.length / totalDeLutas) * 100 : 0}%` }}
        />
      </div>

      <ol className="mt-6 flex flex-col gap-2">
        {visiveis.map((luta, indice) => (
          <LinhaDaLuta
            key={luta.ordem}
            luta={luta}
            anterior={visiveis[indice - 1]}
            animar={!pulou}
          />
        ))}
      </ol>

      <div className="mt-8 flex justify-center pb-4">
        {terminou ? (
          <BotaoLink
            href={`/partida/${partidaId}/resultado`}
            apoio="O veredito do seu legado"
          >
            Ver resultado
          </BotaoLink>
        ) : (
          <Botao variante="contorno" onClick={() => setPulou(true)}>
            Pular para o resultado
          </Botao>
        )}
      </div>
    </main>
  );
}

/**
 * Uma luta na linha do tempo.
 *
 * Marcos de carreira — subir de organização, disputar cinturão — aparecem como
 * faixa acima da luta. São eles que dão ritmo à sequência e evitam que trinta
 * linhas de cartel virem uma lista indistinguível.
 */
function LinhaDaLuta({
  luta,
  anterior,
  animar,
}: {
  luta: Luta;
  anterior?: Luta;
  animar: boolean;
}) {
  const mudouDeOrganizacao = anterior && anterior.organizacao !== luta.organizacao;
  const mudouDeCategoria = anterior && anterior.categoria !== luta.categoria;
  const venceu = luta.resultado === "Vitoria";

  return (
    <li className={cn(animar && "animate-entrada")}>
      {mudouDeCategoria && <Marco texto="Mudança de categoria" tom="legado" />}
      {mudouDeOrganizacao && !mudouDeCategoria && (
        <Marco texto={ORGANIZACOES[luta.organizacao]} tom="fight" />
      )}
      {luta.disputaDeCinturao && <Marco texto="Disputa de cinturão" tom="legado" />}

      <div
        className={cn(
          "border-grafite-borda bg-card flex items-center gap-3 border-l-2 px-3 py-2",
          venceu ? "border-l-vitoria" : "border-l-aco",
          luta.valendoCinturao && "border-l-legado",
        )}
      >
        <span className="font-display text-aco w-8 shrink-0 text-sm tabular-nums">
          {luta.idade}a
        </span>

        <span className="flex-1 truncate text-sm">{luta.adversario}</span>

        <span className="text-aco hidden text-xs tabular-nums sm:inline">
          {luta.overallDoAdversario}
        </span>

        <span
          className={cn(
            "font-display shrink-0 px-2 py-0.5 text-xs font-bold tracking-wider uppercase",
            venceu
              ? "bg-vitoria/15 text-vitoria"
              : luta.resultado === "Derrota"
                ? "bg-aco/20 text-aco-claro"
                : "bg-grafite-borda text-aco-claro",
          )}
        >
          {venceu ? "V" : luta.resultado === "Derrota" ? "D" : "E"} ·{" "}
          {METODOS_CURTOS[luta.metodo]}
          {luta.metodo !== "Decisao" && ` R${luta.roundDoEncerramento}`}
        </span>
      </div>
    </li>
  );
}

function Marco({ texto, tom }: { texto: string; tom: "fight" | "legado" }) {
  return (
    <p
      className={cn(
        "font-display my-2 text-center text-xs font-bold tracking-[0.25em] uppercase",
        tom === "legado" ? "text-legado-claro" : "text-fight-claro",
      )}
    >
      — {texto} —
    </p>
  );
}

function calcularParcial(lutas: Luta[]) {
  return {
    vitorias: lutas.filter((l) => l.resultado === "Vitoria").length,
    derrotas: lutas.filter((l) => l.resultado === "Derrota").length,
    empates: lutas.filter((l) => l.resultado === "Empate").length,
    idade: lutas.at(-1)?.idade,
  };
}

function Centro({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <p className="text-aco-claro animate-pulse text-center">{children}</p>
    </main>
  );
}

export type { Carreira };
