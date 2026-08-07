"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AvisoDeSubida } from "@/components/jogo/aviso-de-subida";
import { Botao, BotaoLink } from "@/components/jogo/botao";
import { EscolhaDoCamp } from "@/components/jogo/escolha-do-camp";
import { Etiqueta, Painel, TituloAngular } from "@/components/jogo/painel";
import { PainelDeLesao } from "@/components/jogo/painel-de-lesao";
import { RankingDaDivisao } from "@/components/jogo/ranking-da-divisao";
import { RostoDoAtleta } from "@/components/jogo/rosto-do-atleta";
import { api, ErroDaApi } from "@/lib/api/cliente";
import type {
  Camp,
  EtapaDaCarreira,
  EventoDaCarreira,
  Habilidade,
  IntensidadeDoTreino,
  NotaDeHabilidade,
  OfertaDeLuta,
  RoundDaLuta,
  SituacaoDaCarreira,
} from "@/lib/api/tipos";
import {
  COR_DA_DIFICULDADE,
  DESCRICAO_DA_DIFICULDADE,
  DIFICULDADES,
  ESTILOS,
  INTENSIDADES_DE_TREINO,
  METODOS,
  METODOS_CURTOS,
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

  if (carreira.isPending) return <Centro>Preparando sua estreia...</Centro>;
  if (carreira.isError) {
    return <Centro>{mensagemDeErro(carreira.error, "Não foi possível iniciar a carreira.")}</Centro>;
  }

  const situacao = carreira.data;
  const lesao = situacao.estado.lesao;

  const noUfc = situacao.rankingDaDivisao.length > 0;

  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-7 sm:px-6">
      <Cabecalho situacao={situacao} />

      <AvisoDeSubida
        posicaoAtual={situacao.estado.posicaoNoRanking}
        posicaoAnterior={situacao.posicaoAnterior}
        chaveDoMomento={situacao.carreira.totalDeLutas}
      />

      {/* Enquanto o lutador não chega ao UFC não existe ranking a mostrar, e a
          escada de etapas é o que conta onde ele está. Dali em diante ela dá
          lugar à tabela real da divisão. */}
      {noUfc ? (
        <RankingDaDivisao
          linhas={situacao.rankingDaDivisao}
          categoria={situacao.estado.categoriaTexto}
          posicaoAnterior={situacao.posicaoAnterior}
          className="mt-7 lg:hidden"
        />
      ) : (
        <RankingDaCarreira
          key={`${situacao.estado.etapa}-${situacao.carreira.totalDeLutas}`}
          situacao={situacao}
        />
      )}

      {situacao.camp && (
        <ResultadoDoCamp camp={situacao.camp} atributos={situacao.estado.atributos} />
      )}
      {situacao.eventos.length > 0 && <Eventos eventos={situacao.eventos} />}
      {situacao.ultimaLuta && (
        <UltimaLuta key={situacao.ultimaLuta.luta.ordem} situacao={situacao} />
      )}

      {jogar.isPending && (
        <div className="bg-grafite/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="animate-pulso-fight recorte-octogonal bg-fight flex size-28 items-center justify-center text-center">
            <span className="font-display text-sm font-bold tracking-widest uppercase">
              {jogar.variables?.tipo === "aceitar" ? <><span>A luta</span><br /><span>começou</span></> : "Avançando"}
            </span>
          </div>
        </div>
      )}

      {situacao.encerrada ? (
        <Painel destaque className="mt-6">
          <div className="p-6 text-center">
            <Etiqueta>Carreira encerrada</Etiqueta>
            <p className="font-display mt-2 text-3xl font-bold uppercase">{situacao.carreira.cartel}</p>
            <BotaoLink className="mt-5" href={`/partida/${partidaId}/resultado`}>
              Ver veredito final
            </BotaoLink>
          </div>
        </Painel>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
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

          {/* A coluna gruda ao rolar: com a tabela do lado o tempo todo, aceitar
              a luta contra o #6 deixa de ser um nome e passa a ser um degrau
              que dá para ver. */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
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
            <PainelDeDecisao
              situacao={situacao}
              carregando={jogar.isPending}
              agir={(acao) => jogar.mutate(acao)}
              lesionado={lesao !== null}
            />
            {noUfc && (
              <RankingDaDivisao
                linhas={situacao.rankingDaDivisao}
                categoria={situacao.estado.categoriaTexto}
                posicaoAnterior={situacao.posicaoAnterior}
                className="hidden lg:flex"
              />
            )}
          </div>
        </div>
      )}

      {jogar.isError && (
        <p className="border-fight bg-fight/10 text-fight-claro mt-5 border-l-2 px-4 py-3 text-sm">
          {mensagemDeErro(jogar.error, "Não foi possível registrar esta decisão.")}
        </p>
      )}
    </main>
  );
}

