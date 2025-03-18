import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

interface Position {
  x: number;
  y: number;
  z: number;
}

interface Rotation {
  x: number;
  y: number;
  z: number;
}

interface Velocity {
  x: number;
  y: number;
  z: number;
}

interface Bullet {
  id: string;
  position: Position;
  velocity: Velocity;
  ownerId: string;
  timeCreated: number;
}

interface Enemy {
  id: string;
  position: Position;
  rotation: Rotation;
  health: number;
}

interface GameState {
  // Player state
  playerPosition: Position;
  playerRotation: Rotation;
  health: number;
  score: number;

  // Game objects
  bullets: Bullet[];
  enemies: Enemy[];

  // Actions
  setPlayerPosition: (position: Position) => void;
  setPlayerRotation: (rotation: Rotation) => void;

  spawnBullet: (bullet: Omit<Bullet, "id" | "timeCreated">) => void;
  updateBullets: (delta: number) => void;

  spawnEnemy: (position: Position) => void;
  removeEnemy: (id: string) => void;
  updateEnemies: (delta: number, playerPosition: Position) => void;

  increaseScore: (amount: number) => void;
  decreaseHealth: (amount: number) => void;
}

// Utility functions
const distanceBetween = (pos1: Position, pos2: Position): number => {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

const useStore = create<GameState>((set, get) => ({
  // Initial player state
  playerPosition: { x: 0, y: 5, z: 0 },
  playerRotation: { x: 0, y: 0, z: 0 },
  health: 100,
  score: 0,

  // Initial game objects
  bullets: [],
  enemies: [],

  // Actions
  setPlayerPosition: (position) => set({ playerPosition: position }),
  setPlayerRotation: (rotation) => set({ playerRotation: rotation }),

  spawnBullet: (bulletData) => {
    set((state) => ({
      bullets: [
        ...state.bullets,
        {
          id: uuidv4(),
          position: bulletData.position,
          velocity: bulletData.velocity,
          ownerId: bulletData.ownerId,
          timeCreated: Date.now(),
        },
      ],
    }));
  },

  updateBullets: (delta) => {
    set((state) => {
      // Move bullets according to their velocity
      const updatedBullets = state.bullets
        .map((bullet) => ({
          ...bullet,
          position: {
            x: bullet.position.x + bullet.velocity.x * delta,
            y: bullet.position.y + bullet.velocity.y * delta,
            z: bullet.position.z + bullet.velocity.z * delta,
          },
        }))
        // Filter out bullets that have existed for too long (3 seconds)
        .filter((bullet) => Date.now() - bullet.timeCreated < 3000);

      // Check for collision with enemies
      const enemies = [...state.enemies];
      let score = state.score;

      updatedBullets.forEach((bullet) => {
        if (bullet.ownerId !== "player") return;

        enemies.forEach((enemy, index) => {
          const distance = distanceBetween(bullet.position, enemy.position);

          // If bullet is close enough to enemy, damage enemy
          if (distance < 1.5) {
            enemies[index] = { ...enemy, health: enemy.health - 25 };

            // If enemy is destroyed, remove it and add score
            if (enemies[index].health <= 0) {
              enemies.splice(index, 1);
              score += 100;
            }
          }
        });
      });

      return { bullets: updatedBullets, enemies, score };
    });
  },

  spawnEnemy: (position) => {
    set((state) => ({
      enemies: [
        ...state.enemies,
        {
          id: uuidv4(),
          position,
          rotation: { x: 0, y: 0, z: 0 },
          health: 100,
        },
      ],
    }));
  },

  removeEnemy: (id) => {
    set((state) => ({
      enemies: state.enemies.filter((enemy) => enemy.id !== id),
    }));
  },

  updateEnemies: (delta, playerPosition) => {
    set((state) => {
      // Very basic AI - enemies just try to move toward the player
      const updatedEnemies = state.enemies.map((enemy) => {
        // Calculate direction to player
        const directionToPlayer = {
          x: playerPosition.x - enemy.position.x,
          y: playerPosition.y - enemy.position.y,
          z: playerPosition.z - enemy.position.z,
        };

        // Normalize
        const length = Math.sqrt(
          directionToPlayer.x * directionToPlayer.x +
            directionToPlayer.y * directionToPlayer.y +
            directionToPlayer.z * directionToPlayer.z
        );

        if (length > 0) {
          directionToPlayer.x /= length;
          directionToPlayer.y /= length;
          directionToPlayer.z /= length;
        }

        // Move enemy toward player - fixing the movement by ensuring delta is a number
        const speed = 3;
        // Make sure delta is a valid number, use a default value if it's not
        const safetyDelta =
          typeof delta === "number" && !isNaN(delta) ? delta : 0.016;

        const newPosition = {
          x: enemy.position.x + directionToPlayer.x * speed * safetyDelta,
          y: enemy.position.y + directionToPlayer.y * speed * safetyDelta,
          z: enemy.position.z + directionToPlayer.z * speed * safetyDelta,
        };

        // Update enemy rotation to face player
        const rotation = {
          x: enemy.rotation.x,
          y: Math.atan2(directionToPlayer.x, directionToPlayer.z),
          z: enemy.rotation.z,
        };

        return {
          ...enemy,
          position: newPosition,
          rotation,
        };
      });

      // Check for collision with player
      let health = state.health;

      updatedEnemies.forEach((enemy) => {
        const distance = distanceBetween(enemy.position, playerPosition);

        // If enemy is very close to player, damage player
        if (distance < 2) {
          health -= 0.5; // Slowly decrease health on collision
        }
      });

      // Respawn enemies if there are too few
      let updatedEnemiesList = [...updatedEnemies];

      if (updatedEnemiesList.length < 3) {
        // Add a sufficient distance from the player to make them spawn outside the visible area
        const spawnDistance = 30;
        const angle = Math.random() * Math.PI * 2; // Random angle around player

        // Use polar coordinates to position enemies around the player
        const x = playerPosition.x + Math.cos(angle) * spawnDistance;
        const z = playerPosition.z + Math.sin(angle) * spawnDistance;

        updatedEnemiesList.push({
          id: uuidv4(),
          position: { x, y: playerPosition.y, z },
          rotation: { x: 0, y: 0, z: 0 },
          health: 100,
        });
      }

      return { enemies: updatedEnemiesList, health };
    });
  },

  increaseScore: (amount) => set((state) => ({ score: state.score + amount })),
  decreaseHealth: (amount) =>
    set((state) => ({ health: state.health - amount })),
}));

export default useStore;
