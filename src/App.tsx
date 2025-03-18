import React, { Suspense, Component, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Sky, Stars } from "@react-three/drei";
import Game from "./components/Game";
import GameUI from "./components/GameUI";

// Error boundary component to catch rendering errors
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to the console
    console.error("Error boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#333",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            textAlign: "center",
          }}>
          <h2>Something went wrong.</h2>
          <p>Please refresh the page to try again.</p>
          <pre
            style={{
              maxWidth: "80%",
              overflow: "auto",
              backgroundColor: "#222",
              padding: "10px",
              borderRadius: "4px",
              fontSize: "12px",
              margin: "10px 0",
            }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              border: "none",
              borderRadius: "4px",
              color: "white",
              cursor: "pointer",
              marginTop: "20px",
            }}>
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Custom component to handle canvas fallback
function GameCanvas() {
  const [canvasError, setCanvasError] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  // Provide a way to recover from Three.js errors
  useEffect(() => {
    const handleError = () => {
      console.log("Canvas error detected, will restart");
      setCanvasError(true);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  // If we detected an error, try restarting the canvas after a short delay
  useEffect(() => {
    if (canvasError) {
      const timer = setTimeout(() => {
        console.log("Attempting to restart canvas");
        setCanvasError(false);
        setRestartKey((prev) => prev + 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [canvasError]);

  if (canvasError) {
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#87CEEB",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          flexDirection: "column",
        }}>
        <h2>Recovering game...</h2>
        <p>Please wait a moment</p>
      </div>
    );
  }

  return (
    <Canvas
      key={restartKey}
      shadows
      mode="concurrent" // Use concurrent mode for better performance
      dpr={[1, 2]} // Lower resolution to improve performance
      gl={{
        antialias: true,
        alpha: false,
        stencil: false,
        depth: true,
        powerPreference: "high-performance",
      }}
      camera={{ fov: 60, near: 0.1, far: 1000, position: [0, 5, 15] }}
      performance={{ min: 0.5 }}
      onError={(e) => {
        console.error("Canvas render error:", e);
        setCanvasError(true);
      }}>
      <color attach="background" args={["#87CEEB"]} />
      <fog attach="fog" args={["#87CEEB", 30, 100]} />
      <Suspense fallback={null}>
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
      </Suspense>
    </Canvas>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <>
        <GameCanvas />
        <GameUI />
      </>
    </ErrorBoundary>
  );
}

export default App;
