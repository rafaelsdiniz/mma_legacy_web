"use client";

import { useEffect } from "react";

import { Botao, BotaoLink } from "@/components/jogo/botao";
import { Etiqueta } from "@/components/jogo/painel";

/**
 * Erro inesperado em qualquer rota.
 *
 * Precisa ser client component: o Next monta uma error boundary do React em
 * volta do segmento, e boundary só existe no cliente.
 *
 * A causa mais provável em produção não é bug de tela — é a API dormindo ou
 * fora do ar. Por isso o botão principal é tentar de novo, não voltar ao
 * início: uma segunda tentativa costuma resolver depois que a instância acorda.
 */
export default function Erro({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // O digest é o que liga esta tela à entrada correspondente no log do
    // servidor. Sem ele, um relato de "deu erro" é impossível de rastrear.
    console.error("Falha não tratada:", error.digest ?? error.message);
  }, [error]);

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(193,18,31,0.14),transparent_70%)] blur-2xl"
      />

      <div className="relative flex flex-col items-center">
        <p className="font-display text-fight text-7xl leading-none font-bold sm:text-8xl">
          500
        </p>

        <h1 className="mt-4 text-2xl leading-tight sm:text-3xl">
          A luta foi interrompida
        </h1>

        <p className="text-aco-claro mt-3 max-w-md text-sm leading-relaxed">
          Alguma coisa quebrou do nosso lado. Se você acabou de abrir o site, o
          servidor pode estar acordando — tentar de novo costuma resolver.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Botao onClick={reset} apoio="Recarrega só esta parte">
            Tentar de novo
          </Botao>
          <BotaoLink href="/" variante="contorno">
            Voltar ao início
          </BotaoLink>
        </div>

        {error.digest && (
          <Etiqueta className="mt-12 text-[10px]">
            Código do erro: {error.digest}
          </Etiqueta>
        )}
      </div>
    </main>
  );
}
