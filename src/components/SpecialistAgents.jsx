import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Palette, Coins, ChevronRight } from 'lucide-react';

const AGENTS = [
    { id: 'arch', name: 'Agent 🏗', role: 'Architect', color: 'text-blue-400', icon: Box, delay: 0.2 },
    { id: 'aes', name: 'Agent 🎨', role: 'Aesthetic', color: 'text-pink-400', icon: Palette, delay: 0.4 },
    { id: 'val', name: 'Agent 🪙', role: 'Valuator', color: 'text-yellow-400', icon: Coins, delay: 0.6 },
];

const SpecialistAgents = ({ active, prototype }) => {
    return (
        <div className="flex flex-col gap-4 mt-8 w-full max-w-lg">
            <AnimatePresence>
                {active && AGENTS.map((agent) => (
                    <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: agent.delay }}
                        className="group flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition-all cursor-pointer"
                    >
                        <div className={`p-2 rounded-full bg-white/5 ${agent.color}`}>
                            <agent.icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{agent.name}</span>
                                <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded border border-current ${agent.color}`}>
                                    {agent.role}
                                </span>
                            </div>
                            <p className="text-xs text-white/80 mt-1 line-clamp-1 italic">
                                {prototype ? prototype[agent.id] : 'Synthesizing output...'}
                            </p>
                        </div>

                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default SpecialistAgents;
