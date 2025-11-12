import React, { useState, useEffect, useRef } from "react";

export default function ThiefCatchScene({ onVerify }) {
  const STAGE_WIDTH = 600;
  const STAGE_HEIGHT = 400;

  const policePos = { x: STAGE_WIDTH - 100, y: STAGE_HEIGHT / 2 - 50 };
  const thiefHome = { x: 50, y: STAGE_HEIGHT - 60 };
  const bank = { x: 50, y: 20 };

  const totalRounds = 2;
  const tripTime = 4000; // slower thief
  const totalDistance = Math.abs(bank.y - thiefHome.y);
  const speed = totalDistance / (tripTime / 16.6); // px per frame

  const [thiefPos, setThiefPos] = useState({ ...thiefHome });
  const [verified, setVerified] = useState(false);
  const [arrowPos, setArrowPos] = useState(null);
  const [message, setMessage] = useState("🎯 Drag the target and throw the stick!");
  const [reticlePos, setReticlePos] = useState({ x: policePos.x, y: policePos.y });
  const [tripCount, setTripCount] = useState(0);
  const [kickEffect, setKickEffect] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const forwardRef = useRef(true);
  const pauseRef = useRef(false);
  const thiefRef = useRef(thiefPos); // ✅ Real-time thief tracker
  const animationRefs = useRef({ arrow: null, thief: null });

  // Update ref whenever thief moves
  useEffect(() => {
    thiefRef.current = thiefPos;
  }, [thiefPos]);

  // ✅ Thief movement
  useEffect(() => {
    if (verified || showWelcome) return;
    let frame;

    const move = () => {
      setThiefPos((pos) => {
        if (pauseRef.current) return pos;

        const target = forwardRef.current ? bank : thiefHome;
        const dy = target.y - pos.y;
        if (Math.abs(dy) < speed) {
          const nextTrip = tripCount + 1;
          pauseRef.current = true;
          setTimeout(() => {
            if (nextTrip >= totalRounds * 2) setShowWelcome(true);
            else {
              setTripCount(nextTrip);
              forwardRef.current = !forwardRef.current;
              pauseRef.current = false;
            }
          }, 800);
          return { ...pos, y: target.y };
        }

        const moveY = dy > 0 ? speed : -speed;
        const offsetX = Math.sin(Date.now() * 0.006) * 5; // tiny wiggle
        return { x: thiefHome.x + offsetX, y: pos.y + moveY };
      });
      frame = requestAnimationFrame(move);
    };
    frame = requestAnimationFrame(move);
    animationRefs.current.thief = frame;
    return () => cancelAnimationFrame(frame);
  }, [verified, showWelcome, tripCount, speed]);
// Inside handleShoot
  // ✅ Throw boomerang (real-time collision)
  const handleShoot = () => {
    if (verified || arrowPos) return;

    const startX = policePos.x;
    const startY = policePos.y;
    const targetX = reticlePos.x;
    const targetY = reticlePos.y;

    const duration = 1000;
    const startTime = performance.now();

    const animate = (time) => {
      const progress = Math.min(1, (time - startTime) / duration);
      const x = startX + (targetX - startX) * progress;
      const y = startY + (targetY - startY) * progress;
      setArrowPos({ x, y });

      // ✅ Live collision with thiefRef
      const thief = thiefRef.current;
      const dx = Math.abs(thief.x - x);
      const dy = Math.abs(thief.y - y);

      if (dx < 25 && dy < 35) {
        setVerified(true);
        setKickEffect(true);
        setMessage("💥 Boom! You hit the thief perfectly!");
        cancelAnimationFrame(animationRefs.current.arrow);
        setTimeout(() => {
          setKickEffect(false);
          setShowWelcome(true);
          if (onVerify) onVerify(true);
        }, 800);
        return;
      }

      if (progress < 1 && !verified) {
        animationRefs.current.arrow = requestAnimationFrame(animate);
      } else {
        if (!verified) setMessage("❌ Missed! Try again!");
        setTimeout(() => setArrowPos(null), 800);
      }
    };

    animationRefs.current.arrow = requestAnimationFrame(animate);
  };

  // ✅ Smooth and responsive target drag
  const handlePointerDown = (e) => {
    e.preventDefault();
    const container = e.target.closest("div");
    const rect = container.getBoundingClientRect();

    const move = (ev) => {
      const x = Math.max(20, Math.min(STAGE_WIDTH - 20, ev.clientX - rect.left));
      const y = Math.max(20, Math.min(STAGE_HEIGHT - 20, ev.clientY - rect.top));
      setReticlePos({ x, y });
    };

    const up = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
    };

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  };

  const handleRetry = () => {
    setVerified(false);
    setTripCount(0);
    setThiefPos({ ...thiefHome });
    setMessage("🎯 Drag the target and throw the stick!");
    setArrowPos(null);
    setShowWelcome(false);
    forwardRef.current = true;
    pauseRef.current = false;
  };

  // ✅ Mission complete
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
        <h1 style={{ fontSize: 36 }}>🎉 Mission Complete!</h1>
        <h2 style={{ fontSize: 22, marginBottom: 20 }}>You caught the thief 👮‍♂️</h2>
        <button
          onClick={handleRetry}
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

  // ✅ Game scene
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #2196f3, #4caf50)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          background: "linear-gradient(to bottom, #b3e5fc, #a5d6a7)",
          border: "3px solid #333",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* 🏦 Bank */}
        <div style={{ position: "absolute", top: bank.y, left: bank.x, fontSize: 28 }}>🏦</div>

        {/* 🏠 Home */}
        <div style={{ position: "absolute", top: thiefHome.y, left: thiefHome.x, fontSize: 28 }}>🏠</div>

        {/* 👮‍♂️ Police */}
        <div style={{ position: "absolute", top: policePos.y, left: policePos.x, fontSize: 48 }}>👮‍♂️</div>

        {/* 🕵️‍♂️ Thief */}
        <div
          style={{
            position: "absolute",
            top: thiefPos.y + (kickEffect ? -20 : 0),
            left: thiefPos.x + (kickEffect ? 20 : 0),
            fontSize: 36,
            transition: kickEffect ? "all 0.2s ease" : "none",
          }}
        >
          {!verified ? "🕵️‍♂️" : "💀"}
        </div>

        {/* 🪃 Boomerang */}
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
            left: reticlePos.x - 20,
            top: reticlePos.y - 20,
            width: 40,
            height: 40,
            border: "2px solid red",
            borderRadius: "50%",
            cursor: "grab",
          }}
        ></div>

        {/* Throw Button */}
        {!verified && (
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
            bottom: 4,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(255,255,255,0.3)",
            padding: "6px 14px",
            borderRadius: 6,
            fontWeight: "bold",
            fontSize: 14,
          }}
        >
          {message} (Trip: {tripCount}/{totalRounds * 2})
        </div>
      </div>
    </div>
  );
}
