import React, { useState } from "react";
import ThiefCatchScene from "./ThiefCatchScene";
import SuccessPage from "./SuccessPage";
import FailPage from "./FailPage";

function App() {
  const [result, setResult] = useState(null); // null, "success", "fail"

  const handleRetry = () => {
    setResult(null);
  };

  if (result === "success") return <SuccessPage onRetry={handleRetry} />;
  if (result === "fail") return <FailPage onRetry={handleRetry} />;

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
        overflow: "hidden",
      }}
    >
      <h2 style={{ margin: 12 }}>Thief vs Police CAPTCHA</h2>
      <ThiefCatchScene
        onVerify={(ok) => {
          setResult(ok ? "success" : "fail");
        }}
      />
    </div>
  );
}

export default App;
