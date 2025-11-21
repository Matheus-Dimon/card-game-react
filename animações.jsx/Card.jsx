import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion-3d';
import { Text } from '@react-three/drei';

// Configurações de animação (Spring physics para sensação de peso)
const transition = { type: 'spring', stiffness: 300, damping: 20 };

const Card = ({ position, name, attack, health, color }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Variantes definem os estados visuais da carta
  const variants = {
    idle: { 
      y: position[1], 
      z: position[2], 
      scale: 1, 
      rotateX: 0, 
      rotateZ: 0 
    },
    hover: { 
      y: position[1] + 1.5, // Levanta a carta
      z: position[2] + 2,   // Traz para perto da câmera
      scale: 1.2, 
      rotateX: 0.2,         // Inclina levemente para o jogador
      rotateZ: 0,
      transition: { type: 'spring', stiffness: 400, damping: 15 }
    },
    active: {
      z: 1, 
      rotateX: 0.5,         // Prepara para atacar
      scale: 1.1
    }
  };

  return (
    <motion.group
      position={position}
      initial="idle"
      animate={isActive ? "active" : (isHovered ? "hover" : "idle")}
      variants={variants}
      transition={transition}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onClick={() => setIsActive(!isActive)}
    >
      {/* A Geometria da Carta (Com espessura) */}
      <mesh castShadow receiveShadow>
        {/* Largura, Altura, Espessura */}
        <boxGeometry args={[3, 4.5, 0.15]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Borda da Carta (simulando a moldura dourada/prata) */}
      <mesh position={[0, 0, -0.01]}>
         <boxGeometry args={[3.2, 4.7, 0.1]} />
         <meshStandardMaterial color="#222" />
      </mesh>

      {/* Texto/Stats na Carta */}
      <group position={[0, 0, 0.1]}>
        <Text position={[0, 1.5, 0]} fontSize={0.35} color="white" anchorX="center">
          {name}
        </Text>
        
        {/* Orbe de Ataque */}
        <mesh position={[-1.1, -1.8, 0]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
        <Text position={[-1.1, -1.8, 0.4]} fontSize={0.4} color="black">
          {attack}
        </Text>

        {/* Orbe de Vida */}
        <mesh position={[1.1, -1.8, 0]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="red" />
        </mesh>
        <Text position={[1.1, -1.8, 0.4]} fontSize={0.4} color="white">
          {health}
        </Text>
      </group>
    </motion.group>
  );
};

export default Card;