"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { MarcaTexto } from "@/components/jogo/marca";
import { Etiqueta, Painel } from "@/components/jogo/painel";
import { api, ErroDaApi } from "@/lib/api/cliente";
import type { EscolhaFeita, Habilidade, NotaDeHabilidade } from "@/lib/api/tipos";
import { HABILIDADES } from "@/lib/api/tipos";
import { cn } from "@/lib/utils";

/**
 * A tela de draft.
 *
 * É onde o jogo vive. Três coisas foram desenhadas de propósito para produzir
 * arrependimento, que é o que faz o jogador apertar "jogar de novo":
 *
 * 1. ao escolher uma habilidade, as outras sete do atleta morrem na tela;
 * 2. uma habilidade já preenchida aparece com a nota do atleta atual do lado da
 *    que você tem — é a faca girando quando o Khabib chega e o wrestling já foi;
 * 3. o painel lateral mostra o que já foi montado, mas nunca quem vem depois.
 */
export function TelaDeDraft({ partidaId }: { partidaId: string }) {
  const router = useRouter();
  const clienteDeConsulta = useQueryClient();
  const [descartando, setDescartando] = useState<Habilidade | null>(null);

  const rodada = useQuery({
    queryKey: ["rodada", partidaId],
    queryFn: () => api.obterRodadaAtual(partidaId),
    retry: false,
  });

  const escolher = useMutation({
    mutationFn: (habilidade: Habilidade) =>
      api.escolherHabilidade(partidaId, rodada.data!.atleta.id, habilidade),
    onMutate: (habilidade) => setDescartando(habilidade),
    onSuccess: async (partida) => {
      if (partida.status !== "DraftEmAndamento") {
        router.push(`/partida/${partidaId}/lutador`);
        return;
      }

      // Segura o quadro por um instante para a animação de descarte terminar
      // antes de o próximo atleta entrar. Sem isso a troca é instantânea e a
      // batida emocional da rodada se perde.
      await new Promise((resolva) => setTimeout(resolva, 420));
      await clienteDeConsulta.invalidateQueries({ queryKey: ["rodada", partidaId] });
      setDescartando(null);
    },
    onError: () => setDescartando(null),
  });

  if (rodada.isPending) {
    return <Aviso>Carregando o draft...</Aviso>;
  }

  if (rodada.isError) {
    const erro = rodada.error;

    // Recarregar a página depois do draft pronto cai aqui: o servidor responde
    // 409 porque não há mais rodada em aberto.
    if (erro instanceof ErroDaApi && erro.ehJogadaInvalida) {
      router.replace(`/partida/${partidaId}/lutador`);
      return <Aviso>Draft concluído. Levando você ao seu lutador...</Aviso>;
    }

    return (
      <Aviso>
        {erro instanceof ErroDaApi
          ? erro.message
          : "Não foi possível falar com o servidor."}
      </Aviso>
    );
  }

  const { atleta, ordem, totalDeRodadas, habilidadesDisponiveis, escolhasFeitas } =
    rodada.data;

  const disponiveis = new Set(habilidadesDisponiveis);
  const jaEscolhidas = new Map(
    escolhasFeitas.map((escolha) => [escolha.habilidade, escolha]),
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between gap-4">
        <MarcaTexto className="text-lg" />
        <ProgressoDoDraft ordem={ordem} total={totalDeRodadas} />
      </header>

      <div className="mt-6 grid flex-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Painel destaque className="animate-entrada">
          <div className="flex flex-col gap-5 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Etiqueta>Rodada {ordem} de {totalDeRodadas}</Etiqueta>
                <h1 className="mt-1 text-3xl leading-none sm:text-4xl">{atleta.nome}</h1>
                <p className="text-aco-claro mt-1 text-sm">{atleta.pais}</p>
              </div>
              <div className="bg-grafite-borda recorte-octogonal hidden size-20 shrink-0 sm:block" />
            </div>

            <p className="text-aco-claro text-sm">
              Escolha <span className="text-gelo font-semibold">uma</span> habilidade.
              As outras sete vão embora com ele.
            </p>

            <ul className="flex flex-col gap-2">
              {HABILIDADES.map((habilidade) => {
                const nota = atleta.notas.find((n) => n.habilidade === habilidade)!;
                const ocupadaPor = jaEscolhidas.get(habilidade);

                return (
                  <li key={habilidade}>
                    <OpcaoDeHabilidade
                      nota={nota}
                      disponivel={disponiveis.has(habilidade)}
                      ocupadaPor={ocupadaPor}
                      descartada={descartando !== null && descartando !== habilidade}
                      escolhida={descartando === habilidade}
                      carregando={escolher.isPending}
                      aoEscolher={() => escolher.mutate(habilidade)}
                    />
                  </li>
                );
              })}
            </ul>

            {escolher.isError && (
              <p className="border-fight bg-fight/10 text-fight-claro border-l-2 px-4 py-2.5 text-sm">
                {escolher.error instanceof ErroDaApi
                  ? escolher.error.message
                  : "Não foi possível registrar a escolha."}
              </p>
            )}
          </div>
        </Painel>

        <SeuLutador escolhas={escolhasFeitas} total={totalDeRodadas} />
      </div>
    </main>
  );
}

/**
 * Uma linha de habilidade do atleta da vez.
 *
 * O caso mais importante é o `ocupadaPor`: a habilidade já foi preenchida, e em
 * vez de simplesmente esconder a nota, mostramos a do atleta atual ao lado da
 * que o jogador tem. Ver "99 — você tem 76" é o que faz doer.
 */
