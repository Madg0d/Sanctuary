import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InvokeLLM } from '@/api/integrations';
import { Event } from '@/api/entities';
import { Note } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO, isFuture, isToday } from 'date-fns';
import {
    LayoutDashboard,
    Cloud,
    Calendar,
    Target,
    ClipboardEdit,
    Plus,
    MessageSquare,
    DollarSign,
    BookOpen,
    Sun,
    CloudRain,
    CloudSnow,
    Zap,
    Loader2
} from 'lucide-react';
import { createPageUrl } from '@/utils';

// Helper to get a dynamic greeting
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

// Helper to get a weather icon
const getWeatherIcon = (condition) => {
    const conditionLower = condition?.toLowerCase() || "";
    if (conditionLower.includes("clear") || conditionLower.includes("sunny")) return <Sun className="w-8 h-8 text-yellow-400" />;
    if (conditionLower.includes("rain")) return <CloudRain className="w-8 h-8 text-blue-400" />;
    if (conditionLower.includes("snow")) return <CloudSnow className="w-8 h-8 text-white" />;
    if (conditionLower.includes("storm")) return <Zap className="w-8 h-8 text-yellow-300" />;
    return <Cloud className="w-8 h-8 text-gray-400" />;
};

export default function Home() {
    const [greeting] = useState(getGreeting());
    const [weather, setWeather] = useState(null);
    const [events, setEvents] = useState([]);
    const [goals, setGoals] = useState([]);
    const [quickNote, setQuickNote] = useState("");
    const [loading, setLoading] = useState({ weather: true, events: true, goals: true });

    useEffect(() => {
        const fetchDashboardData = async () => {
            // Fetch Weather
            setLoading(prev => ({ ...prev, weather: true }));
            try {
                const location = localStorage.getItem("weather-location") || "New York"; // Use saved location or a default
                const weatherResult = await InvokeLLM({
                    prompt: `Get the current weather for ${location}. Include temperature and a short condition description.`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            location: { type: "string" },
                            temperature: { type: "number" },
                            condition: { type: "string" }
                        }
                    }
                });
                setWeather(weatherResult);
            } catch (e) { console.error("Failed to fetch weather", e); }
            setLoading(prev => ({ ...prev, weather: false }));

            // Fetch Events
            setLoading(prev => ({ ...prev, events: true }));
            try {
                const allEvents = await Event.list();
                const upcomingEvents = allEvents
                    .filter(e => isFuture(parseISO(e.date)) || isToday(parseISO(e.date)))
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 3);
                setEvents(upcomingEvents);
            } catch (e) { console.error("Failed to fetch events", e); }
            setLoading(prev => ({ ...prev, events: false }));

            // Fetch Goals
            setLoading(prev => ({ ...prev, goals: true }));
            try {
                const noteData = await Note.filter({ title: { $regex: "^GOAL:" } });
                const parsedGoals = noteData.map(note => ({ id: note.id, ...JSON.parse(note.content) }));
                const inProgressGoals = parsedGoals.filter(g => g.status === 'in_progress').slice(0, 2);
                setGoals(inProgressGoals);
            } catch (e) { console.error("Failed to fetch goals", e); }
            setLoading(prev => ({ ...prev, goals: false }));
        };

        fetchDashboardData();
    }, []);

    const handleSaveQuickNote = async () => {
        if (!quickNote.trim()) return;
        const title = `Quick Note: ${new Date().toLocaleString()}`;
        await Note.create({ title, content: quickNote, is_pinned: false });
        setQuickNote("");
        // Optionally, add a notification for the user
    };

    const WidgetCard = ({ children, className }) => (
        <div className={`bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-900 ${className}`}>
            {children}
        </div>
    );

    const LoadingSpinner = () => (
        <div className="flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto text-white">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-wider">{greeting}</h1>
                <p className="text-zinc-400 text-lg">Here's your sanctuary at a glance.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Weather Widget */}
                <WidgetCard className="lg:col-span-1">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle className="flex items-center text-lg"><Cloud className="w-5 h-5 mr-3 text-zinc-400"/>Weather</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading.weather ? <LoadingSpinner /> : weather ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-4xl font-bold">{weather.temperature}°C</p>
                                    <p className="text-zinc-400">{weather.location}</p>
                                </div>
                                {getWeatherIcon(weather.condition)}
                            </div>
                        ) : <p className="text-zinc-500">Weather data unavailable.</p>}
                    </CardContent>
                </WidgetCard>

                {/* Upcoming Events Widget */}
                <WidgetCard className="lg:col-span-2">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle className="flex items-center text-lg"><Calendar className="w-5 h-5 mr-3 text-zinc-400"/>Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading.events ? <LoadingSpinner /> : events.length > 0 ? (
                            <div className="space-y-3">
                                {events.map(event => (
                                    <div key={event.id} className="flex items-center">
                                        <div className="flex flex-col items-center justify-center bg-zinc-800 rounded-lg p-2 mr-4 w-16">
                                            <span className="text-xs font-bold uppercase text-red-400">{format(parseISO(event.date), 'MMM')}</span>
                                            <span className="text-xl font-bold">{format(parseISO(event.date), 'd')}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{event.title}</p>
                                            <p className="text-sm text-zinc-400">{event.time || "All day"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-zinc-500">No upcoming events.</p>}
                    </CardContent>
                </WidgetCard>
                
                {/* Quick Note Widget */}
                <WidgetCard className="lg:col-span-1">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle className="flex items-center text-lg"><ClipboardEdit className="w-5 h-5 mr-3 text-zinc-400"/>Quick Note</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Textarea
                            value={quickNote}
                            onChange={(e) => setQuickNote(e.target.value)}
                            placeholder="Jot down a thought..."
                            className="bg-zinc-800 border-zinc-700 h-24 mb-3"
                        />
                        <Button onClick={handleSaveQuickNote} className="w-full bg-white text-black hover:bg-zinc-200">
                            <Plus className="w-4 h-4 mr-2"/>Save Note
                        </Button>
                    </CardContent>
                </WidgetCard>

                {/* Goals Widget */}
                <WidgetCard className="lg:col-span-2">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle className="flex items-center text-lg"><Target className="w-5 h-5 mr-3 text-zinc-400"/>Active Goals</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading.goals ? <LoadingSpinner /> : goals.length > 0 ? (
                            <div className="space-y-4">
                                {goals.map(goal => (
                                    <div key={goal.id}>
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-semibold truncate">{goal.title}</p>
                                            <p className="text-sm text-zinc-400">{goal.progress}%</p>
                                        </div>
                                        <Progress value={goal.progress} className="h-2 [&>*]:bg-white" />
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-zinc-500">No active goals in progress.</p>}
                    </CardContent>
                </WidgetCard>

                {/* Quick Links Widget */}
                <WidgetCard className="lg:col-span-2">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle className="flex items-center text-lg"><LayoutDashboard className="w-5 h-5 mr-3 text-zinc-400"/>Quick Access</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        {[
                            { name: "Journal", icon: BookOpen, path: "Journal" },
                            { name: "Chat", icon: MessageSquare, path: "Chat" },
                            { name: "Finance", icon: DollarSign, path: "Finance" },
                            { name: "Focus", icon: Target, path: "Focus" }
                        ].map(link => (
                            <Link to={createPageUrl(link.path)} key={link.name} className="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                                <link.icon className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                                <span className="text-sm font-medium">{link.name}</span>
                            </Link>
                        ))}
                    </CardContent>
                </WidgetCard>
            </div>
        </div>
    );
}