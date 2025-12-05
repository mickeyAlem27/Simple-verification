import React from "react";

export default function FailPage({ onRetry }) {
  return (
    <div
      style={{
        textAlign: "center",
        color: "white",
        backgroundColor: "#1a1a1a",
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1 style={{ color: "red" }}>❌  Failed!</h1>
      <p>The thief escaped! Verification failed.</p>
      <button
        onClick={onRetry}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          fontSize: 16,
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          backgroundColor: "#ff5555",
          color: "white",
        }}
      >
        Retry
      </button>
    </div>
  );
}
