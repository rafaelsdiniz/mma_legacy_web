"use client";

import { useSyncExternalStore } from "react";

import { BotaoLink } from "@/components/jogo/botao";
import {
  assinarPartidasSalvas,
  lerPartidaMaisRecente,
  semPartidaSalva,
} from "@/lib/partidas-salvas";

/**
 * O atalho de volta para a última carreira deste navegador.
 *
 * Some quando não há nada guardado — e some também no servidor, onde não existe
 * `localStorage`, o que mantém o HTML da home igual dos dois lados.
 */
export function ContinuarPartida() {
  const partida = useSyncExternalStore(
    assinarPartidasSalvas,
    lerPartidaMaisRecente,
    semPartidaSalva,
  );

  if (!partida) {
    return null;
  }

  return (
    <BotaoLink
      variante="contorno"
      href={caminhoDaPartida(partida.status, partida.id)}
      apoio={partida.nomeDeCartaz}
      className="mt-4 min-w-64"
    >
      Continuar carreira
    </BotaoLink>
  );
}

/** Onde a partida parou, para o atalho cair direto na tela certa. */
function caminhoDaPartida(status: string, id: string) {
  switch (status) {
    case "DraftEmAndamento":
      return `/partida/${id}/draft`;
    case "DraftConcluido":
      return `/partida/${id}/lutador`;
    case "CarreiraSimulada":
      return `/partida/${id}/resultado`;
    default:
      return `/partida/${id}/carreira`;
  }
}
