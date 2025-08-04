import React, { useState, useEffect, useRef } from 'react';
import { Note } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Power, Timer, BarChart, History } from "lucide-react";
import { formatDistanceStrict } from 'date-fns';

export default function Detox() {
    const [isDetoxing, setIsDetoxing] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const intervalRef = useRef(null);
    const [sessions, setSessions] = useState([]);
    
    useEffect(() => {
        loadSessions();
    }, []);

    useEffect(() => {
        if (isDetoxing) {
            setStartTime(new Date());
            intervalRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
            if (startTime) {
                const endTime = new Date();
                const duration = Math.round((endTime - startTime) / 1000);
                if (duration > 5) { // Only save sessions longer than 5 seconds
                    saveSession(duration);
                }
                setElapsedTime(0);
                setStartTime(null);
            }
        }
        return () => clearInterval(intervalRef.current);
    }, [isDetoxing]);

    const loadSessions = async () => {
        try {
            const noteData = await Note.filter({ title: { $regex: "^DETOX:" } }, "-updated_date");
            const parsedSessions = noteData.map(note => ({
                id: note.id,
                ...JSON.parse(note.content)
            }));
            setSessions(parsedSessions);
        } catch (error) {
            console.error("Failed to load sessions:", error);
        }
    };

    const saveSession = async (duration) => {
        try {
            const sessionData = {
                start_time: startTime.toISOString(),
                end_time: new Date().toISOString(),
                duration_seconds: duration
            };
            
            const title = `DETOX: ${formatElapsedTime(duration)} - ${new Date().toLocaleDateString()}`;
            
            await Note.create({
                title,
                content: JSON.stringify(sessionData)
            });
            
            loadSessions();
        } catch (error) {
            console.error("Failed to save session:", error);
        }
    };

    const toggleDetox = () => {
        setIsDetoxing(!isDetoxing);
    };
    
    const formatElapsedTime = (seconds) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };
    
    const totalDetoxTime = sessions.reduce((acc, s) => acc + s.duration_seconds, 0);
    const longestSession = Math.max(0, ...sessions.map(s => s.duration_seconds));

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 tracking-wider">DIGITAL DETOX</h1>
                <p className="text-zinc-400 text-sm">Track your screen-free time</p>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 text-center mb-8">
                <Timer className={`w-16 h-16 mx-auto mb-6 ${isDetoxing ? 'text-white animate-pulse' : 'text-zinc-600'}`} />
                <div className="text-6xl font-bold mb-4">{formatElapsedTime(elapsedTime)}</div>
                <p className="text-zinc-400 mb-8">{isDetoxing ? "Detox session in progress..." : "Start a new session to disconnect"}</p>
                <Button onClick={toggleDetox} className={`px-12 py-6 text-lg ${isDetoxing ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>
                    <Power className="w-5 h-5 mr-3" />
                    {isDetoxing ? "End Session" : "Start Session"}
                </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                    <h2 className="text-xl font-bold mb-6 tracking-wide flex items-center"><BarChart className="w-5 h-5 mr-3"/>Statistics</h2>
                    <div className="space-y-4 text-lg">
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Total Time</span>
                            <span>{formatElapsedTime(totalDetoxTime)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Total Sessions</span>
                            <span>{sessions.length}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-zinc-400">Longest Session</span>
                            <span>{formatElapsedTime(longestSession)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                    <h2 className="text-xl font-bold mb-6 tracking-wide flex items-center"><History className="w-5 h-5 mr-3"/>Recent Sessions</h2>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                        {sessions.map(session => (
                            <div key={session.id} className="flex justify-between items-center text-sm p-2 bg-zinc-800 rounded-md">
                                <span className="text-zinc-400">{formatDistanceStrict(new Date(session.start_time), new Date())} ago</span>
                                <span>{formatElapsedTime(session.duration_seconds)}</span>
                            </div>
                        ))}
                        {sessions.length === 0 && <p className="text-zinc-500 text-center py-4">No sessions recorded yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}