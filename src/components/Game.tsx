import React, { useEffect, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import Airplane from "./Airplane";
import Ground from "./Ground";
import Explosion from "./Explosion";
import PlayerExplosion from "./PlayerExplosion";
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
  const [playerExploded, setPlayerExploded] = useState(false);
  const [playerExplosionPos, setPlayerExplosionPos] = useState<Position | null>(
    null
  );

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
    gameOver,
    health,
  } = useStore();

  // Monitor health for player explosion
  useEffect(() => {
    // If health is 0 and player hasn't exploded yet, trigger explosion
    if (health <= 0 && !playerExploded && !playerExplosionPos) {
      console.log("Player health zero - triggering explosion");
      setPlayerExploded(true);
      setPlayerExplosionPos({ ...playerPosition });
    }
  }, [health, playerExploded, playerPosition, playerExplosionPos]);

  // Reset player explosion state when game is reset
  useEffect(() => {
    if (!gameOver && playerExploded) {
      setPlayerExploded(false);
      setPlayerExplosionPos(null);
    }
  }, [gameOver, playerExploded]);

  // Function to handle when player explosion animation completes
  const handlePlayerExplosionComplete = useCallback(() => {
    console.log("Player explosion animation complete");
    setPlayerExplosionPos(null);
  }, []);

  // Function to spawn initial enemies
  const spawnInitialEnemies = useCallback(() => {
    console.log("Spawning initial enemies");
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
  }, [spawnEnemy]);

  // One-time initialization
  useEffect(() => {
    console.log("Game component mounted");
    if (enemies.length === 0) {
      spawnInitialEnemies();
    }

    // Cleanup on unmount
    return () => {
      console.log("Game component unmounting");
    };
  }, [spawnEnemy, enemies.length, spawnInitialEnemies]);

  // Watch for game reset
  useEffect(() => {
    // When gameOver changes from true to false, respawn enemies
    if (!gameOver && enemies.length === 0) {
      spawnInitialEnemies();
    }
  }, [gameOver, enemies.length, spawnInitialEnemies]);

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
      // Don't update game state when game is over
      if (gameOver) return;

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

      {/* Player airplane - only show if not exploded */}
      {!playerExploded && (
        <Airplane
          position={playerPosition}
          rotation={playerRotation}
          isPlayer
        />
      )}

      {/* Player explosion */}
      {playerExplosionPos && (
        <PlayerExplosion
          position={playerExplosionPos}
          onComplete={handlePlayerExplosionComplete}
        />
      )}

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

      {/* Enemy Explosions */}
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
