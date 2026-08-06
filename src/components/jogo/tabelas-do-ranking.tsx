"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Etiqueta, Painel } from "@/components/jogo/painel";
import { RostoDoAtleta } from "@/components/jogo/rosto-do-atleta";
import { api } from "@/lib/api/cliente";
import type { DivisaoDoRanking, LutadorDoAcervo } from "@/lib/api/tipos";
import { ESTILOS } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

/**
 * O ranking das oito divisões.
 *
 * A divisão fica selecionável em vez de tudo empilhado: são 128 linhas no
 * total, e uma lista única exigiria rolagem infinita para achar a categoria em
 * que o jogador está competindo.
 *
 * O campeão aparece destacado acima da tabela, e não como "posição zero". Na
 * hierarquia do esporte ele não é o primeiro colocado — é outra coisa, e é isso
 * que faz a disputa de cinturão ter peso.
 */
export function TabelasDoRanking() {
  const [categoriaAberta, setCategoriaAberta] = useState<string | null>(null);

  const ranking = useQuery({
    queryKey: ["ranking"],
    queryFn: () => api.obterRanking(),
    // Só muda quando o acervo é reeditado.
    staleTime: 60 * 60 * 1000,
  });

  if (ranking.isPending) {
    return <p className="text-aco-claro mt-10 animate-pulse">Carregando o ranking...</p>;
  }

  if (ranking.isError || ranking.data.length === 0) {
    return (
      <p className="border-fight bg-fight/10 text-fight-claro mt-10 border-l-2 px-4 py-3 text-sm">
        Não foi possível carregar o ranking.
      </p>
    );
  }

  const selecionada = categoriaAberta ?? ranking.data[0].categoria;
  const divisao = ranking.data.find((item) => item.categoria === selecionada)!;

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        {ranking.data.map((item) => (
          <button
            key={item.categoria}
            type="button"
            onClick={() => setCategoriaAberta(item.categoria)}
            className={cn(
              "recorte-angular-suave font-display border px-4 py-2 text-xs tracking-widest uppercase transition-colors",
              item.categoria === selecionada
                ? "border-fight bg-fight/15 text-fight-claro"
                : "border-grafite-borda text-aco-claro hover:border-aco hover:text-gelo",
            )}
          >
            {item.categoriaTexto}
          </button>
        ))}
      </div>

      <Divisao divisao={divisao} />
    </>
  );
}

function Divisao({ divisao }: { divisao: DivisaoDoRanking }) {
  return (
    <div className="mt-6 flex flex-col gap-4">
      {divisao.campeao && <Campeao atleta={divisao.campeao} />}

      <Painel>
        <ol className="flex flex-col">
          {divisao.ranqueados.map((atleta) => (
            <li key={atleta.id}>
              <LinhaDoRanking atleta={atleta} />
            </li>
          ))}
        </ol>
      </Painel>
    </div>
  );
}

function Campeao({ atleta }: { atleta: LutadorDoAcervo }) {
  return (
    <Painel destaque>
      <div className="flex items-center gap-4 p-5">
        <RostoDoAtleta slug={atleta.slug} nome={atleta.nome} tamanho={72} />

        <div className="min-w-0 flex-1">
          <Etiqueta className="text-legado-claro">Campeão</Etiqueta>
          <p className="font-display truncate text-2xl leading-tight font-bold">
            {atleta.nome}
          </p>
          <p className="text-aco text-xs">
            {atleta.pais} · {ESTILOS[atleta.estilo]}
          </p>
        </div>

        <div className="text-right">
          <Etiqueta className="text-[10px]">Overall</Etiqueta>
          <p className="font-display text-legado-claro text-4xl leading-none font-bold tabular-nums">
            {atleta.overall}
          </p>
        </div>
      </div>
    </Painel>
  );
}

function LinhaDoRanking({ atleta }: { atleta: LutadorDoAcervo }) {
  return (
    <div className="border-grafite-borda flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0">
      <span className="font-display text-aco w-7 shrink-0 text-lg font-bold tabular-nums">
        {atleta.posicaoNoRanking}
      </span>

      <RostoDoAtleta slug={atleta.slug} nome={atleta.nome} tamanho={40} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm leading-tight">{atleta.nome}</p>
        <p className="text-aco truncate text-[11px]">{atleta.pais}</p>
      </div>

      <span className="text-aco hidden text-[11px] sm:inline">
        {ESTILOS[atleta.estilo]}
      </span>

      <span className="font-display w-10 shrink-0 text-right text-lg font-bold tabular-nums">
        {atleta.overall}
      </span>
    </div>
  );
}
