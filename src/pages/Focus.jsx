
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

const BreathingCycle = ({ duration, text }) => {
    return (
        <div className="text-center transition-opacity duration-500">
            <p className="text-xl mb-4 text-white">{text}</p>
            <div className="w-16 h-16 rounded-full border-2 border-white mx-auto flex items-center justify-center animate-pulse" style={{ animationDuration: `${duration}s` }}>
                <div className="w-8 h-8 bg-white rounded-full animate-ping" style={{ animationDuration: `${duration}s` }}></div>
            </div>
        </div>
    );
};

export default function Focus() {
    const [focusMode, setFocusMode] = useState(false);
    const [ambientSoundId, setAmbientSoundId] = useState("none");
    const [soundPlaying, setSoundPlaying] = useState(false);
    const [volume, setVolume] = useState(0.3);
    const audioRef = useRef(null);

    const ambientSounds = [
        { id: "none", name: "None", description: "Pure silence" },
        { id: "white", name: "White Noise", description: "Static sound", programmatic: true }
    ];

    // Breathing exercise state
    const [breathingActive, setBreathingActive] = useState(false);
    const [breathingPhase, setBreathingPhase] = useState(0);
    const breathingPhases = [
        { text: "Inhale", duration: 4 },
        { text: "Hold", duration: 4 },
        { text: "Exhale", duration: 4 },
        { text: "Hold", duration: 4 },
    ];

    useEffect(() => {
        let timer;
        if (breathingActive) {
            const phaseDuration = breathingPhases[breathingPhase].duration * 1000;
            timer = setTimeout(() => {
                setBreathingPhase((prev) => (prev + 1) % breathingPhases.length);
            }, phaseDuration);
        }
        return () => clearTimeout(timer);
    }, [breathingActive, breathingPhase, breathingPhases]);

    const toggleFocusMode = () => {
        setFocusMode(prev => {
            const isEntering = !prev;
            if (isEntering) {
                document.documentElement.requestFullscreen().catch(e => {
                    console.error("Failed to enter fullscreen:", e);
                });
            } else {
                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(e => {
                        console.error("Failed to exit fullscreen:", e);
                    });
                }
            }
            return isEntering;
        });
    };
    
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setFocusMode(false);
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Generate white noise programmatically
    const generateWhiteNoise = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const bufferSize = 2 * audioContext.sampleRate;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = audioContext.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        
        const gainNode = audioContext.createGain();
        gainNode.gain.value = volume * 0.1;
        
        whiteNoise.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        return { source: whiteNoise, context: audioContext, gain: gainNode };
    };

    const [whiteNoiseNodes, setWhiteNoiseNodes] = useState(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
        if (whiteNoiseNodes) {
            whiteNoiseNodes.gain.gain.value = volume * 0.1;
        }
    }, [volume, whiteNoiseNodes]);
    
    useEffect(() => {
        const selectedSound = ambientSounds.find(s => s.id === ambientSoundId);

        if (soundPlaying) {
            if (selectedSound?.programmatic) {
                if (!whiteNoiseNodes) {
                    const nodes = generateWhiteNoise();
                    nodes.source.start(0);
                    setWhiteNoiseNodes(nodes);
                }
            } else if (selectedSound?.url) {
                if (audioRef.current) {
                    audioRef.current.play().catch(e => console.error("Audio play failed:", e.message));
                }
            }
        } else {
            if (whiteNoiseNodes) {
                whiteNoiseNodes.source.stop();
                whiteNoiseNodes.context.close();
                setWhiteNoiseNodes(null);
            }
            if (audioRef.current) {
                audioRef.current.pause();
            }
        }

        return () => {
            if (!soundPlaying && whiteNoiseNodes) {
                whiteNoiseNodes.source.stop();
                whiteNoiseNodes.context.close();
                setWhiteNoiseNodes(null);
            }
        };
    }, [soundPlaying, ambientSoundId, ambientSounds, whiteNoiseNodes]); // Added whiteNoiseNodes to dependency array to prevent stale closure for cleanup in effect

    const handleSoundChange = (sound) => {
        setSoundPlaying(false);

        if (whiteNoiseNodes) {
            whiteNoiseNodes.source.stop();
            whiteNoiseNodes.context.close();
            setWhiteNoiseNodes(null);
        }

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current.load();
        }
        
        setAmbientSoundId(sound.id);
        if (sound.url && audioRef.current) {
            audioRef.current.src = sound.url;
            audioRef.current.load();
        }
    };

    const toggleAmbientSound = () => {
        if (ambientSoundId !== "none") {
            setSoundPlaying(!soundPlaying);
        }
    };
    
    return (
        <div className={`max-w-4xl mx-auto transition-all duration-300 ${focusMode ? 'fixed inset-0 bg-black p-8 z-50 overflow-y-auto' : ''}`}>
             <audio ref={audioRef} loop />
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold mb-2 tracking-wider text-white">FOCUS</h1>
                    <p className="text-zinc-400 text-sm">Deep work environment</p>
                </div>
                {focusMode && <Button onClick={toggleFocusMode} variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">Exit Fullscreen</Button>}
            </div>

            <div className="space-y-6">
                {/* Focus Mode */}
                <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold tracking-wide text-white">FULLSCREEN FOCUS</h2>
                            <p className="text-zinc-400 text-sm">Enter an immersive, distraction-free mode</p>
                        </div>
                        <Button
                            onClick={toggleFocusMode}
                            className="bg-white text-black hover:bg-zinc-200"
                        >
                            {focusMode ? "Exit Focus" : "Enter Focus"}
                        </Button>
                    </div>
                    
                    <div className="text-sm text-zinc-400">
                        {focusMode 
                            ? "Focus mode is active. Press 'Esc' or the exit button to return." 
                            : "Enter fullscreen focus mode to remove all distractions from your screen."
                        }
                    </div>
                </div>

                {/* Breathing Exercise */}
                <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
                     <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold tracking-wide text-white">BREATHING EXERCISE</h2>
                            <p className="text-zinc-400 text-sm">Calm your mind with box breathing</p>
                        </div>
                        <Button
                            onClick={() => {
                                setBreathingActive(!breathingActive);
                                if (!breathingActive) {
                                    setBreathingPhase(0);
                                }
                            }}
                             className="bg-white text-black hover:bg-zinc-200"
                        >
                            {breathingActive ? "Stop" : "Start"}
                        </Button>
                    </div>
                    {breathingActive && (
                        <div className="pt-8">
                           <BreathingCycle {...breathingPhases[breathingPhase]} />
                        </div>
                    )}
                </div>

                {/* Ambient Sounds */}
                <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold tracking-wide text-white">AMBIENT SOUNDS</h2>
                            <p className="text-zinc-400 text-sm">Background audio for concentration</p>
                        </div>
                        {ambientSoundId !== "none" && (
                            <Button
                                onClick={toggleAmbientSound}
                                className={`px-4 py-2 rounded-lg ${
                                    soundPlaying ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'bg-white text-black hover:bg-zinc-200'
                                }`}
                            >
                                {soundPlaying ? (
                                    <>
                                        <Pause className="w-4 h-4 mr-2" />
                                        Pause
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Play
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {ambientSounds.map((sound) => (
                            <button
                                key={sound.id}
                                onClick={() => handleSoundChange(sound)}
                                className={`
                                    p-4 rounded-lg transition-all duration-200 text-left
                                    ${ambientSoundId === sound.id
                                        ? 'bg-zinc-700 border border-zinc-500' 
                                        : 'bg-zinc-800 hover:bg-zinc-700'
                                    }
                                `}
                            >
                                <div className="font-medium text-white">{sound.name}</div>
                                <div className="text-sm text-zinc-400">{sound.description}</div>
                            </button>
                        ))}
                    </div>

                    {ambientSoundId !== "none" && (
                        <div className="flex items-center space-x-4">
                            <VolumeX className="w-4 h-4 text-zinc-400" />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => {
                                    const newVolume = parseFloat(e.target.value);
                                    setVolume(newVolume);
                                }}
                                className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, white 0%, white ${volume * 100}%, #3f3f46 ${volume * 100}%, #3f3f46 100%)`
                                }}
                            />
                            <Volume2 className="w-4 h-4 text-zinc-400" />
                        </div>
                    )}
                </div>

                {/* Focus Tips */}
                <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
                    <h2 className="text-xl font-bold mb-6 tracking-wide text-white">FOCUS TIPS</h2>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
                            <div>
                                <div className="font-medium text-white">Use the Pomodoro Technique</div>
                                <div className="text-sm text-zinc-400">25 minutes of focused work followed by a 5-minute break</div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
                            <div>
                                <div className="font-medium text-white">Eliminate distractions</div>
                                <div className="text-sm text-zinc-400">Turn off notifications and use focus mode</div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
                            <div>
                                <div className="font-medium text-white">Take regular breaks</div>
                                <div className="text-sm text-zinc-400">Step away from the screen every hour</div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
                            <div>
                                <div className="font-medium text-white">Stay hydrated</div>
                                <div className="text-sm text-zinc-400">Keep water nearby and drink regularly</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
