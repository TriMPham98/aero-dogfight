import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Vector3 } from "three";
import useStore from "../store/store";

const Bullseye: React.FC = () => {
  const outerRingRef = useRef<Mesh>(null);
  const innerRingRef = useRef<Mesh>(null);
  const centerDotRef = useRef<Mesh>(null);
  const { playerPosition, playerRotation } = useStore();

  useFrame(({ camera }) => {
    if (
      !outerRingRef.current ||
      !innerRingRef.current ||
      !centerDotRef.current ||
      !playerPosition
    )
      return;

    // Create a forward vector directly from the player's orientation
    const forward = new Vector3(0, 0, -1);
    forward.applyEuler(playerRotation);
    forward.normalize();

    // Project the bullseye far ahead for visibility
    const distance = 100;

    // Position the bullseye exactly where the aircraft is pointing
    const targetPosition = new Vector3(
      playerPosition.x + forward.x * distance,
      playerPosition.y + forward.y * distance,
      playerPosition.z + forward.z * distance
    );

    // Update all bullseye elements
    outerRingRef.current.position.copy(targetPosition);
    innerRingRef.current.position.copy(targetPosition);
    centerDotRef.current.position.copy(targetPosition);

    // Make sure the bullseye is perpendicular to the forward direction
    outerRingRef.current.lookAt(camera.position);
    innerRingRef.current.lookAt(camera.position);
    centerDotRef.current.lookAt(camera.position);

    // Fixed size for bullseye based on distance
    const distanceToCamera = camera.position.distanceTo(targetPosition);
    const scale = distanceToCamera * 0.03; // Larger scaling factor

    outerRingRef.current.scale.set(scale, scale, scale);
    innerRingRef.current.scale.set(scale, scale, scale);
    centerDotRef.current.scale.set(scale, scale, scale);
  });

  return (
    <group renderOrder={999}>
      {/* Outer ring */}
      <mesh ref={outerRingRef} renderOrder={999}>
        <ringGeometry args={[0.7, 0.9, 32]} />
        <meshBasicMaterial
          color="red"
          transparent
          opacity={0.9}
          depthTest={false}
          depthWrite={false}
          renderOrder={999}
        />
      </mesh>

      {/* Inner ring */}
      <mesh ref={innerRingRef} renderOrder={999}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshBasicMaterial
          color="white"
          transparent
          opacity={0.9}
          depthTest={false}
          depthWrite={false}
          renderOrder={999}
        />
      </mesh>

      {/* Center dot */}
      <mesh ref={centerDotRef} renderOrder={999}>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial
          color="red"
          depthTest={false}
          depthWrite={false}
          renderOrder={999}
        />
      </mesh>
    </group>
  );
};

export default Bullseye;
