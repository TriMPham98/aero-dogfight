import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, Euler, Group } from "three";
import { Trail, GradientTexture } from "@react-three/drei";
import useStore from "../store/store";
import useKeyControls from "../hooks/useKeyControls";

interface AirplaneProps {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  isPlayer?: boolean;
  color?: string;
}

const Airplane: React.FC<AirplaneProps> = ({
  position,
  rotation,
  isPlayer = false,
  color = "blue",
}) => {
  const groupRef = useRef<Group>(null);
  const propellerRef = useRef<Group>(null);
  const { updateControls } = useKeyControls();
  const { setPlayerPosition, setPlayerRotation, spawnBullet, playerPosition } =
    useStore();
  const lastShotTimeRef = useRef(0);

  useEffect(() => {
    if (!groupRef.current) return;

    // Set initial position and rotation for any plane (player or enemy)
    groupRef.current.position.set(position.x, position.y, position.z);
    groupRef.current.rotation.set(rotation.x, rotation.y, rotation.z);
  }, [position, rotation]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Rotate propeller
    if (propellerRef.current) {
      propellerRef.current.rotation.z += 15 * delta;
    }

    // For enemy planes, update their position and rotation from props
    if (!isPlayer) {
      groupRef.current.position.set(position.x, position.y, position.z);
      groupRef.current.rotation.set(rotation.x, rotation.y, rotation.z);

      // Enemy shooting logic - semi-auto pace
      // Make enemies shoot every 2 seconds
      const currentTime = Date.now();
      if (currentTime - lastShotTimeRef.current > 2000) {
        lastShotTimeRef.current = currentTime;

        // Get direction toward player
        const bulletDirection = new Vector3(
          playerPosition.x - position.x,
          playerPosition.y - position.y,
          playerPosition.z - position.z
        ).normalize();

        // Offset bullet spawn position
        const bulletOffset = 2.5;
        const bulletPosition = new Vector3(
          position.x + bulletDirection.x * bulletOffset,
          position.y + bulletDirection.y * bulletOffset,
          position.z + bulletDirection.z * bulletOffset
        );

        // Slower bullet speed for enemies
        const bulletSpeed = 20;

        spawnBullet({
          position: {
            x: bulletPosition.x,
            y: bulletPosition.y,
            z: bulletPosition.z,
          },
          velocity: {
            x: bulletDirection.x * bulletSpeed,
            y: bulletDirection.y * bulletSpeed,
            z: bulletDirection.z * bulletSpeed,
          },
          ownerId: "enemy",
        });
      }

      return;
    }

    // Player plane logic below
    // Get control input and update player plane
    const controlInput = updateControls();

    // Apply rotation based on input
    const rotationSpeed = 1.5;

    // Apply roll (around local Z axis, which is forward)
    if (controlInput.left) {
      groupRef.current.rotateOnAxis(
        new Vector3(0, 0, 1),
        rotationSpeed * delta
      );
    }

    if (controlInput.right) {
      groupRef.current.rotateOnAxis(
        new Vector3(0, 0, 1),
        -rotationSpeed * delta
      );
    }

    // Apply pitch (around local X axis, which is right wing)
    if (controlInput.up) {
      groupRef.current.rotateOnAxis(
        new Vector3(1, 0, 0),
        -rotationSpeed * delta
      );
    }

    if (controlInput.down) {
      groupRef.current.rotateOnAxis(
        new Vector3(1, 0, 0),
        rotationSpeed * delta
      );
    }

    // Move forward in the direction the plane is facing
    const speed = 10;
    const direction = new Vector3(0, 0, -1);
    direction.applyEuler(groupRef.current.rotation);
    direction.multiplyScalar(speed * delta);

    groupRef.current.position.add(direction);

    // Update store with new position and rotation
    setPlayerPosition({
      x: groupRef.current.position.x,
      y: groupRef.current.position.y,
      z: groupRef.current.position.z,
    });

    setPlayerRotation({
      x: groupRef.current.rotation.x,
      y: groupRef.current.rotation.y,
      z: groupRef.current.rotation.z,
    });

    // Shooting
    if (controlInput.shoot && isPlayer) {
      // Get exact forward direction matching camera and bullseye
      const bulletDirection = new Vector3(0, 0, -1);
      bulletDirection.applyEuler(groupRef.current.rotation);
      bulletDirection.normalize();

      // Offset bullet spawn position to be in front of the aircraft
      const bulletOffset = 2.5;
      const bulletPosition = new Vector3(
        groupRef.current.position.x + bulletDirection.x * bulletOffset,
        groupRef.current.position.y + bulletDirection.y * bulletOffset,
        groupRef.current.position.z + bulletDirection.z * bulletOffset
      );

      // Higher bullet speed for better visualization
      const bulletSpeed = 40;

      spawnBullet({
        position: {
          x: bulletPosition.x,
          y: bulletPosition.y,
          z: bulletPosition.z,
        },
        velocity: {
          x: bulletDirection.x * bulletSpeed,
          y: bulletDirection.y * bulletSpeed,
          z: bulletDirection.z * bulletSpeed,
        },
        ownerId: isPlayer ? "player" : "enemy",
      });
    }
  });

  // Secondary color for details
  const accentColor = isPlayer ? "#003366" : "#660000";
  const mainColor = isPlayer ? color : "#cc0000";

  return (
    <group ref={groupRef}>
      {/* Fuselage (main body) */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 2.2, 12]} />
        <meshStandardMaterial
          color={mainColor}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Nose cone */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0, -1.2]}
        rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.4, 0.8, 12]} />
        <meshStandardMaterial
          color={mainColor}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Propeller hub */}
      <mesh castShadow receiveShadow position={[0, 0, -1.65]}>
        <cylinderGeometry args={[0.15, 0.15, 0.15, 12]} />
        <meshStandardMaterial color="#222222" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Propeller */}
      <group ref={propellerRef} position={[0, 0, -1.72]}>
        <mesh castShadow receiveShadow rotation={[0, 0, 0]}>
          <boxGeometry args={[0.1, 1.6, 0.05]} />
          <meshStandardMaterial
            color="#222222"
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.1, 1.6, 0.05]} />
          <meshStandardMaterial
            color="#222222"
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
      </group>

      {/* Cockpit */}
      <mesh castShadow receiveShadow position={[0, 0.3, -0.3]}>
        <sphereGeometry args={[0.3, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#88ccff"
          metalness={0.8}
          roughness={0.2}
          emissive="#003366"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Main Wings */}
      <mesh position={[0, -0.05, 0.1]} castShadow>
        <boxGeometry args={[4, 0.1, 1.2]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Rear stabilizers (horizontal) */}
      <mesh position={[0, 0, 1]} castShadow>
        <boxGeometry args={[1.6, 0.1, 0.6]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Vertical stabilizer (tail fin) */}
      <mesh position={[0, 0.4, 1]} castShadow>
        <boxGeometry args={[0.1, 0.8, 0.6]} />
        <meshStandardMaterial
          color={mainColor}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Rudder */}
      <mesh position={[0, 0.4, 1.3]} castShadow>
        <boxGeometry args={[0.1, 0.7, 0.2]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Landing gear struts */}
      <mesh position={[0.6, -0.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[-0.6, -0.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Landing gear wheels */}
      <mesh position={[0.6, -0.9, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 12]} />
        <meshStandardMaterial color="#111111" metalness={0.4} roughness={0.8} />
      </mesh>

      <mesh
        position={[-0.6, -0.9, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 12]} />
        <meshStandardMaterial color="#111111" metalness={0.4} roughness={0.8} />
      </mesh>

      {/* Exhaust pipes */}
      <mesh
        position={[0.3, -0.2, 0.8]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.3, 8]} />
        <meshStandardMaterial
          color="#444444"
          metalness={0.8}
          roughness={0.3}
          emissive="#ff4400"
          emissiveIntensity={0.5}
        />
      </mesh>

      <mesh
        position={[-0.3, -0.2, 0.8]}
        rotation={[0, 0, -Math.PI / 2]}
        castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.3, 8]} />
        <meshStandardMaterial
          color="#444444"
          metalness={0.8}
          roughness={0.3}
          emissive="#ff4400"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Add trail effect */}
      {isPlayer && (
        <Trail
          width={1}
          length={12}
          color={"#ffffff"}
          attenuation={(t) => t * t}
        />
      )}
    </group>
  );
};

export default Airplane;
