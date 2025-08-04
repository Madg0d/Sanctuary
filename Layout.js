
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
    Clock, 
    Calendar, 
    Edit3, 
    Globe, 
    MessageSquare, 
    Cloud,
    Focus,
    Quote,
    PowerOff,
    BookOpen,
    Brain,
    Target,
    DollarSign,
    Key,
    Monitor,
    Book,
    Calculator as CalcIcon,
    Bot
} from "lucide-react";

const navigationItems = [
    { name: "Timer", icon: Clock, path: "Timer" },
    { name: "Calendar", icon: Calendar, path: "Calendar" },
    { name: "Notes", icon: Edit3, path: "Notes" },
    { name: "News", icon: Globe, path: "News" },
    { name: "Chat", icon: MessageSquare, path: "Chat" },
    { name: "Weather", icon: Cloud, path: "Weather" },
    { name: "Focus", icon: Focus, path: "Focus" },
    { name: "Quotes", icon: Quote, path: "Quotes" },
    { name: "Detox", icon: PowerOff, path: "Detox" },
    { name: "Journal", icon: BookOpen, path: "Journal" },
    { name: "Meditation", icon: Brain, path: "Meditation" },
    { name: "Goals", icon: Target, path: "Goals" },
    { name: "Finance", icon: DollarSign, path: "Finance" },
    { name: "Password", icon: Key, path: "Password" },
    { name: "Browser", icon: Monitor, path: "Browser" },
    { name: "Books", icon: Book, path: "Books" },
    { name: "Calculator", icon: CalcIcon, path: "Calculator" },
    { name: "AI Agent", icon: Bot, path: "AIAgent" }
];

export default function Layout({ children, currentPageName }) {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-black text-white font-mono">
            <style>
                {`
                    :root {
                        --bg-primary: #0a0a0a;
                        --bg-secondary: #1a1a1a;
                        --bg-tertiary: #2a2a2a;
                        --text-primary: #ffffff;
                        --text-secondary: #a0a0a0;
                        --border: #333333;
                        --accent: #ffffff;
                    }
                    
                    * {
                        scrollbar-width: thin;
                        scrollbar-color: var(--bg-tertiary) transparent;
                    }
                    
                    *::-webkit-scrollbar {
                        width: 6px;
                    }
                    
                    *::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    
                    *::-webkit-scrollbar-thumb {
                        background-color: var(--bg-tertiary);
                        border-radius: 3px;
                    }
                `}
            </style>
            
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 rounded-lg border border-zinc-800"
            >
                <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                    <div className="w-full h-0.5 bg-white"></div>
                    <div className="w-full h-0.5 bg-white"></div>
                    <div className="w-full h-0.5 bg-white"></div>
                </div>
            </button>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`
                    fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
                    w-64 h-screen bg-black border-r border-zinc-900 z-40 flex flex-col
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6">
                            <h1 className="text-2xl font-bold mb-8 tracking-wider">ESCAPE</h1>
                            <nav className="space-y-2">
                                {navigationItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={createPageUrl(item.path)}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`
                                            flex items-center space-x-3 px-4 py-3 rounded-lg
                                            transition-all duration-200 hover:bg-zinc-800
                                            ${location.pathname.includes(createPageUrl(item.path))
                                                ? 'bg-zinc-800 text-white' 
                                                : 'text-zinc-400 hover:text-white'
                                            }
                                        `}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="text-sm tracking-wide">{item.name}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="text-xs text-zinc-500 text-center">
                            Digital Sanctuary
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 lg:ml-0 min-h-screen">
                    <div className="p-6 lg:p-8 pt-16 lg:pt-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
