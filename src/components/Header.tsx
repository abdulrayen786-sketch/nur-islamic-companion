import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getApproximateHijriDate } from '../data/calendarEvents';
import { 
  Sparkles, 
  Search, 
  Moon, 
  Sun, 
  Compass, 
  Settings as SettingsIcon, 
  Bell, 
  Volume2, 
  Mic, 
  BookOpen,
  Calendar,
  X
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeSection, 
    setActiveSection, 
    openQuranAt, 
    settings, 
    updateSettings,
    lightScore 
  } = useApp();

  const [hijriInfo, setHijriInfo] = useState(getApproximateHijriDate());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gregorianStr, setGregorianStr] = useState('');

  useEffect(() => {
    setHijriInfo(getApproximateHijriDate());
    const now = new Date();
    setGregorianStr(now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if query is a Surah or Ayah
    const match = searchQuery.trim().match(/^(\d{1,3}):?(\d{1,3})?$/);
    if (match) {
      const s = parseInt(match[1], 10);
      const a = match[2] ? parseInt(match[2], 10) : 1;
      if (s >= 1 && s <= 114) {
        openQuranAt(s, a);
        setSearchOpen(false);
        setSearchQuery('');
        return;
      }
    }

    // Default to opening Quran with search or AI
    setActiveSection('quran');
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0B0F19]/85 border-b border-amber-500/10 px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: NUR Logo & Brand */}
        <div 
          onClick={() => setActiveSection('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {/* Custom Sacred Light Geometric Logo */}
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600/30 via-amber-400/20 to-amber-200/10 border border-amber-400/30 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:border-amber-400/60 transition-all duration-300">
            <div className="absolute inset-0 rounded-xl bg-amber-400/10 blur-sm group-hover:bg-amber-400/20 transition-all"></div>
            <span className="font-arabic text-amber-300 text-xl font-bold relative z-10 leading-none">نُور</span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg tracking-wider text-slate-100 group-hover:text-amber-300 transition-colors">NUR</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">نُور</span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal hidden sm:block">Islamic Personal Companion</p>
          </div>
        </div>

        {/* Center: Hijri & Gregorian Calendar Banner */}
        <div 
          onClick={() => setActiveSection('calendar')}
          className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 cursor-pointer transition-all shadow-inner"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-amber-200">{hijriInfo.formattedHijri}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{gregorianStr}</span>
          </div>
          {hijriInfo.isWhiteDay && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-medium">
              White Day Fast
            </span>
          )}
        </div>

        {/* Right: Quick Controls & Light Meter */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/30 transition-all flex items-center gap-2 text-xs"
            title="Search Qur'an, Duas, & Topics"
          >
            <Search className="w-4 h-4 text-amber-400/80" />
            <span className="hidden lg:inline text-slate-400">Search (e.g. 2:255)...</span>
          </button>

          {/* Quick AI Voice Companion Launcher */}
          <button
            onClick={() => setActiveSection('ai')}
            className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all flex items-center gap-1.5 text-xs font-medium"
            title="Talk to Muslim AI"
          >
            <Mic className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Muslim AI</span>
          </button>

          {/* Today's Light Score Badge */}
          <div 
            onClick={() => setActiveSection('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-400/5 border border-amber-400/20 text-amber-300 cursor-pointer hover:border-amber-400/40 transition-all"
            title="Your Light Today (Holistic Daily Spiritual Progress)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-xs font-semibold">{lightScore}%</span>
          </div>

          {/* Settings Shortcut */}
          <button
            onClick={() => setActiveSection('settings')}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/30 transition-all"
            title="App Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Global Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-xl bg-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-300">
                <Search className="w-4 h-4" />
                <span className="text-sm font-semibold">Quick Islamic Search</span>
              </div>
              <button 
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Surah name, Ayah (e.g. 2:255), Dua, or topic (e.g. Patience, Light)..."
                  autoFocus
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>Quick suggestions:</span>
                <button
                  type="button"
                  onClick={() => { openQuranAt(2, 255); setSearchOpen(false); }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
                >
                  Ayat al-Kursi (2:255)
                </button>
                <button
                  type="button"
                  onClick={() => { openQuranAt(36, 1); setSearchOpen(false); }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
                >
                  Surah Ya-Sin (36)
                </button>
                <button
                  type="button"
                  onClick={() => { openQuranAt(18, 1); setSearchOpen(false); }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
                >
                  Surah Al-Kahf (18)
                </button>
                <button
                  type="button"
                  onClick={() => { openQuranAt(67, 1); setSearchOpen(false); }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
                >
                  Surah Al-Mulk (67)
                </button>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md"
                >
                  Explore in NUR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
