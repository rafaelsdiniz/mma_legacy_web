"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import { AvisoDeSubida } from "@/components/jogo/aviso-de-subida";
import { Botao, BotaoLink } from "@/components/jogo/botao";
import { EscolhaDoCamp } from "@/components/jogo/escolha-do-camp";
import { LutaRoundARound } from "@/components/jogo/luta-round-a-round";
import { Etiqueta, Painel, TituloAngular } from "@/components/jogo/painel";
import { PainelDeLesao } from "@/components/jogo/painel-de-lesao";
import { RankingDaDivisao } from "@/components/jogo/ranking-da-divisao";
import { RostoDoAtleta } from "@/components/jogo/rosto-do-atleta";
import { api, ErroDaApi } from "@/lib/api/cliente";
import type {
  Camp,
  EstadoDaCarreira,
  EtapaDaCarreira,
  EventoDaCarreira,
  Habilidade,
  IntensidadeDoTreino,
  NotaDeHabilidade,
  OfertaDeLuta,
  SituacaoDaCarreira,
} from "@/lib/api/tipos";
import { salvarPartida } from "@/lib/partidas-salvas";
import {
  COR_DA_DIFICULDADE,
  DESCRICAO_DA_DIFICULDADE,
  DIFICULDADES,
  ESTILOS,
  INTENSIDADES_DE_TREINO,
  ORGANIZACOES,
  emPorcentagem,
} from "@/lib/rotulos";
import { cn } from "@/lib/utils";

type Acao =
  | { tipo: "aceitar"; indice: number; foco: Habilidade | null; intensidade: IntensidadeDoTreino }
  | { tipo: "recusar" }
  | { tipo: "recuperar" }
  | { tipo: "aposentar" }
  | { tipo: "simular" };

const EVENTOS: Record<EventoDaCarreira, string> = {
  Promovido: "Você subiu um degrau na carreira.",
  Rebaixado: "Você desceu um degrau e precisa se reconstruir.",
  Dispensado: "Você foi dispensado pela organização.",
  DisputaDeCinturaoMarcada: "Sua próxima luta vale o cinturão.",
  CinturaoConquistado: "O cinturão é seu.",
  CinturaoDefendido: "Cinturão defendido.",
  CinturaoPerdido: "Você perdeu o cinturão.",
  MudouDeCategoria: "Você subiu de categoria.",
  AnoVirado: "Mais um ano passou e seu corpo mudou.",
  FicouInativo: "Você recusou as ofertas e perdeu tempo de carreira.",
  CarreiraEncerrada: "Sua carreira chegou ao fim.",
  Lesionou: "Você saiu machucado da luta.",
  RecuperouDeLesao: "A lesão sarou. Você está liberado para lutar.",
};

/**
 * A carreira jogada, em uma tela só.
 *
 * O layout é de painel, não de página: em telas grandes a altura é a do
 * navegador e nada rola por fora. Antes o jogador descia para ver as ofertas,
 * subia para conferir o ranking e descia de novo para decidir — e decidir
 * olhando de memória não é decidir.
 *
 * As três colunas separam o que cada uma responde: a esquerda diz **onde você
 * está**, o centro **o que aconteceu e o que fazer agora**, e a direita **com
 * que corpo você vai**. Só as colunas rolam por dentro, e a do meio — a da
 * decisão — é dimensionada para não precisar.
 */
