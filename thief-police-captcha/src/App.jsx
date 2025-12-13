import React, { useMemo, useState, useEffect } from "react";
import ThiefCatchScene from "./ThiefCatchScene";
import JungleHuntScene from "./JungleHuntScene";
import TempleRunScene from "./TempleRunScene";
import OrientationSelector from "./OrientationSelector";
import GameIntro from "./GameIntro";
import LevelIntro from "./LevelIntro";
import { useSoundManager, MuteButton } from "./SoundManager";
import "./App.css";
import "./GameContent.css";

const TOTAL_LEVELS = 4;

export default function App({ onSuccess }) {
  const [orientation, setOrientation] = useState(null); // null, 'normal', or 'landscape'
  const [showIntro, setShowIntro] = useState(false); // Show intro after orientation selected
  const [showLevelIntro, setShowLevelIntro] = useState(true); // Show level instructions
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null); // "success", "fail", or null
  const [resultMeta, setResultMeta] = useState({});
  const [gameKey, setGameKey] = useState(0); // Used to force-reset levels
  const [roundsCleared, setRoundsCleared] = useState(0); // Track rounds for Level 2 Score Attack
  const [showLevel2Choice, setShowLevel2Choice] = useState(false); // Show choice after Level 2 round 1

  const { sounds, isMuted, setIsMuted } = useSoundManager();

  // Start background music when intro starts and keep it playing
  useEffect(() => {
    if (showIntro) {
      sounds.startBgMusic();
    }
  }, [showIntro]);

  // Show level intro when level changes
  useEffect(() => {
    setShowLevelIntro(true);
  }, [currentLevel]);

  const handleRetry = () => {
    // Retry the CURRENT level, don't reset to 1
    setResult(null);
    setResultMeta({});
    setGameKey(prev => prev + 1); // Force remount of the level component
    setRoundsCleared(0); // Reset rounds on retry

    if (currentLevel === 1) {
      setScore(0);
    }
    // For Level 2+, we might want to keep the score from previous levels?
    // Currently logic resets level score inside the scene, but global score is cumulative.
    // If we retry Level 2, we probably want to revert score to what it was at start of Level 2.
    // But for simplicity, we just keep accumulating or let the user deal with it.
    // Ideally: we should snapshot score at level start.
  };

  const handleLevelVerify = ({ success, level, scoreAward, reason, data, hits }) => {
    console.log("Level Verify:", { success, level, scoreAward, reason });

    if (success) {
      setScore((prev) => prev + (scoreAward || 0));

      // Level 1 Logic
      if (level === 1) {
        sounds.catch();
        setResult("success");
        setResultMeta({ level, reason: "caught" });
        // Auto-advance logic handled by UI button now
      }

      // Level 2 Logic (Round System)
      if (level === 2) {
        console.log("Level 2 complete! roundsCleared:", roundsCleared);

        // If we cleared 1 round (so we just finished round 2), we WIN the level
        // Round 0 (First 15s) -> Round 1 (Second 15s) -> Win
        if (roundsCleared >= 1) {
          sounds.catch();
          setResult("success");
          setResultMeta({ level, reason: "all_levels_cleared" });
          // Prepare for Level 3
          setTimeout(() => setCurrentLevel(3), 2000);
        } else {
          // After first round, show choice screen
          console.log("Round 1 complete - showing choice screen, showLevel2Choice will be:", true);
          setShowLevel2Choice(true);
        }
      }

      // Level 3 Logic
      if (level === 3) {
        sounds.catch();
        setResult("success");
        setResultMeta({ level, reason: "game_complete" });
        if (onSuccess) onSuccess({ score: score + (scoreAward || 0), rank: getRank(score + (scoreAward || 0)) });
      }

    } else {
      // Handle Round Retry (Time Attack regeneration)
      if (reason === "retry_round") {
        setScore((prev) => prev + (scoreAward || 0));

        // If we cleared 1 round (so we just finished round 2), we WIN the level
        if (roundsCleared >= 1) {
          setResult("success");
          setResultMeta({ level, reason: "all_levels_cleared" });
          setTimeout(() => setCurrentLevel(3), 2000);
        } else {
          setRoundsCleared(prev => prev + 1);
          setGameKey((prev) => prev + 1); // Regenerate level
        }
        return;
      }

      sounds.fail();
      setResult("fail");
      setResultMeta({ level, reason });
    }
  };

  const levelDisplayName = useMemo(
    () => {
      if (currentLevel === 1) return "City Chase";
      if (currentLevel === 2) return roundsCleared === 0 ? "Jungle Hunt (Round 1)" : "Jungle Hunt (Round 2)";
      if (currentLevel === 3) return "Temple Showdown";
      return "Complete";
    },
    [currentLevel, roundsCleared]
  );

  const getRank = (score) => {
    if (score > 1000) return "Legendary Sheriff 🌟";
    if (score > 700) return "Master Detective 🕵️‍♂️";
    if (score > 400) return "Senior Officer 👮";
    return "Rookie Cop 🐣";
  };

  const renderLevel = () => {
    // Show Level Intro first
    if (showLevelIntro) {
      return (
        <LevelIntro
          level={currentLevel}
          onStart={() => {
            setShowLevelIntro(false);
            // Ensure music is playing
            if (!isMuted) sounds.startBgMusic();
          }}
        />
      );
    }

    if (currentLevel === 1) {
      return (
        <ThiefCatchScene
          key={`level-1-${gameKey}`}
          onVerify={handleLevelVerify}
          sounds={sounds}
          autoAdvanceOnSuccess={false}
          autoAdvanceOnFail={false}
        />
      );
    }

    if (currentLevel === 2) {
      return (
        <JungleHuntScene
          key={`level-2-${gameKey}`}
          onVerify={handleLevelVerify}
          sounds={sounds}
          autoAdvanceOnSuccess={false}
          autoAdvanceOnFail={false}
        />
      );
    }

    if (currentLevel === 3) {
      return (
        <TempleRunScene
          key={`level-3-${gameKey}`}
          onVerify={handleLevelVerify}
          sounds={sounds}
        />
      );
    }

    return null;
  };

  return (
    <>
      {/* Show orientation selector if not selected yet */}
      {!orientation && <OrientationSelector onSelect={(o) => {
        setOrientation(o);
        setShowIntro(true); // Show intro after orientation is selected
      }} />}

      {/* Show epic intro after orientation selected */}
      {orientation && showIntro && (
        <GameIntro onComplete={() => setShowIntro(false)} />
      )}

      {/* Mute button */}
      {orientation && <MuteButton isMuted={isMuted} onToggle={() => setIsMuted(!isMuted)} />}

      {/* Show game only after orientation is selected and intro is done */}
      {orientation && !showIntro && (
        <div className={`game-container ${orientation === 'landscape' ? 'landscape-mode' : 'normal-mode'}`}>
          {/* HUD */}
          <div className="game-hud">
            <div className="hud-item">
              <span className="hud-label">Level</span>
              <span className="hud-value">{currentLevel === 2 && roundsCleared > 0 ? 3 : currentLevel === 3 ? 4 : currentLevel}/{TOTAL_LEVELS}</span>
            </div>
            <div className="hud-item">
              <span className="hud-label">Mission</span>
              <span className="hud-value">{levelDisplayName}</span>
            </div>
            <div className="hud-item">
              <span className="hud-label">Score</span>
              <span className="hud-value highlight">{score}</span>
            </div>
          </div>

          {renderLevel()}

          {/* Level 2 Choice Screen */}
          {showLevel2Choice && (
            <div className="final-overlay">
              <div className="final-card">
                <div className="icon-wrapper">
                  <div className="icon">🎯</div>
                </div>

                <h2 className="title">ROUND 1 COMPLETE!</h2>
                <p className="subtitle">Great job! What would you like to do?</p>

                <div className="score-card">
                  <div className="score-row">
                    <span>Current Score</span>
                    <span className="score-value">{score}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    className="game-btn"
                    onClick={() => {
                      setShowLevel2Choice(false);
                      setRoundsCleared(prev => prev + 1);
                      setGameKey(prev => prev + 1);
                    }}
                    style={{ flex: '1', minWidth: '200px' }}
                  >
                    🔄 PLAY AGAIN
                    <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.3rem' }}>Collect More Points!</div>
                  </button>
                  <button
                    className="game-btn"
                    onClick={() => {
                      setShowLevel2Choice(false);
                      setCurrentLevel(3);
                    }}
                    style={{ flex: '1', minWidth: '200px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  >
                    ➡️ CONTINUE
                    <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.3rem' }}>Next Level</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Success Popup (Final) */}
          {result === "success" && resultMeta.reason === "game_complete" && (
            <div className="final-overlay">
              <div className="final-card">
                <div className="confetti-container">
                  {[...Array(20)].map((_, i) => <div key={i} className="confetti" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, backgroundColor: ['#ff0', '#f00', '#0f0', '#00f'][Math.floor(Math.random() * 4)] }}></div>)}
                </div>

                <div className="icon-wrapper">
                  <div className="icon">🏆</div>
                </div>

                <h2 className="title">MISSION ACCOMPLISHED</h2>
                <p className="subtitle">The streets are safe again.</p>

                <div className="score-card">
                  <div className="score-row">
                    <span>Total Score</span>
                    <span className="score-value">{score}</span>
                  </div>
                  <div className="rank-row">
                    <span>Detective Rank</span>
                    <span className="rank-value">{getRank(score)}</span>
                  </div>
                </div>

                <button className="play-again-btn" onClick={() => window.location.reload()}>
                  Play Again
                </button>
              </div>

              <style>{`
            .final-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                animation: fadeIn 0.5s ease-out;
            }
            .final-card {
                background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 24px;
                padding: 40px;
                width: 90%;
                max-width: 450px;
                text-align: center;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                position: relative;
                overflow: hidden;
                animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .icon-wrapper {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #ffd700, #ffa500);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                box-shadow: 0 10px 20px rgba(255, 165, 0, 0.3);
                animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            .icon {
                font-size: 40px;
            }
            .title {
                margin: 0;
                font-family: 'Poppins', sans-serif;
                font-weight: 800;
                font-size: 28px;
                background: linear-gradient(to right, #fff, #ccc);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                letter-spacing: 1px;
            }
            .subtitle {
                color: #888;
                margin: 10px 0 30px;
                font-size: 16px;
            }
            .score-card {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 30px;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }
            .score-row, .rank-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                font-size: 14px;
                color: #aaa;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .rank-row {
                margin-bottom: 0;
                padding-top: 10px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            .score-value {
                font-size: 24px;
                font-weight: 700;
                color: #ffd700;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
            }
            .rank-value {
                font-size: 16px;
                font-weight: 600;
                color: #fff;
            }
            .play-again-btn {
                background: linear-gradient(90deg, #4caf50, #45a049);
                color: white;
                border: none;
                padding: 16px 32px;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
                transition: transform 0.2s, box-shadow 0.2s;
                box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            }
            .play-again-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
            }
            .play-again-btn:active {
                transform: translateY(0);
            }
            
            .confetti {
                position: absolute;
                width: 10px;
                height: 10px;
                top: -10px;
                animation: fall linear forwards;
            }
            
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes bounceIn { from { transform: scale(0); } to { transform: scale(1); } }
            @keyframes fall { 
                to { transform: translateY(100vh) rotate(720deg); } 
                0% { top: -10%; }
                100% { top: 110%; }
            }
            
            /* Randomize confetti duration */
            .confetti:nth-child(odd) { animation-duration: 2.5s; }
            .confetti:nth-child(even) { animation-duration: 3.5s; }
          `}</style>
            </div>
          )}

          {/* ✅ Success Popup (Level 1 & 2) */}
          {result === "success" && resultMeta.reason !== "game_complete" && (
            <div className="game-overlay">
              <div className="overlay-content">
                <h2 className="overlay-title">Level Complete!</h2>
                <p className="overlay-message">Target secured. Ready for the next challenge?</p>
                <button className="game-btn" onClick={() => {
                  setResult(null);
                  setCurrentLevel(prev => prev + 1);
                }}>
                  Next Level ➡️
                </button>
              </div>
            </div>
          )}

          {/* ❌ Fail Popup */}
          {result === "fail" && (
            <div className="game-overlay">
              <div className="overlay-content">
                <h2 className="overlay-title" style={{ background: "linear-gradient(to right, #ef4444, #f87171)" }}>Mission Failed</h2>
                <p className="overlay-message">The thief got away...</p>
                <button className="game-btn" style={{ background: "#ef4444" }} onClick={handleRetry}>
                  Retry Level 🔄
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
