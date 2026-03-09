import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { conductResearch } from '../services/vayuService';

const AITerminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ type: 'user' | 'ai', content: string }[]>([
    { type: 'ai', content: 'Vayu Research Terminal v3.0. Ready for neural commands. Try "invent: portable MRI" or "analyze: dialysis machine".' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const cmd = input.trim();
    setHistory(prev => [...prev, { type: 'user', content: cmd }]);
    setInput('');
    setIsProcessing(true);

    let prompt = "";
    let systemInstruction = "You are an AI research terminal. Respond concisely to commands.";

    if (cmd.startsWith('invent:')) {
      prompt = `Invent a new machine for: ${cmd.replace('invent:', '').trim()}`;
      systemInstruction = "You are a visionary inventor. Provide a concise but brilliant invention concept.";
    } else if (cmd.startsWith('analyze:')) {
      prompt = `Analyze the following technology: ${cmd.replace('analyze:', '').trim()}`;
      systemInstruction = "You are a technical analyst. Provide a brief functional breakdown and weakness report.";
    } else {
      prompt = cmd;
    }

    const response = await conductResearch(prompt, systemInstruction);
    setHistory(prev => [...prev, { type: 'ai', content: response }]);
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col h-full glass-panel font-mono text-sm overflow-hidden border-medical-blue/20">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-white/5">
        <TerminalIcon size={14} className="text-medical-blue" />
        <span className="text-xs font-bold uppercase tracking-widest opacity-70">Research Terminal</span>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {history.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "max-w-[90%] p-3 rounded-lg",
                item.type === 'user' 
                  ? "ml-auto bg-medical-blue/20 border border-medical-blue/30 text-medical-blue" 
                  : "bg-white/5 border border-white/10 text-slate-300"
              )}
            >
              <div className="text-[10px] uppercase opacity-50 mb-1">
                {item.type === 'user' ? 'Scientist' : 'NeuroForge AI'}
              </div>
              <div className="whitespace-pre-wrap">{item.content}</div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-cyber-teal"
          >
            <span className="animate-pulse">Processing neural pathways...</span>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleCommand} className="p-4 border-t border-white/10 bg-white/5">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter command..."
            className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:border-medical-blue/50 transition-colors"
          />
          <button 
            type="submit"
            disabled={isProcessing}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-medical-blue hover:text-white transition-colors disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

import { cn } from '../lib/utils';
export default AITerminal;
