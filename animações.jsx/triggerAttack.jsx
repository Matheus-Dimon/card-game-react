import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { motion } from 'framer-motion-3d';
import { useDrag } from '@use-gesture/react';
import { Text, useCursor } from '@react-three/drei';
import * as THREE from 'three';

// Configuração de animação "Snappy" (rápida e com impacto)
const SPRING_CONFIG = { type: "spring", stiffness: 500, damping: 30 };

const GameCard = forwardRef(({ 
  position, 
  color, 
  name, 
  isEnemy, 
  onPlayCard 
}, ref) => {
  const groupRef = useRef();
  const [hovered, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);
  
  // Estados de Animação
  const [animState, setAnimState] = useState("idle");
  const [targetPos, setTargetPos] = useState(position); // Posição alvo dinâmica

  useCursor(hovered); // Muda o cursor para pointer

  // Expondo a função de ataque para o componente pai (Mesa)
  useImperativeHandle(ref, () => ({
    // Função chamada quando esta carta deve atacar outra
    attack: (targetVector) => {
      // 1. Calcular vetor de direção
      const currentPos = new THREE.Vector3(...position);
      const target = new THREE.Vector3(...targetVector);
      
      // Calcula o ponto de impacto (vai até 80% do caminho para simular colisão)
      const direction = new THREE.Vector3().subVectors(target, currentPos).multiplyScalar(0.8);
      
      // Sequência de Animação Manual via variants não seria suficiente aqui 
      // pois a posição muda dinamicamente. Vamos usar o estado para controlar variants customizados.
      
      // Guardamos o vetor do impacto para usar na variante "attacking"
      groupRef.current.userData.attackVector = [
        position[0] + direction.x,
        position[1] + direction.y,
        position[2] + direction.z // Levanta um pouco para bater de cima
      ];

      setAnimState("attacking");
      
      // Retorna ao estado idle após o impacto (tempo da animação)
      setTimeout(() => {
        setAnimState("recovering"); // Pequeno recuo
        setTimeout(() => setAnimState("idle"), 300);
      }, 400);
    },
    
    // Função para receber dano (tremer)
    takeDamage: () => {
      setAnimState("hit");
      setTimeout(() => setAnimState("idle"), 300);
    }
  }));

  // Configuração do Drag & Drop
  const bind = useDrag(({ active, movement: [x, y], timeStamp, event }) => {
    if (isEnemy) return; // Não pode arrastar cartas do inimigo
    
    setDragging(active);
    
    if (active) {
      // Convertendo movimento 2D do mouse para coordenadas 3D relativas
      // Fator de divisão ajusta a sensibilidade dependendo do zoom da câmera
      const newPos = [
        position[0] + x / 40, 
        position[1] - y / 40, 
        position[2] + 3 // Levanta a carta enquanto arrasta
      ];
      setTargetPos(newPos);
      setAnimState("dragging");
    } else {
      // Soltou a carta
      if (targetPos[1] > 1.5) { 
        // Se soltou acima de Y=1.5, considera jogada na mesa
        onPlayCard && onPlayCard();
        setTargetPos([position[0], 2, 0]); // Vai para posição da mesa
        setAnimState("idle");
      } else {
        // Volta para a mão
        setTargetPos(position);
        setAnimState("idle");
      }
    }
  }, { filterTaps: true });

  // Variantes de Animação Complexas
  const variants = {
    idle: {
      x: position[0], y: position[1], z: position[2],
      rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1
    },
    hover: {
      z: position[2] + 1.5, scale: 1.2, rotateX: 0.1,
    },
    dragging: {
      x: targetPos[0], y: targetPos[1], z: targetPos[2],
      rotateX: 0.2, rotateZ: -0.1, scale: 1.1,
      transition: { type: "spring", stiffness: 800, damping: 20 } // Muito responsivo
    },
    attacking: {
      // Aqui pegamos o vetor calculado noimperative handle
      x: groupRef.current?.userData?.attackVector?.[0] || 0,
      y: groupRef.current?.userData?.attackVector?.[1] || 0,
      z: groupRef.current?.userData?.attackVector?.[2] || 0,
      rotateX: 0.6, // Inclina agressivamente para frente
      scale: 1.3,
      // Anticipation (pull back) -> Attack (fast)
      transition: { duration: 0.2, ease: "backIn" } 
    },
    hit: {
      x: [position[0], position[0] + 0.2, position[0] - 0.2, position[0]], // Shake
      rotateZ: [0, 0.1, -0.1, 0],
      color: "#ff0000", // Flash vermelho (precisa ser passado pro material, simplificado aqui)
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.group
      ref={groupRef}
      {...bind()}
      initial="idle"
      animate={dragging ? "dragging" : (animState === "idle" && hovered ? "hover" : animState)}
      variants={variants}
      transition={SPRING_CONFIG}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* Corpo da Carta */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.5, 3.5, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      
      {/* Visualização Frontal (Borda) */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[2.3, 3.3, 0.01]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      <Text position={[0, 0, 0.1]} fontSize={0.3} color="white">
        {name}
      </Text>
    </motion.group>
  );
});

export default GameCard;