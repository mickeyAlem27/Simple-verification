import React, { useState, useEffect } from 'react';
import './GameIntro.css';

export default function GameIntro({ onComplete }) {
    const [phase, setPhase] = useState('fade-in'); // fade-in, title, subtitle, fade-out

    useEffect(() => {
        const timers = [];

        // Phase 1: Fade in (1s)
        timers.push(setTimeout(() => setPhase('title'), 1000));

        // Phase 2: Show title (2s)
        timers.push(setTimeout(() => setPhase('subtitle'), 3000));

        // Phase 3: Show subtitle (2s)
        timers.push(setTimeout(() => setPhase('fade-out'), 5000));

        // Phase 4: Complete (1s fade out)
        timers.push(setTimeout(() => {
            onComplete?.();
        }, 6000));

        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    return (
        <div className={`game-intro ${phase}`}>
            {/* Background with animated gradient */}
            <div className="intro-background">
                <div className="intro-gradient"></div>
                <div className="intro-particles">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="particle" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}></div>
                    ))}
                </div>
            </div>

            {/* Main content */}
            <div className="intro-content">
                {/* Title */}
                <div className="intro-title">
                    <div className="title-line-1">THIEF</div>
                    <div className="title-vs">VS</div>
                    <div className="title-line-2">POLICE</div>
                </div>

                {/* Subtitle */}
                {(phase === 'subtitle' || phase === 'fade-out') && (
                    <div className="intro-subtitle">
                        <div className="subtitle-text">THE CHASE BEGINS</div>
                        <div className="subtitle-line"></div>
                        <div className="subtitle-tagline">Catch The Thief. Save The City.</div>
                    </div>
                )}

                {/* Bottom text */}
                {phase === 'subtitle' && (
                    <div className="intro-bottom">
                        <div className="press-start">GET READY...</div>
                    </div>
                )}
            </div>

            {/* Cinematic bars */}
            <div className="cinematic-bar cinematic-bar-top"></div>
            <div className="cinematic-bar cinematic-bar-bottom"></div>
        </div>
    );
}
