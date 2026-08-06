import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * O CTA em destaque do padrão visual: bordas angulares vermelhas, título em
 * display condensada e uma linha de apoio embaixo.
 */
const BASE =
  "recorte-angular-suave group relative inline-flex flex-col items-center justify-center px-8 py-3 text-center font-display uppercase tracking-widest transition-all disabled:pointer-events-none disabled:opacity-45";

const VARIANTES = {
  destaque:
    "bg-fight text-gelo hover:bg-fight-claro shadow-[0_0_28px_-6px_rgba(193,18,31,0.75)] hover:shadow-[0_0_36px_-4px_rgba(224,32,47,0.9)]",
  contorno:
    "border border-grafite-borda bg-grafite-claro text-gelo hover:border-fight hover:text-fight-claro",
  fantasma: "text-aco-claro hover:text-gelo",
} as const;

type Variante = keyof typeof VARIANTES;

interface ConteudoDoBotao {
  children: React.ReactNode;
  apoio?: string;
  variante?: Variante;
  className?: string;
}

function Miolo({ children, apoio }: Pick<ConteudoDoBotao, "children" | "apoio">) {
  return (
    <>
      <span className="text-lg leading-tight font-bold">{children}</span>
      {apoio && (
        <span className="mt-0.5 text-[11px] font-medium tracking-[0.18em] opacity-75">
          {apoio}
        </span>
      )}
    </>
  );
}

export function Botao({
  children,
  apoio,
  variante = "destaque",
  className,
  ...resto
}: ConteudoDoBotao & React.ComponentProps<"button">) {
  return (
    <button className={cn(BASE, VARIANTES[variante], className)} {...resto}>
      <Miolo apoio={apoio}>{children}</Miolo>
    </button>
  );
}

export function BotaoLink({
  children,
  apoio,
  variante = "destaque",
  className,
  href,
}: ConteudoDoBotao & { href: string }) {
  return (
    <Link href={href} className={cn(BASE, VARIANTES[variante], className)}>
      <Miolo apoio={apoio}>{children}</Miolo>
    </Link>
  );
}
