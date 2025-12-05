import React, { useState, useEffect, useRef } from "react";

const LEVEL_ID = 1;
const LEVEL_SCORE = 120;

export default function ThiefCatchScene({
  onVerify,
  autoAdvanceOnSuccess = false,
  autoAdvanceOnFail = false,
}) {
  const STAGE_WIDTH = 720; // Match new standard
  const STAGE_HEIGHT = 480; // Match new standard

  const policePos = { x: STAGE_WIDTH - 120, y: STAGE_HEIGHT / 2 - 50 };
  const thiefHome = { x: 60, y: STAGE_HEIGHT - 80 };
  const bank = { x: 60, y: 40 };
  const policeStation = { x: policePos.x - 60, y: policePos.y + 40 };

  const totalRounds = 2;
  const tripTime = 4000;
  const totalDistance = Math.abs(bank.y - thiefHome.y);
  const speed = totalDistance / (tripTime / 16.6);

  const [thiefPos, setThiefPos] = useState({ ...thiefHome });
  const [verified, setVerified] = useState(false);
  const [arrowPos, setArrowPos] = useState(null);
  const [message, setMessage] = useState("🎯 Drag the target and throw the stick!");
  const [reticlePos, setReticlePos] = useState({
    x: bank.x + 90,
    y: bank.y + (thiefHome.y - bank.y) * 0.55,
  });
  const [tripCount, setTripCount] = useState(0);
  const [kickEffect, setKickEffect] = useState(false);
  const [falling, setFalling] = useState(false);
  const [reticleAngle, setReticleAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [evidence, setEvidence] = useState([]);
  const sessionId = useRef(crypto.randomUUID());

  const forwardRef = useRef(true);
  const pauseRef = useRef(false);
  const animationRefs = useRef({ arrow: null, thief: null });
  const onVerifyRef = useRef(onVerify);
  const failedRef = useRef(false);

  // Keep onVerify ref updated
  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  // Reticle rotation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!dragging) setReticleAngle((p) => (p + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [dragging]);

  // Thief Movement
  useEffect(() => {
    let lastTime = performance.now();
    const moveThief = (time) => {
      if (verified || pauseRef.current) return;
      const delta = time - lastTime;
      lastTime = time;

      setThiefPos((prev) => {
        let newY = prev.y;
        if (forwardRef.current) {
          // Home -> Bank (Up)
          newY -= speed * (delta / 16.6);
          if (newY <= bank.y) {
            newY = bank.y;
            forwardRef.current = false;
            pauseRef.current = true;
            setTimeout(() => {
              pauseRef.current = false;
              animationRefs.current.thief = requestAnimationFrame(moveThief);
            }, 1000);
            return { x: prev.x, y: newY };
          }
        } else {
          // Bank -> Home (Down)
          newY += speed * (delta / 16.6);
          if (newY >= thiefHome.y) {
            newY = thiefHome.y;
            forwardRef.current = true;
            setTripCount((c) => c + 1);
            pauseRef.current = true;
            setTimeout(() => {
              pauseRef.current = false;
              animationRefs.current.thief = requestAnimationFrame(moveThief);
            }, 1000);
            return { x: prev.x, y: newY };
          }
        }
        return { x: prev.x, y: newY };
      });

      if (!pauseRef.current) {
        animationRefs.current.thief = requestAnimationFrame(moveThief);
      }
    };
    animationRefs.current.thief = requestAnimationFrame(moveThief);
    return () => cancelAnimationFrame(animationRefs.current.thief);
  }, [verified, speed]);

  // Fail condition
  useEffect(() => {
    if (tripCount >= totalRounds && !verified && !failedRef.current) {
      failedRef.current = true;
      onVerifyRef.current?.({ success: false, level: LEVEL_ID, reason: "escaped" });
    }
  }, [tripCount, verified]); // Removed onVerify from deps

  const handleThrow = () => {
    if (verified || arrowPos) return;

    const start = { x: policePos.x, y: policePos.y + 20 };
    const end = { ...reticlePos };
    const duration = 600;
    const startTime = performance.now();

    const animateArrow = (time) => {
      const progress = Math.min(1, (time - startTime) / duration);
      const currentX = start.x + (end.x - start.x) * progress;
      const currentY = start.y + (end.y - start.y) * progress;

      // Parabola height
      const arcHeight = 100 * Math.sin(progress * Math.PI);
      setArrowPos({ x: currentX, y: currentY - arcHeight });

      if (progress < 1) {
        animationRefs.current.arrow = requestAnimationFrame(animateArrow);
      } else {
        checkHit(end);
        setTimeout(() => setArrowPos(null), 200);
      }
    };
    animationRefs.current.arrow = requestAnimationFrame(animateArrow);
  };

  const checkHit = (impactPos) => {
    const dx = impactPos.x - thiefPos.x;
    const dy = impactPos.y - thiefPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 50) {
      setVerified(true);
      setKickEffect(true);
      setFalling(true);
      setMessage("💥 GOT HIM!");

      setTimeout(() => {
        onVerify?.({ success: true, level: LEVEL_ID, scoreAward: LEVEL_SCORE });
      }, 1000);
    } else {
      setMessage("❌ Missed! Try again!");
    }
  };

  // Drag Logic
  const handleDragStart = (e) => {
    e.preventDefault();
    setDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startReticle = { ...reticlePos };

    const onMove = (mv) => {
      const dx = mv.clientX - startX;
      const dy = mv.clientY - startY;
      setReticlePos({
        x: Math.max(0, Math.min(STAGE_WIDTH, startReticle.x + dx)),
        y: Math.max(0, Math.min(STAGE_HEIGHT, startReticle.y + dy)),
      });
    };

    const onUp = () => {
      setDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div className="game-stage" style={{ background: "linear-gradient(to bottom, #1e293b, #0f172a)" }}>
      {/* City Background Elements */}
      <div style={{ position: "absolute", bottom: 0, width: "100%", height: "40%", background: "#334155", clipPath: "polygon(0 20%, 20% 0, 40% 20%, 60% 5%, 80% 25%, 100% 10%, 100% 100%, 0 100%)", opacity: 0.5 }}></div>

      {/* Bank */}
      <div style={{ position: "absolute", top: bank.y, left: bank.x, textAlign: "center" }}>
        <div style={{ fontSize: 40 }}>🏦</div>
        <div style={{ color: "#fbbf24", fontWeight: "bold", fontSize: 12 }}>CITY BANK</div>
      </div>

      {/* Thief Home */}
      <div style={{ position: "absolute", top: thiefHome.y, left: thiefHome.x, textAlign: "center" }}>
        <div style={{ fontSize: 40 }}>🏠</div>
        <div style={{ color: "#f87171", fontWeight: "bold", fontSize: 12 }}>HIDEOUT</div>
      </div>

      {/* Police Station */}
      <div style={{ position: "absolute", top: policeStation.y, left: policeStation.x, textAlign: "center" }}>
        <div style={{ fontSize: 40 }}>🚓</div>
      </div>

      {/* Path */}
      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <line x1={bank.x + 20} y1={bank.y + 40} x2={thiefHome.x + 20} y2={thiefHome.y} stroke="rgba(255,255,255,0.1)" strokeWidth="4" strokeDasharray="10,10" />
      </svg>

      {/* Thief */}
      <div
        style={{
          position: "absolute",
          top: thiefPos.y,
          left: thiefPos.x,
          fontSize: 40,
          transition: falling ? "all 0.5s ease-in" : "none",
          transform: falling ? "rotate(90deg) scale(0.8)" : "none",
          filter: kickEffect ? "brightness(2) sepia(1)" : "none",
        }}
      >
        🥷
      </div>

      {/* Arrow */}
      {arrowPos && (
        <div style={{ position: "absolute", top: arrowPos.y, left: arrowPos.x, fontSize: 30, transform: "rotate(-45deg)" }}>
          🔗
        </div>
      )}

      {/* Reticle */}
      <div
        onPointerDown={handleDragStart}
        style={{
          position: "absolute",
          top: reticlePos.y - 25,
          left: reticlePos.x - 25,
          width: 50,
          height: 50,
          border: "3px dashed #fbbf24",
          borderRadius: "50%",
          cursor: "grab",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `rotate(${reticleAngle}deg)`,
          boxShadow: "0 0 15px rgba(251, 191, 36, 0.3)",
        }}
      >
        <div style={{ width: 8, height: 8, background: "#fbbf24", borderRadius: "50%" }}></div>
      </div>

      {/* Controls */}
      <div style={{ position: "absolute", bottom: 20, right: 20 }}>
        <button className="game-btn" onClick={handleThrow} disabled={verified || arrowPos}>
          THROW BATON
        </button>
      </div>

      {/* Message Toast */}
      <div style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.6)",
        padding: "8px 16px",
        borderRadius: 20,
        color: "#fff",
        fontSize: 14,
        backdropFilter: "blur(4px)"
      }}>
        {message}
      </div>
    </div>
  );
}
