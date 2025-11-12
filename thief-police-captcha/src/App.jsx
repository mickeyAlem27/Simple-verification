import React, { useState } from "react";
import ThiefCatchScene from "./ThiefCatchScene";

function App() {
  const [verified, setVerified] = useState(false);

  // Prevent scroll and make full viewport
  React.useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden"; // ✅ disables scrolling
    document.body.style.width = "100%";
    document.body.style.height = "100%";

    return () => {
      // Reset if component unmounts
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ margin: 12 }}>Thief vs Police CAPTCHA</h2>

      {/* Game scene */}
      <div style={{ flex: 1, width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <ThiefCatchScene
          onVerify={(ok) => {
            if (ok) {
              setVerified(true);
              alert("Nice! You caught the thief — you're verified.");
            } else {
              alert("Verification failed. Try again.");
            }
          }}
        />
      </div>

      {/* Signup button */}
      <div style={{ margin: 12 }}>
        <button
          disabled={!verified}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            backgroundColor: verified ? "#0ea5e9" : "#94a3b8",
            color: "white",
            fontWeight: "bold",
            cursor: verified ? "pointer" : "not-allowed",
          }}
        >
          Complete Signup
        </button>
      </div>
    </div>
  );
}

export default App;
