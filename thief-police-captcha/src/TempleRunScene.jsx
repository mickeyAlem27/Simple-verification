import React, { useState, useEffect, useRef } from "react";

const LEVEL_ID = 3;
const LEVEL_DURATION_MS = 20_000;
const REQUIRED_CATCHES = 5;
const GRID_SIZE = 3; // 3x3 Grid
const POPUP_INTERVAL_MS = 900; // How often they pop up
const POPUP_DURATION_MS = 800; // How long they stay up

export default function TempleRunScene({ onVerify }) {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(LEVEL_DURATION_MS / 1000);
    const [catches, setCatches] = useState(0);
    const [activeCell, setActiveCell] = useState(null); // { index: number, type: 'thief' | 'bomb' }
    const [gameState, setGameState] = useState("playing"); // playing, won, lost
    const [message, setMessage] = useState("Catch the Thief 5 times! Avoid Bombs!");
    const [evidence, setEvidence] = useState([]);

    const timerRef = useRef(null);
    const popupTimerRef = useRef(null);
    const sessionId = useRef(crypto.randomUUID());
    const gameStateRef = useRef(gameState);

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
                    handleGameOver("lost");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Popup Logic
        const spawnEntity = () => {
            // Clear current
            setActiveCell(null);

            // Wait a tiny bit then spawn new
            setTimeout(() => {
                if (gameStateRef.current !== "playing") return;

                const randomIndex = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
                // 30% chance of Bomb, 70% Thief
                const type = Math.random() > 0.3 ? "thief" : "bomb";

                setActiveCell({ index: randomIndex, type });

                // Auto-hide after duration
                setTimeout(() => {
                    setActiveCell((current) => {
                        if (current && current.index === randomIndex) return null;
                        return current;
                    });
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

    // Win Check
    useEffect(() => {
        if (catches >= REQUIRED_CATCHES && gameState === "playing") {
            handleGameOver("won");
        }
    }, [catches, gameState]); // Add dependencies

    const handleCellClick = (index) => {
        if (gameState !== "playing") return;

        if (activeCell && activeCell.index === index) {
            if (activeCell.type === "thief") {
                // Good hit
                setCatches((prev) => prev + 1);
                setScore((prev) => prev + 100);
                setMessage(`👊 Got him! (${catches + 1}/${REQUIRED_CATCHES})`);
                collectEvidence("hit_thief", { index, timeLeft });
                setActiveCell(null); // Hide immediately
            } else {
                // Bad hit (Bomb)
                setScore((prev) => Math.max(0, prev - 50));
                setMessage("💥 OUCH! That was a trap!");
                collectEvidence("hit_bomb", { index, timeLeft });
                setActiveCell(null);

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
                    <span>🎯 {catches}/{REQUIRED_CATCHES}</span>
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
                    const isActive = activeCell && activeCell.index === i;
                    const isThief = isActive && activeCell.type === "thief";
                    const isBomb = isActive && activeCell.type === "bomb";

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
