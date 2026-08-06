"use client";

import { Environment, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import { Box3, Vector3, type Group } from "three";

const MODELO = "/alex-pereira.glb";

/** Decodificador Draco servido pelo próprio site, e não por CDN de terceiros. */
const DECODIFICADOR = "/draco/";

/** Altura que a cabeça deve ocupar na cena, em unidades do mundo 3D. */
const ALTURA_ALVO = 1.6;

/** Voltas por minuto. Devagar o suficiente para não competir com o texto. */
const VOLTAS_POR_MINUTO = 1.5;

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

  useFrame((_, delta) => {
    if (!grupo.current) return;

    // Girar por tempo decorrido, e não por quadro, mantém a mesma velocidade em
    // tela de 60 Hz e de 144 Hz.
    grupo.current.rotation.y += delta * ((VOLTAS_POR_MINUTO * Math.PI * 2) / 60);
  });

  return (
    <group ref={grupo}>
      <primitive object={scene} scale={escala} position={deslocamento} />
    </group>
  );
}

useGLTF.preload(MODELO, DECODIFICADOR);
