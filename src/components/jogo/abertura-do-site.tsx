"use client";

import { useEffect, useState } from "react";

import { TelaDeCarregamento } from "@/components/jogo/tela-de-carregamento";

/** Tempo mínimo em tela. Curto o bastante para não irritar, longo o bastante para ser visto. */
const DURACAO_MINIMA_MS = 1600;

/** Duração do desaparecimento, casada com a transição do CSS. */
const DURACAO_DA_SAIDA_MS = 450;

const CHAVE_DA_SESSAO = "mma-legacy:abertura-vista";

/**
 * Abertura do site.
 *
 * Existe porque `loading.tsx` não resolve este caso: ele só aparece enquanto um
 * segmento de rota está suspenso, e a home é estática — renderiza pronta, sem
 * nada para esperar. Para haver abertura na entrada, ela precisa ser controlada
 * no cliente com duração própria.
 *
 * Mostra uma vez por sessão. Splash que reaparece a cada navegação deixa de ser
 * abertura e vira obstáculo.
 */
export function AberturaDoSite() {
  const [visivel, setVisivel] = useState(true);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    // Em visita repetida na mesma sessão, some no primeiro quadro.
    if (sessionStorage.getItem(CHAVE_DA_SESSAO)) {
      setVisivel(false);
      return;
    }

    const inicioDaSaida = setTimeout(() => {
      sessionStorage.setItem(CHAVE_DA_SESSAO, "1");
      setSaindo(true);
    }, DURACAO_MINIMA_MS);

    const fim = setTimeout(
      () => setVisivel(false),
      DURACAO_MINIMA_MS + DURACAO_DA_SAIDA_MS,
    );

    return () => {
      clearTimeout(inicioDaSaida);
      clearTimeout(fim);
    };
  }, []);

  useEffect(() => {
    // Trava a rolagem enquanto a abertura cobre a tela, senão dá para rolar
    // a página por baixo dela.
    document.body.style.overflow = visivel ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [visivel]);

  if (!visivel) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 transition-opacity duration-450 ease-out"
      style={{ opacity: saindo ? 0 : 1 }}
    >
      <TelaDeCarregamento mensagem="Entrando no octógono" />
    </div>
  );
}
