import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FlaskConical, 
  Cpu, 
  Activity, 
  Network, 
  Search, 
  Terminal as TerminalIcon,
  Menu,
  X,
  Zap,
  Microscope,
  Atom,
  Settings,
  ChevronRight,
  Save,
  History,
  Share2,
  Download,
  Stethoscope,
  Globe,
  Lightbulb,
  Copy,
  Trash2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  conductResearch, 
  SYSTEM_INSTRUCTIONS, 
  saveInvention, 
  getSavedInventions, 
  clearHistory,
  ResearchResult, 
  exportToVayuDrive,
  parseSimulationData,
  parseGraphData
} from './services/vayuService';
import SimulationViewer from './components/SimulationViewer';
import KnowledgeGraph from './components/KnowledgeGraph';
import AITerminal from './components/AITerminal';
import { ToastContainer, ToastType } from './components/Toast';
import { cn } from './lib/utils';

type Tab = 'dashboard' | 'lab' | 'designer' | 'simulation' | 'graph' | 'patent' | 'terminal' | 'history';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [researchInput, setResearchInput] = useState('');
  const [researchResult, setResearchResult] = useState<string | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [savedInventions, setSavedInventions] = useState<ResearchResult[]>([]);
  const [puterConnected, setPuterConnected] = useState<boolean | null>(null);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [showResultOnMobile, setShowResultOnMobile] = useState(false);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const checkPuter = () => {
      if (typeof (window as any).puter !== 'undefined') {
        setPuterConnected(true);
      } else {
        setPuterConnected(false);
      }
    };
    checkPuter();
    loadHistory();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadHistory = async () => {
    const history = await getSavedInventions();
    setSavedInventions(history);
  };

  const handleResearch = async (type: keyof typeof SYSTEM_INSTRUCTIONS) => {
    if (!researchInput.trim()) {
      addToast("Please enter research parameters.", "error");
      return;
    }
    setIsResearching(true);
    // Don't clear researchResult immediately to avoid flicker, 
    // but we can show a loading overlay
    try {
      const result = await conductResearch(researchInput, SYSTEM_INSTRUCTIONS[type]);
      setResearchResult(result);
      setSimulationData(parseSimulationData(result));
      setGraphData(parseGraphData(result));
      addToast("Neural synthesis complete.", "success");
      if (isMobile) setShowResultOnMobile(true);
    } catch (error: any) {
      addToast(`Vayu Neural Error: ${error.message || "Connection interrupted."}`, "error");
      setResearchResult(`### Vayu Neural Error\n\n${error.message || "The neural link was interrupted. Please ensure your connection to the Vayu Cloud is stable."}`);
    } finally {
      setIsResearching(false);
    }
  };

  const handleSave = async () => {
    if (!researchResult) return;
    try {
      const newInvention: ResearchResult = {
        title: researchInput.slice(0, 30) + (researchInput.length > 30 ? '...' : ''),
        content: researchResult,
        type: activeTab,
        timestamp: Date.now()
      };
      await saveInvention(newInvention);
      await loadHistory();
      addToast("Invention successfully synced to Vayu Cloud.", "success");
    } catch (error: any) {
      addToast(`Save Error: ${error.message}`, "error");
    }
  };

  const handleExport = async () => {
    if (!researchResult) return;
    try {
      const filename = `vayu_research_${Date.now()}.md`;
      await exportToVayuDrive(filename, researchResult);
      addToast(`Research successfully exported to Vayu Drive: ${filename}`, "success");
    } catch (error: any) {
      addToast(`Export Error: ${error.message}`, "error");
    }
  };

  const handleCopy = () => {
    if (!researchResult) return;
    navigator.clipboard.writeText(researchResult);
    setCopied(true);
    addToast("Copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setResearchResult(null);
    setResearchInput('');
    setSimulationData(null);
    setGraphData(null);
    addToast("Research cleared", "info");
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear all invention history? This cannot be undone.")) return;
    try {
      await clearHistory();
      await loadHistory();
      addToast("History cleared successfully.", "success");
    } catch (error: any) {
      addToast(`Clear Error: ${error.message}`, "error");
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'lab', label: 'Research Lab', icon: FlaskConical },
    { id: 'designer', label: 'Machine Designer', icon: Cpu },
    { id: 'simulation', label: 'Simulation Lab', icon: Activity },
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'patent', label: 'Patent Explorer', icon: Search },
    { id: 'terminal', label: 'AI Terminal', icon: TerminalIcon },
    { id: 'history', label: 'Invention History', icon: History },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-[#050505] text-slate-200 overflow-hidden neural-grid">
      {/* Toast System */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Neural Background Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-medical-blue/5 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-plasma-violet/5 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Connection Banner */}
      <AnimatePresence>
        {puterConnected === false && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 bg-red-500/90 backdrop-blur-md text-white p-2 text-center text-xs font-bold z-[100] border-b border-red-400/50"
          >
            VAYU NEURAL LINK OFFLINE: Puter.js failed to initialize. Please refresh or check your connection.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop Only */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: sidebarOpen ? 280 : 80,
          x: isMobile ? -300 : 0
        }}
        className={cn(
          "glass-panel m-4 mr-0 flex flex-col border-r border-white/10 z-50 transition-all duration-300",
          isMobile ? "fixed inset-y-0 left-0 m-0 rounded-none border-r" : "relative"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <div className={cn("flex items-center gap-3 overflow-hidden", !sidebarOpen && !isMobile && "hidden")}>
            <div className="w-8 h-8 rounded-lg bg-medical-blue flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.5)]">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight whitespace-nowrap">Vayu Engine</span>
          </div>
          {!isMobile && (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="p-2">
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as Tab);
                if (isMobile) setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group relative",
                activeTab === item.id 
                  ? "bg-medical-blue/20 text-medical-blue border border-medical-blue/30" 
                  : "hover:bg-white/5 text-slate-400 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn(activeTab === item.id && "text-medical-blue")} />
              {(sidebarOpen || isMobile) && <span className="font-medium">{item.label}</span>}
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-6 bg-medical-blue rounded-r-full"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className={cn("glass-card p-4 flex items-center gap-3", !sidebarOpen && !isMobile && "justify-center")}>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Globe size={18} className="text-cyber-teal" />
            </div>
            {(sidebarOpen || isMobile) && (
              <div className="flex flex-col">
                <span className="text-sm font-bold">Vayu Cloud</span>
                <span className="text-[10px] text-cyber-teal uppercase tracking-widest">Active</span>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-2 md:p-4 overflow-hidden relative">
        {/* Header */}
        <header className="flex items-center justify-between mb-4 md:mb-6 px-2 md:px-4">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 glass-card"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1 className="text-lg md:text-2xl font-bold tracking-tight text-white">
                {navItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="hidden md:block text-sm text-slate-400">Vayu Research Engine v3.0 • Neural Synthesis</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyber-teal animate-pulse" />
              VAYU_CORE
            </div>
            <div className="flex gap-1 md:gap-2">
              <button 
                onClick={handleCopy}
                disabled={!researchResult}
                className="p-1.5 md:p-2 glass-card hover:text-medical-blue transition-colors disabled:opacity-30"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
              <button 
                onClick={handleClear}
                disabled={!researchResult && !researchInput}
                className="p-1.5 md:p-2 glass-card hover:text-red-400 transition-colors disabled:opacity-30"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 md:px-4 pb-20 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 glass-panel p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Atom size={120} />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-white">Vayu Research Engine</h2>
                    <p className="text-slate-400 mb-8 max-w-xl">
                      A 100% frontend-only research platform powered by Vayu Neural Synthesis. 
                      Inventing the future of medical and mechanical engineering through advanced AI discovery.
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="glass-card p-4">
                        <div className="text-medical-blue font-bold text-2xl mb-1">{savedInventions.length}</div>
                        <div className="text-xs uppercase tracking-widest opacity-50">Stored Concepts</div>
                      </div>
                      <div className="glass-card p-4">
                        <div className="text-cyber-teal font-bold text-2xl mb-1">∞</div>
                        <div className="text-xs uppercase tracking-widest opacity-50">Vayu Capacity</div>
                      </div>
                      <div className="glass-card p-4">
                        <div className="text-plasma-violet font-bold text-2xl mb-1">0ms</div>
                        <div className="text-xs uppercase tracking-widest opacity-50">Edge Latency</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-panel p-6 flex flex-col">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Lightbulb size={16} className="text-yellow-400" />
                      Invention Modules
                    </h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Medical Technology', icon: Stethoscope, tab: 'lab' },
                        { name: 'Machinery Design', icon: Cpu, tab: 'designer' },
                        { name: 'Cross-Industry', icon: Globe, tab: 'lab' },
                        { name: 'Patent Disruption', icon: Search, tab: 'patent' }
                      ].map((module) => (
                        <button 
                          key={module.name} 
                          onClick={() => setActiveTab(module.tab as Tab)}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <module.icon size={16} className="text-medical-blue" />
                            <span className="text-sm">{module.name}</span>
                          </div>
                          <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel p-6">
                      <h3 className="font-bold mb-4">Vayu Universe</h3>
                      <div className="space-y-4">
                        {savedInventions.slice(0, 3).map((inv, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="w-8 h-8 rounded bg-medical-blue/20 flex items-center justify-center text-medical-blue">
                              <FlaskConical size={14} />
                            </div>
                            <div>
                              <div className="text-sm font-medium truncate w-40">{inv.title}</div>
                              <div className="text-[10px] opacity-50">{new Date(inv.timestamp).toLocaleDateString()}</div>
                            </div>
                          </div>
                        ))}
                        {savedInventions.length === 0 && <div className="text-xs opacity-30 italic">No inventions saved yet.</div>}
                      </div>
                    </div>
                    <div className="md:col-span-2 glass-panel p-6">
                      <h3 className="font-bold mb-4">Vayu Synthesis Load</h3>
                      <div className="h-40 flex items-end gap-1">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <div 
                            key={i} 
                            className="flex-1 bg-medical-blue/30 rounded-t-sm hover:bg-medical-blue transition-colors"
                            style={{ height: `${Math.random() * 100}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(activeTab === 'lab' || activeTab === 'designer' || activeTab === 'patent') && (
                <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6 h-full">
                  {isMobile && researchResult && (
                    <div className="flex gap-2 mb-2">
                      <button 
                        onClick={() => setShowResultOnMobile(false)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                          !showResultOnMobile ? "bg-medical-blue text-white" : "bg-white/5 text-slate-400"
                        )}
                      >
                        Parameters
                      </button>
                      <button 
                        onClick={() => setShowResultOnMobile(true)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                          showResultOnMobile ? "bg-medical-blue text-white" : "bg-white/5 text-slate-400"
                        )}
                      >
                        Result
                      </button>
                    </div>
                  )}

                  <div className={cn(
                    "lg:col-span-2 flex flex-col gap-6",
                    isMobile && showResultOnMobile && researchResult && "hidden"
                  )}>
                    <div className="glass-panel p-6">
                      <h3 className="font-bold mb-4">Research Parameters</h3>
                      <textarea
                        value={researchInput}
                        onChange={(e) => setResearchInput(e.target.value)}
                        placeholder={
                          activeTab === 'lab' ? "Describe a technology to deconstruct or an invention to create..." :
                          activeTab === 'designer' ? "Describe the machine architecture you want to design..." :
                          "Describe a technology field to find patent disruptions..."
                        }
                        className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-medical-blue/50 transition-colors resize-none mb-4"
                      />
                      <div className="flex flex-wrap gap-2">
                        {activeTab === 'lab' && (
                          <>
                            <button 
                              onClick={() => handleResearch('DECONSTRUCTION')}
                              disabled={isResearching}
                              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                            >
                              Deconstruct
                            </button>
                            <button 
                              onClick={() => handleResearch('MEDICAL_INVENTOR')}
                              disabled={isResearching}
                              className="flex-1 bg-medical-blue text-white rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] transition-all disabled:opacity-50"
                            >
                              Invent Med-Tech
                            </button>
                            <button 
                              onClick={() => handleResearch('CROSS_INDUSTRY')}
                              disabled={isResearching}
                              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 mt-2"
                            >
                              Vayu Synthesis
                            </button>
                          </>
                        )}
                        {activeTab === 'designer' && (
                          <button 
                            onClick={() => handleResearch('DESIGN')}
                            disabled={isResearching}
                            className="w-full bg-medical-blue text-white rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all disabled:opacity-50"
                          >
                            Generate Architecture
                          </button>
                        )}
                        {activeTab === 'patent' && (
                          <button 
                            onClick={() => handleResearch('PATENT_DISRUPTION')}
                            disabled={isResearching}
                            className="w-full bg-plasma-violet text-white rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all disabled:opacity-50"
                          >
                            Analyze Market Gaps
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="glass-panel p-6 flex-1">
                      <h3 className="font-bold mb-4">Vayu Configuration</h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Neural Flux', val: 85 },
                          { label: 'Scientific Rigor', val: 95 },
                          { label: 'Market Disruption', val: 70 }
                        ].map(param => (
                          <div key={param.label}>
                            <div className="flex justify-between text-[10px] uppercase opacity-50 mb-1">
                              <span>{param.label}</span>
                              <span>{param.val}%</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-medical-blue" style={{ width: `${param.val}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    "lg:col-span-3 glass-panel p-4 md:p-8 overflow-y-auto relative min-h-[400px] md:min-h-[500px]",
                    isMobile && !showResultOnMobile && researchResult && "hidden"
                  )}>
                    {researchResult && (
                      <div className="absolute top-4 right-4 z-20">
                        <button 
                          onClick={handleSave}
                          className="flex items-center gap-2 px-4 py-2 bg-medical-blue/20 hover:bg-medical-blue/40 border border-medical-blue/30 rounded-lg text-xs font-bold transition-all"
                        >
                          <Save size={14} />
                          Save to Vayu Cloud
                        </button>
                      </div>
                    )}
                    
                    {isResearching ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/20 backdrop-blur-sm z-10">
                        <div className="w-12 h-12 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin" />
                        <div className="text-sm font-mono text-medical-blue animate-pulse uppercase tracking-widest">Vayu Synthesis in Progress...</div>
                      </div>
                    ) : researchResult ? (
                      <div className="markdown-body">
                        <Markdown>{researchResult}</Markdown>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                        <FlaskConical size={64} className="mb-4" />
                        <p className="max-w-xs">Vayu is idle. Initiate a research sequence to begin discovery.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'simulation' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                  <div className="lg:col-span-3 glass-panel p-0 overflow-hidden relative">
                    <SimulationViewer blueprint={simulationData} />
                    <div className="absolute top-4 left-4 glass-card p-3 pointer-events-none">
                      <div className="text-[10px] uppercase opacity-50 mb-1">Simulation Status</div>
                      <div className="text-cyber-teal font-bold">VAYU_ACTIVE</div>
                    </div>
                  </div>
                  <div className="glass-panel p-6">
                    <h3 className="font-bold mb-4">Telemetry</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Thermal Load', value: '42°C', color: 'text-orange-400' },
                        { label: 'Power Draw', value: '1.2kW', color: 'text-medical-blue' },
                        { label: 'Signal Noise', value: '-110dB', color: 'text-cyber-teal' },
                        { label: 'Structural Integrity', value: '99.8%', color: 'text-emerald-400' },
                      ].map(stat => (
                        <div key={stat.label} className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <div className="text-[10px] uppercase opacity-50 mb-1">{stat.label}</div>
                          <div className={cn("text-lg font-bold font-mono", stat.color)}>{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'graph' && (
                <div className="h-full flex flex-col gap-6">
                  <div className="flex-1">
                    <KnowledgeGraph data={graphData} />
                  </div>
                </div>
              )}

              {activeTab === 'terminal' && (
                <div className="h-full">
                  <AITerminal />
                </div>
              )}

              {activeTab === 'history' && (
                <div className="glass-panel p-8 h-full overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <History className="text-medical-blue" />
                      Invention History
                    </h2>
                    {savedInventions.length > 0 && (
                      <button 
                        onClick={handleClearHistory}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-xs font-bold text-red-400 transition-all"
                      >
                        <Trash2 size={14} />
                        Clear All History
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedInventions.map((inv, i) => (
                      <div key={i} className="glass-card p-6 flex flex-col group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-2 rounded bg-medical-blue/20 text-medical-blue">
                            <Cpu size={16} />
                          </div>
                          <span className="text-[10px] uppercase opacity-50">{new Date(inv.timestamp).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-bold mb-2 group-hover:text-medical-blue transition-colors">{inv.title}</h3>
                        <div className="text-xs text-slate-400 line-clamp-3 mb-4 opacity-70">
                          {inv.content.replace(/[#*`]/g, '').slice(0, 150)}...
                        </div>
                        <button 
                          onClick={() => {
                            setResearchResult(inv.content);
                            setActiveTab('lab');
                          }}
                          className="mt-auto text-xs font-bold text-medical-blue hover:underline flex items-center gap-1"
                        >
                          Open in Lab <ChevronRight size={12} />
                        </button>
                      </div>
                    ))}
                    {savedInventions.length === 0 && (
                      <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-30">
                        <History size={48} className="mb-4" />
                        <p>No inventions saved to the Vayu cloud yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 z-[60]">
            {navItems.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  activeTab === item.id ? "text-medical-blue" : "text-slate-500"
                )}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
              </button>
            ))}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center gap-1 text-slate-500"
            >
              <Menu size={20} />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
