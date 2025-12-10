import React, { useEffect, useMemo, useRef, useState } from "react";

const LEVEL_ID = 2;
const LEVEL_SCORE = 220;
const LEVEL_DURATION_MS = 15_000; // Increased slightly for time attack
const IDOL_HIT_RADIUS = 28;
const TARGET_RING_RADIUS = 38;
const TREE_CANOPY_SIZE = 120;
const TREE_COUNT = 7; // 7 Trees total
const TARGET_COUNT = 7; // 4 Real + 3 Fake = 7 Total active spots
const REQUIRED_HITS = 4; // Must hit ALL 4 Real Targets
const TREE_X_OFFSET = 165;
const TREE_TOP_MARGIN = 18;
const TREE_BOTTOM_MARGIN = 36;

const STAGE_WIDTH = 720;
const STAGE_HEIGHT = 480; // Match new standard

export default function JungleHuntScene({
  onVerify,
  autoAdvanceOnSuccess = false,
  autoAdvanceOnFail = false,
}) {
  const policeCamp = { x: 90, y: STAGE_HEIGHT - 120 };
  const trees = useMemo(() => {
    const baseX = STAGE_WIDTH - TREE_X_OFFSET;
    const availableHeight = STAGE_HEIGHT - TREE_TOP_MARGIN - TREE_BOTTOM_MARGIN - TREE_CANOPY_SIZE;
    const spacing = TREE_COUNT > 1 ? availableHeight / (TREE_COUNT - 1) : 0;
    const palettes = [
      "linear-gradient(135deg, #1e8b4c, #0a3f23)",
      "linear-gradient(125deg, #2b7445, #11351f)",
      "linear-gradient(140deg, #347c4e, #13361c)",
      "linear-gradient(120deg, #26613d, #0a2414)",
      "linear-gradient(140deg, #3b8c5b, #173828)",
      "linear-gradient(135deg, #2f7a53, #0d2d1c)",
    ];

    return Array.from({ length: TREE_COUNT }, (_, index) => {
      // Create a curve: Trees in the middle are further left/right
      // Using sine wave for a natural arc
      const normalizedPos = index / (TREE_COUNT - 1); // 0 to 1
      const curveOffset = Math.sin(normalizedPos * Math.PI) * 80; // Curve amount

      return {
        id: `tree-${index + 1}`,
        x: baseX - 50 + curveOffset, // Reverse curve: Middle trees are further right (bowl shape)
        y: TREE_TOP_MARGIN + index * spacing,
        canopy: palettes[index % palettes.length],
      };
    });
  }, []);

  const getTargetAnchor = (tree) => ({
    x: tree.x + TREE_CANOPY_SIZE * 0.65,
    y: tree.y + TREE_CANOPY_SIZE * 0.18,
  });

  const [gameTargets] = useState(() => {
    const ids = trees.map((tree) => tree.id);
    // Shuffle ids
    const shuffled = [...ids].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, TARGET_COUNT);

    // First 4 are Real, last 3 are Fake
    const real = new Set(selected.slice(0, 4));
    const fake = new Set(selected.slice(4, 7));

    return {
      all: selected,
      real,
      fake
    };
  });

  const initialReticle = useMemo(
    () => ({
      x: STAGE_WIDTH / 2,
      y: STAGE_HEIGHT / 2,
    }),
    []
  );
  const reticleRef = useRef(initialReticle);
  const [reticlePos, setReticlePos] = useState(initialReticle);
  const [dartPos, setDartPos] = useState(null);
  const [message, setMessage] = useState("🌿 Find all 4 REAL idols! Time regenerates the jungle!");
  const [hitTargets, setHitTargets] = useState([]);
  const [timeLeft, setTimeLeft] = useState(LEVEL_DURATION_MS / 1000);
  const [levelActive, setLevelActive] = useState(true);
  const [verified, setVerified] = useState(false);
  const [evidence, setEvidence] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const PER_IDOL_SCORE = Math.round(LEVEL_SCORE / 4); // Split score among 4 targets
  const [levelScore, setLevelScore] = useState(0);
  const sessionId = useRef(crypto.randomUUID());
  const animationRef = useRef(null);
  const timeoutRef = useRef(null);
  const countdownRef = useRef(null);
  const resolvedRef = useRef(false);
  const hitSetRef = useRef(new Set());
  const stageRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setLevelActive(false);
      // Time Attack: Game ends ONLY when time is up
      // If we didn't hit all targets by now, we FAIL.
      finalizeFailure("time_up");
    }, LEVEL_DURATION_MS);

    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [levelScore]); // Added levelScore dependency to ensure we send correct score

  const collectEvidence = (type, data = {}) => {
    setEvidence((prev) => [...prev, { type, time: Date.now(), ...data }]);
  };

  const stopTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const resolveOutcome = () => {
    if (resolvedRef.current) return false;
    resolvedRef.current = true;
    setLevelActive(false);
    stopTimers();
    return true;
  };

  const sendVerifyToServer = async (success) => {
    const requestId = Math.random().toString(36).substring(2, 9);

    const log = (...args) => {
      console.log(`[${new Date().toISOString()}] [J${requestId}]`, ...args);
    };

    try {
      const apiUrl = "/api/verify";
      const payload = {
        level: LEVEL_ID,
        success: Boolean(success),
        evidence,
        sessionId: sessionId.current,
        requestId,
        timestamp: new Date().toISOString(),
      };

      log("Dispatching jungle verification", payload);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Level-ID": LEVEL_ID,
          "X-Request-ID": requestId,
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        const err = new Error(`HTTP error! status: ${response.status}`);
        err.status = response.status;
        err.response = data;
        log("Server responded with error", err);
        throw err;
      }

      log("Jungle verification success", data);
      return data;
    } catch (error) {
      console.error("Jungle verification failed", error);
      throw error;
    }
  };

  const finalizeSuccess = (reason = "all_targets") => {
    if (!resolveOutcome()) return;
    setVerified(true);
    setMessage(
      reason === "all_targets"
        ? "🔥 All real idols secured!"
        : "🔥 Time's up! Mission Accomplished."
    );
    if (!autoAdvanceOnSuccess) setShowOverlay(true);

    // Calculate total payout including what we already added to levelScore
    // Actually levelScore tracks what we hit THIS round.
    const payout = levelScore;

    sendVerifyToServer(true)
      .then((data) => {
        onVerify?.({
          success: true,
          data,
          level: LEVEL_ID,
          scoreAward: payout,
          hits: hitSetRef.current.size,
        });
      })
      .catch((error) => {
        onVerify?.({ success: false, level: LEVEL_ID, reason: "server_error", error });
      });
  };

  const finalizeFailure = (reason) => {
    if (!resolveOutcome()) return;
    if (!autoAdvanceOnFail) setShowOverlay(true);
    onVerify?.({ success: false, level: LEVEL_ID, reason });
    sessionId.current = crypto.randomUUID();
  };

  const animateDart = (start, end, callback) => {
    const duration = 500;
    const startTime = performance.now();

    const step = (time) => {
      const progress = Math.min(1, (time - startTime) / duration);
      const x = start.x + (end.x - start.x) * progress;
      const y = start.y + (end.y - start.y) * progress;
      setDartPos({ x, y });
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        setTimeout(() => setDartPos(null), 200);
        callback?.();
      }
    };

    animationRef.current = requestAnimationFrame(step);
  };

  const handleThrow = () => {
    if (verified || !levelActive) return;

    const start = { x: policeCamp.x + 40, y: policeCamp.y - 20 };
    const shotTarget = { ...reticleRef.current };

    collectEvidence("throw", {
      reticle: shotTarget,
      targets: gameTargets,
      alreadyHit: Array.from(hitSetRef.current),
      timeLeft,
    });

    animateDart(start, shotTarget, () => {
      let closestTreeId = null;
      let minDistance = Infinity;
      let closestTargetId = null;
      let minTargetDistance = Infinity;

      trees.forEach((tree) => {
        const { x: anchorX, y: anchorY } = getTargetAnchor(tree);
        const dx = shotTarget.x - anchorX;
        const dy = shotTarget.y - anchorY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance) {
          minDistance = distance;
          closestTreeId = tree.id;
        }
        if (gameTargets.all.includes(tree.id) && distance < minTargetDistance) {
          minTargetDistance = distance;
          closestTargetId = tree.id;
        }
      });

      const hitTargetId = closestTargetId && minTargetDistance <= IDOL_HIT_RADIUS ? closestTargetId : null;

      if (hitTargetId) {
        const alreadyHit = hitSetRef.current.has(hitTargetId);
        if (!alreadyHit) {
          if (gameTargets.real.has(hitTargetId)) {
            // Real Target Hit
            hitSetRef.current.add(hitTargetId);
            const updated = hitSetRef.current.size;
            setHitTargets(Array.from(hitSetRef.current));
            setLevelScore((prev) => prev + PER_IDOL_SCORE);
            collectEvidence("hit_real", { distance: minTargetDistance, treeId: hitTargetId, timeLeft, updated });

            setMessage(`🎯 Real Idol secured! (${updated}/${REQUIRED_HITS})`);

            // Early Win Check -> Now triggers REGENERATION (Round Retry)
            if (updated >= REQUIRED_HITS) {
              setTimeout(() => {
                // We send "retry_round" as failure reason to trigger the special logic in App.jsx
                // But technically it's a "success" for this round.
                // App.jsx expects success=false + reason="retry_round" to regenerate.

                onVerify?.({
                  success: false,
                  level: LEVEL_ID,
                  reason: "retry_round",
                  scoreAward: levelScore + PER_IDOL_SCORE // Include the last hit!
                });
              }, 500);
            }
          } else {
            // Fake Target Hit
            collectEvidence("hit_fake", { distance: minTargetDistance, treeId: hitTargetId, timeLeft });
            setMessage("⚠️ That's a FAKE! No points!");
          }
        } else {
          collectEvidence("repeat_hit", { distance: minTargetDistance, treeId: hitTargetId, timeLeft });
          setMessage("⚡ Idol already secured! Find the remaining target.");
        }
      } else {
        collectEvidence("miss", { distance: minDistance, treeId: closestTreeId, timeLeft });
        setMessage("🙈 Missed! Stick the idol itself, not just the glow.");
      }
    });
  };

  const clampReticle = (x, y) => ({
    x: Math.max(40, Math.min(STAGE_WIDTH - 40, x)),
    y: Math.max(20, Math.min(STAGE_HEIGHT - 40, y)),
  });

  const setReticle = (pos) => {
    const clamped = clampReticle(pos.x, pos.y);
    reticleRef.current = clamped;
    setReticlePos(clamped);
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

  const handleDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const move = (event) => {
      const coords = getGameCoordinates(event.clientX, event.clientY);
      setReticle(coords);
    };

    const up = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
    };

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  };

  const handleStagePointerDown = (e) => {
    if (!stageRef.current || !levelActive || verified) return;
    const coords = getGameCoordinates(e.clientX, e.clientY);
    setReticle(coords);
  };

  if (showOverlay) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f5132, #062d19)",
          color: "white",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1>{verified ? "🔥 Jungle Clear!" : "🌪️ Lost in the jungle"}</h1>
          <p>{verified ? "You nailed the glowing tree!" : "Too many misses. The thief escaped deeper."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-stage"
      ref={stageRef}
      onPointerDown={handleStagePointerDown}
      style={{
        background: "linear-gradient(to bottom, #1b5e20, #0b3414)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 40% 20%, rgba(255,255,255,0.08), transparent 55%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 30%, rgba(255,255,255,0.06), transparent 50%)" }} />

      <div
        style={{
          position: "absolute",
          left: policeCamp.x,
          top: policeCamp.y,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span style={{ fontSize: 32 }}>👮‍♂️</span>
        <span style={{ fontSize: 14, color: "#ffd54f" }}>Jungle Scout</span>
      </div>

      <div
        style={{
          position: "absolute",
          left: policeCamp.x + 60,
          top: policeCamp.y + 40,
          fontSize: 28,
        }}
      >
        🔥
      </div>

      {trees.map((tree) => {
        const isTarget = gameTargets.all.includes(tree.id);
        const isHit = hitSetRef.current.has(tree.id);

        if (isTarget && isHit) {
          return (
            <div
              key={tree.id}
              style={{
                position: "absolute",
                left: tree.x,
                top: tree.y,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                flexDirection: "column",
                gap: 0,
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: TREE_CANOPY_SIZE,
                  height: TREE_CANOPY_SIZE,
                }}
              >
                {[0, 1, 2].map((layer) => (
                  <div
                    key={`${tree.id}-layer-${layer}`}
                    style={{
                      position: "absolute",
                      top: layer * -12,
                      left: (TREE_CANOPY_SIZE - (TREE_CANOPY_SIZE - layer * 30)) / 2,
                      width: TREE_CANOPY_SIZE - layer * 30,
                      height: 70,
                      background: tree.canopy,
                      borderRadius: 20,
                      filter: `drop-shadow(0 6px 6px rgba(0,0,0,${0.35 - layer * 0.08}))`,
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      border: "1px solid rgba(0,0,0,0.2)",
                    }}
                  ></div>
                ))}
              </div>
              <div
                style={{
                  width: 20,
                  height: 85,
                  background: "linear-gradient(180deg, #5a3419, #2d1407)",
                  borderRadius: 12,
                  marginTop: -12,
                  boxShadow: "inset 0 0 5px rgba(0,0,0,0.35)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", inset: 2, borderRadius: 12, background: "linear-gradient(90deg, rgba(255,255,255,0.12), transparent)", opacity: 0.4 }} />
              </div>
            </div>
          );
        }

        return (
          <div
            key={tree.id}
            style={{
              position: "absolute",
              left: tree.x,
              top: tree.y,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              flexDirection: "column",
              gap: 0,
            }}
          >
            <div
              style={{
                position: "relative",
                width: TREE_CANOPY_SIZE,
                height: TREE_CANOPY_SIZE,
              }}
            >
              {[0, 1, 2].map((layer) => (
                <div
                  key={`${tree.id}-layer-${layer}`}
                  style={{
                    position: "absolute",
                    top: layer * -12,
                    left: (TREE_CANOPY_SIZE - (TREE_CANOPY_SIZE - layer * 30)) / 2,
                    width: TREE_CANOPY_SIZE - layer * 30,
                    height: 70,
                    background: tree.canopy,
                    borderRadius: 20,
                    filter: `drop-shadow(0 6px 6px rgba(0,0,0,${0.35 - layer * 0.08}))`,
                    clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                    border: isTarget ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.2)",
                  }}
                ></div>
              ))}

              {isTarget && (
                <div
                  style={{
                    position: "absolute",
                    top: getTargetAnchor(tree).y - tree.y - TARGET_RING_RADIUS,
                    left: getTargetAnchor(tree).x - tree.x - TARGET_RING_RADIUS,
                    width: TARGET_RING_RADIUS * 2,
                    height: TARGET_RING_RADIUS * 2,
                    borderRadius: "50%",
                    border: "2px dashed rgba(255,255,255,0.85)",
                    boxShadow: "0 0 14px rgba(255,255,255,0.7)",
                    animation: "pulse 1.4s infinite",
                    background: "rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 5,
                    pointerEvents: "none",
                    mixBlendMode: "screen",
                  }}
                >
                  <span style={{ fontSize: 28 }}>🔮</span>
                </div>
              )}
            </div>
            <div
              style={{
                width: 20,
                height: 85,
                background: "linear-gradient(180deg, #5a3419, #2d1407)",
                borderRadius: 12,
                marginTop: -12,
                boxShadow: "inset 0 0 5px rgba(0,0,0,0.35)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 2,
                  borderRadius: 12,
                  background: "linear-gradient(90deg, rgba(255,255,255,0.12), transparent)",
                  opacity: 0.4,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: -12,
                  width: 12,
                  height: 32,
                  borderRadius: 12,
                  background: "linear-gradient(180deg, #3f8b3a, #1f4f1c)",
                  transform: "rotate(-18deg)",
                  opacity: 0.6,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 38,
                  right: -14,
                  width: 14,
                  height: 42,
                  borderRadius: 14,
                  background: "linear-gradient(180deg, #3d7041, #1c341d)",
                  transform: "rotate(24deg)",
                  opacity: 0.5,
                }}
              />
            </div>
          </div>
        );
      })}

      {dartPos && (
        <div
          style={{
            position: "absolute",
            left: dartPos.x,
            top: dartPos.y,
            fontSize: 32,
          }}
        >
          🗡️
        </div>
      )}

      <div
        onPointerDown={handleDragStart}
        style={{
          position: "absolute",
          left: reticlePos.x - 28,
          top: reticlePos.y - 28,
          width: 56,
          height: 56,
          border: "3px dashed #ffeb3b",
          borderRadius: "50%",
          boxShadow: "0 0 12px rgba(255,235,59,0.9)",
          cursor: "grab",
        }}
      ></div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 90,
          background: "linear-gradient(180deg, rgba(16,64,38,0.95), rgba(16,64,38,0))",
        }}
      ></div>

      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
        }}
      >
        <button
          className="game-btn"
          onClick={handleThrow}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={verified || !levelActive}
        >
          {verified ? "Captured" : levelActive ? "Throw Spear" : "Time Up"}
        </button>
      </div>

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
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.9; }
            50% { transform: scale(1.05); opacity: 0.4; }
            100% { transform: scale(0.95); opacity: 0.9; }
          }
        `}
      </style>
    </div >
  );
}