export function TelaDeSimulacao({ partidaId }: { partidaId: string }) {
  const consultas = useQueryClient();
  const chave = ["carreira", partidaId];
  const carreira = useQuery({
    queryKey: chave,
    queryFn: () => api.estrearCarreira(partidaId),
    staleTime: Number.POSITIVE_INFINITY,
  });

  // O camp vale para a rodada inteira: seja qual for a oferta aceita, é este
  // treino que a antecede. Por isso a escolha mora aqui, e não dentro do card
  // de cada luta.
  const [foco, setFoco] = useState<Habilidade | null>(null);
  const [intensidade, setIntensidade] = useState<IntensidadeDoTreino>("Padrao");

  const jogar = useMutation({
    mutationFn: (acao: Acao) => executar(partidaId, acao),
    onSuccess: (situacao) => consultas.setQueryData(chave, situacao),
  });

  // Mantém o atalho da home apontando para esta partida. É escrita em
  // armazenamento de fora do React, que é exatamente para o que um efeito
  // serve — e por isso não há estado nenhum sendo sincronizado aqui.
  const situacaoCarregada = carreira.data;

  useEffect(() => {
    if (!situacaoCarregada) {
      return;
    }

    salvarPartida({
      id: partidaId,
      nomeDeCartaz: situacaoCarregada.nomeDeCartaz,
      status: situacaoCarregada.encerrada ? "CarreiraSimulada" : "CarreiraEmAndamento",
    });
  }, [partidaId, situacaoCarregada]);

  if (carreira.isPending) return <Centro>Preparando sua estreia...</Centro>;
  if (carreira.isError) {
    return <Centro>{mensagemDeErro(carreira.error, "Não foi possível iniciar a carreira.")}</Centro>;
  }

  const situacao = carreira.data;
  const lesao = situacao.estado.lesao;
  const noUfc = situacao.rankingDaDivisao.length > 0;

  return (
    <main className="mx-auto flex w-full max-w-[1700px] flex-1 flex-col gap-3 px-3 py-3 sm:px-4 lg:h-dvh lg:overflow-hidden">
      <BarraDoLutador situacao={situacao} partidaId={partidaId} />

      <AvisoDeSubida
        posicaoAtual={situacao.estado.posicaoNoRanking}
        posicaoAnterior={situacao.posicaoAnterior}
        chaveDoMomento={situacao.carreira.totalDeLutas}
      />

      {situacao.encerrada ? (
        <FimDaCarreira situacao={situacao} partidaId={partidaId} />
      ) : (
        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[250px_minmax(0,1fr)_280px]">
          <Coluna>
            {noUfc ? (
              <RankingDaDivisao
                linhas={situacao.rankingDaDivisao}
                categoria={situacao.estado.categoriaTexto}
                posicaoAnterior={situacao.posicaoAnterior}
                className="shrink-0"
              />
            ) : (
              <EscadaDaCarreira
                key={`${situacao.estado.etapa}-${situacao.carreira.totalDeLutas}`}
                estado={situacao.estado}
              />
            )}
            <PainelDoMomento estado={situacao.estado} />
          </Coluna>

          <Coluna>
            <Avisos eventos={situacao.eventos} camp={situacao.camp} estado={situacao.estado} />

            {situacao.ultimaLuta && (
              <LutaRoundARound
                key={situacao.ultimaLuta.luta.ordem}
                desfecho={situacao.ultimaLuta}
              />
            )}

            {/* Machucado não escolhe luta: enquanto a lesão dura a mesa some e
                sobra o departamento médico. É o preço de ter aceitado a luta
                dura, e ele precisa parecer um preço. */}
            {lesao ? (
              <PainelDeLesao
                lesao={lesao}
                carregando={jogar.isPending}
                tratar={() => jogar.mutate({ tipo: "recuperar" })}
              />
            ) : (
              <Ofertas
                ofertas={situacao.ofertas}
                intensidade={intensidade}
                carregando={jogar.isPending}
                aceitar={(indice) =>
                  jogar.mutate({ tipo: "aceitar", indice, foco, intensidade })
                }
              />
            )}
          </Coluna>

          <Coluna>
            {!lesao && (
              <EscolhaDoCamp
                atributos={situacao.estado.atributos}
                foco={foco}
                intensidade={intensidade}
                desabilitado={jogar.isPending}
                aoEscolherFoco={setFoco}
                aoEscolherIntensidade={setIntensidade}
              />
            )}
            <AcoesDaRodada
              carregando={jogar.isPending}
              lesionado={lesao !== null}
              agir={(acao) => jogar.mutate(acao)}
            />
          </Coluna>
        </div>
      )}

      {jogar.isPending && <Cortina acao={jogar.variables?.tipo} />}

      {jogar.isError && (
        <p className="border-fight bg-fight/10 text-fight-claro shrink-0 border-l-2 px-4 py-2 text-sm">
          {mensagemDeErro(jogar.error, "Não foi possível registrar esta decisão.")}
        </p>
      )}
    </main>
  );
}

/**
 * Uma coluna do painel: rola por dentro em vez de empurrar a página.
 *
 * O `min-h-0` é o que faz isso funcionar. Sem ele o item da grade cresce até
 * caber o conteúdo, a página inteira volta a rolar e o layout de painel deixa
 * de existir.
 */
