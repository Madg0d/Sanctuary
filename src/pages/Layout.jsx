
import React from "react";
import { Link } from "react-router-dom";
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
    Bot,
    LayoutDashboard // Add Dashboard icon
} from "lucide-react";

const navigationItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "Home" }, // Point to the new Home page
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
    const NavLink = ({ item }) => (
        <Link 
            to={createPageUrl(item.path)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                currentPageName === item.name ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
            }`}
        >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.name}</span>
        </Link>
    );

    return (
        <div className="flex h-screen bg-zinc-950 text-white font-sans">
            <aside className="w-64 bg-zinc-900/50 border-r border-zinc-800 flex flex-col p-4">
                <div className="flex items-center mb-8">
                    <div className="w-8 h-8 bg-white rounded-lg mr-3"></div>
                    <h1 className="text-xl font-bold tracking-wider">Sanctuary</h1>
                </div>
                <nav className="flex-1 space-y-2">
                    {navigationItems.map(item => <NavLink key={item.name} item={item} />)}
                </nav>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