const ESCADA: { etapa: EtapaDaCarreira; rotulo: string; posicao: string }[] = [
  { etapa: "CircuitoRegional", rotulo: "Regional", posicao: "Base" },
  { etapa: "OrganizacaoNacional", rotulo: "Nacional", posicao: "Pro" },
  { etapa: "GrandeOrganizacao", rotulo: "Grande organização", posicao: "Estreia" },
  { etapa: "Top15", rotulo: "Ranking", posicao: "#15–6" },
  { etapa: "Top5", rotulo: "Elite", posicao: "#5–2" },
  { etapa: "DisputaDeCinturao", rotulo: "Desafiante", posicao: "#1" },
  { etapa: "Campeao", rotulo: "Campeão", posicao: "C" },
];

/** A posição que a API conhece: uma escada de etapas, não um ranking inventado. */
function RankingDaCarreira({ situacao }: { situacao: SituacaoDaCarreira }) {
  const indiceAtual = ESCADA.findIndex((degrau) => degrau.etapa === situacao.estado.etapa);
  return (
    <section className="mt-7 overflow-hidden border border-grafite-borda bg-grafite-claro/70 p-4 sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div><Etiqueta>Sua posição na carreira</Etiqueta><p className="font-display text-xl font-bold uppercase">{ESCADA[indiceAtual]?.rotulo}</p></div>
        <span className="font-display text-legado-claro text-3xl font-bold">{ESCADA[indiceAtual]?.posicao}</span>
      </div>
      <ol className="relative grid grid-cols-7 gap-1 before:absolute before:top-4 before:right-[7%] before:left-[7%] before:h-px before:bg-grafite-borda">
        {ESCADA.map((degrau, indice) => {
          const atual = indice === indiceAtual;
          const passou = indice < indiceAtual;
          return (
            <li key={degrau.etapa} className="relative flex min-w-0 flex-col items-center text-center">
              <span className={cn("relative z-10 flex size-8 items-center justify-center rounded-full border font-display text-[10px] font-bold transition-all duration-700", atual && "animate-subir-ranking border-legado bg-legado text-grafite shadow-[0_0_24px_rgba(217,168,63,0.65)]", passou && "border-vitoria bg-vitoria/20 text-vitoria", !atual && !passou && "border-grafite-borda bg-grafite-claro text-aco")}>{degrau.posicao}</span>
              <span className={cn("mt-2 hidden truncate text-[9px] uppercase sm:block", atual ? "text-gelo" : "text-aco")}>{degrau.rotulo}</span>
            </li>
          );
        })}
      </ol>
      {situacao.estado.vitoriasParaSubir > 0 && indiceAtual < ESCADA.length - 1 && (
        <p className="text-aco-claro mt-4 text-center text-xs">
          <span className="text-gelo font-semibold">{situacao.estado.vitoriasNaEtapa} de {situacao.estado.vitoriasParaSubir}</span> vitórias para o próximo degrau
        </p>
      )}
    </section>
  );
}

function Cabecalho({ situacao }: { situacao: SituacaoDaCarreira }) {
  const { estado, carreira } = situacao;
  return (
    <header className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
      <div>
        <Etiqueta>{ORGANIZACOES[estado.organizacao]} · {estado.categoriaTexto}</Etiqueta>
        <h1 className="mt-1 text-3xl leading-none sm:text-4xl">{situacao.nomeDeCartaz}</h1>
        <p className="text-aco-claro mt-2 text-sm">
          {ESTILOS[estado.estilo]} · {estado.idade} anos
          {estado.ehCampeao && <span className="text-legado-claro"> · Campeão</span>}
        </p>
      </div>
      <div className="flex gap-6 sm:text-right">
        <Numero rotulo="Cartel" valor={carreira.cartel} />
        <Numero rotulo="Overall" valor={estado.overallAtual} destaque />
      </div>
    </header>
  );
}

