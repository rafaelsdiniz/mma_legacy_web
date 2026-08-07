"use client";

import { useEffect, useState } from "react";

import { Etiqueta } from "@/components/jogo/painel";
import { cn } from "@/lib/utils";

/** Quanto tempo o aviso fica na tela antes de sair sozinho. */
const MS_NA_TELA = 3200;

/**
 * O popup que celebra o movimento no ranking.
 *
 * Aparece sozinho quando a posição muda e sai sozinho depois de alguns
 * segundos — é comemoração, não decisão, então não pede clique nem bloqueia a
 * tela. Quem quiser conferir com calma tem a tabela do lado o tempo todo.
 *
 * Serve para os dois lados: subir de #9 para #6 e cair do cinturão contam a
 * mesma história com sinais opostos, e um jogo que só comemora vitória perde
 * metade da narrativa.
 */
export function AvisoDeSubida({
  posicaoAtual,
  posicaoAnterior,
  chaveDoMomento,
}: {
  posicaoAtual: number | null;
  posicaoAnterior: number | null;
  /** Muda a cada jogada, para o aviso reaparecer mesmo indo à mesma posição. */
  chaveDoMomento: string | number;
}) {
  const [visivel, setVisivel] = useState(false);

  const entrou = posicaoAnterior === null && posicaoAtual !== null;
  const subiu = posicaoAnterior !== null && posicaoAtual !== null && posicaoAtual < posicaoAnterior;
  const caiu = posicaoAnterior !== null && posicaoAtual !== null && posicaoAtual > posicaoAnterior;
  const houveMovimento = entrou || subiu || caiu;

  useEffect(() => {
    if (!houveMovimento) return;

    setVisivel(true);
    const temporizador = setTimeout(() => setVisivel(false), MS_NA_TELA);

    return () => clearTimeout(temporizador);
  }, [houveMovimento, chaveDoMomento]);

  if (!houveMovimento || !visivel) return null;

  const virouCampeao = posicaoAtual === 0;
  const bom = entrou || subiu;

  return (
    <div
      // Não recebe clique: é aviso passageiro, e roubar o cursor de quem já
      // está decidindo a próxima luta seria hostil.
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <div
        className={cn(
          "animate-entrada recorte-angular flex items-center gap-4 border px-5 py-3 shadow-2xl backdrop-blur-sm",
          virouCampeao
            ? "border-legado bg-legado/20"
            : bom
              ? "border-fight bg-fight/20"
              : "border-aco bg-grafite-claro/90",
        )}
      >
        <span
          className={cn(
            "font-display text-3xl leading-none font-bold",
            bom ? "text-fight-claro" : "text-aco-claro",
          )}
        >
          {bom ? "▲" : "▼"}
        </span>

        <div>
          <Etiqueta className="text-[10px]">
            {virouCampeao
              ? "Cinturão conquistado"
              : entrou
                ? "Você entrou no ranking"
                : bom
                  ? "Subiu no ranking"
                  : "Caiu no ranking"}
          </Etiqueta>

          <p className="font-display mt-0.5 text-lg leading-none font-bold tabular-nums">
            {posicaoAnterior === null ? (
              <>
                <span className="text-aco">sem posição</span>
                <span className="text-aco mx-2">→</span>
                <span>#{posicaoAtual}</span>
              </>
            ) : (
              <>
                <span className="text-aco">#{posicaoAnterior}</span>
                <span className="text-aco mx-2">→</span>
                <span>{virouCampeao ? "CAMPEÃO" : `#${posicaoAtual}`}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
