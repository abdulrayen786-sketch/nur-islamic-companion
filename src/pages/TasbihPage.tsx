import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AudioService } from '../services/audioService';
import confetti from 'canvas-confetti';
import {
  Disc,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
  History,
  Award
} from 'lucide-react';

interface DhikrPreset {
  name: string;
  arabic: string;
  transliteration: string;
  defaultTarget: number;
}

const PRESET_DHIKRS: DhikrPreset[] = [
  { name: 'SubhanAllah', arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'Glory be to Allah', defaultTarget: 33 },
  { name: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'All praise is due to Allah', defaultTarget: 33 },
  { name: 'Allahu Akbar', arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allah is the Greatest', defaultTarget: 34 },
  { name: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'I seek forgiveness from Allah', defaultTarget: 100 },
  { name: 'La ilaha illallah', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', transliteration: 'There is no god but Allah', defaultTarget: 100 },
  { name: 'Salawat on Prophet ﷺ', arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ', transliteration: 'O Allah, send blessings upon Muhammad', defaultTarget: 100 },
  { name: 'SubhanAllahi wa bihamdihi', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', transliteration: 'Glory and praise be to Allah', defaultTarget: 100 },
  { name: 'La hawla wa la quwwata illa billah', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', transliteration: 'There is no power except with Allah', defaultTarget: 33 },
  { name: 'Hasbunallahu wa ni\'mal wakeel', arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', transliteration: 'Allah is sufficient for us, the best disposer', defaultTarget: 33 },
];

export const TasbihPage: React.FC = () => {
  const { tasbihSessions, logTasbihSession, settings } = useApp();

  const [selectedDhikr, setSelectedDhikr] = useState<DhikrPreset>(PRESET_DHIKRS[0]);
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState<number>(33);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [totalCyclesCompleted, setTotalCyclesCompleted] = useState(0);
  const [customDhikrName, setCustomDhikrName] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  const handleIncrement = () => {
    if (soundEnabled) {
      AudioService.playTasbihClick();
    }

    const nextCount = count + 1;
    setCount(nextCount);

    if (target > 0 && nextCount === target) {
      // Completed target cycle
      if (soundEnabled) {
        AudioService.playCompletionChime();
      }
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#F59E0B', '#FDE68A', '#10B981'],
        });
      } catch (e) {
        // Confetti fallback
      }

      setTotalCyclesCompleted((prev) => prev + 1);
      logTasbihSession({
        dhikrName: selectedDhikr.name,
        count: nextCount,
        target,
      });
    }
  };

  const handleDecrement = () => {
    if (count > 0) {
      setCount((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    if (count > 0 && target > 0 && count < target) {
      logTasbihSession({
        dhikrName: selectedDhikr.name,
        count,
        target,
      });
    }
    setCount(0);
  };

  const handleSelectDhikr = (preset: DhikrPreset) => {
    if (count > 0) {
      logTasbihSession({
        dhikrName: selectedDhikr.name,
        count,
        target,
      });
    }
    setSelectedDhikr(preset);
    setTarget(preset.defaultTarget);
    setCount(0);
  };

  const progressPercent = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 100;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-[#0E1424] border border-amber-500/20 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-arabic text-amber-300 text-lg">المسبحة الرقمية</span>
            <span className="text-xs uppercase tracking-wider text-slate-400">• Digital Tasbih</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Digital Tasbih Counter</h1>
          <p className="text-xs text-slate-400">Keep your heart grounded in constant remembrance and dhikr of Allah.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              soundEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Click Sound: On' : 'Muted'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-medium"
            title="Reset Counter"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Preset Dhikr Selector */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 px-1">Select Dhikr / Supplication:</span>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {PRESET_DHIKRS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleSelectDhikr(preset)}
              className={`px-4 py-2 rounded-2xl border whitespace-nowrap text-xs transition-all text-left ${
                selectedDhikr.name === preset.name
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold border-amber-400 shadow-md'
                  : 'bg-[#0E1424] border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <p className="font-arabic text-sm">{preset.arabic}</p>
              <p className="text-[10px] opacity-80 mt-0.5">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Luxury Digital Tasbih Device Canvas */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#131B2F] via-[#0E1527] to-[#0A0D18] border border-amber-500/30 p-8 sm:p-12 text-center shadow-2xl space-y-6">
        
        {/* Background Sacred Geometric Pattern */}
        <div className="absolute inset-0 bg-islamic-pattern opacity-10 pointer-events-none"></div>

        {/* Selected Dhikr Display */}
        <div className="relative z-10 space-y-1">
          <p className="font-arabic text-3xl sm:text-4xl text-amber-200 leading-relaxed">
            {selectedDhikr.arabic}
          </p>
          <h2 className="text-lg sm:text-xl font-display font-bold text-white">
            {selectedDhikr.name}
          </h2>
          <p className="text-xs text-slate-400 italic">
            "{selectedDhikr.transliteration}"
          </p>
        </div>

        {/* Target Buttons (33, 99, 100, 1000, Free) */}
        <div className="relative z-10 flex items-center justify-center gap-2">
          {[33, 99, 100, 1000, 0].map((tVal) => (
            <button
              key={tVal}
              onClick={() => { setTarget(tVal); setCount(0); }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                target === tVal
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tVal === 0 ? 'Free Count' : `${tVal}x`}
            </button>
          ))}
        </div>

        {/* Giant Interactive Tap Bead Surface */}
        <div className="relative z-10 flex justify-center py-4">
          <div
            onClick={handleIncrement}
            className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-slate-950 via-[#10172A] to-slate-900 border-2 border-amber-400/40 hover:border-amber-400/80 shadow-2xl flex flex-col items-center justify-center cursor-pointer select-none group active:scale-95 transition-transform duration-100 shadow-amber-500/10"
          >
            {/* Animated Rotating Outer Glow Rings */}
            <div className="absolute inset-0 rounded-full border border-amber-400/20 border-dashed animate-spin-slow pointer-events-none"></div>
            <div className="absolute inset-2 rounded-full border border-amber-400/10 pointer-events-none"></div>

            {/* Inner Content */}
            <span className="font-arabic text-amber-300 text-xs opacity-70 mb-1">اضغط للتسبيح</span>
            <span className="text-5xl sm:text-6xl font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-100 to-amber-300">
              {count}
            </span>
            {target > 0 && (
              <span className="text-xs text-slate-400 font-mono mt-1 font-semibold">
                Target: {target}
              </span>
            )}
            <span className="text-[10px] uppercase font-bold text-amber-400/80 mt-2 tracking-wider group-hover:text-amber-300 transition-colors">
              Tap Anywhere
            </span>
          </div>
        </div>

        {/* Minus and Reset Sub-controls */}
        <div className="relative z-10 flex items-center justify-center gap-4">
          <button
            onClick={handleDecrement}
            disabled={count <= 0}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40 flex items-center gap-1.5"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Count -1</span>
          </button>

          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

      </div>

      {/* Completed History Log */}
      <div className="bg-[#0E1424] border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-display font-semibold text-white">Completed Dhikr Sessions</h3>
          </div>
          <span className="text-xs text-slate-400">Total Logged: {tasbihSessions.length}</span>
        </div>

        {tasbihSessions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No completed sessions logged yet today.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {tasbihSessions.slice(0, 6).map((s) => (
              <div key={s.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-200">{s.dhikrName}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold">
                  {s.count}x
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