function Numero({ rotulo, valor, destaque = false }: { rotulo: string; valor: string | number; destaque?: boolean }) {
  return <div><Etiqueta>{rotulo}</Etiqueta><p className={cn("font-display text-3xl leading-none font-bold tabular-nums", destaque && "text-legado-claro")}>{valor}</p></div>;
}

function Eventos({ eventos }: { eventos: EventoDaCarreira[] }) {
  return (
    <ul className="mt-6 flex flex-col gap-2">
      {eventos.map((evento, indice) => (
        <li key={`${evento}-${indice}`} className="animate-entrada border-legado bg-legado/10 text-legado-claro border-l-2 px-4 py-3 text-sm font-semibold">
          {EVENTOS[evento]}
        </li>
      ))}
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
function ResultadoDoCamp({
  camp,
  atributos,
}: {
  camp: Camp;
  atributos: NotaDeHabilidade[];
}) {
  if (!camp.foco) {
    return null;
  }

  // O nome acentuado da habilidade já vem do servidor com os atributos; repetir
  // a tabela aqui seria criar uma segunda versão dela.
  const nomeDoFoco =
    atributos.find((atributo) => atributo.habilidade === camp.foco)?.nome ?? camp.foco;

  const texto = camp.evoluiu
    ? `Camp ${INTENSIDADES_DE_TREINO[camp.intensidade].toLowerCase()}: ${nomeDoFoco} subiu de ${camp.notaAntes} para ${camp.notaDepois}.`
    : camp.noTetoDoPotencial
      ? `${nomeDoFoco} já chegou ao teto do que você draftou. Treinar mais aqui não rende nada.`
      : `Camp ${INTENSIDADES_DE_TREINO[camp.intensidade].toLowerCase()}: ${nomeDoFoco} não evoluiu desta vez.`;

  return (
    <p
      className={cn(
        "animate-entrada mt-6 border-l-2 px-4 py-3 text-sm font-semibold",
        camp.evoluiu
          ? "border-vitoria bg-vitoria/10 text-vitoria"
          : "border-grafite-borda bg-grafite-claro/60 text-aco-claro",
      )}
    >
      {texto}
    </p>
  );
}

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
    <section>
      <TituloAngular>Ofertas na mesa</TituloAngular>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {ofertas.map((oferta, indice) => (
          <Painel key={oferta.indice} destaque={oferta.valendoCinturao} className="animate-entrada" style={{ animationDelay: `${indice * 100}ms` }}>
            <div className="flex h-full flex-col p-5">
              <div className="flex items-start gap-3">
                {/* Adversário do ranking tem rosto; o inventado do regional,
                    não. A foto é o que faz "vs Alex Pereira" parecer uma luta
                    de verdade em vez de uma linha de texto. */}
                {oferta.slugDoAdversario && (
                  <RostoDoAtleta
                    slug={oferta.slugDoAdversario}
                    nome={oferta.adversario}
                    tamanho={56}
                  />
                )}

                <div className="min-w-0 flex-1">
                  <Etiqueta className={oferta.valendoCinturao ? "text-legado-claro" : undefined}>
                    {oferta.valendoCinturao ? "Valendo cinturão" : `${oferta.roundsProgramados} rounds`}
                  </Etiqueta>
                  <h2 className="mt-1 truncate text-2xl leading-none">{oferta.adversario}</h2>
                  <p className="text-aco mt-1 text-xs">
                    {oferta.posicaoDoAdversario === null
                      ? oferta.cartelDoAdversario
                      : oferta.posicaoDoAdversario === 0
                        ? "Campeão da divisão"
                        : `#${oferta.posicaoDoAdversario} do ranking`}{" "}
                    · {ESTILOS[oferta.estiloDoAdversario]}
                  </p>
                </div>
              </div>

              {/* O confronto direto vem antes de qualquer número: saber que é o
                  cara que te nocauteou muda a leitura de tudo que vem depois. */}
              {oferta.ehRevanche && (
                <p className="border-legado bg-legado/10 text-legado-claro mt-4 border-l-2 px-3 py-2 text-xs font-semibold">
                  Revanche · {oferta.derrotasDoAdversarioParaVoce}–
                  {oferta.vitoriasDoAdversarioSobreVoce} no confronto direto
                </p>
              )}

              <p className="text-aco-claro my-4 text-sm leading-snug">{oferta.chamada}</p>

              <div className="mb-4 flex items-end justify-between border-y border-grafite-borda py-3">
                <span className="text-aco text-xs">{oferta.categoriaTexto}</span>
                <Numero rotulo="Overall" valor={oferta.overallDoAdversario} />
              </div>

              <SeloDeDificuldade oferta={oferta} intensidade={intensidade} />

              <div className="mt-auto pt-4">
                <Botao className="w-full" disabled={carregando} onClick={() => aceitar(oferta.indice)}>
                  Aceitar luta
                </Botao>
              </div>
            </div>
          </Painel>
        ))}
      </div>
    </section>
  );
}

