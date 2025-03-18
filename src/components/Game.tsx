import React, { useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import Airplane from "./Airplane";
import Ground from "./Ground";
import Explosion from "./Explosion";
import CameraFollower from "./CameraFollower";
import useStore from "../store/store";

interface ExplosionState {
  id: string;
  position: { x: number; y: number; z: number };
}

const Game: React.FC = () => {
  const [explosions, setExplosions] = useState<ExplosionState[]>([]);

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

  useEffect(() => {
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
  }, [spawnEnemy]);

  // Keep track of previous enemies to detect destroyed ones
  const prevEnemiesRef = React.useRef(enemies);

  useFrame((_, delta) => {
    // Update game state
    updateBullets(delta);
    updateEnemies(delta, playerPosition);

    // Debug enemy positions (can be removed later)
    if (enemies.length > 0) {
      console.log(`Player: ${JSON.stringify(playerPosition)}`);
      console.log(`Enemy 0: ${JSON.stringify(enemies[0].position)}`);
    }

    // Check for destroyed enemies to create explosions
    const prevEnemies = prevEnemiesRef.current;

    prevEnemies.forEach((prevEnemy) => {
      if (!enemies.find((enemy) => enemy.id === prevEnemy.id)) {
        // Enemy was destroyed, create explosion
        setExplosions((prev) => [
          ...prev,
          {
            id: prevEnemy.id,
            position: prevEnemy.position,
          },
        ]);
      }
    });

    prevEnemiesRef.current = enemies;
  });

  const handleExplosionComplete = (id: string) => {
    setExplosions((prev) => prev.filter((exp) => exp.id !== id));
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
