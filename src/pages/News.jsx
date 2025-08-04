
import React, { useState, useEffect } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { RefreshCw, Globe, TrendingUp } from "lucide-react";

export default function News() {
    const [activeSection, setActiveSection] = useState("current");
    const [newsData, setNewsData] = useState({});
    const [loading, setLoading] = useState({});

    const sections = [
        { id: "current", name: "Current Events", icon: Globe },
        { id: "canada", name: "Canada", icon: Globe },
        { id: "usa", name: "United States", icon: Globe },
        { id: "europe", name: "Europe", icon: Globe },
        { id: "middleeast", name: "Middle East", icon: Globe },
        { id: "asia", name: "Asia", icon: Globe },
        { id: "geopolitics", name: "Geopolitics", icon: TrendingUp },
        { id: "economy", name: "Economy", icon: TrendingUp },
        { id: "science", name: "Science", icon: TrendingUp },
        { id: "entertainment", name: "Entertainment", icon: TrendingUp }
    ];

    const fetchNews = async (section) => {
        setLoading(prev => ({ ...prev, [section]: true }));
        
        try {
            let prompt = "";
            
            if (section === "current") {
                prompt = "Get the latest current events and breaking news from today. Focus on the most important global stories, political developments, major incidents, and significant announcements. Present 8-10 headlines with brief summaries. Provide a source URL for each story.";
            } else if (["canada", "usa", "europe", "middleeast", "asia"].includes(section)) {
                const regionName = section === "usa" ? "United States" : section === "middleeast" ? "Middle East" : section;
                prompt = `Get the latest news specifically from ${regionName}. Focus on regional politics, economics, social issues, and important local developments. Present 8-10 headlines with brief summaries. Provide a source URL for each story.`;
            } else {
                const categoryMap = {
                    geopolitics: "international relations, diplomacy, conflicts, and global political developments",
                    economy: "financial markets, business news, economic indicators, and corporate developments",
                    science: "scientific discoveries, research breakthroughs, technology advances, and health developments",
                    entertainment: "movies, music, celebrities, sports, and cultural events"
                };
                prompt = `Get the latest news in ${categoryMap[section]}. Present 8-10 headlines with brief summaries focusing on the most significant recent developments. Provide a source URL for each story.`;
            }

            const result = await InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        headlines: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    summary: { type: "string" },
                                    timestamp: { type: "string" },
                                    source_url: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            setNewsData(prev => ({ ...prev, [section]: result.headlines || [] }));
        } catch (error) {
            console.error("Failed to fetch news:", error);
            setNewsData(prev => ({ ...prev, [section]: [] }));
        }
        
        setLoading(prev => ({ ...prev, [section]: false }));
    };

    useEffect(() => {
        fetchNews(activeSection);
    }, [activeSection]);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 tracking-wider">NEWS</h1>
                <p className="text-zinc-400 text-sm">Curated global updates</p>
            </div>

            {/* Section Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
                {sections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`
                            px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center space-x-2
                            ${activeSection === section.id 
                                ? 'bg-white text-black' 
                                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }
                        `}
                    >
                        <section.icon className="w-4 h-4" />
                        <span>{section.name}</span>
                    </button>
                ))}
            </div>

            {/* News Content */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold tracking-wide">
                        {sections.find(s => s.id === activeSection)?.name.toUpperCase()}
                    </h2>
                    <Button
                        onClick={() => fetchNews(activeSection)}
                        disabled={loading[activeSection]}
                        variant="outline"
                        size="sm"
                        className="border-zinc-700 text-white hover:bg-zinc-800"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading[activeSection] ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                {loading[activeSection] ? (
                    <div className="space-y-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-4 bg-zinc-800 rounded mb-2"></div>
                                <div className="h-12 bg-zinc-800 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {(newsData[activeSection] || []).map((item, index) => (
                            <div key={index} className="border-b border-zinc-800 pb-4 last:border-b-0">
                                <h3 className="text-lg font-medium mb-2 text-white">
                                    {item.title}
                                </h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    {item.summary}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-zinc-500 text-xs">
                                        {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : ''}
                                    </p>
                                    {item.source_url && (
                                        <a
                                            href={item.source_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-zinc-400 hover:text-white hover:underline cursor-pointer"
                                        >
                                            Source
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                        {(!newsData[activeSection] || newsData[activeSection].length === 0) && !loading[activeSection] && (
                            <div className="text-center py-12">
                                <Globe className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                                <p className="text-zinc-400">No news available. Try refreshing.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
