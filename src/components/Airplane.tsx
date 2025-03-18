import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, Euler } from "three";
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
  const mesh = useRef<THREE.Mesh>(null);
  const { updateControls } = useKeyControls();
  const { setPlayerPosition, setPlayerRotation, spawnBullet, playerPosition } =
    useStore();

  useEffect(() => {
    if (!mesh.current || !isPlayer) return;

    // Set initial position and rotation for the plane
    mesh.current.position.set(position.x, position.y, position.z);
    mesh.current.rotation.set(rotation.x, rotation.y, rotation.z);
  }, [isPlayer, position, rotation]);

  useFrame((_, delta) => {
    if (!mesh.current || !isPlayer) return;

    // Get control input and update player plane
    const controlInput = updateControls();

    // Apply rotation based on input
    const rotationSpeed = 1.5;

    // Create a quaternion from the current rotation
    const currentRotation = mesh.current.rotation.clone();

    // Create rotation vectors based on aircraft's local axes
    const localRight = new Vector3(1, 0, 0).applyEuler(currentRotation);
    const localUp = new Vector3(0, 1, 0).applyEuler(currentRotation);

    // Apply roll (around local Z axis, which is forward)
    if (controlInput.left) {
      mesh.current.rotateOnAxis(new Vector3(0, 0, 1), rotationSpeed * delta);
    }

    if (controlInput.right) {
      mesh.current.rotateOnAxis(new Vector3(0, 0, 1), -rotationSpeed * delta);
    }

    // Apply pitch (around local X axis, which is right wing)
    if (controlInput.up) {
      mesh.current.rotateOnAxis(new Vector3(1, 0, 0), -rotationSpeed * delta);
    }

    if (controlInput.down) {
      mesh.current.rotateOnAxis(new Vector3(1, 0, 0), rotationSpeed * delta);
    }

    // Move forward in the direction the plane is facing
    const speed = 10;
    const direction = new Vector3(0, 0, -1);
    direction.applyEuler(mesh.current.rotation);
    direction.multiplyScalar(speed * delta);

    mesh.current.position.add(direction);

    // Update store with new position and rotation
    setPlayerPosition({
      x: mesh.current.position.x,
      y: mesh.current.position.y,
      z: mesh.current.position.z,
    });

    setPlayerRotation({
      x: mesh.current.rotation.x,
      y: mesh.current.rotation.y,
      z: mesh.current.rotation.z,
    });

    // Shooting
    if (controlInput.shoot && isPlayer) {
      // Create forward vector for bullet direction
      const bulletDirection = new Vector3(0, 0, -1);
      bulletDirection.applyEuler(mesh.current.rotation);

      // Add an offset to spawn bullets slightly in front of the aircraft
      const bulletOffset = bulletDirection.clone().multiplyScalar(2);
      const bulletPosition = new Vector3(
        mesh.current.position.x + bulletOffset.x,
        mesh.current.position.y + bulletOffset.y,
        mesh.current.position.z + bulletOffset.z
      );

      spawnBullet({
        position: {
          x: bulletPosition.x,
          y: bulletPosition.y,
          z: bulletPosition.z,
        },
        velocity: {
          x: bulletDirection.x * 20,
          y: bulletDirection.y * 20,
          z: bulletDirection.z * 20,
        },
        ownerId: isPlayer ? "player" : "enemy",
      });
    }
  });

  return (
    <group
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}>
      {/* Main body */}
      <mesh ref={mesh} castShadow receiveShadow>
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
