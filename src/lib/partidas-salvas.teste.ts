import { describe, expect, it } from "vitest";

import {
  esquecerPartida,
  listarPartidasSalvas,
  lerPartidaMaisRecente,
  salvarPartida,
} from "./partidas-salvas";

describe("partidas salvas", () => {
  it("guarda a partida e devolve a mais recente primeiro", () => {
    salvarPartida({ id: "a", nomeDeCartaz: "PRIMEIRO", status: "DraftEmAndamento" });
    salvarPartida({ id: "b", nomeDeCartaz: "SEGUNDO", status: "CarreiraEmAndamento" });

    expect(lerPartidaMaisRecente()?.id).toBe("b");
    expect(listarPartidasSalvas()).toHaveLength(2);
  });

  it("atualiza a partida existente em vez de duplicar", () => {
    salvarPartida({ id: "a", nomeDeCartaz: "ANTES", status: "DraftEmAndamento" });
    salvarPartida({ id: "a", nomeDeCartaz: "DEPOIS", status: "CarreiraEmAndamento" });

    expect(listarPartidasSalvas()).toHaveLength(1);
    expect(lerPartidaMaisRecente()?.nomeDeCartaz).toBe("DEPOIS");
  });

  it("guarda no maximo cinco partidas", () => {
    for (const numero of [1, 2, 3, 4, 5, 6, 7]) {
      salvarPartida({
        id: String(numero),
        nomeDeCartaz: `LUTADOR ${numero}`,
        status: "DraftEmAndamento",
      });
    }

    expect(listarPartidasSalvas()).toHaveLength(5);
    expect(lerPartidaMaisRecente()?.id).toBe("7");
  });

  it("esquece a partida pedida", () => {
    salvarPartida({ id: "a", nomeDeCartaz: "FICA", status: "DraftEmAndamento" });
    salvarPartida({ id: "b", nomeDeCartaz: "SAI", status: "DraftEmAndamento" });

    esquecerPartida("b");

    expect(listarPartidasSalvas().map((salva) => salva.id)).toEqual(["a"]);
  });

  it("sobrevive a lixo gravado por uma versao anterior", () => {
    window.localStorage.setItem("mma-legacy:partidas", "isto nao e json");

    expect(listarPartidasSalvas()).toEqual([]);
    expect(lerPartidaMaisRecente()).toBeNull();
  });

  it("descarta registro sem os campos que a tela usa", () => {
    window.localStorage.setItem("mma-legacy:partidas", JSON.stringify([{ id: 7 }, null]));

    expect(listarPartidasSalvas()).toEqual([]);
  });
});
