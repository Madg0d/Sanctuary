
import React, { useState, useEffect } from "react";
import { Note } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Plus, Star, Clock, Target, Trash2 } from "lucide-react";

export default function Books() {
    const [books, setBooks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [filter, setFilter] = useState("all");
    const [newBook, setNewBook] = useState({
        title: "",
        author: "",
        totalPages: "",
        currentPage: 0,
        status: "want_to_read",
        rating: 0,
        notes: "",
        genre: "fiction"
    });

    const statuses = [
        { value: "want_to_read", label: "Want to Read", color: "text-zinc-400" },
        { value: "reading", label: "Currently Reading", color: "text-blue-400" },
        { value: "finished", label: "Finished", color: "text-green-400" },
        { value: "paused", label: "Paused", color: "text-yellow-400" }
    ];

    const genres = ["fiction", "non-fiction", "biography", "science", "history", "philosophy", "business", "self-help"];

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            const noteData = await Note.filter({ title: { $regex: "^BOOK:" } }, "-updated_date");
            const parsedBooks = noteData.map(note => ({
                id: note.id,
                ...JSON.parse(note.content)
            }));
            setBooks(parsedBooks);
        } catch (error) {
            console.error("Failed to load books:", error);
        }
    };

    const saveBook = async () => {
        if (!newBook.title || !newBook.author) return;

        try {
            const bookData = {
                ...newBook,
                totalPages: parseInt(newBook.totalPages) || 0,
                currentPage: parseInt(newBook.currentPage) || 0,
                rating: newBook.rating || 0,
                dateAdded: new Date().toISOString()
            };
            
            const title = `BOOK: ${bookData.title} by ${bookData.author}`;

            if (editingBook) {
                 await Note.update(editingBook.id, {
                    title,
                    content: JSON.stringify(bookData)
                });
            } else {
                 await Note.create({
                    title,
                    content: JSON.stringify(bookData)
                });
            }
            
            setNewBook({
                title: "",
                author: "",
                totalPages: "",
                currentPage: 0,
                status: "want_to_read",
                rating: 0,
                notes: "",
                genre: "fiction"
            });
            
            setShowForm(false);
            setEditingBook(null);
            loadBooks();
        } catch (error) {
            console.error("Failed to save book:", error);
        }
    };

    const updateBookField = async (book, field, value) => {
        const updatedBook = { ...book, [field]: value };
        if (field === 'rating' && book.status !== 'finished') {
            updatedBook.status = 'finished';
        }
        try {
            await Note.update(book.id, {
                title: `BOOK: ${updatedBook.title} by ${updatedBook.author}`,
                content: JSON.stringify(updatedBook)
            });
            loadBooks();
        } catch (error) {
            console.error("Failed to update book:", error);
        }
    };


    const updateProgress = async (book, newPage) => {
        const updatedBook = { 
            ...book, 
            currentPage: Math.min(Math.max(0, newPage), book.totalPages),
            status: newPage >= book.totalPages ? "finished" : book.status
        };
        
        try {
            await Note.update(book.id, {
                title: `BOOK: ${book.title} by ${book.author}`,
                content: JSON.stringify(updatedBook)
            });
            loadBooks();
        } catch (error) {
            console.error("Failed to update progress:", error);
        }
    };
    
    const deleteBook = async (bookId) => {
        try {
            await Note.delete(bookId);
            loadBooks();
        } catch (error) {
            console.error("Failed to delete book:", error);
        }
    }

    const openEditForm = (book) => {
        setEditingBook(book);
        setNewBook({
            ...book,
            totalPages: book.totalPages || ""
        });
        setShowForm(true);
    };

    const filteredBooks = books.filter(book => {
        if (filter === "all") return true;
        return book.status === filter;
    });

    const stats = {
        total: books.length,
        reading: books.filter(b => b.status === "reading").length,
        finished: books.filter(b => b.status === "finished").length,
        pages: books.reduce((sum, book) => sum + (book.currentPage || 0), 0)
    };

    const renderStars = (book, interactive = false) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < book.rating ? 'text-yellow-400 fill-current' : 'text-zinc-600'} ${interactive ? 'cursor-pointer hover:opacity-80' : ''}`}
                onClick={(e) => {
                    if (interactive) {
                        e.stopPropagation();
                        updateBookField(book, 'rating', i + 1);
                    }
                }}
            />
        ));
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 tracking-wider text-white">READING LIST</h1>
                <p className="text-zinc-400 text-sm">Track your reading progress and discoveries</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <BookOpen className="w-5 h-5 text-zinc-400" />
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.total}</p>
                                <p className="text-xs text-zinc-400">Total Books</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-blue-400" />
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.reading}</p>
                                <p className="text-xs text-zinc-400">Currently Reading</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <Target className="w-5 h-5 text-green-400" />
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.finished}</p>
                                <p className="text-xs text-zinc-400">Completed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <BookOpen className="w-5 h-5 text-purple-400" />
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.pages}</p>
                                <p className="text-xs text-zinc-400">Pages Read</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center mb-6">
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-48 bg-zinc-900 border-zinc-700 text-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Books</SelectItem>
                        {statuses.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                                {status.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                <Button
                    onClick={() => {
                        setEditingBook(null);
                        setNewBook({
                            title: "", author: "", totalPages: "", currentPage: 0,
                            status: "want_to_read", rating: 0, notes: "", genre: "fiction"
                        });
                        setShowForm(true);
                    }}
                    className="bg-white text-black hover:bg-zinc-200"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Book
                </Button>
            </div>

            {/* Books Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map(book => {
                    const progress = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;
                    const statusInfo = statuses.find(s => s.value === book.status);
                    
                    return (
                        <Card key={book.id} onClick={() => openEditForm(book)} className="bg-zinc-900 border-zinc-800 cursor-pointer hover:border-zinc-700">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg mb-1 text-white">{book.title}</CardTitle>
                                        <p className="text-zinc-400 text-sm">by {book.author}</p>
                                        <p className={`text-xs mt-1 ${statusInfo?.color}`}>
                                            {statusInfo?.label}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex space-x-1 mb-1">
                                            {renderStars(book, book.status === 'finished')}
                                        </div>
                                        <p className="text-xs text-zinc-500 capitalize">{book.genre}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardContent>
                                {book.totalPages > 0 && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-1 text-white">
                                            <span>Progress</span>
                                            <span>{book.currentPage} / {book.totalPages} pages</span>
                                        </div>
                                        <Progress value={progress} className="h-2 [&>*]:bg-white" />
                                    </div>
                                )}
                                
                                {book.notes && (
                                    <p className="text-sm text-zinc-400 mb-4 line-clamp-3">{book.notes}</p>
                                )}
                                
                                {book.status === "reading" && book.totalPages > 0 && (
                                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                        <Button
                                            size="sm"
                                            onClick={() => updateProgress(book, book.currentPage + 10)}
                                            className="bg-zinc-700 text-white hover:bg-zinc-600 flex-1"
                                        >
                                            +10 pages
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => updateProgress(book, book.totalPages)}
                                            className="bg-green-600 text-white hover:bg-green-500"
                                        >
                                            Finish
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {filteredBooks.length === 0 && (
                <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">No books found. Add your first book to get started!</p>
                </div>
            )}

            {/* Add/Edit Book Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-800 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold tracking-wide text-white">{editingBook ? "EDIT BOOK" : "ADD BOOK"}</h3>
                             {editingBook && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-zinc-500 hover:text-red-500"
                                    onClick={() => {
                                        if(confirm("Are you sure you want to delete this book?")) {
                                            deleteBook(editingBook.id);
                                            setShowForm(false);
                                            setEditingBook(null); // Ensure editingBook is cleared after deletion
                                        }
                                    }}
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                             )}
                        </div>
                        <div className="space-y-4">
                            <Input
                                placeholder="Book title"
                                value={newBook.title}
                                onChange={(e) => setNewBook(prev => ({ ...prev, title: e.target.value }))}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                            <Input
                                placeholder="Author"
                                value={newBook.author}
                                onChange={(e) => setNewBook(prev => ({ ...prev, author: e.target.value }))}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    type="number"
                                    placeholder="Total pages"
                                    value={newBook.totalPages}
                                    onChange={(e) => setNewBook(prev => ({ ...prev, totalPages: e.target.value }))}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                />
                                <Input
                                    type="number"
                                    placeholder="Current page"
                                    value={newBook.currentPage}
                                    onChange={(e) => setNewBook(prev => ({ ...prev, currentPage: parseInt(e.target.value) || 0 }))}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    value={newBook.status}
                                    onValueChange={(value) => setNewBook(prev => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map(status => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={newBook.genre}
                                    onValueChange={(value) => setNewBook(prev => ({ ...prev, genre: value }))}
                                >
                                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {genres.map(genre => (
                                            <SelectItem key={genre} value={genre} className="capitalize">
                                                {genre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div>
                                <label className="block text-sm text-zinc-400 mb-2">Rating</label>
                                <div className="flex space-x-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 cursor-pointer hover:opacity-80 ${i < newBook.rating ? 'text-yellow-400 fill-current' : 'text-zinc-600'}`}
                                        onClick={() => setNewBook(prev => ({ ...prev, rating: i + 1, status: 'finished' }))}
                                    />
                                ))}
                                </div>
                            </div>
                            <Textarea
                                placeholder="Notes or thoughts about this book..."
                                value={newBook.notes}
                                onChange={(e) => setNewBook(prev => ({ ...prev, notes: e.target.value }))}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6">
                            <Button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingBook(null); // Clear editing book on cancel
                                }}
                                variant="outline"
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={saveBook}
                                className="bg-white text-black hover:bg-zinc-200"
                            >
                                {editingBook ? "Save Changes" : "Add Book"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
