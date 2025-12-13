import React, { useState, useEffect, useRef } from "react";

const LEVEL_ID = 1;
const LEVEL_SCORE = 120;

export default function ThiefCatchScene({
  onVerify,
  sounds,
  autoAdvanceOnSuccess = false,
  autoAdvanceOnFail = false,
}) {
  const STAGE_WIDTH = 720;
  const STAGE_HEIGHT = 480;

  // Use percentage-based positions that scale with viewport
  const policePos = { x: STAGE_WIDTH * 0.833, y: STAGE_HEIGHT * 0.479 };
  const thiefHome = { x: STAGE_WIDTH * 0.083, y: STAGE_HEIGHT * 0.833 };
  const bank = { x: STAGE_WIDTH * 0.083, y: STAGE_HEIGHT * 0.083 };
  const policeStation = { x: policePos.x - STAGE_WIDTH * 0.083, y: policePos.y + STAGE_HEIGHT * 0.083 };

  const totalRounds = 2;
  const tripTime = 4000;
  const totalDistance = Math.abs(bank.y - thiefHome.y);
  const speed = totalDistance / (tripTime / 16.6);

  const [thiefPos, setThiefPos] = useState({ ...thiefHome });
  const [verified, setVerified] = useState(false);
  const [arrowPos, setArrowPos] = useState(null);
  const [message, setMessage] = useState("🎯 Drag the target and throw the stick!");
  const [reticlePos, setReticlePos] = useState({
    x: bank.x + STAGE_WIDTH * 0.125, // 12.5% of width
    y: bank.y + (thiefHome.y - bank.y) * 0.55,
  });
  const [tripCount, setTripCount] = useState(0);
  const [kickEffect, setKickEffect] = useState(false);
  const [falling, setFalling] = useState(false);
  const stageRef = useRef(null); // Ref for game stage coordinate conversion
  const [reticleAngle, setReticleAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [evidence, setEvidence] = useState([]);
  const sessionId = useRef(crypto.randomUUID());

  const forwardRef = useRef(true);
  const pauseRef = useRef(false);
  const animationRefs = useRef({ arrow: null, thief: null });
  const onVerifyRef = useRef(onVerify);
  const failedRef = useRef(false);
  const kickAttemptedRef = useRef(false); // Track if kick was attempted this trip

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
            kickAttemptedRef.current = false; // Reset for new trip
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
            kickAttemptedRef.current = false; // Reset for new trip
            setTripCount((c) => c + 1);
            pauseRef.current = true;
            setTimeout(() => {
              pauseRef.current = false;
              animationRefs.current.thief = requestAnimationFrame(moveThief);
            }, 1000);
            return { x: prev.x, y: newY };
          }
        }

        // PRECISE SYMMETRIC KICK DETECTION
        // Works equally in BOTH directions (home→bank AND bank→home)
        if (!verified) {
          // Calculate exact distance from thief to reticle
          const dx = thiefPos.x - reticlePos.x;
          const dy = newY - reticlePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // STRICT RADIUS CHECK - Only kick if thief is within 30px radius RIGHT NOW
          // AND both X and Y distances must be small (Explicit Symmetry)
          const xDistance = Math.abs(dx);
          const yDistance = Math.abs(dy);
          if (distance < 30 && xDistance < 30 && yDistance < 30 && !kickAttemptedRef.current) {
            kickAttemptedRef.current = true; // Mark as attempted
            sounds?.kick();
            setVerified(true);
            setKickEffect(true);
            setFalling(true);
            setMessage("💥 PERFECT KICK!");
            setTimeout(() => {
              onVerify?.({ success: true, level: LEVEL_ID, scoreAward: LEVEL_SCORE });
            }, 1000);
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

    sounds?.throw();
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
    // Check distance from THIEF to RETICLE (target position)
    // This ensures we only hit if thief is actually at the target
    const dx = thiefPos.x - reticlePos.x;
    const dy = thiefPos.y - reticlePos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Precise hit detection - 30px radius for accurate targeting
    // Only hit if thief is currently at the target position
    // Explicitly check X and Y symmetry
    const xDistance = Math.abs(dx);
    const yDistance = Math.abs(dy);

    if (dist < 30 && xDistance < 30 && yDistance < 30 && !kickAttemptedRef.current) {
      kickAttemptedRef.current = true; // Prevent multiple hits
      sounds?.kick();
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

  // Helper to convert screen coordinates to game coordinates
  const getGameCoordinates = (clientX, clientY) => {
    if (!stageRef.current) return { x: clientX, y: clientY };
    const rect = stageRef.current.getBoundingClientRect();

    // Get CSS transform scale
    const transform = window.getComputedStyle(stageRef.current).transform;
    let scale = 1;
    if (transform !== 'none') {
      const matrix = transform.match(/matrix\(([^)]+)\)/);
      if (matrix) {
        const values = matrix[1].split(', ');
        scale = parseFloat(values[0]) || 1;
      }
    }

    // Convert screen coordinates to game coordinates
    const x = (clientX - rect.left) / scale;
    const y = (clientY - rect.top) / scale;
    return { x, y };
  };

  // Optimized drag logic for smooth mobile performance
  const handleDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);

    // Get correct coordinates for both mouse and touch
    const getCoords = (event) => {
      if (event.touches && event.touches[0]) {
        return { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }
      return { x: event.clientX, y: event.clientY };
    };

    const startCoords = getCoords(e);
    const startReticle = { ...reticlePos };
    let rafId = null;

    const onMove = (mv) => {
      mv.preventDefault();

      // Cancel previous animation frame
      if (rafId) cancelAnimationFrame(rafId);

      // Use requestAnimationFrame for smooth 60fps updates
      rafId = requestAnimationFrame(() => {
        const moveCoords = getCoords(mv);
        const gameCoords = getGameCoordinates(moveCoords.x, moveCoords.y);

        setReticlePos({
          x: Math.max(0, Math.min(STAGE_WIDTH, gameCoords.x)),
          y: Math.max(0, Math.min(STAGE_HEIGHT, gameCoords.y)),
        });
      });
    };

    const onUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      setDragging(false);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
    };

    document.addEventListener("pointermove", onMove, { passive: false });
    document.addEventListener("pointerup", onUp);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onUp);
  };

  return (
    <div
      ref={stageRef}
      className="game-stage"
      style={{ background: "linear-gradient(to bottom, #1e293b, #0f172a)" }}
      onClick={(e) => {
        if (verified || arrowPos) return; // Don't allow repositioning after throwing
        const coords = getGameCoordinates(e.clientX, e.clientY);
        setReticlePos({
          x: Math.max(0, Math.min(STAGE_WIDTH, coords.x)),
          y: Math.max(0, Math.min(STAGE_HEIGHT, coords.y)),
        });
      }}
    >
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
        <div style={{ fontSize: 60 }}>🚓</div>
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

      {/* Arrow - Centered at target */}
      {arrowPos && (
        <div style={{
          position: "absolute",
          top: arrowPos.y - 15,
          left: arrowPos.x - 15,
          fontSize: 30,
          transform: "rotate(-45deg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 30,
          height: 30
        }}>
          🔗
        </div>
      )}

      {/* Reticle */}
      <div
        onPointerDown={handleDragStart}
        onClick={(e) => e.stopPropagation()}
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
          transform: `rotate(0deg)`,
          boxShadow: "0 0 15px rgba(251, 191, 36, 0.3)",
        }}
      >
        <div style={{ width: 8, height: 8, background: "#fbbf24", borderRadius: "50%" }}></div>
      </div>

      {/* Controls */}
      <div style={{ position: "absolute", bottom: 20, right: 20 }}>
        <button
          className="game-btn"
          onClick={(e) => {
            e.stopPropagation(); // Prevent repositioning targeting circle
            handleThrow();
          }}
          disabled={verified || arrowPos}
        >
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
