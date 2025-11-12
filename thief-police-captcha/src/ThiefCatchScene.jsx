import React, { useState, useEffect, useRef } from "react";

export default function ThiefCatchScene({ onVerify }) {
  const STAGE_WIDTH = 600;
  const STAGE_HEIGHT = 400;

  const policePos = { x: STAGE_WIDTH - 100, y: STAGE_HEIGHT / 2 - 50 };
  const thiefHome = { x: 50, y: STAGE_HEIGHT - 60 };
  const bank = { x: 50, y: 20 };

  const totalRounds = 2;
  const tripTime = 4000;
  const totalDistance = Math.abs(bank.y - thiefHome.y);
  const speed = totalDistance / (tripTime / 16.6);

  const [thiefPos, setThiefPos] = useState({ ...thiefHome });
  const [verified, setVerified] = useState(false);
  const [arrowPos, setArrowPos] = useState(null);
  const [message, setMessage] = useState("🎯 Drag the target and throw the stick!");
  const [reticlePos, setReticlePos] = useState({ x: bank.x + 30, y: bank.y + 20 });
  const [tripCount, setTripCount] = useState(0);
  const [kickEffect, setKickEffect] = useState(false);
  const [falling, setFalling] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [reticleAngle, setReticleAngle] = useState(0);

  const forwardRef = useRef(true);
  const pauseRef = useRef(false);
  const animationRefs = useRef({ arrow: null, thief: null });

  // Reticle rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setReticleAngle((p) => (p + 3) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Thief movement
  useEffect(() => {
    if (verified || showWelcome || falling) return;

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
            if (nextTrip >= totalRounds * 2) {
              if (!verified) {
                setMessage("🚨 Mission Failed! The thief escaped!");
                if (onVerify) onVerify(false);
                setShowWelcome(true);
              }
            } else {
              setTripCount(nextTrip);
              forwardRef.current = !forwardRef.current;
              pauseRef.current = false;
            }
          }, 800);

          return { ...pos, y: target.y };
        }

        const moveY = dy > 0 ? speed : -speed;
        const offsetX = Math.sin(Date.now() * 0.006) * 10;
        return { x: thiefHome.x + offsetX, y: pos.y + moveY };
      });

      frame = requestAnimationFrame(move);
    };

    frame = requestAnimationFrame(move);
    animationRefs.current.thief = frame;
    return () => cancelAnimationFrame(frame);
  }, [verified, showWelcome, tripCount, speed, falling]);

  // Throw stick
  const handleShoot = () => {
    if (verified || arrowPos) return;

    const startX = policePos.x;
    const startY = policePos.y;
    const targetX = reticlePos.x;
    const targetY = reticlePos.y;
    const duration = 500; // faster
    const startTime = performance.now();

    const reticleRadius = 48
    ; // wider for easier hit

    const animate = (time) => {
      const progress = Math.min(1, (time - startTime) / duration);
      const x = startX + (targetX - startX) * progress;
      const y = startY + (targetY - startY) * progress;
      setArrowPos({ x, y }); // stick stays visible

      // collision detection
      const dx = thiefPos.x - reticlePos.x;
      const dy = thiefPos.y - reticlePos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= reticleRadius && !verified) {
        setVerified(true);
        setKickEffect(true);
        setFalling(true); // start falling animation
        setMessage("💥 Boom! Thief kicked!");
        cancelAnimationFrame(animationRefs.current.arrow);

        // animate fall
        let fallPos = { ...thiefPos };
        const fallDuration = 600;
        const fallStart = performance.now();
        const fallAnimate = (time) => {
          const t = Math.min(1, (time - fallStart) / fallDuration);
          fallPos = { ...fallPos, y: thiefPos.y + t * 80, x: thiefPos.x + t * 20, rotation: t * 180 };
          setThiefPos(fallPos);

          if (t < 1) requestAnimationFrame(fallAnimate);
          else {
            setKickEffect(false);
            setFalling(false);
            setShowWelcome(true);
            if (onVerify) onVerify(true);
          }
        };
        requestAnimationFrame(fallAnimate);
        return;
      }

      if (progress < 1 && !verified) {
        animationRefs.current.arrow = requestAnimationFrame(animate);
      } else {
        if (!verified) setMessage("❌ Missed! Try again!");
        setTimeout(() => setArrowPos(null), 500);
      }
    };

    animationRefs.current.arrow = requestAnimationFrame(animate);
  };

  // drag reticle
  const handlePointerDown = (e) => {
    e.preventDefault();
    const move = (ev) => {
      const rect = e.target.closest("div").getBoundingClientRect();
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
    setReticlePos({ x: bank.x + 30, y: bank.y + 20 });
  };

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
        <h1 style={{ fontSize: 36 }}>{verified ? "🎉 Mission Complete!" : "🚨 Mission Failed!"}</h1>
        <h2 style={{ fontSize: 22, marginBottom: 20 }}>
          {verified ? "You caught the thief!" : "The thief escaped! Verification failed."}
        </h2>
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
          }}
        >
          🏦
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
          }}
        >
          🏠
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
            top: thiefPos.y,
            left: thiefPos.x,
            fontSize: 36,
            transform: falling ? `rotate(${thiefPos.rotation || 0}deg)` : undefined,
            transition: kickEffect || falling ? "all 0.2s ease" : "none",
          }}
        >
          {!verified ? "🕵️‍♂️" : "💀"}
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

        {/* Reticle */}
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
            transform: `rotate(${reticleAngle}deg)`,
            transition: "transform 0.1s linear",
            cursor: "grab",
          }}
        ></div>

        {/* Throw button */}
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
