import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

// Custom middleware for error handling
const errorHandlingMiddleware = (config) => (set, get, api) => {
  const safeSet = (updater) => {
    try {
      set(updater);
    } catch (error) {
      console.error("Error in state update:", error);
      // If we get an error, don't update state and log it
    }
  };

  return config(safeSet, get, api);
};

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
  gameOver: boolean;

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
  resetGame: () => void;
}

// Utility functions
const distanceBetween = (pos1: Position, pos2: Position): number => {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

const useStore = create<GameState>(
  errorHandlingMiddleware((set, get) => ({
    // Initial player state
    playerPosition: { x: 0, y: 5, z: 0 },
    playerRotation: { x: 0, y: 0, z: 0 },
    health: 100,
    score: 0,
    gameOver: false,

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
        try {
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

          // Create a copy for collision detection
          const bullets = [...updatedBullets];
          const enemies = [...state.enemies];
          let score = state.score;
          let health = state.health;

          // Track bullets to remove after collisions
          const bulletsToRemove = new Set<string>();

          // Check for collisions with enemies
          for (let i = 0; i < bullets.length; i++) {
            const bullet = bullets[i];

            // Check enemy bullets hitting player
            if (bullet.ownerId === "enemy") {
              const playerPosition = state.playerPosition;
              const distance = distanceBetween(bullet.position, playerPosition);

              // If bullet is close enough to player, damage player
              if (distance < 2 && !bulletsToRemove.has(bullet.id)) {
                // Mark bullet for removal
                bulletsToRemove.add(bullet.id);

                // Damage player
                health -= 10;
                console.log(`Player hit by enemy bullet, health: ${health}`);

                // Continue to next bullet
                continue;
              }
            }

            // Skip non-player bullets for enemy damage
            if (bullet.ownerId !== "player") continue;

            for (let j = 0; j < enemies.length; j++) {
              const enemy = enemies[j];
              const distance = distanceBetween(bullet.position, enemy.position);

              // If bullet is close enough to enemy, damage enemy
              if (distance < 1.5 && !bulletsToRemove.has(bullet.id)) {
                // Mark bullet for removal
                bulletsToRemove.add(bullet.id);
                console.log(
                  `Bullet hit enemy: ${enemy.id}, health before: ${enemy.health}`
                );

                // Damage enemy
                const newHealth = enemy.health - 25;
                console.log(`Enemy new health: ${newHealth}`);

                enemies[j] = {
                  ...enemy,
                  health: newHealth,
                };

                // If enemy is destroyed, increment score
                if (enemies[j].health <= 0) {
                  console.log(`Enemy destroyed: ${enemy.id}, adding score`);
                  // Mark enemy to be removed
                  enemies.splice(j, 1);
                  j--; // Adjust index after removal

                  // Add score
                  score += 100;
                  console.log(`New score: ${score}`);
                }

                // Break inner loop once collision is detected
                break;
              }
            }
          }

          // Remove collided bullets
          const filteredBullets = bullets.filter(
            (bullet) => !bulletsToRemove.has(bullet.id)
          );

          console.log(
            `Bullets: ${filteredBullets.length}, Enemies: ${enemies.length}, Score: ${score}`
          );

          // Check if health is zero and update gameOver state
          let gameOver = state.gameOver;
          if (health <= 0) {
            gameOver = true;
          }

          // Return updated state
          return {
            bullets: filteredBullets,
            enemies,
            score,
            health,
            gameOver,
          };
        } catch (error) {
          console.error("Error in updateBullets:", error);
          // Return unchanged state to prevent crash
          return state;
        }
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
        try {
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
              y: Math.atan2(-directionToPlayer.x, -directionToPlayer.z),
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

            // If enemy is very close to player, end the game immediately
            if (distance < 2) {
              // Set health to zero for immediate game over on collision
              health = 0;
              console.log(
                "Player collided with enemy plane - instant game over"
              );
            }
          });

          // Check for ground collision - set health to zero if player hits the ground
          const groundLevel = -1; // Ground Y position (based on Ground.tsx)
          if (playerPosition.y <= groundLevel) {
            console.log("Player collided with ground - health set to zero");
            health = 0;
          }

          // Set game over if health is zero
          let gameOver = state.gameOver;
          if (health <= 0) {
            gameOver = true;
          }

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

          return { enemies: updatedEnemiesList, health, gameOver };
        } catch (error) {
          console.error("Error in updateEnemies:", error);
          return state;
        }
      });
    },

    increaseScore: (amount) =>
      set((state) => ({ score: state.score + amount })),
    decreaseHealth: (amount) =>
      set((state) => ({ health: state.health - amount })),
    resetGame: () =>
      set((state) => ({
        playerPosition: { x: 0, y: 5, z: 0 },
        playerRotation: { x: 0, y: 0, z: 0 },
        health: 100,
        score: 0,
        gameOver: false,
        bullets: [],
        enemies: [],
      })),
  }))
);

export default useStore;
