import { useEffect, useRef, useState } from 'react';

// Professional audio manager with real sound files
export function useSoundManager() {
    const [isMuted, setIsMuted] = useState(false);
    const audioRefs = useRef({});
    const bgMusicRef = useRef(null);

    // Initialize audio elements
    useEffect(() => {
        // Background music (looping)
        bgMusicRef.current = new Audio();
        bgMusicRef.current.loop = true;
        bgMusicRef.current.volume = 0.3; // Lower volume for gameplay

        // Sound effects - using local files
        audioRefs.current = {
            kick: new Audio('/sounds/kick.mp3'),
            throw: new Audio('/sounds/throw.mp3'),
            hit: new Audio('/sounds/hit.mp3'),
            catch: new Audio('/sounds/catch.mp3'),
            fail: new Audio('/sounds/fail.mp3'),
        };

        // Set volumes
        Object.values(audioRefs.current).forEach(audio => {
            audio.volume = 0.8;
        });

        return () => {
            if (bgMusicRef.current) {
                bgMusicRef.current.pause();
            }
        };
    }, []);

    // Mute/unmute
    useEffect(() => {
        if (bgMusicRef.current) {
            bgMusicRef.current.muted = isMuted;
        }
        Object.values(audioRefs.current).forEach(audio => {
            audio.muted = isMuted;
        });
    }, [isMuted]);

    const playSound = (soundName) => {
        if (isMuted || !audioRefs.current[soundName]) return;

        const audio = audioRefs.current[soundName];
        audio.currentTime = 0;
        audio.play().catch(err => console.error('Sound play failed:', soundName, err));
    };

    const playBackgroundMusic = (url) => {
        if (isMuted || !bgMusicRef.current) return;

        bgMusicRef.current.src = url;
        bgMusicRef.current.play().catch(err => console.log('BG music play failed:', err));
    };

    const stopBackgroundMusic = () => {
        if (bgMusicRef.current) {
            bgMusicRef.current.pause();
            bgMusicRef.current.currentTime = 0;
        }
    };

    const sounds = {
        kick: () => playSound('kick'),
        throw: () => playSound('throw'),
        hit: () => playSound('hit'),
        catch: () => playSound('catch'),
        fail: () => playSound('fail'),
        startBgMusic: () => playBackgroundMusic('/sounds/bgmusic.mp3'),
        stopBgMusic: () => stopBackgroundMusic(),
        setBgVolume: (volume) => {
            if (bgMusicRef.current) {
                bgMusicRef.current.volume = volume;
            }
        },
    };

    return { sounds, isMuted, setIsMuted };
}

// Mute button component
export function MuteButton({ isMuted, onToggle }) {
    return (
        <button
            onClick={onToggle}
            title={isMuted ? "Unmute" : "Mute"}
            style={{
                position: 'fixed',
                top: '15px',
                right: '15px',
                zIndex: 10000,
                background: 'rgba(50,50,50,0.8)',
                border: 'none',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
        >
            {isMuted ? '🔇' : '🔊'}
        </button>
    );
}
