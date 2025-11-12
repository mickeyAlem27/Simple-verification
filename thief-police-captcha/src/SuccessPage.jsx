import React from "react";

export default function SuccessPage({ onRetry }) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #2196f3, #4caf50)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 36 }}>🎉 Mission Complete!</h1>
      <h2 style={{ fontSize: 22, marginBottom: 20 }}>You caught the thief 👮‍♂️</h2>
      <button
        onClick={onRetry}
        style={{
          background: "#fff",
          color: "#333",
          padding: "10px 22px",
          fontSize: 16,
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        🔁 Play Again
      </button>
    </div>
  );
}
