import React from "react";

export default function SuccessPage({ onRetry, score = 0 }) {
  return (
    <div>
      <h2 style={{ color: "#22c55e", marginBottom: 8 }}>🎉 Mission Complete!</h2>
      <p style={{ marginBottom: 6 }}>You cleared every level and secured the jungle.</p>
      <p style={{ fontWeight: 600, color: "#0f5132" }}>Final Score: {score}</p>
      <button
        onClick={onRetry}
        style={{
          background: "#22c55e",
          color: "white",
          padding: "10px 18px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
          marginTop: 14,
        }}
      >
        Play Again
      </button>
    </div>
  );
}
