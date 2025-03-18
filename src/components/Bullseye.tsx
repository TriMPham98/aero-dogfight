import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Vector3 } from "three";
import useStore from "../store/store";

const Bullseye: React.FC = () => {
  const outerRingRef = useRef<Mesh>(null);
  const innerRingRef = useRef<Mesh>(null);
  const centerDotRef = useRef<Mesh>(null);
  const { playerPosition, playerRotation } = useStore();

  // Update the bullseye position to match the plane's aiming direction
  useFrame(({ camera }) => {
    if (
      !outerRingRef.current ||
      !innerRingRef.current ||
      !centerDotRef.current ||
      !playerPosition
    )
      return;

    // Create a forward vector from the player's rotation
    const forwardVector = new Vector3(0, 0, -1);
    forwardVector.applyEuler(playerRotation);

    // Place the bullseye far ahead in the direction the plane is pointing
    const distance = 20;
    const targetPosition = new Vector3(
      playerPosition.x + forwardVector.x * distance,
      playerPosition.y + forwardVector.y * distance,
      playerPosition.z + forwardVector.z * distance
    );

    // Apply position to all bullseye elements
    outerRingRef.current.position.copy(targetPosition);
    innerRingRef.current.position.copy(targetPosition);
    centerDotRef.current.position.copy(targetPosition);

    // Make the bullseye face toward the camera (always visible)
    outerRingRef.current.lookAt(camera.position);
    innerRingRef.current.lookAt(camera.position);
    centerDotRef.current.lookAt(camera.position);
  });

  return (
    <>
      {/* Outer ring */}
      <mesh ref={outerRingRef}>
        <ringGeometry args={[0.15, 0.2, 32]} />
        <meshBasicMaterial
          color="red"
          transparent
          opacity={0.7}
          depthTest={false}
        />
      </mesh>

      {/* Inner ring */}
      <mesh ref={innerRingRef}>
        <ringGeometry args={[0.05, 0.08, 32]} />
        <meshBasicMaterial
          color="white"
          transparent
          opacity={0.8}
          depthTest={false}
        />
      </mesh>

      {/* Center dot */}
      <mesh ref={centerDotRef}>
        <circleGeometry args={[0.02, 32]} />
        <meshBasicMaterial color="red" depthTest={false} />
      </mesh>
    </>
  );
};

export default Bullseye;
