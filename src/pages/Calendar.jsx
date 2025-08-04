
import React, { useState, useEffect } from "react";
import { Event } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, startOfMonth, endOfMonth } from "date-fns";

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showEventForm, setShowEventForm] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        duration: 60
    });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        const eventData = await Event.list();
        setEvents(eventData);
    };

    const monthStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const monthEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const getEventsForDate = (date) => {
        return events.filter(event => 
            isSameDay(parseISO(event.date), date)
        );
    };

    const handleCreateEvent = async () => {
        if (!newEvent.title || !newEvent.date) return;
        
        await Event.create(newEvent);
        await loadEvents();
        setNewEvent({ title: "", description: "", date: "", time: "", duration: 60 });
        setShowEventForm(false);
    };

    const openEventForm = (date) => {
        setSelectedDate(date);
        setNewEvent(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }));
        setShowEventForm(true);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 tracking-wider text-white">CALENDAR</h1>
                <p className="text-zinc-400 text-sm">Your focused schedule</p>
            </div>

            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <Button
                        onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                        variant="outline"
                        size="icon"
                        className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 bg-transparent"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="text-2xl font-bold tracking-wide text-white">
                        {format(currentDate, 'MMMM yyyy').toUpperCase()}
                    </h2>
                    <Button
                        onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                        variant="outline"
                        size="icon"
                        className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 bg-transparent"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
                <Button
                    onClick={() => openEventForm(new Date())}
                    className="bg-white text-black hover:bg-zinc-200"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                </Button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-zinc-900 rounded-2xl p-2 sm:p-6 border border-zinc-800 mb-8">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 sm:gap-4 mb-4">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                        <div key={day} className="text-center text-zinc-400 text-xs sm:text-sm font-medium py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1 sm:gap-4">
                    {calendarDays.map(date => {
                        const dayEvents = getEventsForDate(date);
                        const isToday = isSameDay(date, new Date());
                        const isCurrentMonth = isSameMonth(date, currentDate);
                        
                        return (
                            <div
                                key={date.toString()}
                                onClick={() => openEventForm(date)}
                                className={`
                                    min-h-24 p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 flex flex-col
                                    border border-zinc-800 hover:border-zinc-600
                                    ${isToday ? 'bg-zinc-800 border-white' : 'bg-zinc-900 hover:bg-zinc-800'}
                                    ${!isCurrentMonth && 'opacity-40'}
                                `}
                            >
                                <div className={`text-sm font-medium mb-2 ${
                                    isToday ? 'text-white' : 'text-zinc-300'
                                }`}>
                                    {format(date, 'd')}
                                </div>
                                <div className="space-y-1 flex-grow">
                                    {dayEvents.slice(0, 2).map(event => (
                                        <div
                                            key={event.id}
                                            className="text-xs bg-zinc-700 rounded px-2 py-1 truncate"
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <div className="text-xs text-zinc-500">
                                            +{dayEvents.length - 2} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Event Form Modal */}
            {showEventForm && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-800">
                        <h3 className="text-xl font-bold mb-6 tracking-wide text-white">NEW EVENT</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Title</label>
                                <Input
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                    placeholder="Event title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Description</label>
                                <Textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                    placeholder="Event description"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">Date</label>
                                    <Input
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">Time</label>
                                    <Input
                                        type="time"
                                        value={newEvent.time}
                                        onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <Button
                                onClick={() => setShowEventForm(false)}
                                variant="outline"
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateEvent}
                                className="bg-white text-black hover:bg-zinc-200"
                            >
                                Create
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
