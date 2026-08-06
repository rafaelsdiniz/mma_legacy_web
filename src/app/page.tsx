import { BotaoLink } from "@/components/jogo/botao";
import { Marca } from "@/components/jogo/marca";
import { Etiqueta, Painel } from "@/components/jogo/painel";

/**
 * Home.
 *
 * O trabalho desta tela é converter visitante em jogador num clique — por isso
 * não existe página de "como jogar". As três etapas abaixo dizem o essencial em
 * poucas palavras, e o resto o jogador aprende na primeira rodada do draft.
 */

const ETAPAS = [
  {
    numero: "01",
    titulo: "Oito atletas",
    texto: "O sorteio apresenta um por vez. Você não sabe quem vem depois.",
  },
  {
    numero: "02",
    titulo: "Uma habilidade de cada",
    texto:
      "Pegou a potência do Poatan? O slot fechou. O wrestling vai ter que vir de outro.",
  },
  {
    numero: "03",
    titulo: "Uma carreira inteira",
    texto: "Cartel, cinturões, mudança de categoria e o veredito do seu legado.",
  },
];

export default function PaginaInicial() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      {/* Halo vermelho ao fundo, no lugar do refletor da arena. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(193,18,31,0.16),transparent_68%)] blur-2xl"
      />

      <div className="relative flex w-full max-w-4xl flex-col items-center text-center">
        <Marca tamanho={300} className="animate-entrada" />

        <p className="text-aco-claro mt-8 max-w-xl text-base leading-relaxed sm:text-lg">
          Monte o lutador perfeito com as melhores habilidades das maiores
          referências do MMA e descubra até onde sua carreira chegaria.
        </p>

        <div className="mt-10">
          <BotaoLink href="/criar" apoio="Faça parte do legado">
            Montar meu lutador
          </BotaoLink>
        </div>

        <div className="mt-20 grid w-full gap-4 sm:grid-cols-3">
          {ETAPAS.map((etapa) => (
            <Painel key={etapa.numero} className="text-left">
              <div className="p-5">
                <span className="font-display text-fight text-3xl leading-none font-bold">
                  {etapa.numero}
                </span>
                <h3 className="mt-3 text-lg leading-tight">{etapa.titulo}</h3>
                <p className="text-aco-claro mt-2 text-sm leading-relaxed">
                  {etapa.texto}
                </p>
              </div>
            </Painel>
          ))}
        </div>

        <Etiqueta className="mt-16">
          Projeto independente · sem vínculo com organizações esportivas
        </Etiqueta>
      </div>
    </main>
  );
}
