import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, Euler, Group } from "three";
import { Trail } from "@react-three/drei";
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
  const { updateControls } = useKeyControls();
  const { setPlayerPosition, setPlayerRotation, spawnBullet, playerPosition } =
    useStore();

  useEffect(() => {
    if (!groupRef.current || !isPlayer) return;

    // Set initial position and rotation for the plane
    groupRef.current.position.set(position.x, position.y, position.z);
    groupRef.current.rotation.set(rotation.x, rotation.y, rotation.z);
  }, [isPlayer, position, rotation]);

  useFrame((_, delta) => {
    if (!groupRef.current || !isPlayer) return;

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

  return (
    <group ref={groupRef}>
      {/* Main body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 0.5, 2]} />
        <meshStandardMaterial color={color} />

        {/* Add trail effect */}
        {isPlayer && (
          <Trail
            width={1}
            length={8}
            color={"#ffffff"}
            attenuation={(t) => t * t}
          />
        )}
      </mesh>

      {/* Wings */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[4, 0.1, 0.7]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0.3, 1]} castShadow>
        <boxGeometry args={[1, 0.5, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

export default Airplane;
