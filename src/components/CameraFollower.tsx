import React, { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector3, Euler, Quaternion, Matrix4 } from "three";
import useStore from "../store/store";
import Bullseye from "./Bullseye";

const CameraFollower: React.FC = () => {
  const { camera } = useThree();
  const { playerPosition, playerRotation } = useStore();
  const cameraPositionRef = useRef(new Vector3(0, 5, 10));

  // Initialize camera position
  useEffect(() => {
    // Set initial camera position and FOV
    camera.position.set(0, 5, 10);
    camera.fov = 60;
    camera.updateProjectionMatrix();
  }, [camera]);

  // Set up camera following that aligns with plane direction
  useFrame(() => {
    if (!playerPosition) return;

    // Get the plane's forward direction vector
    const forwardVector = new Vector3(0, 0, -1);
    forwardVector.applyEuler(playerRotation);
    forwardVector.normalize();

    // Get plane's up vector
    const upVector = new Vector3(0, 1, 0);
    upVector.applyEuler(playerRotation);
    upVector.normalize();

    // Get plane's right vector (cross product of up and forward)
    const rightVector = new Vector3()
      .crossVectors(upVector, forwardVector)
      .normalize();

    // Recalculate true up vector to ensure orthogonality
    const trueUpVector = new Vector3()
      .crossVectors(forwardVector, rightVector)
      .normalize();

    // Position camera behind plane
    const distance = 15; // Distance behind plane
    const heightOffset = 1.5; // Slight height offset

    // Calculate camera position directly behind plane along its axes
    const cameraPosition = new Vector3(
      playerPosition.x -
        forwardVector.x * distance +
        trueUpVector.x * heightOffset,
      playerPosition.y -
        forwardVector.y * distance +
        trueUpVector.y * heightOffset,
      playerPosition.z -
        forwardVector.z * distance +
        trueUpVector.z * heightOffset
    );

    // Smooth camera movement
    const positionSmoothness = 0.1; // Higher value for more responsive movement
    cameraPositionRef.current.lerp(cameraPosition, positionSmoothness);
    camera.position.copy(cameraPositionRef.current);

    // Look directly where the plane is pointing (far ahead)
    const lookDistance = 100;
    const lookAtPoint = new Vector3(
      playerPosition.x + forwardVector.x * lookDistance,
      playerPosition.y + forwardVector.y * lookDistance,
      playerPosition.z + forwardVector.z * lookDistance
    );

    // Point camera in the exact direction the plane is facing
    camera.lookAt(lookAtPoint);

    // Align camera's up vector with the plane's up vector for complete alignment
    camera.up.copy(trueUpVector);
  });

  return <Bullseye />; // Render the bullseye component
};

export default CameraFollower;
