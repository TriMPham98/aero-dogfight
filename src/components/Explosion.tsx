import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  Mesh,
  SphereGeometry,
  MeshBasicMaterial,
  Group,
} from "three";

interface ExplosionProps {
  position: { x: number; y: number; z: number };
  onComplete: () => void;
}

const Explosion: React.FC<ExplosionProps> = ({ position, onComplete }) => {
  const group = useRef<Group>(null);
  const particles = useRef<Mesh[]>([]);
  const timeRef = useRef<number>(0);
  const duration = 1.5; // Duration in seconds

  // Create particles on mount
  useEffect(() => {
    console.log(`Creating explosion at position: ${JSON.stringify(position)}`);
    try {
      if (!group.current) {
        console.error("Group ref is null in Explosion component");
        return;
      }

      // Generate particles
      const count = 20;
      particles.current = [];

      for (let i = 0; i < count; i++) {
        const particle = new Mesh(
          new SphereGeometry(0.2, 8, 8),
          new MeshBasicMaterial({
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

      // Reset timer when explosion is created
      timeRef.current = 0;
      console.log(
        `Explosion created with ${particles.current.length} particles`
      );

      return () => {
        console.log("Cleaning up explosion");
        // Proper cleanup of all particles and materials
        if (group.current) {
          particles.current.forEach((particle) => {
            if (particle.material) {
              if (Array.isArray(particle.material)) {
                particle.material.forEach((m) => m.dispose());
              } else {
                particle.material.dispose();
              }
            }
            if (particle.geometry) {
              particle.geometry.dispose();
            }
            group.current?.remove(particle);
          });
          particles.current = [];
        }
      };
    } catch (error) {
      console.error("Error in Explosion useEffect:", error);
      // Call onComplete to prevent hanging
      setTimeout(() => onComplete(), 0);
    }
  }, [position]);

  // Animate particles
  useFrame((_, delta) => {
    try {
      timeRef.current += delta;

      if (!group.current) return;

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
        console.log("Explosion animation complete, calling onComplete");
        onComplete();
      }
    } catch (error) {
      console.error("Error in Explosion useFrame:", error);
      // If there's an error, still try to complete the explosion to avoid hanging
      onComplete();
    }
  });

  return <group ref={group} position={[position.x, position.y, position.z]} />;
};

export default Explosion;