/**
 * O grau da luta e o que ela pode custar ao corpo.
 *
 * O risco mostrado é o da intensidade de camp escolhida agora, e é exatamente o
 * mesmo número que o servidor vai sortear depois — trocar para treino pesado faz
 * o percentual subir aqui na hora, que é onde a escolha do camp dói.
 */
function SeloDeDificuldade({
  oferta,
  intensidade,
}: {
  oferta: OfertaDeLuta;
  intensidade: IntensidadeDoTreino;
}) {
  const risco =
    oferta.opcoesDeCamp.find((opcao) => opcao.intensidade === intensidade)?.riscoDeLesao ??
    oferta.riscoDeLesao;

  return (
    <div className="border-grafite-borda border-b pb-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className={cn("font-display text-lg font-bold uppercase", COR_DA_DIFICULDADE[oferta.dificuldade])}>
          Luta {DIFICULDADES[oferta.dificuldade].toLowerCase()}
        </span>
        <span className="text-aco-claro text-xs tabular-nums">
          <span className={risco >= 0.15 ? "text-fight-claro font-semibold" : undefined}>
            {emPorcentagem(risco)}
          </span>{" "}
          de lesão
        </span>
      </div>
      <p className="text-aco mt-1 text-[11px] leading-snug">
        {DESCRICAO_DA_DIFICULDADE[oferta.dificuldade]}
      </p>
    </div>
  );
}

function PainelDeDecisao({
  situacao,
  carregando,
  lesionado,
  agir,
}: {
  situacao: SituacaoDaCarreira;
  carregando: boolean;
  lesionado: boolean;
  agir: (acao: Acao) => void;
}) {
  const { estado } = situacao;
  return (
    <aside className="flex flex-col gap-4">
      <Painel>
        <div className="p-5">
          <TituloAngular className="-ml-4 text-lg">Momento</TituloAngular>
          <Progresso rotulo="Vitórias para subir" atual={estado.vitoriasNaEtapa} total={estado.vitoriasParaSubir} />
          <Progresso rotulo="Compromissos no ano" atual={estado.compromissosNaTemporada} total={estado.compromissosPorTemporada} />
          <Progresso rotulo="Derrotas até o corte" atual={estado.derrotasSeguidas} total={estado.derrotasParaSerDispensado} perigo />
          <Progresso rotulo="Recusas até o corte" atual={estado.recusasSeguidas} total={estado.recusasParaSerDispensado} perigo />
        </div>
      </Painel>

      <Painel>
        <div className="flex flex-col gap-2 p-5">
          {/* Recusar não existe enquanto o corpo é quem manda: quem está
              machucado não está fugindo de ninguém. */}
          {!lesionado && (
            <>
              <Botao variante="contorno" disabled={carregando} onClick={() => agir({ tipo: "recusar" })}>Recusar ofertas</Botao>
              <p className="text-aco mb-2 text-[11px] leading-snug">Recusar consome tempo. Três recusas seguidas causam dispensa.</p>
            </>
          )}
          <Botao variante="contorno" disabled={carregando} onClick={() => confirmar("Simular toda a carreira restante?", () => agir({ tipo: "simular" }))}>Simular o resto</Botao>
          <Botao variante="fantasma" disabled={carregando} onClick={() => confirmar("Encerrar sua carreira agora?", () => agir({ tipo: "aposentar" }))}>Aposentar agora</Botao>
        </div>
      </Painel>
    </aside>
  );
}

