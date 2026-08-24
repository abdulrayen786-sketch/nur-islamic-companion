import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { calculatePrayerTimes } from '../utils/prayerCalculator';
import {
  Moon,
  Sun,
  Sparkles,
  Heart,
  BookOpen,
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  Award,
  Clock,
  Share2,
  Check
} from 'lucide-react';

export const RamadanPage: React.FC = () => {
  const {
    ramadanState,
    setRamadanState,
    prayerConfig,
    completedPrayers,
    openQuranAt,
  } = useApp();

  const [prayerData, setPrayerData] = useState(() =>
    calculatePrayerTimes(new Date(), prayerConfig, completedPrayers)
  );

  const [copiedDuaKey, setCopiedDuaKey] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setPrayerData(calculatePrayerTimes(new Date(), prayerConfig, completedPrayers));
    }, 1000);
    return () => clearInterval(timer);
  }, [prayerConfig, completedPrayers]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDuaKey(key);
    setTimeout(() => setCopiedDuaKey(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Ramadan Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#172036] via-[#101728] to-[#0A0D1A] border border-amber-500/30 p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-islamic-pattern opacity-10 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Moon className="w-3.5 h-3.5" />
              <span>شهر رمضان المبارك • The Blessed Month of Ramadan</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">
              Ramadan Mode & Companion
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              "The month of Ramadan in which was revealed the Qur'an, a guidance for the people and clear proofs of guidance and criterion." (2:185)
            </p>
          </div>

          {/* Fasting Status Toggle Box */}
          <div className="bg-slate-950/80 border border-amber-400/30 rounded-2xl p-4 text-center min-w-[200px] shadow-xl">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Today's Fasting Status</span>
            <div className="my-2 flex items-center justify-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-base font-bold text-emerald-300 uppercase">
                {ramadanState.fastingStatusToday}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-1 mt-2">
              {(['fasting', 'completed', 'exempt'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setRamadanState((prev) => ({ ...prev, fastingStatusToday: status }))}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold capitalize border transition-all ${
                    ramadanState.fastingStatusToday === status
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Suhoor (Imsak) & Iftar Live Timers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Suhoor Spotlight */}
        <div className="p-6 rounded-3xl bg-[#0E1424] border border-slate-800 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Suhoor Ends (Imsak)</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
              {prayerData.suhoorTime}
            </h3>
            <p className="text-xs text-slate-400">10 minutes before Fajr adhan</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <Sun className="w-8 h-8" />
          </div>
        </div>

        {/* Iftar Spotlight */}
        <div className="p-6 rounded-3xl bg-[#0E1424] border border-amber-500/30 shadow-xl flex items-center justify-between bg-gradient-to-r from-[#0E1424] to-amber-950/20">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Iftar (Maghrib Time)</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-amber-200">
              {prayerData.iftarTime}
            </h3>
            <p className="text-xs text-slate-400">Time to break the fast with dates & water</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
            <Moon className="w-8 h-8" />
          </div>
        </div>

      </div>

      {/* 30-Day Ramadan Khatm & Worship Trackers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* 1. Ramadan 30-Day Khatm Tracker */}
        <div className="p-6 rounded-3xl bg-[#0E1424] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Daily 1 Juz Goal</h3>
            </div>
            <span className="text-xs text-amber-300 font-semibold">Juz {ramadanState.quranJuzGoalForDay} of 30</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Read 1 Juz (~20 pages) each day to complete the entire Qur'an during this blessed month.
          </p>

          <button
            onClick={() => openQuranAt(1)}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open Today's Juz in Qur'an</span>
          </button>
        </div>

        {/* 2. Taraweeh Tracker */}
        <div className="p-6 rounded-3xl bg-[#0E1424] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Taraweeh Prayer</h3>
            </div>
            <span className="text-xs text-amber-300 font-bold font-mono">
              {ramadanState.taraweehRakatsCompleted} Rak'ahs
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Log tonight's completed Taraweeh & Witr congregation prayer rak'ahs:
          </p>

          <div className="grid grid-cols-4 gap-2">
            {[8, 12, 20, 0].map((rakat) => (
              <button
                key={rakat}
                onClick={() => setRamadanState((p) => ({ ...p, taraweehRakatsCompleted: rakat }))}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  ramadanState.taraweehRakatsCompleted === rakat
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                }`}
              >
                {rakat === 0 ? 'Rest' : `${rakat} R`}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Daily Sadaqah (Charity) */}
        <div className="p-6 rounded-3xl bg-[#0E1424] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Daily Sadaqah</h3>
            </div>
            <span className="text-xs text-rose-300 font-bold">
              ${ramadanState.charityDonatedToday} Donated
            </span>
          </div>

          <p className="text-xs text-slate-300">
            "The Prophet ﷺ was the most generous of all people, and he used to reach the peak in Ramadan."
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRamadanState((p) => ({ ...p, charityDonatedToday: p.charityDonatedToday + 5 }))}
              className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold hover:border-rose-500/40"
            >
              + $5 Given
            </button>
            <button
              onClick={() => setRamadanState((p) => ({ ...p, charityDonatedToday: p.charityDonatedToday + 20 }))}
              className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold hover:border-rose-500/40"
            >
              + $20 Given
            </button>
          </div>
        </div>

      </div>

      {/* Essential Ramadan Duas */}
      <div className="bg-[#0E1424] border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-base font-display font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Essential Ramadan Supplications</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Dua 1: Iftar */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-amber-300">Dua for Breaking the Fast (Iftar)</span>
              <button
                onClick={() =>
                  handleCopy(
                    "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ\n\nDhahaba adh-dhama'u wabtallat al-'urooqu wa thabata al-ajru in sha Allah.\n\nThe thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.\n\n— Sunan Abi Dawud 2357",
                    "iftar"
                  )
                }
                className="text-slate-400 hover:text-white p-1"
              >
                {copiedDuaKey === "iftar" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="font-arabic text-lg text-amber-100 text-right leading-loose" dir="rtl">
              ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ
            </p>
            <p className="text-xs text-amber-200/70 italic">
              Dhahaba adh-dhama'u wabtallat al-'urooqu wa thabata al-ajru in sha Allah.
            </p>
            <p className="text-xs text-slate-300">
              "The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills."
            </p>
            <p className="text-[10px] text-slate-500">Sunan Abi Dawud 2357 (Hasan)</p>
          </div>

          {/* Dua 2: Laylat al-Qadr */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-amber-300">Dua for Laylat al-Qadr (Night of Decree)</span>
              <button
                onClick={() =>
                  handleCopy(
                    "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي\n\nAllahumma innaka 'Afuwwun tuhibbul-'afwa fa'fu 'anni.\n\nO Allah, You are Forgiving and love forgiveness, so forgive me.\n\n— Jami` at-Tirmidhi 3513",
                    "laylat"
                  )
                }
                className="text-slate-400 hover:text-white p-1"
              >
                {copiedDuaKey === "laylat" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="font-arabic text-lg text-amber-100 text-right leading-loose" dir="rtl">
              اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي
            </p>
            <p className="text-xs text-amber-200/70 italic">
              Allahumma innaka 'Afuwwun tuhibbul-'afwa fa'fu 'anni.
            </p>
            <p className="text-xs text-slate-300">
              "O Allah, You are Forgiving and love forgiveness, so forgive me."
            </p>
            <p className="text-[10px] text-slate-500">Jami` at-Tirmidhi 3513 (Sahih)</p>
          </div>

        </div>
      </div>

    </div>
  );
};
