"use client";

import { Etiqueta, Painel, TituloAngular } from "@/components/jogo/painel";
import type {
  Habilidade,
  IntensidadeDoTreino,
  NotaDeHabilidade,
} from "@/lib/api/tipos";
import { INTENSIDADES } from "@/lib/api/tipos";
import {
  DESCRICAO_DA_INTENSIDADE,
  INTENSIDADES_DE_TREINO,
  corDaNota,
} from "@/lib/rotulos";
import { cn } from "@/lib/utils";

/**
 * O camp que antecede a luta: em que treinar e com que peso.
 *
 * Fica acima das ofertas porque vale para qualquer uma delas — a escolha é uma
 * só por rodada. O preço de treinar pesado aparece no card de cada oferta: o
 * risco de lesão de todas elas sobe assim que a intensidade muda, que é onde a
 * escolha dói.
 */
export function EscolhaDoCamp({
  atributos,
  foco,
  intensidade,
  desabilitado,
  aoEscolherFoco,
  aoEscolherIntensidade,
}: {
  atributos: NotaDeHabilidade[];
  foco: Habilidade | null;
  intensidade: IntensidadeDoTreino;
  desabilitado: boolean;
  aoEscolherFoco: (habilidade: Habilidade | null) => void;
  aoEscolherIntensidade: (intensidade: IntensidadeDoTreino) => void;
}) {
  return (
    <Painel>
      <div className="p-5">
        <TituloAngular className="-ml-4 text-lg">Campo de treino</TituloAngular>

        <Etiqueta className="mt-4">Foco</Etiqueta>
        <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-2">
          {atributos.map((atributo) => (
            <Escolha
              key={atributo.habilidade}
              ativa={foco === atributo.habilidade}
              desabilitado={desabilitado}
              aoClicar={() =>
                aoEscolherFoco(foco === atributo.habilidade ? null : atributo.habilidade)
              }
            >
              <span className="truncate">{atributo.nome}</span>
              <span className={cn("tabular-nums", corDaNota(atributo.nota))}>
                {atributo.nota}
              </span>
            </Escolha>
          ))}
        </div>
        <p className="text-aco mt-2 text-[11px] leading-snug">
          {foco
            ? "Toque de novo para treinar sem foco nenhum."
            : "Sem foco escolhido, o camp acontece mas não puxa nada."}
        </p>

        <Etiqueta className="mt-5">Intensidade</Etiqueta>
        <div className="mt-2 flex flex-col gap-1.5">
          {INTENSIDADES.map((qual) => (
            <Escolha
              key={qual}
              ativa={intensidade === qual}
              desabilitado={desabilitado}
              aoClicar={() => aoEscolherIntensidade(qual)}
            >
              <span>{INTENSIDADES_DE_TREINO[qual]}</span>
            </Escolha>
          ))}
        </div>
        <p className="text-aco mt-2 text-[11px] leading-snug">
          {DESCRICAO_DA_INTENSIDADE[intensidade]}
        </p>
      </div>
    </Painel>
  );
}

function Escolha({
  children,
  ativa,
  desabilitado,
  aoClicar,
}: {
  children: React.ReactNode;
  ativa: boolean;
  desabilitado: boolean;
  aoClicar: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativa}
      disabled={desabilitado}
      onClick={aoClicar}
      className={cn(
        "flex items-center justify-between gap-2 border px-2.5 py-1.5 text-left text-xs transition-colors disabled:pointer-events-none disabled:opacity-45",
        ativa
          ? "border-fight bg-fight/10 text-gelo"
          : "border-grafite-borda bg-grafite-claro/60 text-aco-claro hover:border-aco",
      )}
    >
      {children}
    </button>
  );
}