function Coluna({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-col gap-3 lg:overflow-x-hidden lg:overflow-y-auto">
      {children}
    </div>
  );
}

/**
 * A faixa de identidade, em uma linha só.
 *
 * Junta o que antes era um cabeçalho de três linhas: quem é, onde luta, qual o
 * cartel e quanto vale hoje. Cada centímetro aqui sai do espaço da decisão.
 */
function BarraDoLutador({
  situacao,
  partidaId,
}: {
  situacao: SituacaoDaCarreira;
  partidaId: string;
}) {
  const { estado, carreira } = situacao;

  return (
    <header className="border-grafite-borda bg-grafite-claro/70 flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border px-4 py-2.5">
      <div className="min-w-0">
        <h1 className="font-display truncate text-xl leading-none font-bold uppercase sm:text-2xl">
          {situacao.nomeDeCartaz}
        </h1>
        <p className="text-aco mt-1 truncate text-xs">
          {ORGANIZACOES[estado.organizacao]} · {estado.categoriaTexto} ·{" "}
          {ESTILOS[estado.estilo]} · {estado.idade} anos
          {estado.ehCampeao && <span className="text-legado-claro"> · Campeão</span>}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-5">
        <Numero rotulo="Cartel" valor={carreira.cartel} />
        <Numero rotulo="Overall" valor={estado.overallAtual} destaque />

        {/* Sem a navegação do site nesta tela, este é o caminho de volta — e ele
            é discreto de propósito: sair no meio da carreira tem que ser um
            clique deliberado, não um esbarrão no menu. */}
        <Link
          href={`/partida/${partidaId}/lutador`}
          className="font-display text-aco hover:text-gelo hidden text-[10px] tracking-[0.2em] uppercase transition-colors sm:block"
        >
          Ficha
        </Link>
      </div>
    </header>
  );
}

function Numero({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: string | number;
  destaque?: boolean;
}) {
  return (
    <div className="text-right">
      <Etiqueta className="text-[9px]">{rotulo}</Etiqueta>
      <p
        className={cn(
          "font-display text-2xl leading-none font-bold tabular-nums",
          destaque && "text-legado-claro",
        )}
      >
        {valor}
      </p>
    </div>
  );
}

const ESCADA: { etapa: EtapaDaCarreira; rotulo: string; marca: string }[] = [
  { etapa: "CircuitoRegional", rotulo: "Regional", marca: "1" },
  { etapa: "OrganizacaoNacional", rotulo: "Nacional", marca: "2" },
  { etapa: "GrandeOrganizacao", rotulo: "Grande organização", marca: "3" },
  { etapa: "Top15", rotulo: "Ranking #15–6", marca: "4" },
  { etapa: "Top5", rotulo: "Elite #5–2", marca: "5" },
  { etapa: "DisputaDeCinturao", rotulo: "Desafiante #1", marca: "6" },
  { etapa: "Campeao", rotulo: "Campeão", marca: "C" },
];

/**
 * A posição antes do UFC: uma escada de etapas, não um ranking inventado.
 *
 * Vertical, e não horizontal como antes, porque agora divide a coluna estreita
 * com o painel de momento — e uma escada de sete degraus em pé cabe onde sete
 * colunas de trinta pixels não cabiam.
 */
function EscadaDaCarreira({ estado }: { estado: EstadoDaCarreira }) {
  const indiceAtual = ESCADA.findIndex((degrau) => degrau.etapa === estado.etapa);

  return (
    <section className="border-grafite-borda bg-grafite-claro/70 shrink-0 border">
      <header className="border-grafite-borda flex items-baseline justify-between border-b px-4 py-3">
        <Etiqueta className="text-[10px]">Sua posição</Etiqueta>
        <span className="font-display text-fight-claro text-xs font-bold uppercase">
          {ESCADA[indiceAtual]?.rotulo}
        </span>
      </header>

      <ol className="flex flex-col py-1">
        {ESCADA.map((degrau, indice) => {
          const atual = indice === indiceAtual;
          const passou = indice < indiceAtual;

          return (
            <li
              key={degrau.etapa}
              className={cn(
                "flex items-center gap-2.5 border-l-2 px-3 py-1.5 text-sm",
                atual ? "border-fight bg-fight/15" : "border-transparent",
              )}
            >
              <span
                className={cn(
                  "font-display flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                  atual && "border-legado bg-legado text-grafite",
                  passou && "border-vitoria bg-vitoria/20 text-vitoria",
                  !atual && !passou && "border-grafite-borda text-aco",
                )}
              >
                {passou ? "✓" : degrau.marca}
              </span>
              <span className={cn("truncate", atual ? "text-gelo font-semibold" : "text-aco")}>
                {degrau.rotulo}
              </span>
            </li>
          );
        })}
      </ol>

      {estado.vitoriasParaSubir > 0 && (
        <p className="text-aco-claro border-grafite-borda border-t px-3 py-2 text-center text-[11px]">
          <span className="text-gelo font-semibold">
            {estado.vitoriasNaEtapa} de {estado.vitoriasParaSubir}
          </span>{" "}
          vitórias para subir
        </p>
      )}
    </section>
  );
}

