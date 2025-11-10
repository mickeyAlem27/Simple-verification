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
  const [ropeVisible, setRopeVisible] = useState(false);
  const [message, setMessage] = useState("🎯 Drag the locker to aim, then throw!");
  const [reticlePos, setReticlePos] = useState({ x: policePos.x, y: policePos.y });
  const [stars, setStars] = useState([]);
  const [tripCount, setTripCount] = useState(0);
  const [kickEffect, setKickEffect] = useState(false);
  const [failed, setFailed] = useState(false); // 👈 new state for popup

  const stageRef = useRef(null);

  // Reticle rotation
  const [reticleAngle, setReticleAngle] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setReticleAngle((prev) => (prev + 3) % 360), 50);
    return () => clearInterval(interval);
  }, []);

  // Thief movement
  useEffect(() => {
    if (verified || failed) return;

    let forward = true;
    const baseSpeed = 1.2;
    let animationFrame;

    const move = () => {
      setThiefPos((pos) => {
        if (verified || failed) return pos;

        const target = forward ? bank : thiefHome;
        const dx = target.x - pos.x;
        const dy = target.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < baseSpeed) {
          if (forward) {
            setStars((prev) => [...prev, { x: pos.x, y: pos.y - 20 }]);
          } else {
            setTripCount((prev) => {
              const newCount = prev + 1;
              if (newCount >= 3) {
                setFailed(true);
                setMessage("❌ Failed to Verify!");
              }
              return newCount;
            });
          }
          forward = !forward;
          return pos;
        }

        const wiggleX = Math.sin(Date.now() / 400) * 1.5;
        const wiggleY = Math.sin(Date.now() / 350) * 1;

        setStars((prev) =>
          prev.map((star, i) => ({
            ...star,
            x: pos.x + i * 12,
            y: pos.y - 20 - i * 8,
          }))
        );

        return {
          x: pos.x + (dx / dist) * baseSpeed + wiggleX,
          y: pos.y + (dy / dist) * baseSpeed + wiggleY,
        };
      });

      animationFrame = requestAnimationFrame(move);
    };

    animationFrame = requestAnimationFrame(move);
    return () => cancelAnimationFrame(animationFrame);
  }, [verified, failed]);

  // Throw / Kick
  const handleShoot = () => {
    if (verified || arrowPos || failed) return;
    setArrowPos({ x: policePos.x, y: policePos.y });
    setRopeVisible(true);
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
          setMessage("💥 BOOM! Thief got kicked!");
          setKickEffect(true);
          setTimeout(() => setKickEffect(false), 600);
        } else {
          setMessage("❌ Missed! Thief continues!");
        }

        setTimeout(() => {
          setArrowPos(null);
          setRopeVisible(false);
        }, 500);
      }
    };

    requestAnimationFrame(animate);
  };

  // Drag reticle
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

  // Retry button resets everything
  const handleRetry = () => {
    setFailed(false);
    setVerified(false);
    setTripCount(0);
    setStars([]);
    setThiefPos({ ...thiefHome });
    setMessage("🎯 Drag the locker to aim, then throw!");
  };

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
        {/* Bank */}
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
            fontSize: 16,
          }}
        >
          🏦 Bank
        </div>

        {/* Home */}
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
            fontSize: 16,
          }}
        >
          🏠 Home
        </div>

        {/* Police */}
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

        {/* Thief */}
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

        {/* Stars */}
        {stars.map((star, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: star.y,
              left: star.x,
              fontSize: 20,
              color: "gold",
              transition: "top 0.2s, left 0.2s",
            }}
          >
            ⭐
          </div>
        ))}

        {/* Reticle */}
        <div
          onPointerDown={handlePointerDown}
          style={{
            position: "absolute",
            left: reticlePos.x - 20,
            top: reticlePos.y - 20,
            width: 40,
            height: 40,
            border: "3px solid orange",
            borderRadius: "50%",
            transform: `rotate(${reticleAngle}deg)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            color: "orange",
            fontWeight: "bold",
            backgroundColor: "rgba(255,165,0,0.2)",
            cursor: "grab",
          }}
        >
          🔒
        </div>

        {/* Stick */}
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

        {/* Throw Button */}
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
          {message} (Trips: {tripCount}/3)
        </div>

        {/* ❌ FAILED POPUP */}
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
