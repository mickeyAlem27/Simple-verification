import React, { useState, useEffect, useRef } from "react";

export default function ThiefCatchScene() {
  const STAGE_WIDTH = 600;
  const STAGE_HEIGHT = 400;

  const policePos = { x: STAGE_WIDTH - 100, y: STAGE_HEIGHT / 2 - 50 };
  const thiefHome = { x: 50, y: STAGE_HEIGHT - 60 };
  const bank = { x: 50, y: 20 };

  const [thiefPos, setThiefPos] = useState({ ...thiefHome });
  const [verified, setVerified] = useState(false);
  const [arrowPos, setArrowPos] = useState(null);
  const [message, setMessage] = useState("🎯 Drag the target and throw the stick!");
  const [reticlePos, setReticlePos] = useState({ x: policePos.x, y: policePos.y });
  const [tripCount, setTripCount] = useState(0);
  const [kickEffect, setKickEffect] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [stars, setStars] = useState([]);

  const stageRef = useRef(null);
  const forwardRef = useRef(true); // track direction
  const [reticleAngle, setReticleAngle] = useState(0);

  // 🔁 Reticle rotation
  useEffect(() => {
    const interval = setInterval(() => setReticleAngle((prev) => (prev + 3) % 360), 50);
    return () => clearInterval(interval);
  }, []);

  // 🕵️‍♂️ Thief movement & star follow
  useEffect(() => {
    if (verified || failed || showWelcome) return;

    const baseSpeed = 1.4;
    let animationFrame;

    const move = () => {
      setThiefPos((pos) => {
        const target = forwardRef.current ? bank : thiefHome;
        const dx = target.x - pos.x;
        const dy = target.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < baseSpeed) {
          // 🌟 When thief reaches bank
          if (forwardRef.current) {
            const newStarsCount = tripCount + 1; // 1 → 1 star, 2 → 2 stars, 3 → 3 stars
            const newStars = Array.from({ length: newStarsCount }).map(() => ({
              id: Date.now() + Math.random(),
              offsetX: Math.random() * 30 - 15,
              offsetY: Math.random() * 30 - 15,
              size: 18 + Math.random() * 6,
              life: 1,
            }));
            setStars(newStars);
          } else {
            // 🏠 Returned home
            setTripCount((prev) => {
              const newCount = prev + 1;
              if (newCount >= 3) {
                setFailed(true);
                setMessage("❌ Failed to verify!");
              }
              return newCount;
            });
          }

          // Reverse direction
          forwardRef.current = !forwardRef.current;
          return pos;
        }

        const curveX = Math.sin(Date.now() / 400) * 2;
        const curveY = Math.cos(Date.now() / 350) * 1.5;

        // ✨ Update star position to follow thief
        setStars((prevStars) =>
          prevStars.map((s) => ({
            ...s,
            life: s.life > 0.02 ? s.life - 0.002 : 0,
            x: pos.x + s.offsetX + curveX,
            y: pos.y + s.offsetY + curveY,
          }))
        );

        return {
          x: pos.x + (dx / dist) * baseSpeed + curveX,
          y: pos.y + (dy / dist) * baseSpeed + curveY,
        };
      });

      animationFrame = requestAnimationFrame(move);
    };

    animationFrame = requestAnimationFrame(move);
    return () => cancelAnimationFrame(animationFrame);
  }, [verified, failed, showWelcome, tripCount]);

  // 🪃 Throw action
  const handleShoot = () => {
    if (verified || arrowPos || failed) return;

    setArrowPos({ x: policePos.x, y: policePos.y });
    const duration = 800;
    const startTime = performance.now();

    const animate = (time) => {
      const progress = (time - startTime) / duration;
      if (progress < 1) {
        setArrowPos({
          x: policePos.x + (reticlePos.x - policePos.x) * progress,
          y: policePos.y + (reticlePos.y - policePos.y) * progress,
        });
        requestAnimationFrame(animate);
      } else {
        const dx = reticlePos.x - thiefPos.x;
        const dy = reticlePos.y - thiefPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 25) {
          setVerified(true);
          setMessage("💥 BOOM! Thief got caught!");
          setKickEffect(true);
          setTimeout(() => {
            setKickEffect(false);
            setShowWelcome(true);
          }, 800);
        } else {
          setMessage("❌ Missed! Try again!");
        }
        setTimeout(() => setArrowPos(null), 500);
      }
    };

    requestAnimationFrame(animate);
  };

  // 🎯 Drag target
  const handlePointerDown = (e) => {
    e.preventDefault();
    const pointerMove = (moveEvent) => {
      const rect = stageRef.current.getBoundingClientRect();
      const x = Math.max(20, Math.min(STAGE_WIDTH - 20, moveEvent.clientX - rect.left));
      const y = Math.max(20, Math.min(STAGE_HEIGHT - 20, moveEvent.clientY - rect.top));
      setReticlePos({ x, y });
    };
    const pointerUp = () => {
      document.removeEventListener("pointermove", pointerMove);
      document.removeEventListener("pointerup", pointerUp);
    };
    document.addEventListener("pointermove", pointerMove);
    document.addEventListener("pointerup", pointerUp);
  };

  const handleRetry = () => {
    setFailed(false);
    setVerified(false);
    setTripCount(0);
    setThiefPos({ ...thiefHome });
    setMessage("🎯 Drag the target and throw the stick!");
    setStars([]);
  };

  // 🎉 Success screen
  if (showWelcome) {
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
        <h1 style={{ fontSize: 40 }}>🎉 Mission Complete!</h1>
        <h2 style={{ fontSize: 28, marginBottom: 30 }}>Welcome, Officer 👮‍♂️</h2>
        <button
          onClick={() => {
            setShowWelcome(false);
            handleRetry();
          }}
          style={{
            background: "#fff",
            color: "#333",
            padding: "12px 28px",
            fontSize: 18,
            borderRadius: 10,
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

  // 🎮 Game view
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        ref={stageRef}
        style={{
          position: "relative",
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          background: "linear-gradient(to bottom, #b3e5fc, #a5d6a7)",
          border: "3px solid #333",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 0 20px rgba(0,0,0,0.6)",
        }}
      >
        {/* 🏦 Bank */}
        <div
          style={{
            position: "absolute",
            top: bank.y,
            left: bank.x,
            width: 60,
            height: 40,
            backgroundColor: "#FFD700",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
          }}
        >
          🏦 Bank
        </div>

        {/* 🏠 Home */}
        <div
          style={{
            position: "absolute",
            top: thiefHome.y,
            left: thiefHome.x,
            width: 60,
            height: 40,
            backgroundColor: "#8B0000",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
          }}
        >
          🏠 Home
        </div>

        {/* 👮‍♂️ Police */}
        <div
          style={{
            position: "absolute",
            top: policePos.y - 25,
            left: policePos.x - 25,
            width: 100,
            height: 100,
            backgroundColor: "#1E90FF",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 30,
            fontWeight: "bold",
          }}
        >
          👮‍♂️
        </div>

        {/* 🕵️‍♂️ Thief */}
        <div
          style={{
            position: "absolute",
            top: thiefPos.y + (kickEffect ? -30 : 0),
            left: thiefPos.x + (kickEffect ? 20 : 0),
            fontSize: 36,
            zIndex: 10,
            transition: kickEffect ? "all 0.3s ease" : "none",
          }}
        >
          {!verified ? "🕵️‍♂️" : "💀"}
        </div>

        {/* 🌟 Stars moving with thief */}
        {stars.map((s) => (
          <div
            key={s.id}
            style={{
              position: "absolute",
              left: s.x || thiefPos.x + s.offsetX,
              top: s.y || thiefPos.y + s.offsetY,
              opacity: s.life,
              fontSize: s.size,
              transition: "all 0.1s linear",
            }}
          >
            🌟
          </div>
        ))}

        {/* 🪃 Stick */}
        {arrowPos && (
          <div
            style={{
              position: "absolute",
              left: arrowPos.x,
              top: arrowPos.y,
              fontSize: 28,
              transform: "rotate(45deg)",
            }}
          >
            🪃
          </div>
        )}

        {/* 🎯 Target */}
        <div
          onPointerDown={handlePointerDown}
          style={{
            position: "absolute",
            left: reticlePos.x - 15,
            top: reticlePos.y - 15,
            width: 30,
            height: 30,
            border: "2px solid red",
            borderRadius: "50%",
            transform: `rotate(${reticleAngle}deg)`,
            transition: "transform 0.1s linear",
            cursor: "grab",
          }}
        ></div>

        {/* 🪃 Throw Button */}
        {!verified && !failed && (
          <button
            onClick={handleShoot}
            style={{
              position: "absolute",
              bottom: 10,
              right: 10,
              padding: "8px 16px",
              backgroundColor: "#1565C0",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Throw Stick 🪃
          </button>
        )}

        {/* Message */}
        <div
          style={{
            position: "absolute",
            bottom: 2,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "white",
            padding: "6px 14px",
            borderRadius: 6,
            fontWeight: "bold",
            fontSize: 14,
          }}
        >
          {message} (Round: {tripCount + 1}/3)
        </div>

        {/* ❌ FAIL */}
        {failed && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 22,
              fontWeight: "bold",
            }}
          >
            <div style={{ marginBottom: 20, fontSize: 28 }}>❌ Failed to Verify!</div>
            <button
              onClick={handleRetry}
              style={{
                padding: "10px 20px",
                backgroundColor: "#f44336",
                border: "none",
                borderRadius: 8,
                color: "white",
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              🔁 Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
