"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";

import { BarraDeAtributo } from "@/components/jogo/barra-de-atributo";
import { BotaoLink } from "@/components/jogo/botao";
import { OctogonoDeAtributos } from "@/components/jogo/octogono-de-atributos";
import { Etiqueta, Painel, TituloAngular } from "@/components/jogo/painel";
import { api } from "@/lib/api/cliente";
import { DESCRICAO_DO_ESTILO, ESTILOS } from "@/lib/rotulos";

/**
 * A revelação do lutador montado.
 *
 * É uma tela só para isto, separada do resultado da carreira de propósito:
 * "quem eu montei" e "no que isso deu" são duas emoções diferentes, e juntá-las
 * numa tela só desperdiça a primeira.
 */
export function TelaDeRevelacao({ partidaId }: { partidaId: string }) {
  const partida = useQuery({
    queryKey: ["partida", partidaId],
    queryFn: () => api.obterPartida(partidaId),
  });

  const overallFinal = partida.data?.lutador?.overall ?? 0;
  const overall = useContagemCrescente(overallFinal);

  if (partida.isPending) {
    return <Centro>Montando seu lutador...</Centro>;
  }

  if (partida.isError || !partida.data.lutador) {
    return (
      <Centro>
        O draft desta partida ainda não terminou.{" "}
        <Link href={`/partida/${partidaId}/draft`} className="text-fight-claro underline">
          Voltar ao draft
        </Link>
      </Centro>
    );
  }

  const { lutador, ficha } = partida.data;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6">
      <div className="animate-entrada text-center">
        <Etiqueta>{ficha.categoriaDePesoTexto} · {ficha.nacionalidade}</Etiqueta>
        <h1 className="font-display mt-2 text-4xl leading-none font-bold sm:text-6xl">
          {ficha.nomeDeCartaz}
        </h1>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[360px_1fr]">
        <Painel destaque>
          <div className="flex flex-col items-center gap-4 p-6">
            <div className="text-center">
              <Etiqueta>Overall</Etiqueta>
              <p className="font-display text-6xl leading-none font-bold tabular-nums sm:text-7xl">
                {overall.toFixed(1)}
              </p>
            </div>

            <OctogonoDeAtributos atributos={lutador.atributos} />

            <div className="w-full text-center">
              <Etiqueta>Estilo</Etiqueta>
              <p className="font-display text-fight-claro mt-1 text-xl font-bold uppercase">
                {ESTILOS[lutador.estilo]}
              </p>
              <p className="text-aco-claro mt-1 text-sm leading-snug">
                {DESCRICAO_DO_ESTILO[lutador.estilo]}
              </p>
            </div>
          </div>
        </Painel>

        <div className="flex flex-col gap-6">
          <Painel>
            <div className="p-5 sm:p-6">
              <TituloAngular className="-ml-4 text-xl">Atributos</TituloAngular>

              <div className="mt-5 flex flex-col gap-3">
                {lutador.atributos.map((atributo) => (
                  <BarraDeAtributo
                    key={atributo.habilidade}
                    nome={atributo.nome}
                    nota={atributo.nota}
                    destaque={atributo.nome === lutador.maiorQualidade}
                  />
                ))}
              </div>
            </div>
          </Painel>

          <div className="grid gap-4 sm:grid-cols-2">
            <Painel>
              <div className="p-5">
                <Etiqueta>Maior qualidade</Etiqueta>
                <p className="font-display text-legado-claro mt-1 text-2xl font-bold">
                  {lutador.maiorQualidade}
                </p>
              </div>
            </Painel>

            <Painel>
              <div className="p-5">
                <Etiqueta>Principal fraqueza</Etiqueta>
                <p className="font-display text-fight-claro mt-1 text-2xl font-bold">
                  {lutador.principalFraqueza}
                </p>
              </div>
            </Painel>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <BotaoLink
          href={`/partida/${partidaId}/carreira`}
          apoio="Da estreia à aposentadoria"
        >
          Simular carreira
        </BotaoLink>
      </div>
    </main>
  );
}

/**
 * Faz o overall subir de 0 até o valor real.
 *
 * É a diferença entre um número que aparece e um número que é revelado — e o
 * overall é a nota que resume trinta segundos de decisão do jogador.
 */
function useContagemCrescente(alvo: number, duracaoMs = 900) {
  const [valor, setValor] = useState(0);

  useEffect(() => {
    if (alvo <= 0) return;

    const inicio = performance.now();
    let quadro = 0;

    const passo = (agora: number) => {
      const progresso = Math.min((agora - inicio) / duracaoMs, 1);
      // Desacelera no fim, para o número "assentar" em vez de travar.
      setValor(alvo * (1 - Math.pow(1 - progresso, 3)));

      if (progresso < 1) {
        quadro = requestAnimationFrame(passo);
      }
    };

    quadro = requestAnimationFrame(passo);

    return () => cancelAnimationFrame(quadro);
  }, [alvo, duracaoMs]);

  return valor;
}

function Centro({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <p className="text-aco-claro text-center">{children}</p>
    </main>
  );
}
