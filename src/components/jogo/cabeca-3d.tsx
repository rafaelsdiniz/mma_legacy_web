"use client";

import { Environment, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import { Box3, Vector3, type Group } from "three";

const MODELO = "/alex-pereira.glb";

/** Decodificador Draco servido pelo próprio site, e não por CDN de terceiros. */
const DECODIFICADOR = "/draco/";

/**
 * Altura do modelo inteiro na cena, em unidades do mundo 3D.
 *
 * Com a câmera onde está, a altura visível é de cerca de 1,8 unidade. Deixar o
 * modelo em 1,2 dá folga em cima e embaixo — sem ela o topo da cabeça e os
 * ombros saem cortados pela borda, ainda mais quando o balanço inclina a peça.
 */
const ALTURA_ALVO = 1.2;

/**
 * Quanto girar para o rosto ficar de frente para a câmera, em radianos.
 *
 * O modelo veio pronto e nada garante que ele nasça olhando para a frente.
 * Se estiver mostrando a nuca, troque para `Math.PI`; se estiver de perfil,
 * `Math.PI / 2` ou `-Math.PI / 2`.
 */
const ROTACAO_FRONTAL = -Math.PI / 2;

/**
 * A amplitude e o ritmo do balanço.
 *
 * A cabeça não gira: ela oscila alguns graus em torno da frente, como quem está
 * parado mas vivo. Os períodos são propositalmente diferentes entre si e sem
 * divisor comum — se os dois batessem, o movimento fecharia um ciclo visível e
 * viraria animação de vitrine em vez de respiração.
 */
const BALANCO = {
  /** ~7° para os lados. */
  amplitudeHorizontal: 0.12,
  periodoHorizontal: 9,

  /** ~3° de inclinação, o aceno mínimo que tira a cabeça da rigidez. */
  amplitudeVertical: 0.05,
  periodoVertical: 6.5,
} as const;

/**
 * A cabeça em 3D que gira no fundo da home.
 *
 * O arquivo original tinha 27 MB, que é peso de vídeo, não de elemento
 * decorativo. Passou por compressão Draco na geometria e caiu para 2,7 MB — o
 * decodificador vive em `public/draco` em vez de vir de CDN, para a página não
 * depender de um domínio de terceiros para desenhar o próprio fundo.
 *
 * Ainda assim é o recurso mais caro do site, então quem manda aqui é o
 * `Suspense`: enquanto o modelo não chega, a home é exatamente o que sempre foi
 * — a imagem de fundo aparece na hora e o 3D entra por cima depois, sem segurar
 * o primeiro desenho da tela.
 */
export default function Cabeca3d() {
  return (
    <Canvas
      // O modelo é enfeite: não deve receber clique, foco nem leitura de tela.
      aria-hidden
      className="pointer-events-none"
      camera={{ position: [0, 0, 2.6], fov: 38 }}
      // Teto de 2x resiste a tela retina sem cobrar 4x de preenchimento no
      // celular, onde a GPU é a parte mais fraca do aparelho.
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={2.4} />
      {/* Contraluz avermelhada, para o volume da cabeça não sumir contra o
          fundo escuro do hero. */}
      <directionalLight position={[-4, 1, -3]} intensity={1.6} color="#c1121f" />

      <Suspense fallback={null}>
        <Modelo />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}

function Modelo() {
  const grupo = useRef<Group>(null);
  const { scene } = useGLTF(MODELO, DECODIFICADOR);

  // Modelo baixado pronto não tem escala nem origem combinadas com nada: pode
  // vir em centímetros, com o centro nos pés ou fora do eixo. Medir a caixa
  // que o envolve e normalizar a partir dela faz a cena funcionar sem depender
  // de números mágicos descobertos a olho — e continua funcionando se um dia
  // outro atleta entrar no lugar deste.
  const { escala, deslocamento } = useMemo(() => {
    const caixa = new Box3().setFromObject(scene);
    const tamanho = caixa.getSize(new Vector3());
    const centro = caixa.getCenter(new Vector3());
    const fator = ALTURA_ALVO / (tamanho.y || 1);

    return { escala: fator, deslocamento: centro.multiplyScalar(-fator) };
  }, [scene]);

  useFrame((estado) => {
    if (!grupo.current) return;

    // A rotação é atribuída a partir do tempo decorrido, e não somada quadro a
    // quadro. Somar acumularia erro e faria a cabeça derivar da frente ao longo
    // dos minutos; assim ela sempre volta exatamente ao ponto de partida.
    const tempo = estado.clock.elapsedTime;

    grupo.current.rotation.y =
      ROTACAO_FRONTAL +
      Math.sin((tempo / BALANCO.periodoHorizontal) * Math.PI * 2) * BALANCO.amplitudeHorizontal;

    grupo.current.rotation.x =
      Math.sin((tempo / BALANCO.periodoVertical) * Math.PI * 2) * BALANCO.amplitudeVertical;
  });

  return (
    <group ref={grupo}>
      <primitive object={scene} scale={escala} position={deslocamento} />
    </group>
  );
}

useGLTF.preload(MODELO, DECODIFICADOR);
