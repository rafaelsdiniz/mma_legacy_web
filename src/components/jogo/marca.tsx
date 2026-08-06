import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * A logo do jogo.
 *
 * Espera o arquivo em `public/marca/mma-legacy.png`. Enquanto ele não existir,
 * o texto abaixo aparece no lugar e mantém a hierarquia certa — MMA em gelo,
 * LEGACY em vermelho, dentro do octógono.
 */
export function Marca({
  className,
  tamanho = 220,
}: {
  className?: string;
  tamanho?: number;
}) {
  return (
    <Image
      src="/marca/mma-legacy.png"
      alt="MMA Legacy"
      width={tamanho}
      height={Math.round(tamanho * 0.58)}
      priority
      className={cn("h-auto", className)}
    />
  );
}

/** Versão em texto, para cabeçalhos internos onde a logo cheia pesaria demais. */
export function MarcaTexto({ className }: { className?: string }) {
  return (
    <span className={cn("font-display leading-none font-bold tracking-tight", className)}>
      <span className="text-gelo">MMA</span>
      <span className="text-fight-claro"> LEGACY</span>
    </span>
  );
}
