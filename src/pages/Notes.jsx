
import React, { useState, useEffect } from "react";
import { Note } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pin, Search, Edit3, Save, X, Sparkles } from "lucide-react";
import { User } from "@/api/entities";

export default function Notes() {
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showNewNote, setShowNewNote] = useState(false);
    const [newNote, setNewNote] = useState({ title: "", content: "" });
    const [generatingPrompt, setGeneratingPrompt] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        loadNotes();
        loadCurrentUser();
    }, []);

    const loadCurrentUser = async () => {
        try {
            const user = await User.me();
            setCurrentUser(user);
        } catch (error) {
            console.error("Failed to load user:", error);
        }
    };

    const loadNotes = async () => {
        try {
            const user = await User.me();
            if (user && user.email) {
                // Exclude notes that are used as storage for other app modules
                const prefixesToExclude = ["BOOK:", "GOAL:", "FINANCE:", "JOURNAL:", "MEDITATION:", "DETOX:"];
                const excludeRegex = `^(${prefixesToExclude.join('|')})`;

                const noteData = await Note.filter({
                    created_by: user.email,
                    title: { $not: { $regex: excludeRegex } }
                }, "-updated_date");
                setNotes(noteData);
            } else {
                setNotes([]);
            }
        } catch (error) {
            console.error("Failed to load notes:", error);
            setNotes([]);
        }
    };

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const createNote = async () => {
        if (!newNote.title.trim()) return;

        if (!currentUser || !currentUser.email) {
            console.error("Cannot create note: User not logged in or email not available.");
            return;
        }

        await Note.create({ ...newNote });
        await loadNotes();
        setNewNote({ title: "", content: "" });
        setShowNewNote(false);
    };

    const updateNote = async () => {
        if (!selectedNote) return;

        await Note.update(selectedNote.id, {
            title: selectedNote.title,
            content: selectedNote.content
        });
        await loadNotes();
        setIsEditing(false);
    };

    const togglePin = async (note) => {
        await Note.update(note.id, { is_pinned: !note.is_pinned });
        await loadNotes();
    };

    const generatePrompt = async () => {
        setGeneratingPrompt(true);
        try {
            const result = await InvokeLLM({
                prompt: "Generate a single, insightful journaling prompt. It should be open-ended and encourage self-reflection. Topics could include past experiences, future aspirations, personal values, or hypothetical scenarios.",
                response_json_schema: {
                    type: "object",
                    properties: {
                        prompt: { type: "string" }
                    }
                }
            });
            const newNoteContent = `Journal Prompt: ${result.prompt}\n\n`;
            setSelectedNote(prev => ({...prev, content: (prev.content || "") + newNoteContent}));
        } catch(e) {
            console.error("Failed to generate prompt", e);
        } finally {
            setGeneratingPrompt(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 tracking-wider">NOTES</h1>
                <p className="text-zinc-400 text-sm">Capture your thoughts</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Notes List */}
                <div className="lg:col-span-1">
                    <div className="mb-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                            <Input
                                placeholder="Search notes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-zinc-900 border-zinc-700 text-white"
                            />
                        </div>
                        <Button
                            onClick={() => setShowNewNote(true)}
                            className="w-full bg-white text-black hover:bg-zinc-200"
                            disabled={!currentUser}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Note
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredNotes.length === 0 && !searchTerm ? (
                            <div className="p-4 text-center text-zinc-500">
                                {currentUser ? "No notes yet. Create a new one!" : "Loading notes or user..."}
                            </div>
                        ) : filteredNotes.length === 0 && searchTerm ? (
                            <div className="p-4 text-center text-zinc-500">
                                No matching notes found.
                            </div>
                        ) : (
                            filteredNotes.map(note => (
                                <div
                                    key={note.id}
                                    onClick={() => setSelectedNote(note)}
                                    className={`
                                        p-4 rounded-lg border cursor-pointer transition-all duration-200
                                        ${selectedNote?.id === note.id
                                            ? 'bg-zinc-800 border-zinc-600'
                                            : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                                        }
                                    `}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-medium text-white truncate">{note.title}</h3>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                togglePin(note);
                                            }}
                                            className={`ml-2 ${note.is_pinned ? 'text-white' : 'text-zinc-600'}`}
                                        >
                                            <Pin className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-zinc-400 text-sm line-clamp-2">
                                        {note.content || "No content"}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Note Editor */}
                <div className="lg:col-span-2">
                    {selectedNote ? (
                        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 h-full">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <Edit3 className="w-5 h-5 text-zinc-400" />
                                    <span className="text-zinc-400 text-sm">
                                        {isEditing ? "Editing" : "Viewing"}
                                    </span>
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        onClick={generatePrompt}
                                        size="sm"
                                        variant="outline"
                                        disabled={generatingPrompt || !currentUser}
                                        className="border-zinc-700 text-white hover:bg-zinc-800"
                                    >
                                        <Sparkles className={`w-4 h-4 mr-2 ${generatingPrompt ? 'animate-spin' : ''}`} />
                                        Prompt
                                    </Button>
                                    {isEditing ? (
                                        <>
                                            <Button
                                                onClick={updateNote}
                                                size="sm"
                                                className="bg-white text-black hover:bg-zinc-200"
                                            >
                                                <Save className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => setIsEditing(false)}
                                                size="sm"
                                                variant="outline"
                                                className="border-zinc-700 text-white hover:bg-zinc-800"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            size="sm"
                                            variant="outline"
                                            className="border-zinc-700 text-white hover:bg-zinc-800"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="space-y-4">
                                    <Input
                                        value={selectedNote.title}
                                        onChange={(e) => setSelectedNote(prev => ({ ...prev, title: e.target.value }))}
                                        className="bg-zinc-800 border-zinc-700 text-white text-xl font-medium"
                                        placeholder="Note title"
                                    />
                                    <Textarea
                                        value={selectedNote.content}
                                        onChange={(e) => setSelectedNote(prev => ({ ...prev, content: e.target.value }))}
                                        className="bg-zinc-800 border-zinc-700 text-white min-h-96 resize-none"
                                        placeholder="Start writing..."
                                    />
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-2xl font-bold mb-4">{selectedNote.title}</h2>
                                    <div className="text-zinc-300 whitespace-pre-wrap">
                                        {selectedNote.content || "No content"}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-zinc-900 rounded-2xl p-12 border border-zinc-800 text-center">
                            <Edit3 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                            <p className="text-zinc-400">Select a note to view or edit</p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Note Modal */}
            {showNewNote && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-800">
                        <h3 className="text-xl font-bold mb-6 tracking-wide">NEW NOTE</h3>
                        <div className="space-y-4">
                            <Input
                                placeholder="Note title"
                                value={newNote.title}
                                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                            <Textarea
                                placeholder="Start writing..."
                                value={newNote.content}
                                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                                className="bg-zinc-800 border-zinc-700 text-white h-32"
                            />
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <Button
                                onClick={() => setShowNewNote(false)}
                                variant="outline"
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={createNote}
                                className="bg-white text-black hover:bg-zinc-200"
                                disabled={!currentUser}
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
