import React from "react";
import useStore from "../store/store";

const GameOver: React.FC = () => {
  const { score, resetGame } = useStore();

  const handleRestart = () => {
    resetGame();
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        zIndex: 100,
      }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "10px" }}>Game Over</h1>
      <h2 style={{ fontSize: "2rem", marginBottom: "30px" }}>
        Your Score: {score}
      </h2>
      <button
        style={{
          padding: "15px 30px",
          fontSize: "1.5rem",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onClick={handleRestart}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#45a049")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#4CAF50")}>
        Restart Game
      </button>
    </div>
  );
};

export default GameOver;
