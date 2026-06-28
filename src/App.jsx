import React, { useState, useEffect } from 'react'
import CompanionModule from './components/CompanionModule'
import CivilizationTunnel from './components/CivilizationTunnel'
import InfiniteCanvas from './components/InfiniteCanvas'
import IdentityCard from './components/IdentityCard'
import RobotAssembly from './components/RobotAssembly'
import { 
  Sparkles, MessageSquare, BookOpen, Brain, 
  Cpu, Layout, CreditCard, Award, UserCheck, Star,
  Sun, Moon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [activeTab, setActiveTab] = useState('companion'); // companion, timeline, canvas, pass, assembly
  
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('companion_theme') || 'dark');

  // Engine State to update header model badge
  const [engineType, setEngineType] = useState(() => {
    try {
      const saved = localStorage.getItem('companion_api_settings');
      const parsed = saved ? JSON.parse(saved) : {};
      return parsed.engineType || 'gemini';
    } catch(e) {
      return 'gemini';
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
    localStorage.setItem('companion_theme', theme);
  }, [theme]);
  
  // Global Education OS State
  const [cardColor, setCardColor] = useState('grey'); // white, grey, blue, green, gold
  const [cardLevel, setCardLevel] = useState(1);
  const [constructionPoints, setConstructionPoints] = useState(35);
  const [talentPoints, setTalentPoints] = useState({
    space: 35,
    bio: 30,
    tech: 40,
    art: 30,
    craft: 30,
    social: 30
  });

  const handlePointsAwarded = (xp) => {
    setConstructionPoints(prev => {
      const next = prev + xp;
      // Trigger level-up thresholds
      const calculatedLevel = Math.floor(next / 50) + 1;
      if (calculatedLevel !== cardLevel) {
        setCardLevel(calculatedLevel);
      }
      return next;
    });
  };

  const handleUpdatePoints = (key, xp) => {
    setTalentPoints(prev => {
      const currentVal = prev[key] || 30;
      const nextVal = Math.min(100, Math.max(10, currentVal + xp));
      return {
        ...prev,
        [key]: nextVal
      };
    });
    handlePointsAwarded(Math.abs(xp));
  };

  return (
    <div className="relative w-full h-screen bg-[var(--bg-color)] text-[var(--text-color)] overflow-hidden font-sans flex">

      {/* Sleek Gradient Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--gradient-bg-from)] via-[var(--bg-color)] to-[var(--bg-color)] pointer-events-none" />

      {/* Sidebar Navigation */}
      <aside className="relative z-10 w-64 bg-black/60 backdrop-blur-md border-r border-white/5 flex flex-col justify-between p-6 flex-shrink-0">
        <div className="flex flex-col gap-8">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <img 
              src="./logo.png" 
              alt="伴生书童 Logo" 
              className="w-10 h-10 rounded-xl border border-purple-500/30 object-cover" 
            />
            <div>
              <h1 className="text-sm font-black tracking-widest bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">
                伴生书童
              </h1>
              <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">
                BRAINLIGHT COMPANION
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {[
              { id: 'companion', label: '伴生书童主舱', icon: MessageSquare, color: 'text-purple-400' },
              { id: 'timeline', label: '文明穿梭时空', icon: BookOpen, color: 'text-cyan-400' },
              { id: 'canvas', label: '无限创造画布', icon: Layout, color: 'text-pink-400' },
              { id: 'pass', label: '开启世界之卡', icon: CreditCard, color: 'text-emerald-400' },
              { id: 'assembly', label: '物理手办装配', icon: Cpu, color: 'text-amber-400' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === item.id ? 'bg-white/10 text-[var(--text-color)] shadow-lg border border-white/10' : 'bg-transparent text-white/40 hover:bg-white/5 hover:text-white/60'}`}
              >
                <item.icon className={`w-4 h-4 ${item.color}`} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* User world pass summary widget at bottom */}
        <div className="glass-panel p-4 flex flex-col gap-2 bg-black/40 border border-white/5">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-white/40 uppercase font-black tracking-wider">Pass 级别</span>
            <span className={`px-1.5 py-0.5 rounded font-black text-[9px] uppercase ${cardColor === 'white' ? 'bg-white text-black' : 
                          cardColor === 'blue' ? 'bg-blue-600 text-white' : 
                          cardColor === 'green' ? 'bg-green-600 text-white' : 
                          cardColor === 'gold' ? 'bg-yellow-600 text-white' : 'bg-zinc-600 text-white'}`}>
              {cardColor}
            </span>
          </div>

          <div className="flex items-end gap-1 mt-1">
            <span className="text-xs text-white/40">LV.</span>
            <span className="text-lg font-black font-mono leading-none">{cardLevel}</span>
            <span className="text-xs font-mono font-bold ml-auto text-yellow-400 flex items-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-yellow-400" />
              {constructionPoints} XP
            </span>
          </div>
        </div>

      </aside>

      {/* Main Workspace Frame */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header Banner */}
        <header className="h-16 border-b border-white/5 px-8 flex justify-between items-center bg-black/20 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-white/50 uppercase tracking-widest font-mono">当前节点: 硅基第二大脑 MVP 实验机</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>当前大脑: {engineType === 'gemini' ? 'Gemini 2.5 Flash' : engineType === 'tencentfree' ? 'Hunyuan (本地代理)' : 'Local Llama'}</span>
            </div>
            
            <button
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-[var(--text-color)] transition-all cursor-pointer flex items-center justify-center"
              title={theme === 'dark' ? "切换为明亮模式" : "切换为暗黑模式"}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-purple-500" />}
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 p-8 overflow-hidden">
          <AnimatePresence mode="wait">
            
            {activeTab === 'companion' && (
              <motion.div
                key="companion"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                <CompanionModule 
                  onPointsAwarded={handlePointsAwarded} 
                  onEngineChange={setEngineType}
                />
              </motion.div>
            )}

            {activeTab === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                <CivilizationTunnel onPointsAwarded={handlePointsAwarded} />
              </motion.div>
            )}

            {activeTab === 'canvas' && (
              <motion.div
                key="canvas"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                <InfiniteCanvas 
                  talentPoints={talentPoints} 
                  onUpdatePoints={handleUpdatePoints}
                />
              </motion.div>
            )}

            {activeTab === 'pass' && (
              <motion.div
                key="pass"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                <IdentityCard 
                  cardColor={cardColor}
                  cardLevel={cardLevel}
                  constructionPoints={constructionPoints}
                  onPointsAwarded={handlePointsAwarded}
                  onColorChange={setCardColor}
                />
              </motion.div>
            )}

            {activeTab === 'assembly' && (
              <motion.div
                key="assembly"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                <RobotAssembly />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

    </div>
  )
}

export default App
