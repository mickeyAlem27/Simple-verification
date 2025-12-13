import React, { useState, useEffect, useRef } from "react";

const LEVEL_ID = 3;
const LEVEL_DURATION_MS = 30_000; // 30 seconds
const REQUIRED_CATCHES = 5;
const GRID_SIZE = 3; // 3x3 Grid
const POPUP_INTERVAL_MS = 900; // How often they pop up
const POPUP_DURATION_MS = 800; // How long they stay up

export default function TempleRunScene({ onVerify, sounds }) {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(LEVEL_DURATION_MS / 1000);
    const [catches, setCatches] = useState(0);
    const [activeCells, setActiveCells] = useState([]); // Array of active cells
    const [gameState, setGameState] = useState("playing"); // playing, won, lost
    const [message, setMessage] = useState("Survive 30 seconds! Catch 5+ thieves to pass!");
    const [evidence, setEvidence] = useState([]);

    const timerRef = useRef(null);
    const popupTimerRef = useRef(null);
    const sessionId = useRef(crypto.randomUUID());
    const gameStateRef = useRef(gameState);
    const catchesRef = useRef(0); // Track catches for timer
    const scoreRef = useRef(0); // Track score for timer
    const attemptsRef = useRef(0); // Track total clicks/attempts

    // Keep ref in sync with state
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    // Grid of 9 spots
    const gridSpots = Array.from({ length: GRID_SIZE * GRID_SIZE });

    const collectEvidence = (type, data = {}) => {
        setEvidence((prev) => [...prev, { type, time: Date.now(), ...data }]);
    };

    const sendVerifyToServer = async (success) => {
        const requestId = Math.random().toString(36).substring(2, 9);
        try {
            const response = await fetch("/api/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Level-ID": LEVEL_ID,
                    "X-Request-ID": requestId,
                },
                body: JSON.stringify({
                    level: LEVEL_ID,
                    success,
                    evidence,
                    sessionId: sessionId.current,
                    requestId,
                    timestamp: new Date().toISOString(),
                }),
            });

            // Handle empty response
            const text = await response.text();
            if (!text) {
                console.warn("Empty response from server, treating as success");
                return { success: true, message: "Verification complete" };
            }

            try {
                return JSON.parse(text);
            } catch (e) {
                console.warn("Invalid JSON response:", text);
                return { success: true, message: "Verification complete" };
            }
        } catch (error) {
            console.error("Verification failed", error);
            throw error;
        }
    };

    const handleGameOver = (result) => {
        setGameState(result);
        clearInterval(timerRef.current);
        clearInterval(popupTimerRef.current);

        if (result === "won") {
            setMessage("🏆 You caught him! Justice is served!");
            sendVerifyToServer(true).then((data) => {
                setTimeout(() => {
                    onVerify({ success: true, level: LEVEL_ID, scoreAward: score + 500, data });
                }, 1500);
            });
        } else {
            setMessage("💀 He escaped into the shadows...");
            onVerify({ success: false, level: LEVEL_ID, reason: "timeout" });
        }
    };

    // Game Loop
    useEffect(() => {
        // Countdown
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Time's up! Check if player caught enough thieves
                    clearInterval(timerRef.current);
                    clearInterval(popupTimerRef.current);

                    // Need 5+ catches to pass
                    if (catchesRef.current >= REQUIRED_CATCHES) {
                        setGameState("won");
                        setMessage(`🏆 Time's up! You caught ${catchesRef.current} thieves! Final Score: ${scoreRef.current}`);
                        sendVerifyToServer(true).then((data) => {
                            setTimeout(() => {
                                onVerify({ success: true, level: LEVEL_ID, scoreAward: scoreRef.current + 500, data });
                            }, 1500);
                        });
                    } else {
                        setGameState("lost");
                        setMessage(`💀 Time's up! Only caught ${catchesRef.current}/${REQUIRED_CATCHES} thieves!`);
                        onVerify({ success: false, level: LEVEL_ID, reason: "insufficient_catches" });
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Popup Logic - Spawn 2 bombs + 1 thief for more engaging gameplay
        // Popup Logic - Spawn 2 bombs + 1 thief
        const spawnEntity = () => {
            // Clear current
            setActiveCells([]);

            // Wait a tiny bit then spawn new
            setTimeout(() => {
                if (gameStateRef.current !== "playing") return;

                // Get 3 unique random positions
                const positions = new Set();
                while (positions.size < 3) {
                    positions.add(Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE)));
                }
                const posArray = Array.from(positions);

                const newEntities = [
                    { index: posArray[0], type: "thief" },
                    { index: posArray[1], type: "bomb" },
                    { index: posArray[2], type: "bomb" }
                ];

                setActiveCells(newEntities);

                setActiveCells(newEntities);

                // We don't increment attempts here anymore - only on user interaction

                // Auto-hide after duration
                setTimeout(() => {
                    setActiveCells([]);
                }, POPUP_DURATION_MS);

            }, 200);
        };

        popupTimerRef.current = setInterval(spawnEntity, POPUP_INTERVAL_MS);
        spawnEntity(); // First spawn

        return () => {
            clearInterval(timerRef.current);
            clearInterval(popupTimerRef.current);
        };
    }, []); // Empty deps is OK now because we use ref

    // No instant win - must survive full 30 seconds

    const handleCellClick = (index) => {
        if (gameState !== "playing") return;

        // Increment attempts for ANY click
        attemptsRef.current += 1;

        const clickedEntity = activeCells.find(c => c.index === index);

        if (clickedEntity) {
            // Remove this entity immediately
            setActiveCells(prev => prev.filter(c => c.index !== index));

            if (clickedEntity.type === "thief") {
                // Good hit
                sounds?.catch();
                const newCatches = catches + 1;
                setCatches(newCatches);
                catchesRef.current = newCatches; // Update ref
                setScore((prev) => {
                    const newScore = prev + 100;
                    scoreRef.current = newScore;
                    return newScore;
                });
                setMessage(`👊 Got him! (${newCatches}/${attemptsRef.current})`);
                collectEvidence("hit_thief", { index, timeLeft });
            } else {
                // Bad hit (Bomb) - Decrease catches AND score
                sounds?.fail();
                const newCatches = Math.max(0, catches - 1);
                setCatches(newCatches);
                catchesRef.current = newCatches;
                setScore((prev) => {
                    const newScore = Math.max(0, prev - 50);
                    scoreRef.current = newScore;
                    return newScore;
                });
                setMessage(`💥 OUCH! That was a trap! -1 catch, -50 points (${newCatches}/${attemptsRef.current})`);
                collectEvidence("hit_bomb", { index, timeLeft });

                // Screen shake effect
                document.body.style.transform = "translate(5px, 5px)";
                setTimeout(() => document.body.style.transform = "none", 100);
            }
        } else {
            // Miss
            collectEvidence("miss", { index, timeLeft });
        }
    };

    return (
        <div className="game-stage" style={{ background: "linear-gradient(135deg, #2c3e50, #000000)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

            <div style={{ marginBottom: 20, textAlign: "center" }}>
                <h2 style={{ margin: 0, color: "#f1c40f", fontSize: 24 }}>TEMPLE SHOWDOWN</h2>
                <div style={{ display: "flex", gap: 20, marginTop: 10, fontSize: 18, fontWeight: "bold", color: "#ccc" }}>
                    <span>⏱️ {timeLeft}s</span>
                    <span>🎯 {catches}/{attemptsRef.current}</span>
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 15,
                    padding: 10,
                    background: "#111",
                    borderRadius: 15,
                    border: "2px solid #444"
                }}
            >
                {gridSpots.map((_, i) => {
                    const activeEntity = activeCells.find(c => c.index === i);
                    const isActive = !!activeEntity;
                    const isThief = activeEntity?.type === "thief";
                    const isBomb = activeEntity?.type === "bomb";

                    return (
                        <div
                            key={i}
                            onPointerDown={() => handleCellClick(i)}
                            style={{
                                width: 100,
                                height: 100,
                                background: "#333",
                                borderRadius: 10,
                                position: "relative",
                                cursor: "pointer",
                                overflow: "hidden",
                                borderBottom: "4px solid #222",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 50,
                                userSelect: "none",
                            }}
                        >
                            {/* Hiding Spot (Urn/Pillar) */}
                            <div style={{
                                position: "absolute",
                                bottom: 0,
                                width: "80%",
                                height: "40%",
                                background: "#555",
                                borderRadius: "50% 50% 0 0",
                                zIndex: 1
                            }}></div>

                            {/* Entity */}
                            <div style={{
                                position: "absolute",
                                bottom: isActive ? "30%" : "-100%",
                                transition: "bottom 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                zIndex: 0,
                                filter: isBomb ? "drop-shadow(0 0 10px red)" : "none"
                            }}>
                                {isThief ? "🥷" : isBomb ? "💣" : ""}
                            </div>
                        </div>
                    );
                })}
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
        </div>
    );
}
