import { cn } from "@/lib/utils";

/**
 * A barra de estatística do padrão visual: rótulo à esquerda, trilho vermelho
 * no meio, nota à direita.
 *
 * A barra é sempre relativa a 100 — a escala inteira do jogo —, e não ao maior
 * valor da lista. Normalizar pelo maior faria um lutador de notas 40 parecer
 * tão forte quanto um de 95, que é exatamente a leitura que não pode acontecer
 * num jogo em que a nota é a moeda.
 */
export function BarraDeAtributo({
  nome,
  nota,
  destaque = false,
  apagado = false,
  className,
}: {
  nome: string;
  nota: number;
  /** Realça a barra, para a habilidade em foco no draft. */
  destaque?: boolean;
  /** Esmaece a barra, para habilidades já preenchidas em outra rodada. */
  apagado?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        apagado && "opacity-40 grayscale",
        className,
      )}
    >
      <span className="font-display w-28 shrink-0 text-sm tracking-wide uppercase">
        {nome}
      </span>

      <div className="bg-grafite-borda h-2 flex-1 overflow-hidden">
        <div
          className={cn(
            "h-full transition-[width] duration-500 ease-out",
            destaque ? "bg-legado" : "bg-fight",
          )}
          style={{ width: `${nota}%` }}
        />
      </div>

      <span
        className={cn(
          "font-display w-9 shrink-0 text-right text-lg leading-none font-bold tabular-nums",
          destaque && "text-legado-claro",
        )}
      >
        {nota}
      </span>
    </div>
  );
}
