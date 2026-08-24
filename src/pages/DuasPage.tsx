import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { AudioService } from '../services/audioService';
import { DuaCategory, DuaItem } from '../types';
import {
  Heart,
  Search,
  Volume2,
  Share2,
  Sparkles,
  BookOpen,
  Check,
  Filter,
  Bookmark,
  ChevronRight
  ,Play, Pause, Square, SkipBack, SkipForward
} from 'lucide-react';

const CATEGORIES: { id: 'all' | DuaCategory; label: string; arabic: string }[] = [
  { id: 'all', label: 'All Duas', arabic: 'جميع الأدعية' },
  { id: 'Daily Life', label: 'Daily Life', arabic: 'الحياة اليومية' },
  { id: 'Morning & Evening', label: 'Morning & Evening', arabic: 'الصباح والمساء' },
  { id: 'Protection', label: 'Protection', arabic: 'الحفظ والوقاية' },
  { id: 'Forgiveness', label: 'Forgiveness', arabic: 'الاستغفار' },
  { id: 'Gratitude', label: 'Gratitude', arabic: 'الشكر والحمد' },
  { id: 'Distress & Anxiety', label: 'Distress & Anxiety', arabic: 'تفريج الكرب' },
  { id: 'Travel', label: 'Travel', arabic: 'السفر' },
  { id: 'Ramadan & Fasting', label: 'Ramadan', arabic: 'رمضان والصيام' },
  { id: 'After Prayer', label: 'After Prayer', arabic: 'بعد الصلاة' },
  { id: 'Before Sleep', label: 'Before Sleep', arabic: 'قبل النوم' },
  { id: 'Upon Waking', label: 'Upon Waking', arabic: 'عند الاستيقاظ' },
  { id: 'Food', label: 'Food', arabic: 'الطعام' },
  { id: 'Quranic Duas', label: 'Quranic Duas', arabic: 'أدعية قرآنية' },
  { id: 'Daily Duas', label: 'Daily Duas', arabic: 'أدعية يومية' },
];

