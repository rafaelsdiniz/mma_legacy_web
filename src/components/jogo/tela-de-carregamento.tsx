import { Marca } from "@/components/jogo/marca";

/**
 * Tela de carregamento da aplicação.
 *
 * Não é um spinner genérico de propósito: é o primeiro contato de quem chega
 * pelo link compartilhado, e a marca aparecendo enquanto a rota carrega já é
 * parte da experiência. O octógono girando ecoa o do logo, e a barra embaixo
 * dá a sensação de progresso sem prometer uma porcentagem que não existe.
 */
export function TelaDeCarregamento({
  mensagem = "Preparando a arena",
}: {
  mensagem?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="textura-arena bg-grafite fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 px-6"
    >
      {/* Halo vermelho, o mesmo refletor de arena da home. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(193,18,31,0.18),transparent_70%)] blur-2xl"
      />

      <div className="relative">
        <Marca tamanho={260} />

        {/* O octógono da marca, redesenhado girando em volta da logo. */}
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          className="absolute top-1/2 left-1/2 size-[150%] -translate-x-1/2 -translate-y-1/2 animate-spin opacity-70 [animation-duration:6s]"
        >
          <polygon
            points="35,4 65,4 96,35 96,65 65,96 35,96 4,65 4,35"
            fill="none"
            stroke="#c1121f"
            strokeWidth="1"
            strokeDasharray="26 14"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="relative flex flex-col items-center gap-3">
        <p className="font-display text-aco-claro text-sm tracking-[0.3em] uppercase">
          {mensagem}
        </p>

        {/* Barra indeterminada: informa que algo acontece sem inventar um número. */}
        <div className="bg-grafite-borda h-0.5 w-48 overflow-hidden">
          <div className="bg-fight h-full w-1/3 animate-[carregando_1.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
