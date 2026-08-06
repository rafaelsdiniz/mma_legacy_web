"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { BarraDeAtributo } from "@/components/jogo/barra-de-atributo";
import { Etiqueta, Painel } from "@/components/jogo/painel";
import { api } from "@/lib/api/cliente";
import type { Habilidade, LutadorDoAcervo } from "@/lib/api/tipos";
import { HABILIDADES } from "@/lib/api/tipos";
import { ESTILOS } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

type Ordenacao = "overall" | "nome" | Habilidade;

const ABREVIACOES: Record<Habilidade, string> = {
  Striking: "STR",
  Potencia: "POT",
  Velocidade: "VEL",
  Wrestling: "WRE",
  JiuJitsu: "JIU",
  Cardio: "CAR",
  Resistencia: "RES",
  InteligenciaDeLuta: "IQ",
};

/**
 * O acervo completo, com busca e ordenação.
 *
 * Não é só vitrine: é onde o jogador estuda antes de draftar. Ordenar por uma
 * habilidade responde "quem tem o melhor wrestling do jogo?", que é exatamente
 * a pergunta que ele faz quando perde esse slot cedo e quer saber o que deixou
 * passar.
 */
export function ListaDeLutadores() {
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("overall");
  const [expandido, setExpandido] = useState<string | null>(null);

  const acervo = useQuery({
    queryKey: ["acervo"],
    queryFn: () => api.listarLutadores(),
    // O acervo só muda quando o jogo é rebalanceado.
    staleTime: 60 * 60 * 1000,
  });

  const lutadores = useMemo(() => {
    if (!acervo.data) return [];

    const termo = busca.trim().toLowerCase();
    const filtrados = termo
      ? acervo.data.filter(
          (lutador) =>
            lutador.nome.toLowerCase().includes(termo) ||
            lutador.pais.toLowerCase().includes(termo),
        )
      : acervo.data;

    return [...filtrados].sort((a, b) => {
      if (ordenacao === "nome") return a.nome.localeCompare(b.nome, "pt-BR");
      if (ordenacao === "overall") return b.overall - a.overall;

      return notaDe(b, ordenacao) - notaDe(a, ordenacao);
    });
  }, [acervo.data, busca, ordenacao]);

  if (acervo.isPending) {
    return <p className="text-aco-claro mt-10 animate-pulse">Carregando o acervo...</p>;
  }

  if (acervo.isError) {
    return (
      <p className="border-fight bg-fight/10 text-fight-claro mt-10 border-l-2 px-4 py-3 text-sm">
        Não foi possível carregar o acervo.
      </p>
    );
  }

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
          placeholder="Buscar por nome ou país"
          className="recorte-angular-suave border-grafite-borda bg-grafite-claro focus:border-fight flex-1 border px-4 py-2.5 outline-none"
        />

        <select
          value={ordenacao}
          onChange={(evento) => setOrdenacao(evento.target.value as Ordenacao)}
          className="recorte-angular-suave border-grafite-borda bg-grafite-claro focus:border-fight border px-4 py-2.5 outline-none"
          aria-label="Ordenar por"
        >
          <option value="overall">Maior overall</option>
          <option value="nome">Nome</option>
          {HABILIDADES.map((habilidade) => (
            <option key={habilidade} value={habilidade}>
              Melhor {ABREVIACOES[habilidade]}
            </option>
          ))}
        </select>
      </div>

      <p className="text-aco mt-3 text-xs">
        {lutadores.length} de {acervo.data.length} atletas
      </p>

      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {lutadores.map((lutador) => (
          <li key={lutador.id}>
            <CardDeLutador
              lutador={lutador}
              destaque={ordenacao !== "nome" && ordenacao !== "overall" ? ordenacao : undefined}
              aberto={expandido === lutador.id}
              aoAlternar={() =>
                setExpandido((atual) => (atual === lutador.id ? null : lutador.id))
              }
            />
          </li>
        ))}
      </ul>
    </>
  );
}

function CardDeLutador({
  lutador,
  destaque,
  aberto,
  aoAlternar,
}: {
  lutador: LutadorDoAcervo;
  destaque?: Habilidade;
  aberto: boolean;
  aoAlternar: () => void;
}) {
  return (
    <Painel destaque={aberto}>
      <button
        type="button"
        onClick={aoAlternar}
        aria-expanded={aberto}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start gap-3">
          <div className="bg-grafite-borda recorte-octogonal size-14 shrink-0" />

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg leading-tight">{lutador.nome}</h3>
            <p className="text-aco text-xs">{lutador.pais}</p>
            <p className="text-fight-claro font-display mt-1 text-xs tracking-wider uppercase">
              {ESTILOS[lutador.estilo]}
            </p>
          </div>

          <div className="text-right">
            <Etiqueta className="text-[10px]">Overall</Etiqueta>
            <p className="font-display text-3xl leading-none font-bold tabular-nums">
              {lutador.overall}
            </p>
          </div>
        </div>

        {/* Resumo fechado: as oito notas em linha, no formato do card do padrão visual. */}
        {!aberto && (
          <div className="border-grafite-borda mt-3 grid grid-cols-8 gap-1 border-t pt-3">
            {lutador.notas.map((nota) => (
              <div key={nota.habilidade} className="text-center">
                <p
                  className={cn(
                    "font-display text-[9px] tracking-wider",
                    destaque === nota.habilidade ? "text-legado-claro" : "text-aco",
                  )}
                >
                  {ABREVIACOES[nota.habilidade]}
                </p>
                <p
                  className={cn(
                    "font-display text-sm font-bold tabular-nums",
                    destaque === nota.habilidade && "text-legado-claro",
                  )}
                >
                  {nota.nota}
                </p>
              </div>
            ))}
          </div>
        )}
      </button>

      {aberto && (
        <div className="border-grafite-borda mx-4 mb-4 flex flex-col gap-2 border-t pt-4">
          {lutador.notas.map((nota) => (
            <BarraDeAtributo
              key={nota.habilidade}
              nome={nota.nome}
              nota={nota.nota}
              destaque={nota.nome === lutador.maiorQualidade}
            />
          ))}

          <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
            <div>
              <Etiqueta className="text-[10px]">Maior qualidade</Etiqueta>
              <p className="text-legado-claro font-semibold">{lutador.maiorQualidade}</p>
            </div>
            <div>
              <Etiqueta className="text-[10px]">Principal fraqueza</Etiqueta>
              <p className="text-fight-claro font-semibold">{lutador.principalFraqueza}</p>
            </div>
          </div>
        </div>
      )}
    </Painel>
  );
}

function notaDe(lutador: LutadorDoAcervo, habilidade: Habilidade) {
  return lutador.notas.find((nota) => nota.habilidade === habilidade)?.nota ?? 0;
}
