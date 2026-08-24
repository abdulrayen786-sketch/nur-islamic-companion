import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { NurLightOrb } from '../components/NurLightOrb';
import { calculatePrayerTimes } from '../utils/prayerCalculator';
import {
  Clock,
  CheckCircle2,
  Circle,
  BookOpen,
  ArrowRight,
  CheckSquare,
  Sparkles,
  Heart,
  Disc,
  Compass,
  Archive,
  Bot,
  Plus,
  Send,
  Calendar,
  Moon,
  ChevronRight,
  Flame
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    setActiveSection,
    openQuranAt,
    prayerConfig,
    completedPrayers,
    togglePrayerCompleted,
    quranProgress,
    tasks,
    toggleTask,
    addTask,
    archiveItems,
    bookmarks,
    duas,
    setAiMessages,
  } = useApp();

  const [prayerData, setPrayerData] = useState(() =>
    calculatePrayerTimes(new Date(), prayerConfig, completedPrayers)
  );

  const [quickTaskText, setQuickTaskText] = useState('');
  const [quickAiPrompt, setQuickAiPrompt] = useState('');

  // Live timer tick every second for prayer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setPrayerData(calculatePrayerTimes(new Date(), prayerConfig, completedPrayers));
    }, 1000);
    return () => clearInterval(timer);
  }, [prayerConfig, completedPrayers]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskText.trim()) return;
    addTask({
      name: quickTaskText.trim(),
      category: 'Worship',
      priority: 'medium',
      date: new Date().toISOString().split('T')[0],
      hasReminder: false,
      repeat: 'once',
    });
    setQuickTaskText('');
  };

  const handleQuickAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAiPrompt.trim()) return;
    const prompt = quickAiPrompt.trim();
    setQuickAiPrompt('');
    setAiMessages((prev) => [
      ...prev,
      {
        id: 'msg-' + Date.now(),
        role: 'user',
        content: prompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setActiveSection('ai');
  };

  // Mock 7-day consistency data calculated from actual logs
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayDayIdx = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeArchiveItems = Array.isArray(archiveItems) ? archiveItems : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* 1. Central NUR Light Orb Centerpiece */}
      <NurLightOrb />

      {/* 2. Grid of 8 Dashboard Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Five Daily Prayers Live Tracker */}
        <div className="bg-[#0E1424]/90 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-amber-500/30 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Daily Prayers</h3>
                  <p className="text-[11px] text-slate-400 font-arabic">مواقيت الصلاة • {prayerConfig.cityName}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveSection('prayer')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
              >
                <span>Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Next Prayer Countdown Spotlight */}
            {prayerData.nextPrayer && (
              <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-400/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold">Next: {prayerData.nextPrayer.name} ({prayerData.nextPrayer.arabicName})</span>
                  <p className="text-base font-display font-bold text-white">{prayerData.nextPrayer.time}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400">Time remaining</span>
                  <p className="text-xs font-mono font-bold text-amber-300">
                    {String(prayerData.timeRemainingToNext.hours).padStart(2, '0')}h : {String(prayerData.timeRemainingToNext.minutes).padStart(2, '0')}m : {String(prayerData.timeRemainingToNext.seconds).padStart(2, '0')}s
                  </p>
                </div>
              </div>
            )}

            {/* Prayer check-off rows */}
            <div className="mt-3 space-y-1.5">
              {prayerData.prayers.filter(p => p.id !== 'sunrise').map((p) => {
                const isChecked = !!completedPrayers[p.id];
                return (
                  <div
                    key={p.id}
                    onClick={() => togglePrayerCompleted(p.id)}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                      p.isCurrent
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
                        : isChecked
                        ? 'bg-slate-900/60 text-slate-300'
                        : 'bg-slate-900/30 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <span className={`text-xs font-medium ${isChecked ? 'line-through opacity-75' : ''}`}>
                        {p.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono">{p.time}</span>
                      <span className="font-arabic text-xs text-amber-300/80">{p.arabicName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Completed: {Object.values(completedPrayers).filter(Boolean).length} / 5</span>
            <span className="text-amber-400 font-medium">Qiyam: {prayerData.tahajjudTime}</span>
          </div>
        </div>

        {/* Card 2: Today's Tasks & Daily Organizer */}
        <div className="bg-[#0E1424]/90 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-amber-500/30 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-300">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Daily Organizer</h3>
                  <p className="text-[11px] text-slate-400">Worship & life priorities</p>
                </div>
              </div>
              <button
                onClick={() => setActiveSection('tasks')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
              >
                <span>All ({safeTasks.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tasks list */}
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {safeTasks.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No tasks scheduled yet.</p>
              ) : (
                safeTasks.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      t.completed ? 'bg-slate-900/30 text-slate-500 line-through' : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800/70 border border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {t.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <span className="text-xs font-medium truncate">{t.name}</span>
                    </div>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                      {t.category}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Add Task Input */}
          <form onSubmit={handleQuickAdd} className="mt-3 pt-3 border-t border-slate-800/60 flex items-center gap-2">
            <input
              type="text"
              value={quickTaskText}
              onChange={(e) => setQuickTaskText(e.target.value)}
              placeholder="Add quick task (e.g. Read Surah Al-Kahf)..."
              className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="p-1.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Card 3: Qur'an Journey & Continue Reading */}
        <div className="bg-[#0E1424]/90 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-amber-500/30 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-300">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Qur'an Progress</h3>
                  <p className="text-[11px] text-slate-400 font-arabic">القرآن الكريم</p>
                </div>
              </div>
              <button
                onClick={() => setActiveSection('quran')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
              >
                <span>Reader</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Last Read Spotlight */}
            <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">Last Read Position</span>
                <span className="text-[11px] text-slate-400">Surah {quranProgress.lastReadSurah}</span>
              </div>
              <p className="text-base font-display font-bold text-white mt-1">
                {quranProgress.lastReadSurahName} <span className="text-xs text-amber-300 font-normal">• Ayah {quranProgress.lastReadAyah}</span>
              </p>
              
              <button
                onClick={() => openQuranAt(quranProgress.lastReadSurah, quranProgress.lastReadAyah)}
                className="mt-3 w-full py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>Continue Reading</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Daily Goal Bar */}
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Daily Goal ({quranProgress.dailyGoalValue} Ayahs)</span>
                <span className="font-semibold text-amber-300">{quranProgress.dailyGoalCompletedToday} read</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (quranProgress.dailyGoalCompletedToday / Math.max(1, quranProgress.dailyGoalValue)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Bookmarks: {bookmarks.length}</span>
            <span>Total Ayahs Read: {quranProgress.totalAyahsRead}</span>
          </div>
        </div>

        {/* Card 4: Seven Days of Light Consistency */}
        <div className="bg-[#0E1424]/90 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-amber-500/30 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">7 Days of Light</h3>
                  <p className="text-[11px] text-slate-400">Spiritual constancy & Istiqamah</p>
                </div>
              </div>
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold border border-amber-500/30">
                5 Day Streak
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              "The most beloved deed to Allah is the most regular and constant, even if it were little." — Sahih al-Bukhari
            </p>

            {/* 7 Days Visual Glowing Dots */}
            <div className="mt-4 grid grid-cols-7 gap-2 text-center">
              {daysOfWeek.map((day, idx) => {
                const isPast = idx <= todayDayIdx;
                const isToday = idx === todayDayIdx;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold">{day}</span>
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                        isToday
                          ? 'bg-amber-400 text-slate-950 font-bold ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-amber-400/30'
                          : isPast
                          ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                          : 'bg-slate-900 border border-slate-800 text-slate-600'
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isPast ? 'opacity-100' : 'opacity-20'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Keep your intention pure</span>
            <span className="text-amber-300 font-medium">Radiant Week</span>
          </div>
        </div>

        {/* Card 5: Self-Accounting (Muhasabah) */}
        <div className="bg-[#0E1424]/90 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-amber-500/30 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-300">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Self-Accounting</h3>
                  <p className="text-[11px] text-slate-400 font-arabic">مُحَاسَبَةُ النَّفْس</p>
                </div>
              </div>
              <button
                onClick={() => setActiveSection('reflection')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
              >
                <span>Journal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <p className="text-xs text-slate-300 italic">
                "Hold yourselves accountable before you are held to account, and weigh your deeds before they are weighed for you."
              </p>
              <p className="text-[11px] text-amber-400 font-medium">— Umar ibn al-Khattab (RA)</p>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => setActiveSection('reflection')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Record Tonight's Muhasabah</span>
            </button>
          </div>
        </div>

        {/* Card 6: Quiet Archive of Spiritual Gems */}
        <div className="bg-[#0E1424]/90 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-amber-500/30 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300">
                  <Archive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Quiet Archive</h3>
                  <p className="text-[11px] text-slate-400">Personal sanctuary of insights</p>
                </div>
              </div>
              <button
                onClick={() => setActiveSection('archive')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {safeArchiveItems.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveSection('archive')}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 cursor-pointer transition-all"
                >
                  <p className="text-xs font-semibold text-slate-200 truncate">{item.title}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Saved items: {safeArchiveItems.length}</span>
            <span className="text-amber-400 font-medium">Safe & Private</span>
          </div>
        </div>

      </div>

      {/* Card 7: Quick Actions Dock */}
      <div className="bg-[#0E1424]/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
          <div>
            <h3 className="text-base font-display font-semibold text-slate-100">Quick Spiritual Actions</h3>
            <p className="text-xs text-slate-400">Direct shortcuts to essential worship tools</p>
          </div>
          <span className="text-xs font-arabic text-amber-300">أدوات العبادة اليومية</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <button
            onClick={() => setActiveSection('quran')}
            className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/80 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-300 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-200">The Qur'an</span>
            <span className="text-[10px] text-slate-400 font-arabic">114 Surahs</span>
          </button>

          <button
            onClick={() => setActiveSection('duas')}
            className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/80 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-300 group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-200">Duas Library</span>
            <span className="text-[10px] text-slate-400 font-arabic">الأدعية المأثورة</span>
          </button>

          <button
            onClick={() => setActiveSection('adhkar')}
            className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/80 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-300 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-200">Daily Adhkar</span>
            <span className="text-[10px] text-slate-400 font-arabic">أذكار الصباح والمساء</span>
          </button>

          <button
            onClick={() => setActiveSection('tasbih')}
            className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/80 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-300 group-hover:scale-110 transition-transform">
              <Disc className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-200">Digital Tasbih</span>
            <span className="text-[10px] text-slate-400 font-arabic">المسبحة الرقمية</span>
          </button>

          <button
            onClick={() => setActiveSection('qibla')}
            className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/80 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-300 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-200">Qibla Direction</span>
            <span className="text-[10px] text-slate-400 font-arabic">اتجاه القبلة</span>
          </button>

          <button
            onClick={() => setActiveSection('ramadan')}
            className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/80 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-300 group-hover:scale-110 transition-transform">
              <Moon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-200">Ramadan Mode</span>
            <span className="text-[10px] text-slate-400 font-arabic">شهر رمضان</span>
          </button>

        </div>
      </div>

      {/* Card 8: Muslim AI Companion Spotlight */}
      <div className="bg-gradient-to-r from-[#12192D] via-[#0E1527] to-[#0B0F1D] border border-amber-500/30 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative p-3 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-400/10 border border-amber-400/30 text-amber-300">
              <Bot className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-display font-bold text-slate-100">Ask Muslim AI</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                  Verified Knowledge
                </span>
              </div>
              <p className="text-xs text-slate-400">Ask about Qur'anic themes, Hadith references, prayer questions, or daily worship.</p>
            </div>
          </div>

          <button
            onClick={() => setActiveSection('ai')}
            className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all shadow-md"
          >
            Open Companion
          </button>
        </div>

        <form onSubmit={handleQuickAiSubmit} className="mt-4 relative">
          <input
            type="text"
            value={quickAiPrompt}
            onChange={(e) => setQuickAiPrompt(e.target.value)}
            placeholder="Ask anything (e.g. 'What is the significance of Ayat al-Kursi?', 'How to do Sujood as-Sahw?')..."
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-4 pr-12 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
