"use client";

import dynamic from "next/dynamic";

/**
 * A fronteira de cliente que segura o 3D fora do pacote principal.
 *
 * Existe por uma restrição do Next: `ssr: false` só vale dentro de um Client
 * Component, e a home é um Server Component. Sem este arquivo, a única saída
 * seria importar o Three.js direto na página — que é justamente o que não se
 * quer, porque aí ele viria no primeiro carregamento junto com o texto e o
 * botão, que são o que a pessoa veio ver.
 */
const Cabeca3d = dynamic(() => import("./cabeca-3d"), { ssr: false });

export function Cabeca3dAdiada() {
  return <Cabeca3d />;
}
