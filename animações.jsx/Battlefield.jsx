import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import GameCard from './GameCard';

const Battlefield = () => {
  // Referências para controlar as cartas diretamente
  const playerCardRef = useRef();
  const enemyCardRef = useRef();

  const handleAttack = () => {
    if (playerCardRef.current && enemyCardRef.current) {
      // 1. Pegar posição do inimigo
      // Nota: Em uma app real, você teria isso no state, aqui acessamos direto a prop visual
      const enemyPos = [0, 3, 0]; 

      // 2. Ordenar que a carta do jogador ataque aquela posição
      playerCardRef.current.attack(enemyPos);

      // 3. Agendar o "dano" na carta inimiga para acontecer no momento do impacto
      setTimeout(() => {
        enemyCardRef.current.takeDamage();
        // Adicionar efeitos sonoros ou partículas aqui
      }, 250); // Sincronizado com a duração do 'backIn' da animação de ataque
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#121212' }}>
      {/* UI Button para testar o ataque */}
      <button 
        onClick={handleAttack}
        style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, padding: '10px 20px', fontSize: '20px' }}
      >
        ⚔️ EXECUTAR ATAQUE
      </button>

      <Canvas camera={{ position: [0, -6, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 5]} intensity={1} castShadow />
        
        {/* CARTA DO JOGADOR (Mão/Mesa) */}
        <GameCard 
          ref={playerCardRef}
          position={[0, -2, 0]} 
          color="#4a90e2" 
          name="Herói" 
          onPlayCard={() => console.log("Carta jogada na mesa!")}
        />

        {/* CARTA INIMIGA (Mesa Oposta) */}
        <GameCard 
          ref={enemyCardRef}
          position={[0, 3, 0]} 
          color="#e74c3c" 
          name="Boss" 
          isEnemy={true}
        />

        {/* Mesa */}
        <mesh position={[0, 0, -1]} receiveShadow>
          <planeGeometry args={[20, 15]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>

        <ContactShadows opacity={0.7} scale={20} blur={2} far={4} />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
};

export default Battlefield;