function OpcaoDeHabilidade({
  nota,
  disponivel,
  ocupadaPor,
  descartada,
  escolhida,
  carregando,
  aoEscolher,
}: {
  nota: NotaDeHabilidade;
  disponivel: boolean;
  ocupadaPor?: EscolhaFeita;
  descartada: boolean;
  escolhida: boolean;
  carregando: boolean;
  aoEscolher: () => void;
}) {
  if (!disponivel && ocupadaPor) {
    const perdeu = nota.nota > ocupadaPor.nota;

    return (
      <div className="border-grafite-borda flex items-center gap-3 border border-dashed px-3 py-2.5 opacity-70">
        <span className="font-display text-aco-claro w-28 shrink-0 text-sm tracking-wide uppercase">
          {nota.nome}
        </span>
        <span
          className={cn(
            "font-display text-lg leading-none font-bold tabular-nums",
            perdeu ? "text-fight-claro" : "text-aco",
          )}
        >
          {nota.nota}
        </span>
        <span className="text-aco-claro ml-auto text-right text-xs">
          você tem <span className="text-gelo font-semibold">{ocupadaPor.nota}</span>
          <br />
          <span className="text-aco">de {ocupadaPor.atletaNome}</span>
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={carregando}
      onClick={aoEscolher}
      className={cn(
        "group border-grafite-borda hover:border-fight flex w-full items-center gap-3 border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed",
        descartada && "animate-descarte",
        escolhida && "border-legado bg-legado/10",
      )}
    >
      <span className="font-display w-28 shrink-0 text-sm tracking-wide uppercase">
        {nota.nome}
      </span>

      <span className="bg-grafite-borda h-2 flex-1 overflow-hidden">
        <span
          className={cn(
            "block h-full transition-colors",
            escolhida ? "bg-legado" : "bg-fight group-hover:bg-fight-claro",
          )}
          style={{ width: `${nota.nota}%` }}
        />
      </span>

      <span
        className={cn(
          "font-display w-9 shrink-0 text-right text-xl leading-none font-bold tabular-nums",
          escolhida && "text-legado-claro",
        )}
      >
        {nota.nota}
      </span>
    </button>
  );
}

/** O painel lateral com o lutador sendo montado. */
function SeuLutador({
  escolhas,
  total,
}: {
  escolhas: EscolhaFeita[];
  total: number;
}) {
  const porHabilidade = new Map(escolhas.map((e) => [e.habilidade, e]));
  const somaParcial = escolhas.reduce((soma, e) => soma + e.nota, 0);
  const mediaParcial = escolhas.length ? Math.round(somaParcial / escolhas.length) : 0;

  return (
    <Painel className="h-fit">
      <div className="p-5">
        <div className="flex items-baseline justify-between">
          <Etiqueta>Seu lutador</Etiqueta>
          <span className="font-display text-aco-claro text-sm tabular-nums">
            {escolhas.length}/{total}
          </span>
        </div>

        <ul className="mt-4 flex flex-col gap-1.5">
          {HABILIDADES.map((habilidade) => {
            const escolha = porHabilidade.get(habilidade);

            return (
              <li
                key={habilidade}
                className={cn(
                  "flex items-center gap-2 border-l-2 py-1 pl-3 text-sm",
                  escolha ? "border-fight" : "border-grafite-borda",
                )}
              >
                <span
                  className={cn(
                    "font-display flex-1 tracking-wide uppercase",
                    escolha ? "text-gelo" : "text-aco",
                  )}
                >
                  {escolha?.habilidadeNome ?? rotuloVazio(habilidade)}
                </span>

                {escolha ? (
                  <>
                    <span className="text-aco max-w-[92px] truncate text-[11px]">
                      {escolha.atletaNome}
                    </span>
                    <span className="font-display w-8 text-right text-base font-bold tabular-nums">
                      {escolha.nota}
                    </span>
                  </>
                ) : (
                  <span className="text-aco font-display w-8 text-right text-base">—</span>
                )}
              </li>
            );
          })}
        </ul>

        {escolhas.length > 0 && (
          <div className="border-grafite-borda mt-4 border-t pt-4">
            <Etiqueta>Média parcial</Etiqueta>
            <p className="font-display text-3xl leading-none font-bold tabular-nums">
              {mediaParcial}
            </p>
            <p className="text-aco mt-1 text-[11px] leading-snug">
              O overall final é ponderado por habilidade — striking e wrestling
              pesam mais.
            </p>
          </div>
        )}
      </div>
    </Painel>
  );
}

function ProgressoDoDraft({ ordem, total }: { ordem: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Rodada ${ordem} de ${total}`}>
      {Array.from({ length: total }, (_, indice) => {
        const numero = indice + 1;

        return (
          <span
            key={numero}
            className={cn(
              "recorte-octogonal size-3 transition-colors",
              numero < ordem && "bg-fight",
              numero === ordem && "bg-legado animate-pulso-fight",
              numero > ordem && "bg-grafite-borda",
            )}
          />
        );
      })}
    </div>
  );
}

/** Nome de exibição das habilidades ainda vazias, sem depender do servidor. */
function rotuloVazio(habilidade: Habilidade) {
  const nomes: Record<Habilidade, string> = {
    Striking: "Striking",
    Potencia: "Potência",
    Velocidade: "Velocidade",
    Wrestling: "Wrestling",
    JiuJitsu: "Jiu-jítsu",
    Cardio: "Cardio",
    Resistencia: "Resistência",
    InteligenciaDeLuta: "Fight IQ",
  };

  return nomes[habilidade];
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <p className="text-aco-claro text-center">{children}</p>
    </main>
  );
}
