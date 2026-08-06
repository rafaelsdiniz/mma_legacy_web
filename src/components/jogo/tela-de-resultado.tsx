"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";

import { BotaoLink } from "@/components/jogo/botao";
import { OctogonoDeAtributos } from "@/components/jogo/octogono-de-atributos";
import { Etiqueta, Painel, TituloAngular } from "@/components/jogo/painel";
import { api } from "@/lib/api/cliente";
import type { Carreira, Luta } from "@/lib/api/tipos";
import { ALTURA_DO_LEGADO, ESTILOS, LEGADOS, METODOS_CURTOS } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

/** A partir deste degrau da escada o jogador foi campeão e ganha o cinturão. */
const DEGRAU_DE_CAMPEAO = ALTURA_DO_LEGADO.CampeaoMundial;

export function TelaDeResultado({ partidaId }: { partidaId: string }) {
  const [cartelAberto, setCartelAberto] = useState(false);

  const resultado = useQuery({
    queryKey: ["resultado", partidaId],
    queryFn: () => api.obterResultado(partidaId),
  });

  if (resultado.isPending) {
    return <Centro>Fechando a carreira...</Centro>;
  }

  if (resultado.isError) {
    return <Centro>Esta partida ainda não chegou ao fim.</Centro>;
  }

  const { ficha, lutador, carreira } = resultado.data;
  const ehCampeao = ALTURA_DO_LEGADO[carreira.legado] >= DEGRAU_DE_CAMPEAO;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6">
      {/* O veredito vem primeiro: é a resposta da pergunta que o jogador fez. */}
      <section className="animate-entrada text-center">
        <Etiqueta>Veredito final</Etiqueta>
        <h1
          className={cn(
            "font-display mt-2 text-4xl leading-none font-bold sm:text-6xl",
            ehCampeao ? "text-legado-claro" : "text-gelo",
          )}
        >
          {LEGADOS[carreira.legado]}
        </h1>
        <p className="text-aco-claro mt-3 text-sm">
          {ficha.nomeDeCartaz} encerrou a carreira aos {carreira.idadeDeAposentadoria} anos
        </p>
      </section>

      {ehCampeao && <Cinturao legado={LEGADOS[carreira.legado]} />}

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Painel destaque className="sm:col-span-1">
          <div className="p-5 text-center">
            <Etiqueta>Cartel</Etiqueta>
            <p className="font-display mt-1 text-4xl leading-none font-bold tabular-nums">
              {carreira.cartel}
            </p>
          </div>
        </Painel>

        <Painel>
          <div className="p-5 text-center">
            <Etiqueta>Overall máximo</Etiqueta>
            <p className="font-display mt-1 text-4xl leading-none font-bold tabular-nums">
              {carreira.overallMaximo}
            </p>
          </div>
        </Painel>

        <Painel>
          <div className="p-5 text-center">
            <Etiqueta>Maior sequência</Etiqueta>
            <p className="font-display mt-1 text-4xl leading-none font-bold tabular-nums">
              {carreira.maiorSequenciaDeVitorias}
            </p>
          </div>
        </Painel>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <Painel>
            <div className="p-5 sm:p-6">
              <TituloAngular className="-ml-4 text-xl">Como venceu</TituloAngular>

              <div className="mt-5 grid grid-cols-3 gap-4 text-center">
                <MetodoDeVitoria rotulo="Interrupção" valor={carreira.vitoriasPorNocaute} />
                <MetodoDeVitoria
                  rotulo="Finalização"
                  valor={carreira.vitoriasPorFinalizacao}
                />
                <MetodoDeVitoria rotulo="Decisão" valor={carreira.vitoriasPorDecisao} />
              </div>
            </div>
          </Painel>

          <Painel>
            <div className="p-5 sm:p-6">
              <TituloAngular className="-ml-4 text-xl">Conquistas</TituloAngular>

              <ul className="mt-5 flex flex-col gap-2">
                {carreira.conquistas.map((conquista) => (
                  <li
                    key={conquista.descricao}
                    className={cn(
                      "flex items-center gap-3 text-sm",
                      !conquista.alcancada && "text-aco",
                    )}
                  >
                    <span
                      className={cn(
                        "font-display w-4 text-lg leading-none font-bold",
                        conquista.alcancada ? "text-vitoria" : "text-aco",
                      )}
                      aria-hidden
                    >
                      {conquista.alcancada ? "✓" : "✗"}
                    </span>
                    <span>{conquista.descricao}</span>
                    <span className="sr-only">
                      {conquista.alcancada ? "conquistado" : "não conquistado"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Painel>
        </div>

        <Painel>
          <div className="flex flex-col items-center p-5">
            <Etiqueta>O lutador que você montou</Etiqueta>
            <p className="font-display text-fight-claro mt-1 text-lg font-bold uppercase">
              {ESTILOS[lutador.estilo]}
            </p>
            <OctogonoDeAtributos atributos={lutador.atributos} className="mt-2" />
          </div>
        </Painel>
      </section>

      <section className="mt-6">
        <button
          type="button"
          onClick={() => setCartelAberto((aberto) => !aberto)}
          className="border-grafite-borda hover:border-fight font-display w-full border px-4 py-3 text-sm tracking-widest uppercase transition-colors"
        >
          {cartelAberto ? "Esconder" : "Ver"} o cartel completo ·{" "}
          {carreira.totalDeLutas} lutas
        </button>

        {cartelAberto && <CartelCompleto carreira={carreira} />}
      </section>

      <div className="mt-10 flex flex-col items-center gap-3 pb-6">
        <BotaoLink href="/criar" apoio={`Semente desta partida: ${resultado.data.seed}`}>
          Montar outro lutador
        </BotaoLink>
      </div>
    </main>
  );
}

/**
 * O cinturão de campeão.
 *
 * Espera o arquivo em `public/marca/cinturao.png`. É a recompensa visual da
 * carreira — o motivo de o jogador querer chegar ao topo — e por isso só
 * aparece para quem de fato conquistou um título.
 */
function Cinturao({ legado }: { legado: string }) {
  return (
    <div className="animate-entrada relative mt-8 flex justify-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(185,138,42,0.28),transparent_65%)] blur-xl"
      />
      <Image
        src="/marca/cinturao.png"
        alt={`Cinturão de campeão — ${legado}`}
        width={640}
        height={420}
        className="relative h-auto w-full max-w-xl"
        priority
      />
    </div>
  );
}

function MetodoDeVitoria({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div>
      <p className="font-display text-3xl leading-none font-bold tabular-nums">{valor}</p>
      <Etiqueta className="mt-1">{rotulo}</Etiqueta>
    </div>
  );
}

function CartelCompleto({ carreira }: { carreira: Carreira }) {
  return (
    <div className="border-grafite-borda mt-2 max-h-[420px] overflow-y-auto border">
      <table className="w-full text-left text-sm">
        <thead className="bg-grafite-claro sticky top-0">
          <tr className="font-display text-aco-claro text-xs tracking-widest uppercase">
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Idade</th>
            <th className="px-3 py-2">Adversário</th>
            <th className="px-3 py-2 text-right">Overall</th>
            <th className="px-3 py-2 text-right">Resultado</th>
          </tr>
        </thead>
        <tbody>
          {carreira.lutas.map((luta) => (
            <LinhaDoCartel key={luta.ordem} luta={luta} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LinhaDoCartel({ luta }: { luta: Luta }) {
  const venceu = luta.resultado === "Vitoria";

  return (
    <tr className="border-grafite-borda border-t">
      <td className="text-aco px-3 py-2 tabular-nums">{luta.ordem}</td>
      <td className="text-aco px-3 py-2 tabular-nums">{luta.idade}</td>
      <td className="px-3 py-2">
        {luta.adversario}
        {luta.valendoCinturao && (
          <span className="text-legado ml-2 text-[10px] tracking-wider uppercase">
            cinturão
          </span>
        )}
      </td>
      <td className="text-aco px-3 py-2 text-right tabular-nums">
        {luta.overallDoAdversario}
      </td>
      <td
        className={cn(
          "font-display px-3 py-2 text-right text-xs font-bold tracking-wider uppercase",
          venceu ? "text-vitoria" : "text-aco-claro",
        )}
      >
        {venceu ? "V" : luta.resultado === "Derrota" ? "D" : "E"} ·{" "}
        {METODOS_CURTOS[luta.metodo]}
      </td>
    </tr>
  );
}

function Centro({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <p className="text-aco-claro text-center">{children}</p>
    </main>
  );
}