function Progresso({ rotulo, atual, total, perigo = false }: { rotulo: string; atual: number; total: number; perigo?: boolean }) {
  const porcentagem = total > 0 ? Math.min(100, (atual / total) * 100) : 100;
  return (
    <div className="mt-4">
      <div className="mb-1 flex justify-between text-xs"><span className="text-aco-claro">{rotulo}</span><span className="tabular-nums">{atual}/{total}</span></div>
      <div className="bg-grafite-borda h-1.5 overflow-hidden"><span className={cn("block h-full", perigo ? "bg-fight" : "bg-vitoria")} style={{ width: `${porcentagem}%` }} /></div>
    </div>
  );
}

function UltimaLuta({ situacao }: { situacao: SituacaoDaCarreira }) {
  const ultima = situacao.ultimaLuta!;
  const venceu = ultima.luta.resultado === "Vitoria";
  return (
    <Painel destaque={ultima.luta.valendoCinturao} className="mt-6 animate-entrada">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><Etiqueta>Última luta</Etiqueta><h2 className="text-2xl">vs. {ultima.luta.adversario}</h2></div>
          <span className={cn("font-display px-3 py-1 text-sm font-bold uppercase", venceu ? "bg-vitoria/15 text-vitoria" : "bg-fight/15 text-fight-claro")}>
            {venceu ? "Vitória" : ultima.luta.resultado} · {METODOS_CURTOS[ultima.luta.metodo]} {ultima.luta.metodo !== "Decisao" && `R${ultima.luta.roundDoEncerramento}`}
          </span>
        </div>
        <ol className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {ultima.rounds.map((round) => <Round key={round.numero} round={round} />)}
        </ol>
      </div>
    </Painel>
  );
}

function Round({ round }: { round: RoundDaLuta }) {
  const venceu = round.vencedor === "Lutador";
  const detalhes = [
    round.lutadorControlou && "você controlou",
    round.adversarioControlou && "rival controlou",
    round.lutadorBuscouQueda && "buscou queda",
    round.adversarioBuscouQueda && "defendeu quedas",
  ].filter(Boolean);
  return (
    <li style={{ animationDelay: `${round.numero * 110}ms` }} className={cn("animate-entrada border p-3", venceu ? "border-vitoria/50" : round.vencedor === "Empate" ? "border-grafite-borda" : "border-fight/50")}>
      <div className="flex justify-between"><Etiqueta>Round {round.numero}</Etiqueta><span className={cn("font-display font-bold", venceu ? "text-vitoria" : "text-fight-claro")}>{venceu ? "10–9" : round.vencedor === "Empate" ? "10–10" : "9–10"}</span></div>
      <p className="text-aco mt-2 min-h-8 text-[10px] leading-snug">{detalhes.join(" · ") || "trocação equilibrada"}</p>
      <p className="mt-2 text-[10px]">Dano: <span className="text-fight-claro">{round.danoDoLutador}</span> / {round.danoDoAdversario}</p>
      {round.encerramento && <p className="text-legado-claro mt-1 text-[10px] font-bold uppercase">{METODOS[round.encerramento]}</p>}
    </li>
  );
}

function executar(partidaId: string, acao: Acao) {
  switch (acao.tipo) {
    case "aceitar":
      return api.aceitarOferta(partidaId, acao.indice, acao.foco, acao.intensidade);
    case "recuperar":
      return api.recuperar(partidaId);
    case "recusar": return api.recusarOfertas(partidaId);
    case "aposentar": return api.aposentar(partidaId);
    case "simular": return api.simularOResto(partidaId);
  }
}

function confirmar(mensagem: string, acao: () => void) {
  if (window.confirm(mensagem)) acao();
}

function mensagemDeErro(erro: unknown, padrao: string) {
  return erro instanceof ErroDaApi ? erro.message : padrao;
}

function Centro({ children }: { children: React.ReactNode }) {
  return <main className="flex flex-1 items-center justify-center px-6 py-20"><p className="text-aco-claro animate-pulse text-center">{children}</p></main>;
}
