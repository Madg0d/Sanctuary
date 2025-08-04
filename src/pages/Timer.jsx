
import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Timer() {
    const [activeTimer, setActiveTimer] = useState("timer");
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [inputMinutes, setInputMinutes] = useState(25); // For general timer
    const [pomodoroSession, setPomodoroSession] = useState(1);
    const [pomodoroType, setPomodoroType] = useState("work"); // work, short, long
    const intervalRef = useRef(null);
    const audioRef = useRef(null); // For sound notification

    const [showTimeEditor, setShowTimeEditor] = useState(false);
    const [editMinutes, setEditMinutes] = useState(25);
    const [editSeconds, setEditSeconds] = useState(0);

    // New states for customizable Pomodoro durations
    const [workDuration, setWorkDuration] = useState(25);
    const [shortBreakDuration, setShortBreakDuration] = useState(5);
    const [longBreakDuration, setLongBreakDuration] = useState(15);

    // New state for auto-starting Pomodoro sessions
    const [autoStartPomodoro, setAutoStartPomodoro] = useState(false);

    const nextPomodoroSession = () => {
        setIsRunning(false); // Ensure it's paused initially before setting next time
        if (pomodoroType === "work") {
            if (pomodoroSession % 4 === 0) { // After 4 work sessions, it's a long break
                setPomodoroType("long");
                setTime(longBreakDuration * 60);
            } else { // After other work sessions, it's a short break
                setPomodoroType("short");
                setTime(shortBreakDuration * 60);
            }
        } else { // pomodoroType is "short" or "long" (i.e., a break just finished)
            setPomodoroType("work");
            setTime(workDuration * 60);
            setPomodoroSession(prev => prev + 1); // Increment session count after a break
        }
    };

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTime(prev => {
                    if (prev > 0) {
                        return prev - 1;
                    } else {
                        // Timer has reached 0
                        setIsRunning(false); // Stop the timer
                        if (audioRef.current) {
                            audioRef.current.play(); // Play sound notification
                        }

                        if (activeTimer === "pomodoro") {
                            nextPomodoroSession(); // Prepare for the next phase
                            if (autoStartPomodoro) {
                                setIsRunning(true); // Automatically start the next phase if enabled
                            }
                        }
                        return 0; // Ensure time stays at 0 until next session or manual start
                    }
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        // Cleanup function for useEffect
        return () => clearInterval(intervalRef.current);
    }, [isRunning, activeTimer, pomodoroType, pomodoroSession, workDuration, shortBreakDuration, longBreakDuration, autoStartPomodoro]); // Added new dependencies

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleTimeClick = () => {
        // Allow editing only if timer is not running and it's a countdown timer (timer or pomodoro)
        if (!isRunning && (activeTimer === "timer" || activeTimer === "pomodoro")) {
            const totalSeconds = time; // Always edit the currently displayed time
            setEditMinutes(Math.floor(totalSeconds / 60));
            setEditSeconds(totalSeconds % 60);
            setShowTimeEditor(true);
        }
    };

    const applyTimeEdit = () => {
        const newTime = editMinutes * 60 + editSeconds;
        if (activeTimer === "timer") {
            setInputMinutes(editMinutes); // Update default minutes for general timer
            setTime(newTime);
        } else if (activeTimer === "pomodoro") {
            setTime(newTime); // Apply the new time to the current display
            // Also update the base duration for the current pomodoro type
            if (pomodoroType === "work") {
                setWorkDuration(editMinutes);
            } else if (pomodoroType === "short") {
                setShortBreakDuration(editMinutes);
            } else if (pomodoroType === "long") {
                setLongBreakDuration(editMinutes);
            }
        }
        setShowTimeEditor(false);
    };

    const startTimer = () => {
        if (activeTimer === "timer" && time === 0) {
            setTime(inputMinutes * 60); // Initialize general timer if starting from 0
        } else if (activeTimer === "pomodoro" && time === 0) {
            // If pomodoro starts from 0 (e.g., initial load or full reset)
            setTime(workDuration * 60); // Set to work duration
            setPomodoroType("work");
            setPomodoroSession(1); // Reset session count
        }
        setIsRunning(!isRunning); // Toggle running state
    };

    const resetTimer = () => {
        setIsRunning(false);
        if (activeTimer === "timer") {
            setTime(inputMinutes * 60); // Reset to default general timer duration
        } else if (activeTimer === "stopwatch") {
            setTime(0); // Reset stopwatch to 0
        } else { // Pomodoro reset
            // Reset to the current phase's default duration
            if (pomodoroType === "work") {
                setTime(workDuration * 60);
            } else if (pomodoroType === "short") {
                setTime(shortBreakDuration * 60);
            } else { // long
                setTime(longBreakDuration * 60);
            }
            // Note: Does not reset pomodoroSession count or type
        }
    };

    const switchTimer = (type) => {
        setActiveTimer(type);
        setIsRunning(false);
        if (type === "timer") {
            setTime(inputMinutes * 60);
        } else if (type === "stopwatch") {
            setTime(0);
        } else { // Pomodoro
            setTime(workDuration * 60); // Initialize pomodoro with work duration
            setPomodoroType("work");
            setPomodoroSession(1); // Reset session count when switching to pomodoro
        }
    };

    // New function to reset pomodoro session count
    const resetPomodoroCount = () => {
        setIsRunning(false);
        setPomodoroSession(1);
        setPomodoroType("work");
        setTime(workDuration * 60); // Reset to default work time
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 tracking-wider">TIMER</h1>
                <p className="text-zinc-400 text-sm">Focus tools for deep work</p>
            </div>

            {/* Timer Type Selector */}
            <div className="flex space-x-4 mb-8">
                {["timer", "stopwatch", "pomodoro"].map((type) => (
                    <button
                        key={type}
                        onClick={() => switchTimer(type)}
                        className={`
                            px-6 py-3 rounded-lg text-sm tracking-wide transition-all duration-200
                            ${activeTimer === type
                                ? 'bg-white text-black'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }
                        `}
                    >
                        {type.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Timer Display */}
            <div className="bg-zinc-900 rounded-2xl p-8 mb-8 border border-zinc-800">
                <div className="text-center">
                    <div
                        className="text-6xl md:text-8xl font-bold mb-6 tracking-wider cursor-pointer hover:text-zinc-300 transition-colors"
                        onClick={handleTimeClick}
                        title="Click to edit time"
                    >
                        {formatTime(time)}
                    </div>

                    {activeTimer === "pomodoro" && (
                        <div className="mb-6">
                            <div className="text-zinc-400 text-sm mb-2">
                                Session {pomodoroSession} • {pomodoroType.toUpperCase()}
                            </div>
                            <div className="flex justify-center space-x-2">
                                {/* Visual indicators for completed Pomodoro sessions out of 4 */}
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full ${
                                            // A session is considered "completed" visually if its index is less than the current session number
                                            // The logic shows current session + prev work sessions
                                            i < (pomodoroSession > 4 ? 4 : pomodoroSession) ? 'bg-white' : 'bg-zinc-700'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center space-x-4">
                        <Button
                            onClick={startTimer}
                            className="bg-white text-black hover:bg-zinc-200 px-8 py-3"
                        >
                            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </Button>
                        <Button
                            onClick={resetTimer}
                            variant="outline"
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white px-8 py-3"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </Button>
                        {/* Pomodoro "Next Session" / "Skip" button - always visible when paused during pomodoro */}
                        {activeTimer === "pomodoro" && !isRunning && (
                            <Button
                                onClick={nextPomodoroSession}
                                className="bg-zinc-700 text-white hover:bg-zinc-600 px-8 py-3"
                                title="Advance to next Pomodoro phase"
                            >
                                <Square className="w-5 h-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Time Editor Modal */}
            {showTimeEditor && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-800">
                        <h3 className="text-xl font-bold mb-6 tracking-wide">SET TIME</h3>
                        <div className="flex space-x-4 mb-6">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Minutes</label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={editMinutes}
                                    onChange={(e) => setEditMinutes(parseInt(e.target.value) || 0)}
                                    className="bg-zinc-800 border-zinc-700 text-white w-20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Seconds</label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={editSeconds}
                                    onChange={(e) => setEditSeconds(parseInt(e.target.value) || 0)}
                                    className="bg-zinc-800 border-zinc-700 text-white w-20"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <Button
                                onClick={() => setShowTimeEditor(false)}
                                variant="outline"
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={applyTimeEdit}
                                className="bg-white text-black hover:bg-zinc-200"
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pomodoro Settings - New Section */}
            {activeTimer === "pomodoro" && (
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 mb-8">
                    <h3 className="text-xl font-bold mb-4 tracking-wide">POMODORO SETTINGS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Work Duration (mins)</label>
                            <Input
                                type="number"
                                min="1"
                                max="180"
                                value={workDuration}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1;
                                    setWorkDuration(val);
                                    // Update displayed time if current phase is 'work' and timer is paused
                                    if (pomodoroType === "work" && !isRunning) setTime(val * 60);
                                }}
                                className="bg-zinc-800 border-zinc-700 text-white w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Short Break (mins)</label>
                            <Input
                                type="number"
                                min="1"
                                max="60"
                                value={shortBreakDuration}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1;
                                    setShortBreakDuration(val);
                                    // Update displayed time if current phase is 'short' break and timer is paused
                                    if (pomodoroType === "short" && !isRunning) setTime(val * 60);
                                }}
                                className="bg-zinc-800 border-zinc-700 text-white w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Long Break (mins)</label>
                            <Input
                                type="number"
                                min="1"
                                max="180"
                                value={longBreakDuration}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1;
                                    setLongBreakDuration(val);
                                    // Update displayed time if current phase is 'long' break and timer is paused
                                    if (pomodoroType === "long" && !isRunning) setTime(val * 60);
                                }}
                                className="bg-zinc-800 border-zinc-700 text-white w-full"
                            />
                        </div>
                        <div className="flex items-center">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoStartPomodoro}
                                    onChange={(e) => setAutoStartPomodoro(e.target.checked)}
                                    className="h-4 w-4 text-white bg-zinc-800 border-zinc-700 rounded focus:ring-0 focus:ring-offset-0" // Basic styling, consider custom checkbox for better UI
                                />
                                <span className="text-sm text-zinc-400">Auto Start Next Session</span>
                            </label>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Button
                            onClick={resetPomodoroCount}
                            variant="outline"
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        >
                            Reset Pomodoro Count
                        </Button>
                    </div>
                </div>
            )}

            {/* General Timer Settings */}
            {activeTimer === "timer" && !isRunning && (
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                    <label className="block text-sm text-zinc-400 mb-2">Duration (minutes)</label>
                    <Input
                        type="number"
                        min="1"
                        max="180"
                        value={inputMinutes}
                        onChange={(e) => {
                            const mins = parseInt(e.target.value) || 1;
                            setInputMinutes(mins);
                            setTime(mins * 60);
                        }}
                        className="bg-zinc-800 border-zinc-700 text-white w-32"
                    />
                </div>
            )}

            {/* Audio element for sound notification */}
            <audio ref={audioRef} src="/sounds/ding.mp3" preload="auto" />
            {/* Make sure ding.mp3 exists in your public/sounds directory, or replace with a public URL */}
        </div>
    );
}
