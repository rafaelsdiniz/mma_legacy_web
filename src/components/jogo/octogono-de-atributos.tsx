"use client";

import { useState } from "react";

import type { Habilidade, NotaDeHabilidade } from "@/lib/api/tipos";
import { cn } from "@/lib/utils";

/**
 * A silhueta do lutador: os oito atributos desenhados sobre o octógono da marca.
 *
 * O papel deste gráfico é **reconhecimento**, não leitura precisa. A forma diz
 * num relance que tipo de lutador foi montado — pontudo para o especialista,
 * cheio para o completo — e é ela que aparece no card compartilhável. Quem
 * carrega os números exatos é a lista de barras ao lado, que funciona também
 * como a versão em tabela deste gráfico.
 *
 * Cores: o traço usa o vermelho claro (#e0202f) e não o vermelho da marca
 * porque o da marca fica em 2,95:1 contra o fundo do card — abaixo do mínimo
 * de 3:1. O dourado marca o pico e a grade usa o cinza aço, que é recessivo
 * de propósito.
 */

const ABREVIACOES: Record<Habilidade, string> = {
  Striking: "STR",
  Potencia: "POT",
  Velocidade: "VEL",
  Wrestling: "WRE",
  JiuJitsu: "JIU",
  Cardio: "CAR",
  Resistencia: "RES",
  InteligenciaDeLuta: "IQ",
};

const TAMANHO = 320;
const CENTRO = TAMANHO / 2;
const RAIO = 108;
const RAIO_DO_ROTULO = RAIO + 34;
const ANEIS = [0.25, 0.5, 0.75, 1];

/** Ângulo do i-ésimo vértice, começando no topo e girando no sentido horário. */
function angulo(indice: number, total: number) {
  return (indice / total) * 2 * Math.PI - Math.PI / 2;
}

function ponto(indice: number, total: number, raio: number) {
  const a = angulo(indice, total);
  return { x: CENTRO + raio * Math.cos(a), y: CENTRO + raio * Math.sin(a) };
}

function poligono(pontos: { x: number; y: number }[]) {
  return pontos.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

export function OctogonoDeAtributos({
  atributos,
  className,
}: {
  atributos: NotaDeHabilidade[];
  className?: string;
}) {
  const [emFoco, setEmFoco] = useState<number | null>(null);

  const total = atributos.length;
  const notaMaxima = Math.max(...atributos.map((a) => a.nota));

  const grade = ANEIS.map((fracao) =>
    poligono(
      Array.from({ length: total }, (_, indice) => ponto(indice, total, RAIO * fracao)),
    ),
  );

  const vertices = atributos.map((atributo, indice) =>
    ponto(indice, total, (atributo.nota / 100) * RAIO),
  );

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${TAMANHO} ${TAMANHO}`}
        className="h-auto w-full max-w-[360px]"
        role="img"
        aria-label={`Atributos do lutador: ${atributos
          .map((a) => `${a.nome} ${a.nota}`)
          .join(", ")}.`}
      >
        {/* Grade: anéis concêntricos e raios, recessivos por design. */}
        <g stroke="#4a4f57" fill="none">
          {grade.map((anel, indice) => (
            <polygon
              key={anel}
              points={anel}
              strokeWidth={1}
              opacity={indice === ANEIS.length - 1 ? 0.55 : 0.22}
            />
          ))}
          {atributos.map((atributo, indice) => {
            const fim = ponto(indice, total, RAIO);
            return (
              <line
                key={atributo.habilidade}
                x1={CENTRO}
                y1={CENTRO}
                x2={fim.x}
                y2={fim.y}
                strokeWidth={1}
                opacity={0.18}
              />
            );
          })}
        </g>

        {/* A silhueta. */}
        <polygon
          points={poligono(vertices)}
          fill="#e0202f"
          fillOpacity={0.24}
          stroke="#e0202f"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Marcadores: o pico em dourado, o resto em vermelho. */}
        {vertices.map((vertice, indice) => {
          const ehPico = atributos[indice].nota === notaMaxima;
          const ativo = emFoco === indice;

          return (
            <circle
              key={atributos[indice].habilidade}
              cx={vertice.x}
              cy={vertice.y}
              r={ativo ? 6 : 4.5}
              fill={ehPico ? "#d9a83f" : "#e0202f"}
              stroke="#141418"
              strokeWidth={2}
            />
          );
        })}

        {/* Rótulos diretos: com oito eixos cabem todos, e é o que dispensa legenda. */}
        {atributos.map((atributo, indice) => {
          const posicao = ponto(indice, total, RAIO_DO_ROTULO);
          const ehPico = atributo.nota === notaMaxima;

          return (
            <g key={atributo.habilidade} className="pointer-events-none">
              <text
                x={posicao.x}
                y={posicao.y - 3}
                textAnchor="middle"
                className="font-display fill-aco-claro text-[11px] tracking-widest"
              >
                {ABREVIACOES[atributo.habilidade]}
              </text>
              <text
                x={posicao.x}
                y={posicao.y + 12}
                textAnchor="middle"
                className={cn(
                  "font-display text-[15px] font-bold tabular-nums",
                  ehPico ? "fill-legado-claro" : "fill-gelo",
                )}
              >
                {atributo.nota}
              </text>
            </g>
          );
        })}

        {/* Alvos de toque generosos, bem maiores que os marcadores. */}
        {vertices.map((vertice, indice) => (
          <circle
            key={`alvo-${atributos[indice].habilidade}`}
            cx={vertice.x}
            cy={vertice.y}
            r={18}
            fill="transparent"
            onMouseEnter={() => setEmFoco(indice)}
            onMouseLeave={() => setEmFoco(null)}
          />
        ))}
      </svg>

      {emFoco !== null && (
        <div className="bg-grafite-claro border-grafite-borda pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 border px-3 py-1.5 text-center">
          <p className="font-display text-xs tracking-widest uppercase">
            {atributos[emFoco].nome}
          </p>
          <p className="font-display text-legado-claro text-xl leading-none font-bold">
            {atributos[emFoco].nota}
          </p>
        </div>
      )}
    </div>
  );
}
