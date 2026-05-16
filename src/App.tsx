import React, { useState, useEffect, useMemo } from 'react';
import { Player } from './components/Player';
import { Docs } from './components/Docs';
import { Tv, ShieldAlert, LogOut, Play, History, Link as LinkIcon, Trash2, Search, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

interface PlayHistory {
  id: string;
  url: string;
  name: string;
  timestamp: number;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<PlayHistory[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<PlayHistory | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [inputName, setInputName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDocs, setShowDocs] = useState(false);

  // Initialize data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('elitetv_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error parsing saved history", e);
      }
    }
    setLoading(false);
  }, []);

  // Persist history to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('elitetv_history', JSON.stringify(history));
    }
  }, [history, loading]);

  const handlePlayUrl = (url: string, name?: string) => {
    if (!url.trim()) return;
    
    setError(null);
    const videoName = name || url.split('/').pop()?.split('?')[0] || "Unnamed Stream";
    
    const newEntry: PlayHistory = {
      id: crypto.randomUUID(),
      url: url.trim(),
      name: videoName,
      timestamp: Date.now()
    };

    setSelectedVideo(newEntry);
    
    // Add to history if not already there (or move to top if it is)
    setHistory(prev => {
      const filtered = prev.filter(h => h.url !== url.trim());
      return [newEntry, ...filtered].slice(0, 50); // Keep last 50
    });
  };

  const handleRemoveHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your play history?")) {
      setHistory([]);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-blue-600 flex flex-col items-center gap-4"
        >
          <Tv size={64} />
          <p className="text-white/20 font-bold uppercase tracking-widest text-xs">Initializing Player</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden text-white font-sans">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-white/5 bg-black/50 backdrop-blur-xl z-30">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div 
              className="flex items-center gap-3 text-blue-500 font-bold tracking-tighter text-xl cursor-pointer"
              onClick={() => { setSelectedVideo(null); setShowDocs(false); }}
            >
              <Tv size={28} />
              <span>Elite Player</span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setShowDocs(!showDocs)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer",
                  showDocs ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                )}
              >
                <Book size={16} />
                <span className="hidden xs:inline">Documentation</span>
                <span className="xs:hidden">Docs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {showDocs ? (
            <Docs key="docs" onBack={() => setShowDocs(false)} />
          ) : selectedVideo ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col overflow-hidden bg-black p-0 sm:p-4 md:p-8"
            >
              <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col gap-4 sm:gap-6">
                <div className="flex items-center justify-between px-4 sm:px-0 py-2 sm:py-0">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button 
                      onClick={() => setSelectedVideo(null)}
                      className="p-2 sm:p-3 bg-white/5 hover:bg-white/10 rounded-xl sm:rounded-2xl text-white/40 hover:text-white transition-all cursor-pointer"
                    >
                      <LogOut className="rotate-180 w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg md:text-2xl font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-2xl">{selectedVideo.name}</h2>
                      <p className="text-white/40 text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-[1px] sm:tracking-[2px] truncate max-w-[200px] sm:max-w-xs md:max-w-2xl">{selectedVideo.url}</p>
                    </div>
                  </div>
                </div>

                <div className="relative aspect-video w-full bg-zinc-950 sm:rounded-2xl overflow-hidden shadow-2xl">
                  <Player
                    url={selectedVideo.url}
                    title={selectedVideo.name}
                    onError={(err) => {
                      console.error('Player runtime error:', err);
                      setError("Unable to play stream. This usually happens if the link is expired, invalid, or blocked by CORS.");
                    }}
                  />
                </div>
                
                {/* Info Text */}
                <div className="bg-white/5 sm:rounded-3xl p-4 sm:p-6 border-y sm:border border-white/5">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                        <LinkIcon size={20} />
                      </div>
                      <h3 className="font-bold">Stream Information</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Protocol</p>
                        <p className="text-sm font-medium text-white/80">{selectedVideo.url.startsWith('http') ? 'Network Stream' : 'Local File'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Format Detection</p>
                        <p className="text-sm font-medium text-white/80">{selectedVideo.url.split('.').pop()?.toUpperCase() || 'Auto'}</p>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              {/* Hero Input Section */}
              <div className="bg-gradient-to-b from-blue-600/5 to-transparent pt-12 pb-20 px-6">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                      Drop any <span className="text-blue-500">Video link</span>
                    </h1>
                    <p className="text-white/40 text-sm md:text-lg max-w-xl mx-auto">
                      Play direct links for M3U8, MP4, MKV, and more. Advanced HLS support with multi-language and quality switching.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-5 flex items-center text-white/20 group-focus-within:text-blue-500 transition-colors">
                          <LinkIcon size={20} />
                        </div>
                        <input
                          type="text"
                          placeholder="Paste your video or stream URL here..."
                          className="w-full h-16 md:h-20 bg-white/5 border border-white/10 rounded-3xl pl-14 pr-6 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-white md:text-lg placeholder:text-white/20 font-medium"
                          value={inputUrl}
                          onChange={(e) => setInputUrl(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handlePlayUrl(inputUrl, inputName)}
                        />
                      </div>
                      <div className="relative group">
                         <div className="absolute inset-y-0 left-5 flex items-center text-white/20 group-focus-within:text-blue-500 transition-colors">
                          <Search size={20} />
                        </div>
                        <input
                          type="text"
                          placeholder="Video Title (Optional)"
                          className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-white placeholder:text-white/20 font-medium"
                          value={inputName}
                          onChange={(e) => setInputName(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => handlePlayUrl(inputUrl, inputName)}
                        disabled={!inputUrl.trim()}
                        className="h-16 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-white/20 rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all active:scale-95 cursor-pointer shadow-xl shadow-blue-600/20"
                      >
                        <Play fill="currentColor" size={20} />
                        Start Playing
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* History Section */}
              <div className="px-6 pb-12">
                <div className="max-w-5xl mx-auto space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <History className="text-white/40" size={20} />
                      <h2 className="text-lg font-bold tracking-tight">Recent Activity</h2>
                    </div>
                    {history.length > 0 && (
                      <button 
                        onClick={clearHistory}
                        className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-red-500 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Trash2 size={12} /> Clear History
                      </button>
                    )}
                  </div>

                  {history.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                      <div className="p-6 bg-white/5 rounded-full text-white/20">
                        <History size={48} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-white/60">No history yet</p>
                        <p className="text-sm text-white/30">Your recently played videos will appear here.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {history.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePlayUrl(item.url, item.name)}
                          className="bg-white/5 border border-white/5 hover:border-blue-500/30 rounded-3xl p-5 flex items-center gap-4 group cursor-pointer transition-all"
                        >
                          <div className="p-4 bg-white/5 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-lg">
                            <Play fill="currentColor" size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold truncate group-hover:text-blue-400 transition-colors">{item.name}</h3>
                            <p className="text-xs text-white/30 truncate uppercase tracking-widest font-bold">{new Date(item.timestamp).toLocaleDateString()} • {item.url.split('://')[0]}</p>
                          </div>
                          <button 
                            onClick={(e) => handleRemoveHistory(e, item.id)}
                            className="p-3 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Errors / Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-500/10 border-t border-red-500/20 p-4 sticky bottom-0 z-50 backdrop-blur-xl"
            >
              <div className="max-w-5xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3 text-red-500">
                  <ShieldAlert size={20} />
                  <p className="text-sm font-medium">{error}</p>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="text-red-500/60 hover:text-red-500 font-bold text-xs uppercase tracking-wider cursor-pointer px-3 py-1 bg-red-500/5 rounded-lg"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

