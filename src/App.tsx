import React from "react";
import { Canvas } from "@react-three/fiber";
import { Sky, Stars } from "@react-three/drei";
import Game from "./components/Game";
import GameUI from "./components/GameUI";

function App() {
  return (
    <>
      <Canvas shadows>
        <Sky sunPosition={[100, 10, 100]} />
        <Stars radius={300} depth={50} count={5000} factor={4} />
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 10, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Game />
      </Canvas>
      <GameUI />
    </>
  );
}

export default App;
