
import React, { useState, useEffect } from "react";
import { InvokeLLM } from "@/api/integrations";
import { FavoriteQuote } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { RefreshCw, Quote, Star, Trash2 } from "lucide-react";

export default function Quotes() {
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState("inspiration");
    const [view, setView] = useState("daily"); // daily or favorites
    const [favorites, setFavorites] = useState([]);
    const [isFavorited, setIsFavorited] = useState(false);
    const [seenQuotes, setSeenQuotes] = useState([]);

    const categories = [
        { id: "inspiration", name: "Inspiration" },
        { id: "productivity", name: "Productivity" },
        { id: "wisdom", name: "Wisdom" },
        { id: "focus", name: "Focus" },
        { id: "minimalism", name: "Minimalism" },
        { id: "philosophy", name: "Philosophy" }
    ];

    useEffect(() => {
        const storedSeenQuotes = JSON.parse(localStorage.getItem("seenQuotes") || "[]");
        setSeenQuotes(storedSeenQuotes);
        loadFavorites(); // Load favorites on mount
    }, []);

    useEffect(() => {
        if (view === "daily") {
            fetchQuote();
        }
        // When switching to 'favorites', `loadFavorites` is handled by initial useEffect
        // and also by `toggleFavorite` and `deleteFavorite` actions.
    }, [view, category]);

    useEffect(() => {
        if (quote) {
            const checkFavorited = favorites.some(fav => fav.content === quote.quote && fav.author === quote.author);
            setIsFavorited(checkFavorited);
        } else {
            setIsFavorited(false);
        }
    }, [quote, favorites]);

    const loadFavorites = async () => {
        try {
            const favs = await FavoriteQuote.list();
            setFavorites(favs);
        } catch (error) {
            console.error("Failed to load favorites:", error);
            setFavorites([]);
        }
    };

    const fetchQuote = async () => {
        setLoading(true);
        try {
            const seenQuotesQuery = seenQuotes.length > 0 ? `Please provide a different quote than the following: ${seenQuotes.map(q => `"${q}"`).join(', ')}.` : '';

            const result = await InvokeLLM({
                prompt: `Generate an inspiring quote about ${category}. Include the quote text and the author. Choose from famous philosophers, thinkers, writers, or leaders. Make it meaningful and relevant to ${category}. ${seenQuotesQuery}`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        quote: { type: "string" },
                        author: { type: "string" },
                        context: { type: "string" }
                    }
                }
            });

            setQuote(result);
            
            // Update seenQuotes and store in localStorage
            const newSeenQuotes = [...seenQuotes, result.quote].slice(-50); // Keep last 50 seen quotes to avoid excessive storage
            setSeenQuotes(newSeenQuotes);
            localStorage.setItem("seenQuotes", JSON.stringify(newSeenQuotes));

            await loadFavorites(); // Refresh favorites to update isFavorited status
        } catch (error) {
            console.error("Failed to fetch quote:", error);
            setQuote(null);
        }
        setLoading(false);
    };

    const handleCategoryChange = (newCategory) => {
        setCategory(newCategory);
        if (view === 'daily') {
          setTimeout(() => fetchQuote(), 100); // Small delay to ensure state update propagates before fetch
        }
    };

    const toggleFavorite = async () => {
        if (!quote) return;

        try {
            const existing = favorites.find(fav => fav.content === quote.quote && fav.author === quote.author);

            if (existing) {
                await FavoriteQuote.delete(existing.id);
            } else {
                await FavoriteQuote.create({
                    content: quote.quote,
                    author: quote.author,
                    context: quote.context || null
                });
            }
            await loadFavorites(); // Reload favorites after modification
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
        }
    };
    
    const deleteFavorite = async (id) => {
        try {
            await FavoriteQuote.delete(id);
            await loadFavorites(); // Reload favorites after deletion
        } catch (error) {
            console.error("Failed to delete favorite:", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 tracking-wider text-white">QUOTES</h1>
                <p className="text-zinc-400 text-sm">Daily wisdom and inspiration</p>
            </div>

             {/* View Toggle */}
            <div className="flex space-x-2 mb-4">
                <Button onClick={() => setView('daily')} className={view === 'daily' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700'}>Daily Quote</Button>
                <Button onClick={() => setView('favorites')} className={view === 'favorites' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700'}>Favorites</Button>
            </div>

            {view === 'daily' && (
                <>
                    {/* Category Selection */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`
                                    px-4 py-2 rounded-lg text-sm transition-all duration-200
                                    ${category === cat.id 
                                        ? 'bg-zinc-800 text-white' 
                                        : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                                    }
                                `}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Quote Display */}
                    <div className="bg-zinc-900 rounded-2xl p-12 border border-zinc-800 text-center mb-6 relative">
                         {quote && !loading && (
                            <Button size="icon" variant="ghost" className="absolute top-4 right-4 text-zinc-400 hover:text-white" onClick={toggleFavorite}>
                                <Star className={`w-5 h-5 ${isFavorited ? 'text-yellow-400 fill-current' : ''}`} />
                            </Button>
                        )}
                        {loading ? (
                            <div>
                                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-6"></div>
                                <p className="text-zinc-400">Fetching wisdom...</p>
                            </div>
                        ) : quote ? (
                            <div>
                                <Quote className="w-12 h-12 text-zinc-600 mx-auto mb-8" />
                                <blockquote className="text-2xl md:text-3xl font-light leading-relaxed mb-8 text-white">
                                    "{quote.quote}"
                                </blockquote>
                                <div className="text-zinc-400">
                                    <div className="text-lg font-medium mb-2 text-white">— {quote.author}</div>
                                    {quote.context && (
                                        <div className="text-sm">{quote.context}</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <Quote className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                                <p className="text-zinc-400">Click refresh to get a quote</p>
                            </div>
                        )}
                    </div>
                     {/* Refresh Button */}
                    <div className="text-center">
                        <Button
                            onClick={fetchQuote}
                            disabled={loading}
                            className="bg-white text-black hover:bg-zinc-200 px-8 py-3"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            New Quote
                        </Button>
                    </div>
                </>
            )}

             {view === 'favorites' && (
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                    <h2 className="text-xl font-bold mb-6 tracking-wide text-white">FAVORITE QUOTES</h2>
                    {favorites.length > 0 ? (
                        <div className="space-y-6">
                            {favorites.map(fav => (
                                <div key={fav.id} className="border-b border-zinc-800 pb-4 last:border-b-0 flex justify-between items-start">
                                    <div>
                                        <blockquote className="text-lg italic text-white mb-2">"{fav.content}"</blockquote>
                                        <p className="text-zinc-400">— {fav.author}</p>
                                        {fav.context && (
                                            <p className="text-zinc-500 text-xs mt-1">{fav.context}</p>
                                        )}
                                    </div>
                                    <Button size="icon" variant="ghost" onClick={() => deleteFavorite(fav.id)} className="text-zinc-500 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-400 text-center py-8">You have no favorite quotes yet.</p>
                    )}
                </div>
            )}
        </div>
    );
}
