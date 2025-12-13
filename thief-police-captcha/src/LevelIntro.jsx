import React, { useState, useEffect } from 'react';
import './GameContent.css'; // Reuse existing styles or add new ones

const LEVEL_INFO = {
    1: {
        title: "CITY CHASE",
        subtitle: "The Pursuit Begins",
        objective: "Catch the thief before he escapes!",
        instructions: [
            "Wait for the thief to cross the TARGET CIRCLE",
            "Tap anywhere to KICK when he's inside",
            "Timing is everything - Don't miss!"
        ],
        icon: "🏃💨"
    },
    2: {
        title: "JUNGLE HUNT",
        subtitle: "Into the Wild",
        objective: "Find where the thief is hiding!",
        instructions: [
            "Watch the bushes carefully",
            "Track the thief's movement",
            "Tap the correct bush to catch him"
        ],
        icon: "🌿👀"
    },
    3: {
        title: "TEMPLE SHOWDOWN",
        subtitle: "The Final Stand",
        objective: "Catch as many thieves as you can!",
        instructions: [
            "Tap thieves 🥷 to catch them (+100 pts)",
            "AVOID bombs 💣 (-50 pts, -1 catch)",
            "Goal: Catch 5+ thieves in 30 seconds"
        ],
        icon: "🛕⚡"
    }
};

export default function LevelIntro({ level, onStart }) {
    const [animate, setAnimate] = useState(false);
    const info = LEVEL_INFO[level] || LEVEL_INFO[1];

    useEffect(() => {
        setAnimate(true);
    }, []);

    return (
        <div className="level-intro-overlay">
            <div className={`level-intro-card ${animate ? 'animate-in' : ''}`}>
                <div className="level-badge">LEVEL {level}</div>

                <div className="level-icon">{info.icon}</div>

                <h1 className="level-title">{info.title}</h1>
                <h3 className="level-subtitle">{info.subtitle}</h3>

                <div className="level-divider"></div>

                <div className="level-objective">
                    <strong>MISSION:</strong> {info.objective}
                </div>

                <div className="level-instructions">
                    {info.instructions.map((inst, i) => (
                        <div key={i} className="instruction-item">
                            <span className="bullet">➤</span>
                            <span>{inst}</span>
                        </div>
                    ))}
                </div>

                <button className="start-mission-btn" onClick={onStart}>
                    START MISSION
                </button>
            </div>

            <style>{`
                .level-intro-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.9);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    color: white;
                }

                .level-intro-card {
                    background: linear-gradient(145deg, #1e293b, #0f172a);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 40px;
                    width: 90%;
                    max-width: 500px;
                    text-align: center;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .level-intro-card.animate-in {
                    opacity: 1;
                    transform: translateY(0);
                }

                .level-badge {
                    background: #f59e0b;
                    color: #000;
                    font-weight: 800;
                    padding: 4px 12px;
                    border-radius: 12px;
                    display: inline-block;
                    font-size: 14px;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                }

                .level-icon {
                    font-size: 60px;
                    margin-bottom: 10px;
                    animation: float 3s ease-in-out infinite;
                }

                .level-title {
                    font-size: 32px;
                    font-weight: 800;
                    margin: 0;
                    background: linear-gradient(to right, #fff, #94a3b8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: 1px;
                }

                .level-subtitle {
                    color: #64748b;
                    font-size: 18px;
                    margin: 5px 0 20px;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .level-divider {
                    height: 1px;
                    background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
                    margin: 20px 0;
                }

                .level-objective {
                    font-size: 18px;
                    color: #e2e8f0;
                    margin-bottom: 25px;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 15px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .level-instructions {
                    text-align: left;
                    margin-bottom: 30px;
                    padding: 0 10px;
                }

                .instruction-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    margin-bottom: 12px;
                    color: #cbd5e1;
                    font-size: 16px;
                    line-height: 1.4;
                }

                .bullet {
                    color: #f59e0b;
                }

                .start-mission-btn {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border: none;
                    padding: 18px 40px;
                    border-radius: 16px;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.2s;
                    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .start-mission-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
                }

                .start-mission-btn:active {
                    transform: translateY(0);
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
}
