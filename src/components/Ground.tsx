import React from "react";
import { Grid } from "@react-three/drei";

const Ground: React.FC = () => {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#225522" />
      </mesh>
      <Grid
        infiniteGrid
        cellSize={1}
        cellThickness={0.5}
        sectionSize={5}
        fadeDistance={50}
        position={[0, -0.99, 0]}
      />
    </>
  );
};

export default Ground;
