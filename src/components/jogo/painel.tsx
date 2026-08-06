import { cn } from "@/lib/utils";

/**
 * O card com bordas angulares do padrão visual.
 *
 * O recorte é feito com dois elementos sobrepostos: o de fora é a "borda"
 * (preenchimento sólido na cor da borda) e o de dentro é o conteúdo, um pixel
 * menor. É o jeito de ter borda em `clip-path`, que não aceita `border`.
 */
export function Painel({
  children,
  className,
  destaque = false,
  ...resto
}: React.ComponentProps<"div"> & { destaque?: boolean }) {
  return (
    <div
      className={cn(
        "recorte-angular p-px",
        destaque ? "bg-fight/70" : "bg-grafite-borda",
        className,
      )}
      {...resto}
    >
      <div className="recorte-angular bg-card h-full w-full">{children}</div>
    </div>
  );
}

/**
 * Título angular: o texto com as marcas vermelhas de canto do padrão visual.
 */
export function TituloAngular({
  children,
  className,
  ...resto
}: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("relative inline-block px-4 py-1", className)} {...resto}>
      <span
        aria-hidden
        className="border-fight absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2"
      />
      <span
        aria-hidden
        className="border-fight absolute right-0 bottom-0 h-3 w-3 border-r-2 border-b-2"
      />
      {children}
    </h2>
  );
}

/** Rótulo pequeno em maiúsculas, usado acima de valores e em cabeçalhos. */
export function Etiqueta({ children, className, ...resto }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-aco-claro font-display text-xs tracking-[0.2em] uppercase",
        className,
      )}
      {...resto}
    >
      {children}
    </p>
  );
}
