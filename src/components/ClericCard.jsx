import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

const ClericCard = ({
  position = [0, 0, 0],
  card = {},
  targetPosition,
  isAttacking = false,
  onAttackComplete = () => {},
  isHealing = false,
  onHealComplete = () => {}
}) => {
  const meshRef = useRef();

  // Load textures (placeholder URLs, replace with actual)
  const frontTexture = useMemo(() => new THREE.TextureLoader().load(card.image || 'https://via.placeholder.com/300x450'), [card.image]);
  const backTexture = useMemo(() => new THREE.TextureLoader().load('https://via.placeholder.com/300x450/000000/FFFFFF?text=Back'), []);

  // Idle bob animation for Cleric
  const [idleSpring, idleApi] = useSpring(() => ({
    positionY: position[1],
    emissive: 0.1,
    loop: true,
    config: { tension: 180, friction: 12 },
  }));

  React.useEffect(() => {
    if (card.type === 'Cleric') {
      idleApi.start({
        from: { positionY: position[1], emissive: 0.1 },
        to: [
          { positionY: position[1] + 0.2, emissive: 0.2 },
          { positionY: position[1], emissive: 0.1 },
        ],
        loop: { reverse: true }
      });
    }
  }, [card.type, position[1], idleApi]);

  // Melee attack animation: Wind-up, Thrust, Impact, Recoil
  const [attackSpring, attackApi] = useSpring(() => ({
    positionX: position[0],
    scale: [1, 1, 1],
    emissive: card.type === 'Cleric' ? 0.1 : 0,
    config: { tension: 300, friction: 20 },
  }));

  React.useEffect(() => {
    if (isAttacking && targetPosition) {
      const originalX = position[0];
      const targetX = targetPosition[0];

      attackApi.start({
        // Wind-up: slight pullback using backIn
        to: { positionX: originalX - 0.5, scale: [0.9, 1.1, 1], emissive: 0.3 },
        delay: 0,
        config: { tension: 400, friction: 20 },
      }).then(() => {
        // Thrust: rapid movement
        return attackApi.start({
          to: { positionX: targetX - 0.1, scale: [1.2, 0.9, 1.1], emissive: 0.5 },
          config: { tension: 600, friction: 15 },
        });
      }).then(() => {
        // Impact: stiff compression
        return attackApi.start({
          to: { scale: [1.3, 0.8, 1.2], emissive: 0.7 },
          config: { frequency: 0.3, damping: 0.9 }, // elasticOut
        });
      }).then(() => {
        // Recoil: bounce back
        return attackApi.start({
          to: { positionX: originalX, scale: [1, 1, 1], emissive: card.type === 'Cleric' ? 0.1 : 0 },
          config: { tension: 300, friction: 25 },
        });
      }).then(() => {
        onAttackComplete();
      });
    }
  }, [isAttacking, targetPosition, position[0], attackApi, onAttackComplete, card.type]);

  // Heal animation for Cleric
  const [healSpring, healApi] = useSpring(() => ({
    auraScale: 1,
    auraOpacity: 0,
    config: { tension: 200, friction: 12 },
  }));

  React.useEffect(() => {
    if (isHealing && card.type === 'Cleric') {
      healApi.start({
        from: { auraScale: 1, auraOpacity: 0 },
        to: [
          { auraScale: 3, auraOpacity: 1 },
          { auraScale: 5, auraOpacity: 0.5 },
          { auraScale: 1, auraOpacity: 0 },
        ],
      }).then(() => {
        onHealComplete();
      });
    }
  }, [isHealing, card.type, healApi, onHealComplete]);

  // Update idle position Y
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y = idleSpring.positionY.get();
    }
  });

  return (
    <>
      <animated.group
        position={[attackSpring.positionX.get(), position[1], position[2]]}
        scale={attackSpring.scale}
      >
        <animated.mesh ref={meshRef} emissive={[attackSpring.emissive.get(), attackSpring.emissive.get() * 0.8, 0]}>
          {/* Front card */}
          <boxGeometry args={[3, 4.5, 0.05]} />
          <animated.meshStandardMaterial
            map={frontTexture}
            emissive="#ffd700"
            emissiveIntensity={attackSpring.emissive}
          />
        </animated.mesh>

        {/* Back side */}
        <mesh position={[0, 0, -0.06]}>
          <boxGeometry args={[3, 4.5, 0.01]} />
          <meshStandardMaterial map={backTexture} />
        </mesh>

        {/* Cleric golden emissive rim */}
        {card.type === 'Cleric' && (
          <mesh position={[0, 0, 0.03]} castShadow>
            <ringGeometry args={[1.45, 1.55, 64]} />
            <animated.meshStandardMaterial
              color="#ffd700"
              emissive="#ffd700"
              emissiveIntensity={idleSpring.emissive}
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

        {/* Heal aura column */}
        {card.type === 'Cleric' && (
          <animated.mesh position={[0, 2, 0.07]} scale={[healSpring.auraScale, 3, healSpring.auraScale]}>
            <cylinderGeometry args={[1, 1, 4]} />
            <animated.meshStandardMaterial
              color="#00ff00"
              transparent
              opacity={healSpring.auraOpacity}
              emissive="#00ff00"
              emissiveIntensity={0.5}
            />
          </animated.mesh>
        )}
      </animated.group>

      {/* Dynamic lighting during attack */}
      {isAttacking && (
        <pointLight
          position={[attackSpring.positionX.get(), position[1] + 2, position[2] + 2]}
          intensity={2}
          color="#ffff00"
          decay={2}
          distance={10}
        />
      )}
    </>
  );
};

export default ClericCard;
