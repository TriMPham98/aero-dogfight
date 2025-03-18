import React from "react";
import useStore from "../store/store";

const GameUI: React.FC = () => {
  const { score, health } = useStore();

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        padding: "20px",
        color: "white",
        fontFamily: "Arial, sans-serif",
        pointerEvents: "none",
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
      }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "calc(100% - 40px)",
        }}>
        <div>
          <p style={{ margin: 0, fontSize: "1.5rem" }}>Score: {score}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "1.5rem", paddingRight: "20px" }}>
            Health: {health}
          </p>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "1rem",
          textAlign: "center",
          backgroundColor: "rgba(0,0,0,0.3)",
          padding: "8px 16px",
          borderRadius: "4px",
        }}>
        <p style={{ margin: 0 }}>Arrow keys to control | Space to shoot</p>
      </div>
    </div>
  );
};

export default GameUI;