/** Os contadores que decidem o próximo passo, com os limiares junto. */
function PainelDoMomento({ estado }: { estado: EstadoDaCarreira }) {
  return (
    <Painel className="shrink-0">
      <div className="px-4 py-3">
        <Etiqueta className="text-[10px]">Momento</Etiqueta>
        <Progresso
          rotulo="Compromissos no ano"
          atual={estado.compromissosNaTemporada}
          total={estado.compromissosPorTemporada}
        />
        <Progresso
          rotulo="Derrotas até o corte"
          atual={estado.derrotasSeguidas}
          total={estado.derrotasParaSerDispensado}
          perigo
        />
        <Progresso
          rotulo="Recusas até o corte"
          atual={estado.recusasSeguidas}
          total={estado.recusasParaSerDispensado}
          perigo
        />
        {estado.lesoesSofridas > 0 && (
          <p className="text-aco mt-3 text-[11px]">
            Lesões na carreira:{" "}
            <span className="text-fight-claro font-semibold">{estado.lesoesSofridas}</span>
          </p>
        )}
      </div>
    </Painel>
  );
}

function Progresso({
  rotulo,
  atual,
  total,
  perigo = false,
}: {
  rotulo: string;
  atual: number;
  total: number;
  perigo?: boolean;
}) {
  const porcentagem = total > 0 ? Math.min(100, (atual / total) * 100) : 100;

  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-[11px]">
        <span className="text-aco-claro">{rotulo}</span>
        <span className="tabular-nums">
          {atual}/{total}
        </span>
      </div>
      <div className="bg-grafite-borda h-1 overflow-hidden">
        <span
          className={cn("block h-full", perigo ? "bg-fight" : "bg-vitoria")}
          style={{ width: `${porcentagem}%` }}
        />
      </div>
    </div>
  );
}

/**
 * O que mudou desde a última decisão, em linhas curtas.
 *
 * Eventos e resultado do camp dividem o mesmo bloco porque respondem à mesma
 * pergunta — "o que aconteceu enquanto eu não estava olhando" — e porque duas
 * caixas separadas custariam o dobro da altura pelo mesmo conteúdo.
 */
function Avisos({
  eventos,
  camp,
  estado,
}: {
  eventos: EventoDaCarreira[];
  camp: Camp | null;
  estado: EstadoDaCarreira;
}) {
  const doCamp = textoDoCamp(camp, estado.atributos);

  if (eventos.length === 0 && !doCamp) {
    return null;
  }

  return (
    <ul className="flex shrink-0 flex-col gap-1.5">
      {eventos.map((evento, indice) => (
        <li
          key={`${evento}-${indice}`}
          className="animate-entrada border-legado bg-legado/10 text-legado-claro border-l-2 px-3 py-1.5 text-xs font-semibold"
        >
          {EVENTOS[evento]}
        </li>
      ))}

      {doCamp && (
        <li
          className={cn(
            "animate-entrada border-l-2 px-3 py-1.5 text-xs font-semibold",
            camp?.evoluiu
              ? "border-vitoria bg-vitoria/10 text-vitoria"
              : "border-grafite-borda bg-grafite-claro/60 text-aco-claro",
          )}
        >
          {doCamp}
        </li>
      )}
    </ul>
  );
}

/**
 * O que o camp rendeu, dito na linguagem da decisão.
 *
 * Diferencia "treinou e não rendeu" de "treinou e já estava no teto": são
 * resultados iguais na nota e opostos no que pedem do jogador. O primeiro pede
 * insistência; o segundo, outro foco.
 */
