import React from 'react';
import './OrientationSelector.css';

export default function OrientationSelector({ onSelect }) {
    return (
        <div className="orientation-selector">
            <div className="animated-background">
                <div className="blur-circle blur-circle-1"></div>
                <div className="blur-circle blur-circle-2"></div>
                <div className="blur-circle blur-circle-3"></div>
            </div>

            <div className="selector-content">
                <div className="game-title">
                    <h1>🕵️ Thief vs Police 👮</h1>
                    <p>Choose Your Play Mode</p>
                </div>

                <div className="button-container">
                    <button
                        className="mode-button normal-mode"
                        onClick={() => onSelect('normal')}
                    >
                        <span className="button-icon">📱</span>
                        <span className="button-text">Play Normal</span>
                        <span className="button-desc">Portrait Mode</span>
                    </button>

                    <button
                        className="mode-button landscape-mode"
                        onClick={() => onSelect('landscape')}
                    >
                        <span className="button-icon">🔄</span>
                        <span className="button-text">Play Landscape</span>
                        <span className="button-desc">Rotate Device</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
