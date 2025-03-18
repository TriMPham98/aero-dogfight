import React, { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector3, Euler } from "three";
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

  // Set up smooth camera following
  useFrame(() => {
    if (!playerPosition) return;

    // Create a rotation based on player's rotation
    const playerEuler = new Euler(
      playerRotation.x,
      playerRotation.y,
      playerRotation.z
    );

    // Create an offset vector - position camera behind and slightly above the player
    const offset = new Vector3(0, 3, 12);

    // Apply the player's yaw (y-rotation) to the offset, but not pitch or roll
    // This makes the camera follow behind the player regardless of direction
    const yawOnlyEuler = new Euler(0, playerEuler.y, 0);
    offset.applyEuler(yawOnlyEuler);

    // Calculate the target position
    const targetPosition = new Vector3(
      playerPosition.x + offset.x,
      playerPosition.y + offset.y, // Keep some height above the player
      playerPosition.z + offset.z
    );

    // Smoothly interpolate the camera position for a less jerky motion
    // Lower value = smoother but more delayed following, higher = more responsive but can be jerky
    const smoothness = 0.05;
    cameraPositionRef.current.lerp(targetPosition, smoothness);

    // Update camera position
    camera.position.copy(cameraPositionRef.current);

    // Look at a point slightly ahead of the player in their direction of travel
    // This helps create a more dynamic view showing where the player is heading
    const lookAheadDistance = 5;
    const forwardVector = new Vector3(0, 0, -lookAheadDistance);
    forwardVector.applyEuler(playerEuler);

    const lookAtPoint = new Vector3(
      playerPosition.x + forwardVector.x,
      playerPosition.y + forwardVector.y,
      playerPosition.z + forwardVector.z
    );

    camera.lookAt(lookAtPoint);
  });

  return <Bullseye />; // Render the bullseye component
};

export default CameraFollower;
