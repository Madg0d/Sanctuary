import Layout from "./Layout.jsx";

import Timer from "./Timer";

import Calendar from "./Calendar";

import Notes from "./Notes";

import News from "./News";

import Chat from "./Chat";

import Weather from "./Weather";

import Focus from "./Focus";

import Quotes from "./Quotes";

import Detox from "./Detox";

import Finance from "./Finance";

import Password from "./Password";

import Browser from "./Browser";

import Books from "./Books";

import Calculator from "./Calculator";

import Goals from "./Goals";

import Meditation from "./Meditation";

import Journal from "./Journal";

import AIAgent from "./AIAgent";

import Home from "./Home";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Timer: Timer,
    
    Calendar: Calendar,
    
    Notes: Notes,
    
    News: News,
    
    Chat: Chat,
    
    Weather: Weather,
    
    Focus: Focus,
    
    Quotes: Quotes,
    
    Detox: Detox,
    
    Finance: Finance,
    
    Password: Password,
    
    Browser: Browser,
    
    Books: Books,
    
    Calculator: Calculator,
    
    Goals: Goals,
    
    Meditation: Meditation,
    
    Journal: Journal,
    
    AIAgent: AIAgent,
    
    Home: Home,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Timer />} />
                
                
                <Route path="/Timer" element={<Timer />} />
                
                <Route path="/Calendar" element={<Calendar />} />
                
                <Route path="/Notes" element={<Notes />} />
                
                <Route path="/News" element={<News />} />
                
                <Route path="/Chat" element={<Chat />} />
                
                <Route path="/Weather" element={<Weather />} />
                
                <Route path="/Focus" element={<Focus />} />
                
                <Route path="/Quotes" element={<Quotes />} />
                
                <Route path="/Detox" element={<Detox />} />
                
                <Route path="/Finance" element={<Finance />} />
                
                <Route path="/Password" element={<Password />} />
                
                <Route path="/Browser" element={<Browser />} />
                
                <Route path="/Books" element={<Books />} />
                
                <Route path="/Calculator" element={<Calculator />} />
                
                <Route path="/Goals" element={<Goals />} />
                
                <Route path="/Meditation" element={<Meditation />} />
                
                <Route path="/Journal" element={<Journal />} />
                
                <Route path="/AIAgent" element={<AIAgent />} />
                
                <Route path="/Home" element={<Home />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}