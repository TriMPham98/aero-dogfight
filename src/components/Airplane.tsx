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
    const currentRotation = new Euler(
      mesh.current.rotation.x,
      mesh.current.rotation.y,
      mesh.current.rotation.z
    );

    if (controlInput.left) {
      currentRotation.z += rotationSpeed * delta;
      currentRotation.y -= rotationSpeed * delta * 0.5;
    }

    if (controlInput.right) {
      currentRotation.z -= rotationSpeed * delta;
      currentRotation.y += rotationSpeed * delta * 0.5;
    }

    if (controlInput.up) {
      currentRotation.x -= rotationSpeed * delta;
    }

    if (controlInput.down) {
      currentRotation.x += rotationSpeed * delta;
    }

    // Apply the new rotation
    mesh.current.rotation.set(
      currentRotation.x,
      currentRotation.y,
      currentRotation.z
    );

    // Move forward in the direction the plane is facing
    const speed = 10;
    const direction = new Vector3(0, 0, -1);
    direction.applyEuler(currentRotation);
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
      const bulletDirection = new Vector3(0, 0, -1).applyEuler(currentRotation);

      spawnBullet({
        position: {
          x: mesh.current.position.x,
          y: mesh.current.position.y,
          z: mesh.current.position.z,
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
