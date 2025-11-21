import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import Card from './Card';

const GameBoard = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      <Canvas shadows>
        {/* Câmera posicionada como o jogador olhando para a mesa */}
        <PerspectiveCamera makeDefault position={[0, -6, 12]} fov={50} rotation={[0.4, 0, 0]} />
        
        {/* Iluminação Dramática */}
        <ambientLight intensity={0.5} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.3} 
          penumbra={1} 
          intensity={1.5} 
          castShadow 
        />
        <pointLight position={[-10, -10, 5]} intensity={0.5} color="blue" />

        {/* O Tabuleiro (Mão do Jogador) */}
        <group position={[0, -2, 0]}>
          {/* Cartas organizadas em arco seria o próximo passo, aqui estão em linha */}
          <Card position={[-3.5, 0, 0]} name="Mago de Fogo" attack={6} health={4} color="#8B0000" />
          <Card position={[0, 0, 0]} name="Guardião" attack={2} health={8} color="#4682B4" />
          <Card position={[3.5, 0, 0]} name="Ladino" attack={5} health={2} color="#2E8B57" />
        </group>

        {/* Chão/Mesa para receber sombras */}
        <mesh position={[0, -5, -2]} rotation={[-Math.PI / 4, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#111" transparent opacity={0.8} />
        </mesh>

        {/* Sombras de contato para realismo quando a carta flutua */}
        <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000" />
        
        {/* Reflexos ambientais */}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default GameBoard;