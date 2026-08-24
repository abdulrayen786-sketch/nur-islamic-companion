import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Sun, Moon, ArrowRight, Quote } from 'lucide-react';

const DAILY_AYAH_QUOTES = [
  {
    arabic: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ",
    transliteration: "Allāhu nūrus-samāwāti wal-arḍ",
    translation: "Allah is the Light of the heavens and the earth.",
    surah: "Surah An-Nur 24:35",
    surahNum: 24,
    ayahNum: 35
  },
  {
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    transliteration: "Alā bidhikrillāhi taṭma'innul-qulūb",
    translation: "Unquestionably, by the remembrance of Allah hearts are assured.",
    surah: "Surah Ar-Ra'd 13:28",
    surahNum: 13,
    ayahNum: 28
  },
  {
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    transliteration: "Inna ma'al-'usri yusrā",
    translation: "Indeed, with hardship [will be] ease.",
    surah: "Surah Ash-Sharh 94:6",
    surahNum: 94,
    ayahNum: 6
  },
  {
    arabic: "وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ",
    transliteration: "Wa tawakkal 'alal-Ḥayyil-ladhī lā yamūt",
    translation: "And put your trust in the Ever-Living Who does not die.",
    surah: "Surah Al-Furqan 25:58",
    surahNum: 25,
    ayahNum: 58
  }
];

export const NurLightOrb: React.FC = () => {
  const { settings, lightScore, openQuranAt, setActiveSection } = useApp();

  // Pick quote based on day
  const dayIndex = new Date().getDate() % DAILY_AYAH_QUOTES.length;
  const quote = DAILY_AYAH_QUOTES[dayIndex];

  // Dynamic glow calculation based on lightScore
  const glowOpacity = Math.max(0.2, lightScore / 100);
  const ringRotationSpeed = lightScore > 80 ? 'animate-spin-slow' : 'animate-spin-slower';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#131B2E] via-[#0E1524] to-[#0A0D18] border border-amber-500/20 p-6 sm:p-8 shadow-2xl shadow-amber-500/5">
      
      {/* Background Sacred Geometric Pattern Overlay */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-10 pointer-events-none"></div>

      {/* Radiant Background Blur Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl pointer-events-none transition-all duration-700"
        style={{ opacity: glowOpacity }}
      ></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left: Personalized Spiritual Greeting & Light Status */}
        <div className="flex-1 text-center md:text-left space-y-3 max-w-xl">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/25 text-amber-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>نُور • Nur Light Companion</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-100 tracking-tight">
            Assalamu Alaikum, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400">{settings.userName}</span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Welcome to your peaceful sanctuary of worship, Qur'an reflection, and mindful remembrance.
          </p>

          {/* Ayah / Spiritual Gem of the Day */}
          <div 
            onClick={() => openQuranAt(quote.surahNum, quote.ayahNum)}
            className="mt-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/30 cursor-pointer group transition-all"
          >
            <div className="flex items-start gap-3">
              <Quote className="w-4 h-4 text-amber-400 shrink-0 mt-1 opacity-70 group-hover:opacity-100" />
              <div className="space-y-1 text-left">
                <p className="font-arabic text-lg sm:text-xl text-amber-200 leading-loose group-hover:text-amber-100 transition-colors">
                  {quote.arabic}
                </p>
                <p className="text-xs text-slate-300 italic">
                  "{quote.translation}"
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium pt-1">
                  <span>{quote.surah}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: The Animated NUR Sacred Light Orb & Spiritual Deed Ring */}
        <div className="shrink-0 flex flex-col items-center">
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
            
            {/* Outer Sacred Rotating Ring with 8 Geometric Points */}
            <div className="absolute inset-0 rounded-full border border-amber-400/20 border-dashed animate-spin-slow"></div>
            <div className="absolute inset-2 rounded-full border border-amber-400/10"></div>

            {/* Glowing Aura Core */}
            <div 
              className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-amber-600/30 via-amber-400/30 to-amber-200/20 blur-md transition-all duration-700"
              style={{ transform: `scale(${0.9 + (lightScore / 100) * 0.25})` }}
            ></div>

            {/* Center Disk Content */}
            <div className="relative z-10 w-32 h-32 rounded-full bg-slate-950/90 border border-amber-400/40 flex flex-col items-center justify-center p-3 text-center shadow-xl backdrop-blur-sm">
              <span className="font-arabic text-amber-300 text-xs opacity-80">نُورُكَ الْيَوْمَ</span>
              <div className="flex items-baseline gap-0.5 my-0.5">
                <span className="text-3xl sm:text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-amber-200">
                  {lightScore}
                </span>
                <span className="text-xs text-amber-400 font-bold">%</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Your Light</span>
            </div>

            {/* Circular SVG Progress Arc */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="currentColor"
                className="text-slate-800/80"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="url(#amberGradient)"
                strokeWidth="4"
                strokeDasharray="282.7"
                strokeDashoffset={282.7 - (282.7 * lightScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#FDE68A" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>
              {lightScore >= 80 ? 'Radiant & Mindful' : lightScore >= 50 ? 'Steadily Illuminating' : 'Begin with Bismillah'}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
