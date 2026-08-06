import { getImageProps } from "next/image";

import { BotaoLink } from "@/components/jogo/botao";
import { Cabeca3dAdiada } from "@/components/jogo/cabeca-3d-adiada";
import { Marca } from "@/components/jogo/marca";

const ETAPAS = [
  { numero: "01", titulo: "Oito atletas", texto: "O sorteio não revela quem vem depois." },
  { numero: "02", titulo: "Uma habilidade", texto: "Cada escolha fecha uma porta para sempre." },
  { numero: "03", titulo: "Um legado", texto: "A carreira decide se o seu nome será lembrado." },
];

/**
 * Abertura do jogo. As duas imagens têm enquadramentos próprios, então o
 * navegador escolhe a arte correta em vez de apenas cortar a versão desktop.
 */
export default function PaginaInicial() {
  const comum = { alt: "", sizes: "100vw" };
  const {
    props: { srcSet: desktop },
  } = getImageProps({
    ...comum,
    src: "/fundoPc-v2.png",
    width: 1672,
    height: 941,
    quality: 75,
  });
  const {
    props: { srcSet: mobile, ...imagem },
  } = getImageProps({
    ...comum,
    src: "/fundoMobile.png",
    width: 1024,
    height: 1536,
    quality: 75,
  });

  return (
    <main className="bg-grafite flex-1">
      <section className="home-hero relative isolate flex min-h-[calc(100svh-61px)] overflow-hidden">
        <picture className="absolute inset-0 -z-30">
          <source media="(min-width: 768px)" srcSet={desktop} />
          <source srcSet={mobile} />
          <img
            {...imagem}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className="h-full w-full object-cover object-[center_32%] md:object-[center_45%]"
          />
        </picture>

        <div aria-hidden className="home-hero-sombra absolute inset-0 -z-20" />

        {/* Fica acima da sombra, para não ser escurecido junto com a foto, e
            abaixo do ruído, que passa por cima dele e o costura ao resto da
            arte. Só no desktop: no celular o conteúdo ocupa a tela toda e não
            sobraria espaço para a cabeça aparecer inteira. */}
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 -z-[15] hidden w-1/2 md:block lg:w-[55%]"
        >
          <Cabeca3dAdiada />
        </div>

        <div aria-hidden className="home-hero-ruido absolute inset-0 -z-10 opacity-30" />

        <div className="mx-auto flex w-full max-w-6xl flex-col justify-end px-6 pb-12 pt-16 md:justify-center md:px-8 md:py-20">
          <div className="animate-entrada flex max-w-xl flex-col items-center text-center md:items-start md:text-left">
            <div className="mb-5 flex items-center gap-3 text-[10px] font-semibold tracking-[0.32em] text-white/60 uppercase md:text-xs">
              <span className="bg-fight h-px w-9" />
              Toda escolha deixa uma marca
            </div>

            <Marca
              tamanho={390}
              className="w-[250px] drop-shadow-[0_10px_35px_rgba(0,0,0,0.95)] sm:w-[310px] md:w-[390px]"
            />

            <h1 className="sr-only">MMA Legacy</h1>
            <p className="mt-5 max-w-md text-sm leading-6 font-medium text-white/78 sm:text-base sm:leading-7 md:mt-7">
              Todo mundo entra achando que vai ser campeão. Monte o seu lutador,
              encare a carreira inteira e descubra se você é diferente.
            </p>

            <BotaoLink
              href="/criar"
              apoio="Oito escolhas. Nenhuma volta atrás."
              className="mt-8 min-w-64 md:mt-9"
            >
              Entrar no octógono
            </BotaoLink>

            <div className="mt-9 grid w-full max-w-lg grid-cols-3 border-y border-white/12 bg-black/15 backdrop-blur-[2px] md:mt-12">
              {ETAPAS.map((etapa) => (
                <div
                  key={etapa.numero}
                  className="border-white/12 px-2 py-3 text-left not-last:border-r sm:px-4"
                >
                  <span className="font-display text-fight-claro text-lg font-bold">
                    {etapa.numero}
                  </span>
                  <p className="font-display mt-0.5 text-[10px] font-semibold tracking-wide text-white uppercase sm:text-xs">
                    {etapa.titulo}
                  </p>
                  <p className="mt-1 hidden text-[10px] leading-4 text-white/45 sm:block">
                    {etapa.texto}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          aria-hidden
          className="absolute right-5 bottom-5 hidden items-center gap-3 font-display text-[10px] tracking-[0.28em] text-white/35 uppercase lg:flex"
        >
          Escolha · Construa · Sobreviva
          <span className="bg-fight h-px w-12" />
        </div>
      </section>
    </main>
  );
}
