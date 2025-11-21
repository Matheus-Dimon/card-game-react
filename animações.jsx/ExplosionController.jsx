import React, { useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 30;

const ExplosionController = forwardRef(({ color = "#ffaa00" }, ref) => {
  const meshRef = useRef();
  
  // Criamos um objeto dummy para calcular as matrizes sem overhead
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Armazenamos o estado das partículas fora do React (em refs) para performance máxima (60FPS)
  const particles = useMemo(() => {
    return new Array(PARTICLE_COUNT).fill(0).map(() => ({
      time: 0,        // Tempo de vida atual
      life: 0,        // Tempo de vida total
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      scale: 1,
      active: false
    }));
  }, []);

  // Função exposta para iniciar a explosão
  useImperativeHandle(ref, () => ({
    explode: (x, y, z) => {
      particles.forEach((p) => {
        p.active = true;
        p.time = 0;
        p.life = 0.5 + Math.random() * 0.5; // Vive entre 0.5s e 1s
        
        // Posição inicial (origem do impacto)
        p.position.set(x, y, z);
        
        // Velocidade explosiva aleatória (esfera)
        p.velocity.set(
          (Math.random() - 0.5) * 10, // Espalha em X
          (Math.random() - 0.5) * 10, // Espalha em Y
          (Math.random() - 0.5) * 5   // Espalha em Z
        );
        
        // Variação de tamanho
        p.scale = 0.2 + Math.random() * 0.3;
      });
    }
  }));

  // O Loop de Animação (Roda 60 vezes por segundo)
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    let activeCount = 0;

    particles.forEach((p, i) => {
      if (!p.active) {
        // Se inativa, esconde a partícula (escala 0)
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        return;
      }

      activeCount++;

      // 1. Física: Atualiza Posição
      p.time += delta;
      p.position.add(p.velocity.clone().multiplyScalar(delta));
      
      // 2. Física: Gravidade (puxa para baixo)
      p.velocity.y -= 15 * delta; 
      
      // 3. Visual: Diminui conforme morre
      const progress = p.time / p.life;
      const currentScale = p.scale * (1 - progress); // Vai de 100% a 0%

      if (progress >= 1) {
        p.active = false;
      }

      // Atualiza a matriz da instância
      dummy.position.copy(p.position);
      dummy.scale.set(currentScale, currentScale, currentScale);
      // Adiciona uma rotação aleatória para parecer "pedaços" voando
      dummy.rotation.x += p.velocity.x * delta;
      dummy.rotation.z += p.velocity.y * delta;
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    // Avisa ao Three.js que as posições mudaram
    if (activeCount > 0) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]}>
      {/* Geometria: Dodecaedro parece "pedras" ou "faíscas" melhor que cubos */}
      <dodecahedronGeometry args={[0.2, 0]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={2} // Faz brilhar como fogo/magia
        toneMapped={false}    // Permite cores ultra-brilhantes
      />
    </instancedMesh>
  );
});

export default ExplosionController;