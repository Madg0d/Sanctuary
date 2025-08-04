
import React, { useState, useEffect, useRef } from "react";
import { ChatRoom, ChatMessage } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Send, Users, Copy } from "lucide-react";

export default function Chat() {
    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [username, setUsername] = useState("");
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [showJoinRoom, setShowJoinRoom] = useState(false);
    const [newRoom, setNewRoom] = useState({ name: "", description: "" });
    const [joinCode, setJoinCode] = useState("");
    const messagesEndRef = useRef(null);
    const [currentUser, setCurrentUser] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadCurrentUser = async () => {
        try {
            const user = await User.me();
            setCurrentUser(user);
        } catch (error) {
            console.error("Failed to load user:", error);
        }
    };

    const loadUserRooms = async () => {
        if (!currentUser?.email) return;
        
        try {
            const userRooms = await ChatRoom.filter({ created_by: currentUser.email }, "-created_date");
            const savedJoinedRooms = JSON.parse(localStorage.getItem("joinedRooms") || "[]");
            
            // Get joined rooms that still exist
            const joinedRoomObjects = [];
            const allAvailableRooms = await ChatRoom.list(); // Fetch all rooms once
            for (const roomCode of savedJoinedRooms) {
                const room = allAvailableRooms.find(r => r.room_code === roomCode);
                if (room && room.created_by !== currentUser.email) {
                    joinedRoomObjects.push(room);
                }
            }
            
            setRooms([...userRooms, ...joinedRoomObjects]);
        } catch (error) {
            console.error("Failed to load rooms:", error);
            setRooms([]);
        }
    };

    const loadMessages = async () => {
        if (!activeRoom) return;
        const messageData = await ChatMessage.filter({ room_id: activeRoom.id }, "created_date");
        setMessages(messageData);
    };

    const joinRoomByCode = async (code) => {
        try {
            const allRooms = await ChatRoom.list();
            const room = allRooms.find(r => r.room_code === code.toUpperCase());
            
            if (room) {
                setActiveRoom(room);
                
                // Add to joined rooms if not created by user and current user is logged in
                if (currentUser && room.created_by !== currentUser.email) {
                    const savedJoinedRooms = JSON.parse(localStorage.getItem("joinedRooms") || "[]");
                    if (!savedJoinedRooms.includes(room.room_code)) {
                        savedJoinedRooms.push(room.room_code);
                        localStorage.setItem("joinedRooms", JSON.stringify(savedJoinedRooms));
                        await loadUserRooms(); // Refresh the rooms list
                    }
                }
            } else {
                console.warn(`Room with code ${code} not found.`);
            }
        } catch (error) {
            console.error("Failed to join room:", error);
        }
    };

    useEffect(() => {
        loadCurrentUser();
        // The loadUserRooms() call here will return early if currentUser is not set.
        // The useEffect below (with currentUser dependency) will properly trigger it.
        loadUserRooms(); 
        
        // Get username from localStorage or generate a random one
        const savedUsername = localStorage.getItem("chat-username");
        if (savedUsername) {
            setUsername(savedUsername);
        } else {
            const randomUsername = `User${Math.floor(Math.random() * 10000)}`;
            setUsername(randomUsername);
            localStorage.setItem("chat-username", randomUsername);
        }

        // Check for room code in URL on initial load
        const urlParams = new URLSearchParams(window.location.search);
        const roomCode = urlParams.get('room');
        if (roomCode) {
            joinRoomByCode(roomCode);
        }
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        if (currentUser) {
            loadUserRooms();
        }
    }, [currentUser]);

    useEffect(() => {
        if (activeRoom) {
            loadMessages();
            // Set up interval to refresh messages
            const interval = setInterval(loadMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [activeRoom]); // Re-run when activeRoom changes

    useEffect(() => {
        scrollToBottom();
    }, [messages]); // Scroll to bottom when messages update

    const createRoom = async () => {
        if (!newRoom.name.trim()) return;
        
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        await ChatRoom.create({
            ...newRoom,
            room_code: roomCode
        });
        
        await loadUserRooms();
        setNewRoom({ name: "", description: "" });
        setShowCreateRoom(false);
    };

    const joinRoom = async () => {
        if (!joinCode.trim()) return;
        joinRoomByCode(joinCode.trim()); // Use the new helper function
        setShowJoinRoom(false);
        setJoinCode("");
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeRoom || !username) return;
        
        await ChatMessage.create({
            room_id: activeRoom.id,
            username,
            message: newMessage,
            timestamp: new Date().toISOString()
        });
        
        setNewMessage("");
        await loadMessages();
    };

    const copyRoomUrl = () => {
        if (!activeRoom) return;
        const url = `${window.location.origin}${window.location.pathname}?room=${activeRoom.room_code}`;
        navigator.clipboard.writeText(url);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 tracking-wider">CHAT</h1>
                <p className="text-zinc-400 text-sm">Private conversations</p>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Room List */}
                <div className="lg:col-span-1">
                    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-sm tracking-wide">ROOMS</h3>
                            <div className="flex space-x-1">
                                <Button
                                    onClick={() => setShowCreateRoom(true)}
                                    size="sm"
                                    className="bg-white text-black hover:bg-zinc-200 px-2"
                                >
                                    <Plus className="w-3 h-3" />
                                </Button>
                                <Button
                                    onClick={() => setShowJoinRoom(true)}
                                    size="sm"
                                    variant="outline"
                                    className="border-zinc-700 text-white hover:bg-zinc-800 px-2"
                                >
                                    <Users className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {rooms.map(room => (
                                <div
                                    key={room.id}
                                    onClick={() => setActiveRoom(room)}
                                    className={`
                                        p-3 rounded-lg cursor-pointer transition-all duration-200
                                        ${activeRoom?.id === room.id 
                                            ? 'bg-zinc-800 border border-zinc-600' 
                                            : 'bg-zinc-800 hover:bg-zinc-700'
                                        }
                                    `}
                                >
                                    <div className="font-medium text-sm mb-1">{room.name}</div>
                                    <div className="text-xs text-zinc-400">Code: {room.room_code}</div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-zinc-800">
                            <div className="text-xs text-zinc-400 mb-2">Username</div>
                            <Input
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    localStorage.setItem("chat-username", e.target.value);
                                }}
                                className="bg-zinc-800 border-zinc-700 text-white text-sm"
                                placeholder="Your username"
                            />
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-3">
                    {activeRoom ? (
                        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 h-[32rem] flex flex-col">
                            {/* Chat Header */}
                            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold">{activeRoom.name}</h3>
                                    <p className="text-sm text-zinc-400">{activeRoom.description}</p>
                                </div>
                                <Button
                                    onClick={copyRoomUrl}
                                    size="sm"
                                    variant="outline"
                                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                {messages.map(message => {
                                    const isMyMessage = message.username === username;
                                    return (
                                        <div key={message.id} className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-sm font-medium text-zinc-300">
                                                    {isMyMessage ? 'You' : message.username}
                                                </span>
                                                <span className="text-xs text-zinc-500">
                                                    {new Date(message.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div className={`text-white rounded-lg p-3 max-w-md ${isMyMessage ? 'bg-zinc-700' : 'bg-zinc-800'}`}>
                                                {message.message}
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-zinc-800">
                                <div className="flex space-x-2">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Type a message..."
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                    <Button
                                        onClick={sendMessage}
                                        className="bg-white text-black hover:bg-zinc-200"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-zinc-900 rounded-2xl p-12 border border-zinc-800 text-center">
                            <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                            <p className="text-zinc-400">Select a room to start chatting</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Room Modal */}
            {showCreateRoom && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-800">
                        <h3 className="text-xl font-bold mb-6 tracking-wide">CREATE ROOM</h3>
                        <div className="space-y-4">
                            <Input
                                placeholder="Room name"
                                value={newRoom.name}
                                onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                            <Textarea
                                placeholder="Room description (optional)"
                                value={newRoom.description}
                                onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <Button
                                onClick={() => setShowCreateRoom(false)}
                                variant="outline"
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={createRoom}
                                className="bg-white text-black hover:bg-zinc-200"
                            >
                                Create
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Join Room Modal */}
            {showJoinRoom && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-800">
                        <h3 className="text-xl font-bold mb-6 tracking-wide">JOIN ROOM</h3>
                        <Input
                            placeholder="Enter room code"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                        <div className="flex justify-end space-x-3 mt-6">
                            <Button
                                onClick={() => setShowJoinRoom(false)}
                                variant="outline"
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={joinRoom}
                                className="bg-white text-black hover:bg-zinc-200"
                            >
                                Join
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
