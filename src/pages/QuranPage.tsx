import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../services/api';
import { ALL_SURAHS, ALL_JUZ, RECITERS_LIST, SUPPORTED_TRANSLATIONS } from '../data/quranMetadata';
import { getSurahAyahs, getAyahAudioUrl, searchQuranMeta } from '../services/quranService';
import { AudioService } from '../services/audioService';
import { Ayah, SurahMeta } from '../types';
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Share2,
  Sparkles,
  FileText,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Check,
  Layers,
  Award,
  ListFilter,
  Eye,
  Type,
  Maximize2
} from 'lucide-react';

export const QuranPage: React.FC = () => {
  const {
    targetQuranSurah,
    targetQuranAyah,
    quranProgress,
    setQuranProgress,
    bookmarks,
    addBookmark,
    removeBookmark,
    notes,
    saveQuranNote,
    deleteQuranNote,
    updateQuranDailyGoalProgress,
    settings,
    updateSettings,
  } = useApp();

  // Active view: 'surahs' | 'juz' | 'reader' | 'bookmarks' | 'goals'
  const [activeTab, setActiveTab] = useState<'surahs' | 'juz' | 'reader' | 'bookmarks' | 'goals'>('surahs');
  
  // Active reading state
  const [currentSurahNumber, setCurrentSurahNumber] = useState<number>(() => targetQuranSurah || quranProgress.lastReadSurah || 1);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState(false);
  const [ayahLoadError, setAyahLoadError] = useState<string | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<string>(settings.quranTranslationLanguage || 'en.sahih');
  const [selectedReciter, setSelectedReciter] = useState<string>(settings.preferredReciterId || 'Alafasy_128kbps');
  
  // Audio state
  const [playingAyahIndex, setPlayingAyahIndex] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [revelationFilter, setRevelationFilter] = useState<'all' | 'Meccan' | 'Medinan'>('all');

  // Reader UI Settings
  const [arabicFontSize, setArabicFontSize] = useState<number>(settings.arabicFontSize || 28);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [showReaderSettings, setShowReaderSettings] = useState(false);

  // Note dialog state
  const [activeNoteAyah, setActiveNoteAyah] = useState<{ surah: number; ayah: number; surahName: string } | null>(null);
  const [noteInputText, setNoteInputText] = useState('');

  // Tafsir modal state
  const [tafsirData, setTafsirData] = useState<{ surah: number; ayah: number; content: string; loading: boolean } | null>(null);

  // Copied alert
  const [copiedAyahNum, setCopiedAyahNum] = useState<number | null>(null);

  const ayahRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // When targetQuranSurah changes externally (e.g. from search / continue reading)
  useEffect(() => {
    if (targetQuranSurah) {
      setCurrentSurahNumber(targetQuranSurah);
      setActiveTab('reader');
    }
  }, [targetQuranSurah]);

  // Fetch Ayahs when currentSurahNumber or selectedTranslation changes
  useEffect(() => {
    let isMounted = true;
    setLoadingAyahs(true);
    setAyahLoadError(null);
    AudioService.stop();
    setIsPlayingAudio(false);
    setPlayingAyahIndex(null);

    const surahMeta = ALL_SURAHS.find((s) => s.number === currentSurahNumber);

    getSurahAyahs(currentSurahNumber, selectedTranslation).then((data) => {
      if (isMounted) {
        setAyahs(data);
        setLoadingAyahs(false);

        // Update last read state in context
        if (surahMeta) {
          setQuranProgress((prev) => ({
            ...prev,
            lastReadSurah: currentSurahNumber,
            lastReadAyah: targetQuranAyah || 1,
            lastReadSurahName: surahMeta.nameTransliteration,
            lastReadTimestamp: new Date().toISOString(),
          }));
        }

        // Scroll to specific Ayah if requested
        if (targetQuranAyah && ayahRefs.current[targetQuranAyah]) {
          setTimeout(() => {
            ayahRefs.current[targetQuranAyah]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      }
    }).catch((error: unknown) => {
      if (isMounted) {
        setAyahs([]);
        setAyahLoadError(error instanceof Error ? error.message : "Verified Qur'anic text could not be loaded.");
        setLoadingAyahs(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentSurahNumber, selectedTranslation]);

  const currentSurahMeta: SurahMeta = ALL_SURAHS.find((s) => s.number === currentSurahNumber) || ALL_SURAHS[0];

  // Audio Recitation Handlers
  const handlePlayAyah = (index: number) => {
    const ayahItem = ayahs[index];
    if (!ayahItem) return;

    if (playingAyahIndex === index && isPlayingAudio) {
      AudioService.pause();
      setIsPlayingAudio(false);
      return;
    }

    const audioUrl = getAyahAudioUrl(selectedReciter, currentSurahNumber, ayahItem.numberInSurah);
    setPlayingAyahIndex(index);
    setIsPlayingAudio(true);

    AudioService.playUrl(
      audioUrl,
      () => {
        // When Ayah ends, auto play next if available
        if (index + 1 < ayahs.length) {
          handlePlayAyah(index + 1);
          updateQuranDailyGoalProgress(1);
        } else {
          setIsPlayingAudio(false);
          setPlayingAyahIndex(null);
        }
      },
      (err) => {
        console.warn("Audio recitation error:", err);
        setIsPlayingAudio(false);
      }
    );
  };

  const handleStopAudio = () => {
    AudioService.stop();
    setIsPlayingAudio(false);
    setPlayingAyahIndex(null);
  };

  const handleBookmarkToggle = (ayahItem: Ayah) => {
    const isBookmarked = bookmarks.some(
      (b) => b.surahNumber === currentSurahNumber && b.ayahNumber === ayahItem.numberInSurah
    );

    if (isBookmarked) {
      const found = bookmarks.find(
        (b) => b.surahNumber === currentSurahNumber && b.ayahNumber === ayahItem.numberInSurah
      );
      if (found) removeBookmark(found.id);
    } else {
      addBookmark({
        surahNumber: currentSurahNumber,
        surahName: currentSurahMeta.nameTransliteration,
        ayahNumber: ayahItem.numberInSurah,
        arabicSnippet: ayahItem.arabicText.slice(0, 120),
        translationSnippet: ayahItem.translation.slice(0, 160),
        isFavorite: true,
      });
    }
  };

  const handleOpenNoteDialog = (ayahItem: Ayah) => {
    const existingNote = notes.find(
      (n) => n.surahNumber === currentSurahNumber && n.ayahNumber === ayahItem.numberInSurah
    );
    setNoteInputText(existingNote ? existingNote.text : '');
    setActiveNoteAyah({
      surah: currentSurahNumber,
      ayah: ayahItem.numberInSurah,
      surahName: currentSurahMeta.nameTransliteration,
    });
  };

  const handleSaveNote = () => {
    if (!activeNoteAyah) return;
    if (noteInputText.trim()) {
      saveQuranNote(
        activeNoteAyah.surah,
        activeNoteAyah.ayah,
        activeNoteAyah.surahName,
        noteInputText.trim()
      );
    }
    setActiveNoteAyah(null);
    setNoteInputText('');
  };

  const handleFetchTafsir = async (ayahItem: Ayah) => {
    setTafsirData({
      surah: currentSurahNumber,
      ayah: ayahItem.numberInSurah,
      content: '',
      loading: true,
    });

    try {
      const res = await apiFetch('/api/gemini/tafsir-ayah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surahNumber: currentSurahNumber,
          ayahNumber: ayahItem.numberInSurah,
          arabicText: ayahItem.arabicText,
          translationText: ayahItem.translation,
        }),
      });
      const data = await res.json();
      setTafsirData({
        surah: currentSurahNumber,
        ayah: ayahItem.numberInSurah,
        content: data.tafsir || 'Tafsir unavailable at this moment.',
        loading: false,
      });
    } catch (e) {
      setTafsirData({
        surah: currentSurahNumber,
        ayah: ayahItem.numberInSurah,
        content: 'Could not load Tafsir at this moment.',
        loading: false,
      });
    }
  };

  const handleCopyAyah = (ayahItem: Ayah) => {
    const text = `${ayahItem.arabicText}\n\n"${ayahItem.translation}"\n\n— Surah ${currentSurahMeta.nameTransliteration} (${currentSurahNumber}:${ayahItem.numberInSurah})`;
    navigator.clipboard.writeText(text);
    setCopiedAyahNum(ayahItem.numberInSurah);
    setTimeout(() => setCopiedAyahNum(null), 2000);
  };

  // Filtered Surahs List
  const { surahs: searchedSurahs, directReference } = searchQuranMeta(searchQuery);
  const filteredSurahs = searchedSurahs.filter((s) => {
    if (revelationFilter === 'Meccan') return s.revelationType === 'Meccan';
    if (revelationFilter === 'Medinan') return s.revelationType === 'Medinan';
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Top Header & Navigation Tabs */}
      <div className="bg-[#0E1424]/95 backdrop-blur-md border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-white">The Holy Qur'an</h1>
                <span className="font-arabic text-amber-300 text-lg">القرآن الكريم</span>
              </div>
              <p className="text-xs text-slate-400">114 Surahs • 30 Juz • 6,236 Verses • Verified Uthmani Text</p>
            </div>
          </div>

          {/* View Switcher Tabs */}
          <div className="flex items-center flex-wrap gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('surahs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'surahs'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Surahs (114)
            </button>
            <button
              onClick={() => setActiveTab('juz')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'juz'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Juz (30)
            </button>
            <button
              onClick={() => setActiveTab('reader')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'reader'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Reader View
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'bookmarks'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bookmarks ({bookmarks.length})
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'goals'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Khatm Goal
            </button>
          </div>
        </div>

        {/* Search & Filter Bar (Shown in Surahs & Juz views) */}
        {(activeTab === 'surahs' || activeTab === 'juz') && (
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Surah by name, number, or exact Ayah (e.g. 'Kahf', 'Yasin', '18', '2:255')..."
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Revelation Filter */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={() => setRevelationFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                  revelationFilter === 'all'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setRevelationFilter('Meccan')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                  revelationFilter === 'Meccan'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Makki (86)
              </button>
              <button
                onClick={() => setRevelationFilter('Medinan')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                  revelationFilter === 'Medinan'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Madani (28)
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* TAB 1: ALL 114 SURAHS LIST / GRID */}
      {/* ======================================================== */}
      {activeTab === 'surahs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>Showing {filteredSurahs.length} of 114 Surahs</span>
            <span>Select any Surah to open verified Uthmani text</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredSurahs.map((surah) => (
              <div
                key={surah.number}
                onClick={() => {
                  setCurrentSurahNumber(surah.number);
                  setActiveTab('reader');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between ${
                  surah.number === currentSurahNumber
                    ? 'bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border-amber-400/50 shadow-lg'
                    : 'bg-[#0E1424]/80 border-slate-800 hover:border-amber-500/40 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Surah Number Badge */}
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700/80 flex items-center justify-center font-display font-bold text-xs text-amber-300 group-hover:border-amber-400/60 transition-colors shrink-0">
                    {surah.number}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-display font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                      {surah.nameTransliteration}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{surah.nameEnglish}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <span>{surah.totalVerses} Ayahs</span>
                      <span>•</span>
                      <span className={surah.revelationType === 'Meccan' ? 'text-amber-400/80' : 'text-emerald-400/80'}>
                        {surah.revelationType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-arabic text-xl text-amber-200 group-hover:text-amber-100 transition-colors">
                    {surah.nameArabic}
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Juz {surah.startJuz}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ALL 30 JUZ BROWSER */}
      {/* ======================================================== */}
      {activeTab === 'juz' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {ALL_JUZ.map((juz) => (
            <div
              key={juz.number}
              onClick={() => {
                setCurrentSurahNumber(juz.startSurah);
                setActiveTab('reader');
              }}
              className="p-5 rounded-2xl bg-[#0E1424]/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center">
                    {juz.number}
                  </span>
                  <h3 className="text-sm font-bold text-white">Juz {juz.number}</h3>
                </div>
                <span className="font-arabic text-base text-amber-300">{juz.nameArabic}</span>
              </div>

              <div className="my-3 space-y-1 text-xs">
                <p className="text-slate-300 font-medium">Surah #{juz.startSurah} (Ayah {juz.startAyah})</p>
                <p className="text-slate-500">Transliteration: "{juz.nameEnglish}"</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold pt-2 border-t border-slate-800/60">
                <span>Start reading this Juz</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: THE QUR'AN READER (VERIFIED COMPLETE VERSES) */}
      {/* ======================================================== */}
      {activeTab === 'reader' && (
        <div className="space-y-4">
          
          {/* Reader Sticky Toolbar & Quick Surah Selector */}
          <div className="sticky top-[65px] z-30 bg-[#0B0F19]/95 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-3 shadow-xl flex flex-wrap items-center justify-between gap-3">
            
            {/* Surah Selector & Prev/Next */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSurahNumber((prev) => Math.max(1, prev - 1))}
                disabled={currentSurahNumber <= 1}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
                title="Previous Surah"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={currentSurahNumber}
                onChange={(e) => setCurrentSurahNumber(parseInt(e.target.value, 10))}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-amber-200 focus:border-amber-400 focus:outline-none max-w-[200px] sm:max-w-xs truncate"
              >
                {ALL_SURAHS.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.nameTransliteration} ({s.nameArabic})
                  </option>
                ))}
              </select>

              <button
                onClick={() => setCurrentSurahNumber((prev) => Math.min(114, prev + 1))}
                disabled={currentSurahNumber >= 114}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
                title="Next Surah"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Translation & Reciter Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              
              {/* Translation Dropdown */}
              <select
                value={selectedTranslation}
                onChange={(e) => setSelectedTranslation(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
              >
                {SUPPORTED_TRANSLATIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.language} ({t.author})
                  </option>
                ))}
              </select>

              {/* Reciter Dropdown */}
              <select
                value={selectedReciter}
                onChange={(e) => setSelectedReciter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:border-amber-400 focus:outline-none hidden sm:block"
              >
                {RECITERS_LIST.map((r) => (
                  <option key={r.id} value={r.subfolder}>
                    {r.name}
                  </option>
                ))}
              </select>

              {/* Reader Preferences Drawer Button */}
              <button
                onClick={() => setShowReaderSettings(!showReaderSettings)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300"
                title="Reader View Settings"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* Audio Play/Stop Button for whole Surah */}
              {isPlayingAudio ? (
                <button
                  onClick={handleStopAudio}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Audio</span>
                </button>
              ) : (
                <button
                  onClick={() => handlePlayAyah(0)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Surah</span>
                </button>
              )}
            </div>

          </div>

          {/* Reader Preferences Bar */}
          {showReaderSettings && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-300 font-medium">Arabic Font Size:</span>
                <button
                  onClick={() => setArabicFontSize((prev) => Math.max(20, prev - 2))}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                >
                  A-
                </button>
                <span className="text-xs font-mono font-semibold text-amber-300">{arabicFontSize}px</span>
                <button
                  onClick={() => setArabicFontSize((prev) => Math.min(48, prev + 2))}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                >
                  A+
                </button>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTransliteration}
                    onChange={(e) => setShowTransliteration(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>Show Transliteration</span>
                </label>
              </div>
            </div>
          )}

          {/* Surah Header Banner Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#131B2F] via-[#0E1527] to-[#0A0D1A] border border-amber-500/30 p-6 sm:p-8 text-center shadow-2xl">
            <div className="absolute inset-0 bg-islamic-pattern opacity-10 pointer-events-none"></div>
            
            <div className="relative z-10 space-y-2">
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                Surah #{currentSurahMeta.number} • {currentSurahMeta.revelationType} • {currentSurahMeta.totalVerses} Verses
              </span>
              
              <h2 className="text-3xl sm:text-5xl font-arabic font-bold text-amber-200 pt-2 pb-1">
                {currentSurahMeta.nameArabic}
              </h2>
              
              <h3 className="text-xl sm:text-2xl font-display font-bold text-white">
                {currentSurahMeta.nameTransliteration}
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-400">
                "{currentSurahMeta.nameEnglish}" • Starts at Juz {currentSurahMeta.startJuz}, Page {currentSurahMeta.pageNumber}
              </p>
            </div>

            {/* Bismillah (Except Surah 9 At-Tawbah and Surah 1 Al-Fatihah which has it as verse 1) */}
            {currentSurahNumber !== 9 && currentSurahNumber !== 1 && (
              <div className="mt-6 pt-6 border-t border-slate-800/80">
                <p className="font-arabic text-2xl sm:text-3xl text-amber-300/90 leading-relaxed">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
                <p className="text-xs text-slate-400 mt-1 italic">
                  In the name of Allah, the Entirely Merciful, the Especially Merciful.
                </p>
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {loadingAyahs && (
            <div className="p-12 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 font-medium">Fetching verified Qur'anic text...</p>
            </div>
          )}

          {!loadingAyahs && ayahLoadError && (
            <div className="p-12 text-center space-y-3">
              <p className="text-sm text-amber-300">{ayahLoadError}</p>
              <p className="text-xs text-slate-400">Check your connection and try again.</p>
            </div>
          )}

          {/* Complete Verified Ayah List */}
          {!loadingAyahs && !ayahLoadError && (
            <div className="space-y-4">
              {ayahs.map((ayah, index) => {
                const isPlaying = playingAyahIndex === index;
                const isBookmarked = bookmarks.some(
                  (b) => b.surahNumber === currentSurahNumber && b.ayahNumber === ayah.numberInSurah
                );
                const hasNote = notes.some(
                  (n) => n.surahNumber === currentSurahNumber && n.ayahNumber === ayah.numberInSurah
                );

                return (
                  <div
                    key={ayah.numberInSurah}
                    ref={(el) => (ayahRefs.current[ayah.numberInSurah] = el)}
                    className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                      isPlaying
                        ? 'bg-gradient-to-r from-amber-500/15 via-[#111728] to-slate-900 border-amber-400/60 shadow-xl ring-1 ring-amber-400/40'
                        : 'bg-[#0E1424]/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Ayah Top Meta & Actions Bar */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
                      
                      {/* Verse Identifier Badge */}
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-amber-300 shadow-sm">
                          {currentSurahNumber}:{ayah.numberInSurah}
                        </span>
                        <span className="text-[11px] text-slate-500">Juz {ayah.juz} • Page {ayah.page}</span>
                      </div>

                      {/* Ayah Quick Toolbar */}
                      <div className="flex items-center gap-1.5">
                        
                        {/* Play Ayah */}
                        <button
                          onClick={() => handlePlayAyah(index)}
                          className={`p-2 rounded-xl transition-all ${
                            isPlaying
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-900 text-slate-300 hover:text-amber-300 hover:bg-slate-800'
                          }`}
                          title="Listen to this verse"
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>

                        {/* Bookmark Ayah */}
                        <button
                          onClick={() => handleBookmarkToggle(ayah)}
                          className={`p-2 rounded-xl transition-all ${
                            isBookmarked
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-900 text-slate-400 hover:text-amber-300 hover:bg-slate-800'
                          }`}
                          title="Bookmark Ayah"
                        >
                          {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                        </button>

                        {/* Note on Ayah */}
                        <button
                          onClick={() => handleOpenNoteDialog(ayah)}
                          className={`p-2 rounded-xl transition-all ${
                            hasNote
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : 'bg-slate-900 text-slate-400 hover:text-purple-300 hover:bg-slate-800'
                          }`}
                          title="Add personal reflection/note"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {/* Tafsir Reflection AI */}
                        <button
                          onClick={() => handleFetchTafsir(ayah)}
                          className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-all"
                          title="View Classical Tafsir & Reflection"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        </button>

                        {/* Copy Verse */}
                        <button
                          onClick={() => handleCopyAyah(ayah)}
                          className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-slate-200 transition-all"
                          title="Copy verse text"
                        >
                          {copiedAyahNum === ayah.numberInSurah ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                      </div>

                    </div>

                    {/* Verified Arabic Uthmani Text */}
                    <div className="text-right py-2">
                      <p
                        className="font-arabic text-amber-100 leading-[2.4] select-text"
                        style={{ fontSize: `${arabicFontSize}px` }}
                        dir="rtl"
                      >
                        {ayah.arabicText} <span className="text-amber-400 font-normal font-sans text-sm inline-block px-1">۝ {ayah.numberInSurah}</span>
                      </p>
                    </div>

                    {/* Transliteration (if enabled) */}
                    {showTransliteration && ayah.transliteration && (
                      <p className="text-xs text-amber-200/70 italic mt-2">
                        {ayah.transliteration}
                      </p>
                    )}

                    {/* Translation */}
                    <div className="pt-3 mt-2 border-t border-slate-800/60">
                      <p className="text-sm text-slate-200 leading-relaxed font-sans select-text">
                        {ayah.translation}
                      </p>
                    </div>

                    {/* Existing Personal Note Preview */}
                    {hasNote && (
                      <div className="mt-3 p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200">
                        <span className="font-semibold text-purple-300">Your Note: </span>
                        {notes.find((n) => n.surahNumber === currentSurahNumber && n.ayahNumber === ayah.numberInSurah)?.text}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Navigation for Surahs */}
          <div className="flex items-center justify-between p-4 bg-[#0E1424] border border-slate-800 rounded-2xl mt-6">
            <button
              onClick={() => {
                setCurrentSurahNumber((prev) => Math.max(1, prev - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentSurahNumber <= 1}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white disabled:opacity-40 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Surah</span>
            </button>

            <span className="text-xs text-slate-400 font-medium">
              Surah {currentSurahNumber} of 114
            </span>

            <button
              onClick={() => {
                setCurrentSurahNumber((prev) => Math.min(114, prev + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentSurahNumber >= 114}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white disabled:opacity-40 flex items-center gap-2"
            >
              <span>Next Surah</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: BOOKMARKS & PERSONAL NOTES */}
      {/* ======================================================== */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-6">
          
          {/* Saved Bookmarks */}
          <div className="space-y-3">
            <h3 className="text-base font-display font-semibold text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span>Bookmarked Verses ({bookmarks.length})</span>
            </h3>

            {bookmarks.length === 0 ? (
              <div className="p-8 text-center bg-[#0E1424] border border-slate-800 rounded-3xl text-slate-400 text-xs">
                No verses bookmarked yet. Tap the bookmark icon on any Ayah in the Reader to save it here.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-4 rounded-2xl bg-[#0E1424] border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-xs font-bold text-amber-300">
                          Surah {bm.surahName} ({bm.surahNumber}:{bm.ayahNumber})
                        </span>
                        <button
                          onClick={() => removeBookmark(bm.id)}
                          className="text-xs text-slate-500 hover:text-rose-400 p-1"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="font-arabic text-sm text-amber-100 my-2 line-clamp-2 text-right">
                        {bm.arabicSnippet}
                      </p>
                      <p className="text-xs text-slate-300 line-clamp-2 italic">
                        "{bm.translationSnippet}"
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentSurahNumber(bm.surahNumber);
                        setActiveTab('reader');
                      }}
                      className="mt-3 w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-medium border border-slate-700/60"
                    >
                      Open in Reader
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Personal Notes */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-base font-display font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Personal Reflections & Notes ({notes.length})</span>
            </h3>

            {notes.length === 0 ? (
              <div className="p-8 text-center bg-[#0E1424] border border-slate-800 rounded-3xl text-slate-400 text-xs">
                No personal notes added yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {notes.map((n) => (
                  <div key={n.id} className="p-4 rounded-2xl bg-[#0E1424] border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs">
                      <span className="font-bold text-purple-300">
                        Surah {n.surahName} ({n.surahNumber}:{n.ayahNumber})
                      </span>
                      <button
                        onClick={() => deleteQuranNote(n.id)}
                        className="text-slate-500 hover:text-rose-400 text-[11px]"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{n.text}</p>
                    <p className="text-[10px] text-slate-500">{new Date(n.updatedAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: KHATM & DAILY GOALS PLANNER */}
      {/* ======================================================== */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-tr from-[#12192D] via-[#0E1527] to-[#0A0D18] border border-amber-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-white">Qur'an Khatm Planner</h3>
                  <p className="text-xs text-slate-400">Complete the recitation of the 30 Juz with steady daily habits</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
                {quranProgress.dailyGoalCompletedToday} / {quranProgress.dailyGoalValue} Today
              </span>
            </div>

            {/* Daily Goal Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div
                onClick={() => setQuranProgress((p) => ({ ...p, dailyGoalValue: 10 }))}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  quranProgress.dailyGoalValue === 10
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <p className="text-xs font-bold">Gentle Pace</p>
                <p className="text-xl font-display font-bold mt-1">10 Ayahs / Day</p>
                <p className="text-[10px] text-slate-400 mt-1">Approx. 600 days to Khatm</p>
              </div>

              <div
                onClick={() => setQuranProgress((p) => ({ ...p, dailyGoalValue: 20 }))}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  quranProgress.dailyGoalValue === 20
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <p className="text-xs font-bold">Standard 1 Juz (Ramadan)</p>
                <p className="text-xl font-display font-bold mt-1">1 Juz / Day (~20p)</p>
                <p className="text-[10px] text-slate-400 mt-1">Complete Khatm in 30 days</p>
              </div>

              <div
                onClick={() => setQuranProgress((p) => ({ ...p, dailyGoalValue: 50 }))}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  quranProgress.dailyGoalValue === 50
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <p className="text-xs font-bold">Devoted Pace</p>
                <p className="text-xl font-display font-bold mt-1">50 Ayahs / Day</p>
                <p className="text-[10px] text-slate-400 mt-1">Complete Khatm in ~120 days</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD / EDIT NOTE MODAL */}
      {/* ======================================================== */}
      {activeNoteAyah && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-display font-bold text-white">
                Note on Surah {activeNoteAyah.surahName} ({activeNoteAyah.surah}:{activeNoteAyah.ayah})
              </h3>
              <button onClick={() => setActiveNoteAyah(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <textarea
              value={noteInputText}
              onChange={(e) => setNoteInputText(e.target.value)}
              placeholder="Write your personal reflections, lessons, or reminders for this verse..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:border-purple-400 focus:outline-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveNoteAyah(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors"
              >
                Save Reflection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAFSIR & DEEP REFLECTION MODAL */}
      {/* ======================================================== */}
      {tafsirData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-display font-bold text-white">
                  Classical Tafsir & Reflection ({tafsirData.surah}:{tafsirData.ayah})
                </h3>
              </div>
              <button onClick={() => setTafsirData(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {tafsirData.loading ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-400">Loading classical scholarly insights...</p>
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3 whitespace-pre-line">
                {tafsirData.content}
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setTafsirData(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
