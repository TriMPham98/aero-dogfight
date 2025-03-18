import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

const Bullseye: React.FC = () => {
  const outerRingRef = useRef<Mesh>(null);
  const innerRingRef = useRef<Mesh>(null);
  const centerDotRef = useRef<Mesh>(null);

  // This component will follow the camera
  useFrame(({ camera }) => {
    if (outerRingRef.current && innerRingRef.current && centerDotRef.current) {
      // Position the bullseye slightly in front of the camera
      const distance = 5;
      outerRingRef.current.position.set(0, 0, -distance);
      innerRingRef.current.position.set(0, 0, -distance);
      centerDotRef.current.position.set(0, 0, -distance);

      // Make the bullseye face the camera
      outerRingRef.current.rotation.copy(camera.rotation);
      innerRingRef.current.rotation.copy(camera.rotation);
      centerDotRef.current.rotation.copy(camera.rotation);

      // Position in camera's local space
      camera.localToWorld(outerRingRef.current.position);
      camera.localToWorld(innerRingRef.current.position);
      camera.localToWorld(centerDotRef.current.position);
    }
  });

  return (
    <>
      {/* Outer ring */}
      <mesh ref={outerRingRef}>
        <ringGeometry args={[0.07, 0.08, 32]} />
        <meshBasicMaterial color="red" transparent opacity={0.7} />
      </mesh>

      {/* Inner ring */}
      <mesh ref={innerRingRef}>
        <ringGeometry args={[0.03, 0.04, 32]} />
        <meshBasicMaterial color="white" transparent opacity={0.8} />
      </mesh>

      {/* Center dot */}
      <mesh ref={centerDotRef}>
        <circleGeometry args={[0.01, 32]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </>
  );
};

export default Bullseye;
