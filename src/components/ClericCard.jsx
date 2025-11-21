import React, { useState } from 'react';
import { Text } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

const ClericCard = ({
  position = [0, 0, 0],
  card = {},
  targetPosition,
  isAttacking = false,
  onAttackComplete = () => {},
  isHealing = false,
  onHealComplete = () => {},
  isHealingOther = false,
  healTargetPosition,
  onHealOtherComplete = () => {}
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Load textures
  const frontTexture = React.useMemo(() => new THREE.TextureLoader().load(card.image || 'https://via.placeholder.com/300x450'), [card.image]);
  const backTexture = React.useMemo(() => new THREE.TextureLoader().load('https://via.placeholder.com/300x450/000000/FFFFFF?text=Back'), []);

  // Variants for animations
  const cardVariants = {
    idle: { y: 0, scale: 1 },
    idleCleric: { y: [0, 0.2, 0], scale: 1, transition: { duration: 2, repeat: Infinity } },
    attackWindup: { x: -0.5, scale: [1, 0.9, 1.1], transition: { type: 'spring', stiffness: 500 } },
    attackThrust: { x: targetPosition ? (targetPosition[0] - position[0] - 0.1) : 0, scale: [1.1, 1.2, 0.9], transition: { type: 'spring', stiffness: 800, damping: 15 } },
    attackImpact: { x: targetPosition ? (targetPosition[0] - position[0] - 0.1) : 0, scale: [0.9, 1.3, 0.8], transition: { type: 'spring', stiffness: 700, damping: 5 } },
    attackRecoil: { x: 0, scale: 1, transition: { type: 'spring', stiffness: 300 } },
  };

  const healVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: [0, 3, 5, 1], opacity: [0, 1, 0.5, 0], transition: { duration: 2 } },
  };

  const castVariants = {
    hidden: { scale: 0, opacity: 0, x: 0 },
    visible: { 
      scale: [0, 1.5, 3, 0], 
      opacity: [0, 0.8, 1, 0], 
      x: healTargetPosition ? (healTargetPosition[0] - position[0]) : 0, 
      transition: { duration: 1.5, ease: 'easeOut' } 
    },
  };

  const currentState = React.useMemo(() => {
    if (card.type === 'Cleric') return 'idleCleric';
    return 'idle';
  }, [card.type]);

  const animateAttack = async () => {
    if (!isAttacking || !targetPosition) return;

    setIsAnimating(true);
    // Wind-up
    // Thrust
    await new Promise(res => setTimeout(res, 300));
    // Assume onAttackComplete is called after animation
    setIsAnimating(false);
    onAttackComplete();
  };

  React.useEffect(() => {
    animateAttack();
  }, [isAttacking, targetPosition]);

  React.useEffect(() => {
    if (isHealing) {
      setTimeout(onHealComplete, 2000);
    }
  }, [isHealing, onHealComplete]);

  React.useEffect(() => {
    if (isHealingOther) {
      setTimeout(onHealOtherComplete, 1500);
    }
  }, [isHealingOther, onHealOtherComplete]);

  return (
    <>
      <motion.group
        position={position}
        initial="idle"
        animate={isAnimating ? "attackRecoil" : currentState}
        variants={cardVariants}
      >
        <motion.mesh>
          {/* Front card */}
          <boxGeometry args={[3, 4.5, 0.05]} />
          <meshStandardMaterial map={frontTexture} emissive={isAnimating ? "#ffd700" : "#000"} emissiveIntensity={isAnimating ? 0.5 : 0} />
        </motion.mesh>

        {/* Back side */}
        <mesh position={[0, 0, -0.06]}>
          <boxGeometry args={[3, 4.5, 0.01]} />
          <meshStandardMaterial map={backTexture} />
        </mesh>

        {/* Cleric golden emissive rim */}
        {card.type === 'Cleric' && (
          <mesh position={[0, 0, 0.03]} castShadow>
            <ringGeometry args={[1.45, 1.55, 64]} />
            <meshStandardMaterial
              color="#ffd700"
              emissive="#ffd700"
              emissiveIntensity={0.3}
            />
          </mesh>
        )}

        {/* Stats text */}
        <Text position={[-1.2, -1.8, 0.06]} fontSize={0.4} color="black">
          ⚔️ {card.attack || 0}
        </Text>
        <Text position={[1.2, -1.8, 0.06]} fontSize={0.4} color="black">
          🛡️ {card.defense || 0}
        </Text>

        {/* Heal aura for self/other */}
        {card.type === 'Cleric' && (isHealing || isHealingOther) && (
          <motion.mesh
            position={[0, 2, 0.07]}
            initial="hidden"
            animate="visible"
            variants={healVariants}
            whileInView="visible"
          >
            <cylinderGeometry args={[1, 1, 4]} />
            <motion.meshStandardMaterial
              color="#00ff00"
              transparent
              emissive="#00ff00"
              emissiveIntensity={0.5}
            />
          </motion.mesh>
        )}

        {/* Cast beam for healing other cards */}
        {card.type === 'Cleric' && isHealingOther && (
          <motion.mesh
            position={[0, 1, 0.1]}
            initial="hidden"
            animate="visible"
            variants={castVariants}
          >
            <cylinderGeometry args={[0.1, 0.3, 2]} />
            <motion.meshStandardMaterial
              color="#a0ffa0"
              transparent
              emissive="#a0ffa0"
              emissiveIntensity={0.8}
            />
          </motion.mesh>
        )}
      </motion.group>

      {/* Dynamic lighting during attack */}
      {isAnimating && (
        <pointLight position={[position[0], position[1] + 2, position[2] + 2]} intensity={2} color="#ffff00" decay={2} distance={10} />
      )}
    </>
  );
};

export default ClericCard;
