
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Search, Clock, Star, ArrowLeft, ArrowRight, RotateCw, Home, ShieldAlert } from "lucide-react";

export default function Browser() {
    const [inputValue, setInputValue] = useState("");
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const [bookmarks, setBookmarks] = useState([
        { name: "Wikipedia", url: "https://wikipedia.org" },
        { name: "Archive.org", url: "https://archive.org" },
        { name: "Hacker News", url: "https://news.ycombinator.com" }
    ]);
    
    const currentUrl = history[historyIndex];

    useEffect(() => {
        if (currentUrl) {
            setInputValue(currentUrl);
        }
    }, [currentUrl]);

    const navigate = (newUrl) => {
        if (!newUrl) return;

        let processedUrl = newUrl;
        if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
            processedUrl = 'https://' + processedUrl;
        }
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(processedUrl);
        
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };
    
    const goBack = () => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
        }
    };
    
    const goForward = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prev => prev + 1);
        }
    };

    const reload = () => {
        const iframe = document.getElementById('browser-iframe');
        if (iframe) {
            iframe.src = iframe.src;
        }
    };
    
    const goHome = () => {
        setHistoryIndex(-1);
        setInputValue("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate(inputValue);
    };

    const addBookmark = () => {
        if (currentUrl && !bookmarks.find(b => b.url === currentUrl)) {
            const name = prompt("Bookmark name:", new URL(currentUrl).hostname);
            if (name) {
                setBookmarks(prev => [...prev, { name, url: currentUrl }]);
            }
        }
    };

    const focusedSites = [
        { name: "Reader Mode Sites", items: [
            { name: "Medium", url: "https://medium.com" },
            { name: "Substack", url: "https://substack.com" },
            { name: "The Atlantic", url: "https://theatlantic.com" }
        ]},
        { name: "Learning Resources", items: [
            { name: "Khan Academy", url: "https://khanacademy.org" },
            { name: "Coursera", url: "https://coursera.org" },
            { name: "edX", url: "https://edx.org" }
        ]},
        { name: "Reference & Research", items: [
            { name: "Wikipedia", url: "https://wikipedia.org" },
            { name: "Wolfram Alpha", url: "https://wolframalpha.com" },
            { name: "Internet Archive", url: "https://archive.org" }
        ]},
        { name: "Minimal Tools", items: [
            { name: "DuckDuckGo", url: "https://duckduckgo.com" },
            { name: "Pinboard", url: "https://pinboard.in" },
            { name: "Hacker News", url: "https://news.ycombinator.com" }
        ]}
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 tracking-wider">FOCUSED BROWSER</h1>
                <p className="text-zinc-400 text-sm">Distraction-free web browsing</p>
            </div>

            {/* Navigation Bar */}
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 mb-6">
                <div className="flex items-center space-x-3">
                    <div className="flex space-x-2">
                        <Button
                            size="icon"
                            variant="outline"
                            className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            onClick={goBack}
                            disabled={historyIndex <= 0}
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="outline"
                            className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            onClick={goForward}
                            disabled={historyIndex >= history.length - 1}
                        >
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="outline"
                            className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            onClick={reload}
                            disabled={!currentUrl}
                        >
                            <RotateCw className="w-4 h-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="outline"
                            className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            onClick={goHome}
                        >
                            <Home className="w-4 h-4" />
                        </Button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="flex-1 flex space-x-2">
                        <div className="relative flex-1">
                            <Globe className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Enter URL or search term..."
                                className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                        <Button type="submit" className="bg-white text-black hover:bg-zinc-200">
                            <Search className="w-4 h-4" />
                        </Button>
                    </form>

                    <Button
                        onClick={addBookmark}
                        size="icon"
                        variant="outline"
                        className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        disabled={!currentUrl}
                    >
                        <Star className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Browser Content */}
            {currentUrl ? (
                <div className="bg-white rounded-2xl border border-zinc-800 h-[600px] flex flex-col">
                    <iframe
                        id="browser-iframe"
                        src={currentUrl}
                        className="w-full h-full rounded-2xl"
                        title="Focused Browser"
                        sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts"
                    />
                    <div className="bg-zinc-900 text-zinc-500 text-xs text-center p-1.5 flex items-center justify-center space-x-2 rounded-b-2xl">
                       <ShieldAlert className="w-3 h-3"/>
                       <span>Some sites may not load due to security policies.</span>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {bookmarks.length > 0 && (
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Star className="w-5 h-5" />
                                    <span>Bookmarks</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {bookmarks.map((bookmark, index) => (
                                        <button
                                            key={index}
                                            onClick={() => navigate(bookmark.url)}
                                            className="p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-left"
                                        >
                                            <div className="font-medium">{bookmark.name}</div>
                                            <div className="text-xs text-zinc-400 truncate">{bookmark.url}</div>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        {focusedSites.map((category, index) => (
                            <Card key={index} className="bg-zinc-900 border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="text-lg">{category.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {category.items.map((site, siteIndex) => (
                                            <button
                                                key={siteIndex}
                                                onClick={() => navigate(site.url)}
                                                className="w-full p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-left"
                                            >
                                                <div className="font-medium">{site.name}</div>
                                                <div className="text-xs text-zinc-400">{site.url}</div>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {history.length > 0 && (
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Clock className="w-5 h-5" />
                                    <span>Recent History</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {history.slice(-5).reverse().map((historyUrl, index) => (
                                        <button
                                            key={index}
                                            onClick={() => navigate(historyUrl)}
                                            className="w-full p-2 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors text-left text-sm"
                                        >
                                            {historyUrl}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