export const DuasPage: React.FC = () => {
  const { duas, toggleDuaFavorite, openQuranAt } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'all' | DuaCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedDuaId, setCopiedDuaId] = useState<string | null>(null);
  const [playingDuaId, setPlayingDuaId] = useState<string | null>(null);
  const [playAll, setPlayAll] = useState(false);
  const [speechRate, setSpeechRate] = useState(() => Number(localStorage.getItem('nur_speech_rate') || '0.9'));
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const currentIndexRef = useRef(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackTokenRef = useRef(0);

  useEffect(() => () => stopReading(), []);
  useEffect(() => {
    stopReading();
    setPlayingDuaId(null);
    setPlayAll(false);
  }, [selectedCategory, searchQuery, favoritesOnly]);

  const handleCopyDua = (dua: DuaItem) => {
    const text = `${dua.title}\n\n${dua.arabic}\n\n${dua.transliteration}\n\n"${dua.translation}"\n\nReference: ${dua.reference}`;
    navigator.clipboard.writeText(text);
    setCopiedDuaId(dua.id);
    setTimeout(() => setCopiedDuaId(null), 2000);
  };

  const filteredDuas = duas.filter((d) => {
    const matchesCat = selectedCategory === 'all' || d.category === selectedCategory;
    const matchesFav = !favoritesOnly || d.isFavorite;
    const cleanQ = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !cleanQ ||
      d.title.toLowerCase().includes(cleanQ) ||
      d.translation.toLowerCase().includes(cleanQ) ||
      d.arabic.includes(cleanQ) ||
      d.category.toLowerCase().includes(cleanQ) ||
      d.reference.toLowerCase().includes(cleanQ);

    return matchesCat && matchesFav && matchesSearch;
  });

  const stopReading = () => {
    playbackTokenRef.current += 1;
    AudioService.stop();
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    audioRef.current = null;
    setPlayingDuaId(null);
    setIsAudioPaused(false);
    setPlayAll(false);
  };

  const fallbackToHostedAudio = (dua: DuaItem, continuous: boolean, token: number) => {
    if (token !== playbackTokenRef.current) return;
    if (!dua.audioFallbackUrl) {
      fallbackToSpeech(dua, continuous, token);
      return;
    }
    audioRef.current?.pause();
    audioRef.current = null;
    const fallbackToken = ++playbackTokenRef.current;
    const audio = new Audio(dua.audioFallbackUrl);
    audio.preload = 'auto';
    audio.playbackRate = speechRate;
    audioRef.current = audio;
    audio.onended = () => {
      if (fallbackToken !== playbackTokenRef.current) return;
      if (continuous && currentIndexRef.current < filteredDuas.length - 1) {
        readDua(currentIndexRef.current + 1, true);
      } else {
        stopReading();
      }
    };
    audio.onerror = () => {
      if (fallbackToken !== playbackTokenRef.current) return;
      fallbackToSpeech(dua, continuous, fallbackToken);
    };
    try {
      audio.play().catch(() => {
        if (fallbackToken !== playbackTokenRef.current) return;
        fallbackToSpeech(dua, continuous, fallbackToken);
      });
    } catch {
      fallbackToSpeech(dua, continuous, fallbackToken);
    }
  };

  const fallbackToSpeech = (dua: DuaItem, continuous: boolean, token: number) => {
    if (token !== playbackTokenRef.current) return;
    const speechToken = ++playbackTokenRef.current;
    AudioService.playTextAudio(dua.arabic, 'ar', () => {
      if (speechToken !== playbackTokenRef.current) return;
      if (continuous && currentIndexRef.current < filteredDuas.length - 1) {
        readDua(currentIndexRef.current + 1, true);
      } else {
        stopReading();
      }
    }, speechRate, (message) => {
      if (speechToken !== playbackTokenRef.current) return;
      console.error('[TTS] Dua fallback error', message);
      stopReading();
    });
  };

  const readDua = (index: number, continuous: boolean) => {
    const dua = filteredDuas[index];
    if (!dua) return stopReading();
    currentIndexRef.current = index;
    setPlayingDuaId(dua.id);
    setPlayAll(continuous);
    setIsAudioPaused(false);
    const token = ++playbackTokenRef.current;
    AudioService.playTextAudio(dua.arabic, 'ar', () => {
      if (token !== playbackTokenRef.current) return;
      if (continuous && currentIndexRef.current < filteredDuas.length - 1) {
        readDua(currentIndexRef.current + 1, true);
      } else {
        stopReading();
      }
    }, speechRate, () => {
      if (token === playbackTokenRef.current) stopReading();
    });
  };

  const handlePlayAudio = (dua: DuaItem) => {
    if (playingDuaId === dua.id && !isAudioPaused) {
      AudioService.pause();
      setIsAudioPaused(true);
      return;
    }
    if (playingDuaId === dua.id && isAudioPaused) {
      AudioService.resume();
      setIsAudioPaused(false);
      return;
    }
    const token = ++playbackTokenRef.current;
    setPlayingDuaId(dua.id);
    setPlayAll(false);
    setIsAudioPaused(false);
    AudioService.playTextAudio(dua.arabic, 'ar', () => {
      if (token === playbackTokenRef.current) stopReading();
    }, speechRate, () => {
      if (token === playbackTokenRef.current) stopReading();
    });
  };

  const pauseOrResume = () => {
    if (isAudioPaused) {
      AudioService.resume();
      setIsAudioPaused(false);
    } else {
      AudioService.pause();
      setIsAudioPaused(true);
    }
  };

  const moveDua = (direction: -1 | 1) => {
    const nextIndex = currentIndexRef.current + direction;
    if (nextIndex >= 0 && nextIndex < filteredDuas.length) readDua(nextIndex, playAll);
  };

  const updateSpeechRate = (value: number) => {
    setSpeechRate(value);
    localStorage.setItem('nur_speech_rate', String(value));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0E1424] border border-amber-500/20 rounded-3xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-arabic text-amber-300 text-lg">الأدعية المأثورة</span>
            <span className="text-xs uppercase tracking-wider text-slate-400">• Authentic Supplications</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Duas & Supplications</h1>
          <p className="text-xs text-slate-400">Authentic prophetic supplications from the Qur'an and Sunnah with references.</p>
        </div>

        <button
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
            favoritesOnly
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${favoritesOnly ? 'fill-current' : ''}`} />
          <span>Favorites Only</span>
        </button>
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4">
          <button onClick={() => readDua(Math.max(0, currentIndexRef.current), true)} className="flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-950"><Play className="h-3.5 w-3.5" /> Play All</button>
          <button onClick={() => readDua(Math.max(0, currentIndexRef.current), false)} className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200"><Play className="h-3.5 w-3.5" /> Play Current</button>
          <button onClick={pauseOrResume} disabled={!playingDuaId} className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 disabled:opacity-40"><Pause className="h-3.5 w-3.5" /> {isAudioPaused ? 'Resume' : 'Pause'}</button>
          <button onClick={stopReading} className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300"><Square className="h-3.5 w-3.5" /> Stop</button>
          <button onClick={() => moveDua(-1)} title="Previous dua" className="rounded-xl bg-slate-900 p-2 text-slate-300"><SkipBack className="h-3.5 w-3.5" /></button>
          <button onClick={() => moveDua(1)} title="Next dua" className="rounded-xl bg-slate-900 p-2 text-slate-300"><SkipForward className="h-3.5 w-3.5" /></button>
          <label className="ml-auto flex items-center gap-2 text-xs text-slate-400">Speed
            <select value={speechRate} onChange={e => updateSpeechRate(Number(e.target.value))} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200">
              {[0.6, 0.8, 0.9, 1, 1.2].map(rate => <option key={rate} value={rate}>{rate}x</option>)}
            </select>
          </label>
          {playingDuaId && <span className="w-full text-xs text-amber-300">Reading: {duas.find(dua => dua.id === playingDuaId)?.title}</span>}
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Duas by keyword, English meaning, or reference (e.g. forgiveness, travel, anxiety)..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 font-semibold border-amber-400 shadow-sm'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duas List */}
      <div className="space-y-4">
        {filteredDuas.length === 0 ? (
          <div className="p-12 text-center bg-[#0E1424] border border-slate-800 rounded-3xl text-slate-400 text-xs">
            No verified supplications found matching your criteria. New text is only added here after its source has been checked.
          </div>
        ) : (
          filteredDuas.map((dua) => {
            const isPlaying = playingDuaId === dua.id;
            return (
              <div
                key={dua.id}
                className="p-6 rounded-3xl bg-[#0E1424]/90 border border-slate-800 hover:border-amber-500/30 transition-all shadow-lg space-y-4"
              >
                {/* Top Meta & Action Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-display">{dua.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-medium border border-slate-700">
                      {dua.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Read Translation Audio */}
                    <button
                      onClick={() => handlePlayAudio(dua)}
                      className={`p-2 rounded-xl transition-all ${
                        isPlaying
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-amber-300'
                      }`}
                      aria-label="Read Arabic text"
                      title="Read Arabic text"
                    >
                      {isPlaying && !isAudioPaused ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>

                    {/* Favorite */}
                    <button
                      onClick={() => toggleDuaFavorite(dua.id)}
                      className={`p-2 rounded-xl transition-all ${
                        dua.isFavorite
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-900 text-slate-400 hover:text-rose-300'
                      }`}
                      title="Add to Favorites"
                    >
                      <Heart className={`w-3.5 h-3.5 ${dua.isFavorite ? 'fill-current' : ''}`} />
                    </button>

                    {/* Copy */}
                    <button
                      onClick={() => handleCopyDua(dua)}
                      className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-slate-200 transition-all"
                      title="Copy Dua"
                    >
                      {copiedDuaId === dua.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Verified Arabic Text */}
                <div className="text-right py-1">
                  <p className="font-arabic text-xl sm:text-2xl text-amber-200 leading-[2.2]" dir="rtl">
                    {dua.arabic}
                  </p>
                </div>

                {/* Transliteration */}
                <p className="text-xs text-amber-200/70 italic">
                  {dua.transliteration}
                </p>

                {/* Translation */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    "{dua.translation}"
                  </p>
                </div>

                {/* Reference & Benefits */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                  <span className="font-medium text-amber-400/80">Reference: {dua.reference}</span>
                  {dua.benefits && <span className="text-slate-400 italic">{dua.benefits}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
