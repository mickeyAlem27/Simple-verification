import React, { useState } from "react";
import ThiefCatchScene from "./ThiefCatchScene";

function App() {
  const [verified, setVerified] = useState(false);

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>Thief vs Police CAPTCHA</h1>
      <p>Catch the thief by throwing the net!</p>

      <ThiefCatchScene onVerify={(ok) => {
        if (ok) {
          setVerified(true);
          alert("Nice! You caught the thief — you're verified.");
        } else {
          alert("Verification failed. Try again.");
        }
      }} />

      <div style={{ marginTop: 20 }}>
        <button disabled={!verified} style={{
          padding: "10px 16px",
          borderRadius: 8,
          backgroundColor: verified ? "#0ea5e9" : "#94a3b8",
          color: "white",
          fontWeight: "bold",
          cursor: verified ? "pointer" : "not-allowed"
        }}>
          Complete Signup
        </button>
      </div>
    </div>
  );
}

export default App;
