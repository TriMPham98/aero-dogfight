import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Color } from "three";

interface ExplosionProps {
  position: { x: number; y: number; z: number };
  onComplete: () => void;
}

const Explosion: React.FC<ExplosionProps> = ({ position, onComplete }) => {
  const group = useRef<THREE.Group>(null);
  const particles = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef<number>(0);
  const duration = 1.5; // Duration in seconds

  // Create particles on mount
  useEffect(() => {
    if (!group.current) return;

    // Generate particles
    const count = 20;
    particles.current = [];

    for (let i = 0; i < count; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshBasicMaterial({
          color: new Color(1, 0.5, 0),
          transparent: true,
          blending: AdditiveBlending,
        })
      );

      // Random position offset
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 2;
      particle.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius - 0.5,
        Math.sin(angle * 2) * radius
      );

      // Random velocity
      particle.userData.velocity = {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 4,
      };

      particles.current.push(particle);
      group.current.add(particle);
    }

    return () => {
      if (group.current) {
        particles.current.forEach((particle) => {
          group.current?.remove(particle);
        });
      }
    };
  }, []);

  // Animate particles
  useFrame((_, delta) => {
    timeRef.current += delta;

    // Update particles
    particles.current.forEach((particle, i) => {
      if (!particle) return;

      // Move according to velocity
      particle.position.x += particle.userData.velocity.x * delta;
      particle.position.y += particle.userData.velocity.y * delta;
      particle.position.z += particle.userData.velocity.z * delta;

      // Fade out over time
      const progress = timeRef.current / duration;
      if (particle.material && "opacity" in particle.material) {
        particle.material.opacity = 1 - progress;
      }

      // Slow down over time
      particle.userData.velocity.x *= 0.98;
      particle.userData.velocity.y *= 0.98;
      particle.userData.velocity.z *= 0.98;

      // Scale down
      const scale = 1 - progress * 0.5;
      particle.scale.set(scale, scale, scale);
    });

    // Remove explosion when done
    if (timeRef.current >= duration) {
      onComplete();
    }
  });

  return <group ref={group} position={[position.x, position.y, position.z]} />;
};

export default Explosion;
