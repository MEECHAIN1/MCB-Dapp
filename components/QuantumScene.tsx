
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { Float, Sphere, Torus, Stars, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Fix: Use a comprehensive JSX augmentation to resolve intrinsic element errors for R3F
declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
  // Fallback for environments looking at the global JSX namespace
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

/**
 * QuantumEffect creates a holographic pulse overlay for the central orb.
 * It uses sine waves to modulate scale, opacity, and color for a "shimmering" effect.
 */
const QuantumEffect = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      // Pulse scale
      meshRef.current.scale.setScalar(1.05 + Math.sin(t * 2) * 0.05);

      // Hologram shimmer
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.2 + Math.sin(t * 4) * 0.1;
      
      // Cycle through MeeChain gold and mystical purple
      const hue = 0.1 + Math.sin(t * 0.5) * 0.05; // Around yellow/gold
      material.color.setHSL(hue, 0.8, 0.5);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.6, 64, 64]} />
      <meshBasicMaterial
        color="#C5A059"
        transparent
        opacity={0.3}
        wireframe
      />
    </mesh>
  );
};

const QuantumOrb = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.2;
      meshRef.current.rotation.z = t * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <meshStandardMaterial
        color="#C5A059"
        emissive="#4F46E5"
        emissiveIntensity={0.5}
        metalness={0.9}
        roughness={0.1}
        wireframe
      />
    </mesh>
  );
};

const MacroscopicWave = () => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
       const t = state.clock.getElapsedTime();
       ref.current.rotation.x = Math.sin(t * 0.2) * 0.1;
       ref.current.rotation.y = t * 0.05;
    }
  });

  return (
    <Torus ref={ref} args={[3, 0.02, 12, 64]} rotation={[Math.PI / 2, 0, 0]}>
      <meshStandardMaterial 
        color="#C5A059" 
        emissive="#C5A059" 
        emissiveIntensity={0.4} 
        transparent 
        opacity={0.1} 
        wireframe 
      />
    </Torus>
  );
}

export const HeroScene: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 45 }} 
        dpr={[1, 1.5]} 
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          
          <Float speed={1.2} rotationIntensity={0.5} floatIntensity={0.5}>
            <QuantumOrb />
            <QuantumEffect />
            <MacroscopicWave />
          </Float>

          <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
          <Environment preset="night" />
        </Suspense>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};