function textoDoCamp(camp: Camp | null, atributos: NotaDeHabilidade[]) {
  if (!camp?.foco) {
    return null;
  }

  // O nome acentuado da habilidade já vem do servidor com os atributos; repetir
  // a tabela aqui seria criar uma segunda versão dela.
  const foco = atributos.find((atributo) => atributo.habilidade === camp.foco)?.nome ?? camp.foco;
  const peso = INTENSIDADES_DE_TREINO[camp.intensidade].toLowerCase();

  if (camp.evoluiu) {
    return `Camp ${peso}: ${foco} subiu de ${camp.notaAntes} para ${camp.notaDepois}.`;
  }

  if (camp.noTetoDoPotencial) {
    return `${foco} já chegou ao teto do que você draftou. Treinar mais aqui não rende nada.`;
  }

  return `Camp ${peso}: ${foco} não evoluiu desta vez.`;
}

/**
 * As lutas na mesa.
 *
 * Uma linha por oferta em vez de um card por oferta: com três na tela, o card
 * grande empurrava a terceira para fora do campo de visão — e comparar duas
 * ofertas que não cabem juntas na tela não é comparar.
 */
function Ofertas({
  ofertas,
  intensidade,
  carregando,
  aceitar,
}: {
  ofertas: OfertaDeLuta[];
  intensidade: IntensidadeDoTreino;
  carregando: boolean;
  aceitar: (indice: number) => void;
}) {
  return (
    <section className="shrink-0">
      <TituloAngular className="text-lg">Ofertas na mesa</TituloAngular>

      <div className="mt-2 flex flex-col gap-2">
        {ofertas.map((oferta, indice) => (
          <Oferta
            key={oferta.indice}
            oferta={oferta}
            intensidade={intensidade}
            carregando={carregando}
            atraso={indice * 90}
            aceitar={() => aceitar(oferta.indice)}
          />
        ))}
      </div>
    </section>
  );
}

