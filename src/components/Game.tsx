import React, { useEffect, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import Airplane from "./Airplane";
import Ground from "./Ground";
import Explosion from "./Explosion";
import CameraFollower from "./CameraFollower";
import useStore from "../store/store";

interface Position {
  x: number;
  y: number;
  z: number;
}

interface ExplosionState {
  id: string;
  position: Position;
}

// Import Enemy type to fix type reference
interface Enemy {
  id: string;
  position: Position;
  rotation: { x: number; y: number; z: number };
  health: number;
}

const Game: React.FC = () => {
  const [explosions, setExplosions] = useState<ExplosionState[]>([]);
  const [lastExplosion, setLastExplosion] = useState<string | null>(null);

  const {
    playerPosition,
    playerRotation,
    setPlayerPosition,
    setPlayerRotation,
    bullets,
    spawnBullet,
    updateBullets,
    enemies,
    spawnEnemy,
    updateEnemies,
    removeEnemy,
  } = useStore();

  // One-time initialization
  useEffect(() => {
    console.log("Game component mounted");
    try {
      // Spawn initial enemies
      for (let i = 0; i < 3; i++) {
        // Create enemies at different angles around the player
        const angle = (i * Math.PI * 2) / 3; // Divide circle into 3 parts
        const distance = 30; // Start enemies further away

        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        console.log(`Spawning enemy at: x=${x}, z=${z}`);
        spawnEnemy({ x, y: 5, z });
      }
    } catch (error) {
      console.error("Error spawning initial enemies:", error);
    }

    // Cleanup on unmount
    return () => {
      console.log("Game component unmounting");
    };
  }, [spawnEnemy]);

  // Keep track of previous enemies to detect destroyed ones
  const prevEnemiesRef = React.useRef<Enemy[]>([]);

  // Handle enemies and explosions in a safer way
  const addExplosion = React.useCallback(
    (enemyId: string, position: Position) => {
      console.log(`Adding explosion for enemy ${enemyId}`);
      setLastExplosion(enemyId);

      // Add with a small delay to prevent state updates during render
      setTimeout(() => {
        setExplosions((prev) => {
          // Don't add duplicate explosions
          if (prev.some((e) => e.id === enemyId)) {
            return prev;
          }
          return [
            ...prev,
            {
              id: enemyId,
              position,
            },
          ];
        });
      }, 0);
    },
    []
  );

  // Game update logic
  useFrame((_, delta) => {
    try {
      // Update game state
      updateBullets(delta);
      updateEnemies(delta, playerPosition);

      // Get current enemy IDs for a quick lookup
      const currentEnemyIds = new Set(enemies.map((enemy) => enemy.id));
      const prevEnemies = prevEnemiesRef.current;

      // Check for destroyed enemies in a controlled way
      if (prevEnemies.length > 0) {
        for (const prevEnemy of prevEnemies) {
          if (
            !currentEnemyIds.has(prevEnemy.id) &&
            prevEnemy.id !== lastExplosion
          ) {
            addExplosion(prevEnemy.id, prevEnemy.position);
            break; // Only process one explosion at a time to avoid state thrashing
          }
        }
      }

      // Update the reference to current enemies for the next frame
      prevEnemiesRef.current = [...enemies];
    } catch (error) {
      console.error("Error in Game useFrame:", error);
    }
  });

  // Safe explosion cleanup
  const handleExplosionComplete = (id: string) => {
    console.log(`Explosion complete: ${id}`);
    // Use setTimeout to avoid state updates during render
    setTimeout(() => {
      setExplosions((prev) => prev.filter((exp) => exp.id !== id));
      if (lastExplosion === id) {
        setLastExplosion(null);
      }
    }, 0);
  };

  return (
    <>
      <CameraFollower />
      <Ground />

      {/* Player airplane */}
      <Airplane position={playerPosition} rotation={playerRotation} isPlayer />

      {/* Enemy airplanes */}
      {enemies.map((enemy) => (
        <Airplane
          key={enemy.id}
          position={enemy.position}
          rotation={enemy.rotation}
          color="red"
        />
      ))}

      {/* Bullets */}
      {bullets.map((bullet) => (
        <mesh
          key={bullet.id}
          position={[bullet.position.x, bullet.position.y, bullet.position.z]}>
          <boxGeometry args={[0.2, 0.2, 0.6]} />
          <meshStandardMaterial color="yellow" emissive="orange" />
        </mesh>
      ))}

      {/* Explosions */}
      {explosions.map((explosion) => (
        <Explosion
          key={explosion.id}
          position={explosion.position}
          onComplete={() => handleExplosionComplete(explosion.id)}
        />
      ))}
    </>
  );
};

export default Game;
