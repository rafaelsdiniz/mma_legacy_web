"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Botao, BotaoLink } from "@/components/jogo/botao";
import { Etiqueta, Painel, TituloAngular } from "@/components/jogo/painel";
import { api, ErroDaApi } from "@/lib/api/cliente";
import type {
  EtapaDaCarreira,
  EventoDaCarreira,
  OfertaDeLuta,
  RoundDaLuta,
  SituacaoDaCarreira,
} from "@/lib/api/tipos";
import { ESTILOS, METODOS, METODOS_CURTOS, ORGANIZACOES } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

type Acao =
  | { tipo: "aceitar"; indice: number }
  | { tipo: "recusar" }
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
};

export function TelaDeSimulacao({ partidaId }: { partidaId: string }) {
  const consultas = useQueryClient();
  const chave = ["carreira", partidaId];
  const carreira = useQuery({
    queryKey: chave,
    queryFn: () => api.estrearCarreira(partidaId),
    staleTime: Number.POSITIVE_INFINITY,
  });

  const jogar = useMutation({
    mutationFn: (acao: Acao) => executar(partidaId, acao),
    onSuccess: (situacao) => consultas.setQueryData(chave, situacao),
  });

  if (carreira.isPending) return <Centro>Preparando sua estreia...</Centro>;
  if (carreira.isError) {
    return <Centro>{mensagemDeErro(carreira.error, "Não foi possível iniciar a carreira.")}</Centro>;
  }

  const situacao = carreira.data;

  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-7 sm:px-6">
      <Cabecalho situacao={situacao} />
      <RankingDaCarreira
        key={`${situacao.estado.etapa}-${situacao.carreira.totalDeLutas}`}
        situacao={situacao}
      />

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
          <Ofertas
            ofertas={situacao.ofertas}
            carregando={jogar.isPending}
            aceitar={(indice) => jogar.mutate({ tipo: "aceitar", indice })}
          />
          <PainelDeDecisao
            situacao={situacao}
            carregando={jogar.isPending}
            agir={(acao) => jogar.mutate(acao)}
          />
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

function Ofertas({ ofertas, carregando, aceitar }: { ofertas: OfertaDeLuta[]; carregando: boolean; aceitar: (indice: number) => void }) {
  return (
    <section>
      <TituloAngular>Ofertas na mesa</TituloAngular>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {ofertas.map((oferta, indice) => (
          <Painel key={oferta.indice} destaque={oferta.valendoCinturao} className="animate-entrada" style={{ animationDelay: `${indice * 100}ms` }}>
            <div className="flex h-full flex-col p-5">
              <Etiqueta className={oferta.valendoCinturao ? "text-legado-claro" : undefined}>
                {oferta.valendoCinturao ? "Valendo cinturão" : `${oferta.roundsProgramados} rounds`}
              </Etiqueta>
              <h2 className="mt-1 text-2xl leading-none">{oferta.adversario}</h2>
              <p className="text-aco mt-1 text-xs">{oferta.cartelDoAdversario} · {ESTILOS[oferta.estiloDoAdversario]}</p>
              <p className="text-aco-claro my-4 text-sm leading-snug">{oferta.chamada}</p>
              <div className="mb-4 flex items-end justify-between border-y border-grafite-borda py-3">
                <span className="text-aco text-xs">{oferta.categoriaTexto}</span>
                <Numero rotulo="Overall" valor={oferta.overallDoAdversario} />
              </div>
              <div className="mt-auto">
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

function PainelDeDecisao({ situacao, carregando, agir }: { situacao: SituacaoDaCarreira; carregando: boolean; agir: (acao: Acao) => void }) {
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
          <Botao variante="contorno" disabled={carregando} onClick={() => agir({ tipo: "recusar" })}>Recusar ofertas</Botao>
          <p className="text-aco mb-2 text-[11px] leading-snug">Recusar consome tempo. Três recusas seguidas causam dispensa.</p>
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
    case "aceitar": return api.aceitarOferta(partidaId, acao.indice);
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
