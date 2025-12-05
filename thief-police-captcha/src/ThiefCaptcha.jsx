// src/ThiefCaptcha.jsx
import React from "react";
import ThiefCatchScene from "./ThiefCatchScene";

export default function ThiefCaptcha({
  sitekey = "dev-mode",   // default value
  onSuccess = () => {},
  onFail = () => {},
  theme = "light",
  size = "normal",
}) {
  const handleVerify = (result) => {
    if (result?.success) {
      const token = `${sitekey}.${crypto.randomUUID()}`;
      onSuccess(token);
    } else {
      onFail();
    }
  };

  return (
    <div
      style={{
        transform: size === "compact" ? "scale(0.75)" : "scale(1)",
        transformOrigin: "top left",
        borderRadius: 12,
        padding: 10,
        background: theme === "dark" ? "#111" : "#f4f4f4",
      }}
    >
      <ThiefCatchScene siteKey={sitekey} onVerify={handleVerify} />
    </div>
  );
}
