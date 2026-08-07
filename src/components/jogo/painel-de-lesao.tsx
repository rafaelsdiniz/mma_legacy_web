"use client";

import { Botao } from "@/components/jogo/botao";
import { Etiqueta, Painel, TituloAngular } from "@/components/jogo/painel";
import type { Lesao } from "@/lib/api/tipos";
import { GRAVIDADES_DE_LESAO, TIPOS_DE_LESAO } from "@/lib/rotulos";

/**
 * A tela de quem está machucado.
 *
 * Toma o lugar das ofertas, e não divide espaço com elas: enquanto a lesão
 * dura, não existe luta para escolher. É o preço de ter aceitado a luta dura,
 * e ele precisa parecer um preço — uma mesa vazia com um botão só.
 */
export function PainelDeLesao({
  lesao,
  carregando,
  tratar,
}: {
  lesao: Lesao;
  carregando: boolean;
  tratar: () => void;
}) {
  const tratados = lesao.afastamento - lesao.compromissosRestantes;

  return (
    <Painel destaque>
      <div className="p-6">
        <TituloAngular className="-ml-4 text-lg">Departamento médico</TituloAngular>

        <p className="font-display mt-4 text-3xl leading-none font-bold uppercase">
          {TIPOS_DE_LESAO[lesao.tipo]}
        </p>
        <p className="text-fight-claro mt-2 text-sm">
          Gravidade {GRAVIDADES_DE_LESAO[lesao.gravidade].toLowerCase()} · aos{" "}
          {lesao.idadeQuandoOcorreu} anos
        </p>

        {lesao.pontosPerdidos > 0 && (
          <p className="border-fight bg-fight/10 text-fight-claro mt-4 border-l-2 px-4 py-3 text-sm">
            A sequela já foi cobrada: <strong>−{lesao.pontosPerdidos}</strong> de
            atributo, e esse ponto não volta.
          </p>
        )}

        <div className="mt-5">
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-aco-claro">Recuperação</span>
            <span className="tabular-nums">
              {tratados}/{lesao.afastamento}
            </span>
          </div>
          <div className="bg-grafite-borda h-1.5 overflow-hidden">
            <span
              className="bg-fight block h-full transition-[width] duration-500"
              style={{ width: `${(tratados / lesao.afastamento) * 100}%` }}
            />
          </div>
        </div>

        <Botao className="mt-6 w-full" disabled={carregando} onClick={tratar}>
          Tratar a lesão
        </Botao>
        <Etiqueta className="mt-3 text-center normal-case tracking-normal">
          Cada tratamento gasta um compromisso do ano — mas não conta como recusa.
        </Etiqueta>
      </div>
    </Painel>
  );
}
