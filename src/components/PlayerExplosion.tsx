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

interface PlayerExplosionProps {
  position: { x: number; y: number; z: number };
  onComplete: () => void;
}

const PlayerExplosion: React.FC<PlayerExplosionProps> = ({
  position,
  onComplete,
}) => {
  const group = useRef<Group>(null);
  const particles = useRef<Mesh[]>([]);
  const timeRef = useRef<number>(0);
  const duration = 2.5; // Longer duration for player explosion

  // Create particles on mount
  useEffect(() => {
    console.log(
      `Creating player explosion at position: ${JSON.stringify(position)}`
    );
    try {
      if (!group.current) {
        console.error("Group ref is null in PlayerExplosion component");
        return;
      }

      // Generate particles - more particles for player explosion
      const count = 40;
      particles.current = [];

      for (let i = 0; i < count; i++) {
        // Different colors for a more dramatic explosion
        const color =
          i % 3 === 0
            ? new Color(1, 0.3, 0) // orange
            : i % 3 === 1
            ? new Color(1, 0.7, 0) // yellow
            : new Color(0.7, 0.1, 0); // red

        const particle = new Mesh(
          new SphereGeometry(0.3 + Math.random() * 0.5, 8, 8), // Larger particles
          new MeshBasicMaterial({
            color,
            transparent: true,
            blending: AdditiveBlending,
            opacity: 0.9,
          })
        );

        // Random position offset - wider explosion
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 3;
        particle.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius - 0.5,
          Math.sin(angle * 2) * radius
        );

        // Random velocity - stronger explosion
        particle.userData.velocity = {
          x: (Math.random() - 0.5) * 6,
          y: Math.random() * 2 * 6, // More upward momentum
          z: (Math.random() - 0.5) * 6,
        };

        // Add smoke particles
        if (i % 4 === 0) {
          const smoke = new Mesh(
            new SphereGeometry(0.5 + Math.random() * 0.8, 8, 8),
            new MeshBasicMaterial({
              color: new Color(0.2, 0.2, 0.2),
              transparent: true,
              opacity: 0.6,
            })
          );

          smoke.position.set(
            Math.cos(angle) * radius * 0.7,
            Math.sin(angle) * radius * 0.7,
            Math.sin(angle * 2) * radius * 0.7
          );

          smoke.userData.velocity = {
            x: (Math.random() - 0.5) * 3,
            y: Math.random() * 3,
            z: (Math.random() - 0.5) * 3,
          };

          smoke.userData.isSmoke = true;
          particles.current.push(smoke);
          group.current.add(smoke);
        }

        particles.current.push(particle);
        group.current.add(particle);
      }

      // Reset timer when explosion is created
      timeRef.current = 0;
      console.log(
        `Player explosion created with ${particles.current.length} particles`
      );

      return () => {
        console.log("Cleaning up player explosion");
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
      console.error("Error in PlayerExplosion useEffect:", error);
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
      particles.current.forEach((particle) => {
        if (!particle) return;

        // Move according to velocity
        particle.position.x += particle.userData.velocity.x * delta;
        particle.position.y += particle.userData.velocity.y * delta;
        particle.position.z += particle.userData.velocity.z * delta;

        // Fade out over time
        const progress = timeRef.current / duration;
        if (particle.material && "opacity" in particle.material) {
          // Smoke fades out more slowly
          if (particle.userData.isSmoke) {
            particle.material.opacity = 0.6 * (1 - progress * 0.8);
          } else {
            particle.material.opacity = 1 - progress;
          }
        }

        // Add gravity effect for more realism
        particle.userData.velocity.y -= 1 * delta; // Gravity

        // Slow down over time
        particle.userData.velocity.x *= 0.98;
        particle.userData.velocity.z *= 0.98;

        // Smoke grows in size
        if (particle.userData.isSmoke) {
          const growFactor = 1 + progress;
          particle.scale.set(growFactor, growFactor, growFactor);
        } else {
          // Regular particles scale down
          const scale = 1 - progress * 0.5;
          particle.scale.set(scale, scale, scale);
        }
      });

      // Remove explosion when done
      if (timeRef.current >= duration) {
        console.log("Player explosion animation complete, calling onComplete");
        onComplete();
      }
    } catch (error) {
      console.error("Error in PlayerExplosion useFrame:", error);
      // If there's an error, still try to complete the explosion to avoid hanging
      onComplete();
    }
  });

  return <group ref={group} position={[position.x, position.y, position.z]} />;
};

export default PlayerExplosion;