function Oferta({
  oferta,
  intensidade,
  carregando,
  atraso,
  aceitar,
}: {
  oferta: OfertaDeLuta;
  intensidade: IntensidadeDoTreino;
  carregando: boolean;
  atraso: number;
  aceitar: () => void;
}) {
  // O risco mostrado é o da intensidade de camp escolhida agora, e é o mesmo
  // número que o servidor vai sortear depois. Trocar para treino pesado faz o
  // percentual subir aqui na hora — é ali que a escolha do camp dói.
  const risco =
    oferta.opcoesDeCamp.find((opcao) => opcao.intensidade === intensidade)?.riscoDeLesao ??
    oferta.riscoDeLesao;

  return (
    <Painel
      destaque={oferta.valendoCinturao}
      className="animate-entrada"
      style={{ animationDelay: `${atraso}ms` }}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 p-3 sm:flex-nowrap">
        {/* Adversário do ranking tem rosto; o inventado do regional, não. A foto
            é o que faz "vs Alex Pereira" parecer uma luta de verdade em vez de
            uma linha de texto. */}
        {oferta.slugDoAdversario && (
          <RostoDoAtleta slug={oferta.slugDoAdversario} nome={oferta.adversario} tamanho={44} />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h2 className="truncate text-lg leading-none">{oferta.adversario}</h2>
            <span className="text-aco shrink-0 text-xs tabular-nums">
              {oferta.overallDoAdversario}
            </span>
          </div>

          <p className="text-aco mt-1 truncate text-[11px]">
            {oferta.posicaoDoAdversario === null
              ? oferta.cartelDoAdversario
              : oferta.posicaoDoAdversario === 0
                ? "Campeão da divisão"
                : `#${oferta.posicaoDoAdversario} do ranking`}{" "}
            · {ESTILOS[oferta.estiloDoAdversario]} ·{" "}
            {oferta.valendoCinturao ? "valendo cinturão" : `${oferta.roundsProgramados} rounds`}
          </p>

          <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-[11px]">
            <span
              className={cn(
                "font-display text-sm font-bold uppercase",
                COR_DA_DIFICULDADE[oferta.dificuldade],
              )}
            >
              Luta {DIFICULDADES[oferta.dificuldade].toLowerCase()}
            </span>
            <span className="text-aco-claro tabular-nums">
              <span className={risco >= 0.15 ? "text-fight-claro font-semibold" : undefined}>
                {emPorcentagem(risco)}
              </span>{" "}
              de lesão
            </span>
            <span className="text-aco hidden xl:inline">
              {DESCRICAO_DA_DIFICULDADE[oferta.dificuldade]}
            </span>
          </p>

          {/* O confronto direto vem à vista: saber que este é o cara que te
              nocauteou muda a leitura de tudo que está ao lado. */}
          {oferta.ehRevanche && (
            <p className="text-legado-claro mt-1.5 text-[11px] font-semibold">
              {`Revanche · ${oferta.derrotasDoAdversarioParaVoce}–${oferta.vitoriasDoAdversarioSobreVoce} no confronto direto`}
            </p>
          )}
        </div>

        <Botao
          className="w-full shrink-0 px-5 py-2 sm:w-auto"
          disabled={carregando}
          onClick={aceitar}
        >
          <span className="text-sm">Aceitar luta</span>
        </Botao>
      </div>
    </Painel>
  );
}

function AcoesDaRodada({
  carregando,
  lesionado,
  agir,
}: {
  carregando: boolean;
  lesionado: boolean;
  agir: (acao: Acao) => void;
}) {
  return (
    <Painel className="shrink-0">
      <div className="flex flex-col gap-2 p-4">
        {/* Recusar não existe enquanto o corpo é quem manda: quem está machucado
            não está fugindo de ninguém. */}
        {!lesionado && (
          <>
            <Botao
              variante="contorno"
              className="px-4 py-2"
              disabled={carregando}
              onClick={() => agir({ tipo: "recusar" })}
            >
              <span className="text-sm">Recusar ofertas</span>
            </Botao>
            <p className="text-aco text-[11px] leading-snug">
              Recusar consome tempo. Três recusas seguidas causam dispensa.
            </p>
          </>
        )}

        <Botao
          variante="contorno"
          className="px-4 py-2"
          disabled={carregando}
          onClick={() =>
            confirmar("Simular toda a carreira restante?", () => agir({ tipo: "simular" }))
          }
        >
          <span className="text-sm">Simular o resto</span>
        </Botao>

        <Botao
          variante="fantasma"
          className="px-4 py-1"
          disabled={carregando}
          onClick={() =>
            confirmar("Encerrar sua carreira agora?", () => agir({ tipo: "aposentar" }))
          }
        >
          <span className="text-sm">Aposentar agora</span>
        </Botao>
      </div>
    </Painel>
  );
}

function FimDaCarreira({
  situacao,
  partidaId,
}: {
  situacao: SituacaoDaCarreira;
  partidaId: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center py-10">
      <Painel destaque className="w-full max-w-md">
        <div className="p-8 text-center">
          <Etiqueta>Carreira encerrada</Etiqueta>
          <p className="font-display mt-2 text-4xl font-bold uppercase">
            {situacao.carreira.cartel}
          </p>
          <BotaoLink className="mt-6" href={`/partida/${partidaId}/resultado`}>
            Ver veredito final
          </BotaoLink>
        </div>
      </Painel>
    </div>
  );
}

function Cortina({ acao }: { acao?: Acao["tipo"] }) {
  return (
    <div className="bg-grafite/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="animate-pulso-fight recorte-octogonal bg-fight flex size-28 items-center justify-center text-center">
        <span className="font-display text-sm font-bold tracking-widest uppercase">
          {acao === "aceitar" ? (
            <>
              <span>A luta</span>
              <br />
              <span>começou</span>
            </>
          ) : (
            "Avançando"
          )}
        </span>
      </div>
    </div>
  );
}

function executar(partidaId: string, acao: Acao) {
  switch (acao.tipo) {
    case "aceitar":
      return api.aceitarOferta(partidaId, acao.indice, acao.foco, acao.intensidade);
    case "recuperar":
      return api.recuperar(partidaId);
    case "recusar":
      return api.recusarOfertas(partidaId);
    case "aposentar":
      return api.aposentar(partidaId);
    case "simular":
      return api.simularOResto(partidaId);
  }
}

function confirmar(mensagem: string, acao: () => void) {
  if (window.confirm(mensagem)) acao();
}

function mensagemDeErro(erro: unknown, padrao: string) {
  return erro instanceof ErroDaApi ? erro.message : padrao;
}

function Centro({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <p className="text-aco-claro animate-pulse text-center">{children}</p>
    </main>
  );
}
