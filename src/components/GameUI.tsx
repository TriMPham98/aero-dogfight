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
      }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}>
        <div>
          <p style={{ margin: 0, fontSize: "1.5rem" }}>Score: {score}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "1.5rem" }}>Health: {health}</p>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}>
        <div
          style={{
            width: "10px",
            height: "10px",
            border: "2px solid white",
            borderRadius: "50%",
            position: "relative",
          }}>
          <div
            style={{
              position: "absolute",
              width: "20px",
              height: "2px",
              backgroundColor: "white",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}></div>
          <div
            style={{
              position: "absolute",
              width: "2px",
              height: "20px",
              backgroundColor: "white",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}></div>
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
        }}>
        <p>Arrow keys to control | Space to shoot</p>
      </div>
    </div>
  );
};

export default GameUI;
