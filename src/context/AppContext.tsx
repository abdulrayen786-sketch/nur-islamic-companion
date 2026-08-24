import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  NavSection,
  PrayerCalculationConfig,
  QuranBookmark,
  QuranNote,
  QuranProgress,
  Task,
  DuaItem,
  DhikrItem,
  TasbihSession,
  SelfAccountingEntry,
  ArchiveItem,
  RamadanState,
  AIMessage,
  AIMemoryItem,
  UserSettings,
} from '../types';
import { DUAS_COLLECTION } from '../data/duasData';
import { MORNING_ADHKAR, EVENING_ADHKAR, AFTER_PRAYER_ADHKAR, BEFORE_SLEEP_ADHKAR } from '../data/adhkarData';
import { calculatePrayerTimes } from '../utils/prayerCalculator';

interface AppContextType {
  // Navigation
  activeSection: NavSection;
  setActiveSection: (sec: NavSection) => void;
  targetQuranSurah: number | null;
  targetQuranAyah: number | null;
  openQuranAt: (surah: number, ayah?: number) => void;

  // Prayer Configuration & Status
  prayerConfig: PrayerCalculationConfig;
  setPrayerConfig: React.Dispatch<React.SetStateAction<PrayerCalculationConfig>>;
  completedPrayers: Record<string, boolean>;
  togglePrayerCompleted: (prayerId: string) => void;

  // Qur'an
  quranProgress: QuranProgress;
  setQuranProgress: React.Dispatch<React.SetStateAction<QuranProgress>>;
  bookmarks: QuranBookmark[];
  addBookmark: (bookmark: Omit<QuranBookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  notes: QuranNote[];
  saveQuranNote: (surahNumber: number, ayahNumber: number, surahName: string, text: string) => void;
  deleteQuranNote: (id: string) => void;
  updateQuranDailyGoalProgress: (ayahsCount: number) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  addNewTask: (title: string, category?: string, frequency?: 'daily' | 'weekly' | 'custom' | string) => void;
  toggleTask: (id: string) => void;
  toggleTaskCompleted: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;

  // Duas & Adhkar
  duas: DuaItem[];
  toggleDuaFavorite: (id: string) => void;
  adhkarSets: {
    morning: DhikrItem[];
    evening: DhikrItem[];
    afterPrayer: DhikrItem[];
    beforeSleep: DhikrItem[];
  };
  incrementDhikr: (setKey: 'morning' | 'evening' | 'afterPrayer' | 'beforeSleep', id: string) => void;
  resetDhikrSet: (setKey: 'morning' | 'evening' | 'afterPrayer' | 'beforeSleep') => void;

  // Tasbih
  tasbihSessions: TasbihSession[];
  logTasbihSession: (session: Omit<TasbihSession, 'id' | 'completedAt'>) => void;

  // Ramadan
  ramadanState: RamadanState;
  setRamadanState: React.Dispatch<React.SetStateAction<RamadanState>>;

  // Self-Accounting (Muhasabah & Reflections)
  accountingEntries: SelfAccountingEntry[];
  reflections: SelfAccountingEntry[];
  saveAccountingEntry: (entry: Omit<SelfAccountingEntry, 'id' | 'createdAt'>) => void;
  saveReflection: (entry: { prompt?: string; text: string; gratitudeNotes?: string[]; mood?: string }) => void;
  deleteReflection: (id: string) => void;

  // Quiet Archive
  archiveItems: ArchiveItem[];
  addToArchive: (item: Omit<ArchiveItem, 'id'>) => void;
  removeFromArchive: (id: string) => void;

  // AI & Memory
  aiMessages: AIMessage[];
  chatMessages: AIMessage[];
  setAiMessages: React.Dispatch<React.SetStateAction<AIMessage[]>>;
  addChatMessage: (role: 'user' | 'assistant', text: string, toolCalls?: any[]) => void;
  aiMemories: AIMemoryItem[];
  saveAiMemory: (key: string, label: string, value: string, category: AIMemoryItem['category']) => void;
  deleteAiMemory: (id: string) => void;
  clearAiChat: () => void;
  clearChatMessages: () => void;

  // Settings
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;

  // Overall Light Score calculation
  lightScore: number;
}

const defaultPrayerConfig: PrayerCalculationConfig = {
  method: 'MWL',
  madhab: 'shafii',
  highLatitudeRule: 'middleOfTheNight',
  latitude: 21.3891,
  longitude: 39.8579,
  cityName: 'Makkah',
  countryName: 'Saudi Arabia',
  autoDetectLocation: false,
};

const defaultSettings: UserSettings = {
  userName: 'Servant of Allah',
  appLanguage: 'en',
  aiLanguage: 'en',
  quranTranslationLanguage: 'en.sahih',
  voiceLanguage: 'en-US',
  theme: 'midnight',
  arabicFontSize: 30,
  translationFontSize: 16,
  lineSpacing: 2.2,
  preferredReciterId: 'Alafasy_128kbps',
  audioAutoPlayNext: true,
  enableVibrations: true,
  enableSoundFeedback: true,
  aiMemoryEnabled: true,
  notifications: {
    prayerAdhan: true,
    prayerReminders: true,
    dailyQuranGoal: true,
    morningAdhkar: true,
    eveningAdhkar: true,
    ramadanAlerts: true,
    customTasks: true,
  },
};

const defaultQuranProgress: QuranProgress = {
  lastReadSurah: 1,
  lastReadAyah: 1,
  lastReadSurahName: 'Al-Fatihah',
  lastReadTimestamp: new Date().toISOString(),
  totalAyahsRead: 7,
  dailyGoalType: 'ayahs',
  dailyGoalValue: 20,
  dailyGoalCompletedToday: 7,
  history: [
    { date: new Date().toISOString().split('T')[0], ayahsRead: 7, minutesSpent: 5 }
  ],
};

const defaultRamadanState: RamadanState = {
  isActive: false,
  currentDay: 1,
  fastingStatusToday: 'fasting',
  suhoorTime: '04:45 AM',
  iftarTime: '06:30 PM',
  taraweehRakatsCompleted: 8,
  dailyCharityGoalAmount: 10,
  charityDonatedToday: 5,
  quranJuzGoalForDay: 1,
  ramadanNotes: 'Intentions set for pure devotion and reading 1 Juz daily.',
};

const defaultTasks: Task[] = [
  {
    id: 't-1',
    name: 'Read Surah Al-Mulk before sleeping',
    category: 'Qur\'an',
    priority: 'high',
    date: new Date().toISOString().split('T')[0],
    time: '21:30',
    hasReminder: true,
    repeat: 'daily',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-2',
    name: 'Recite Morning Adhkar & Ayat al-Kursi',
    category: 'Worship',
    priority: 'medium',
    date: new Date().toISOString().split('T')[0],
    time: '06:30',
    hasReminder: true,
    repeat: 'daily',
    completed: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-3',
    name: 'Daily 100x Astaghfirullah Tasbih',
    category: 'Worship',
    priority: 'medium',
    date: new Date().toISOString().split('T')[0],
    hasReminder: false,
    repeat: 'daily',
    completed: false,
    createdAt: new Date().toISOString(),
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [targetQuranSurah, setTargetQuranSurah] = useState<number | null>(null);
  const [targetQuranAyah, setTargetQuranAyah] = useState<number | null>(null);

  // Persistent States with safe localStorage parsing
  const [prayerConfig, setPrayerConfig] = useState<PrayerCalculationConfig>(() => {
    try {
      const saved = localStorage.getItem('nur_prayer_config');
      if (saved) return { ...defaultPrayerConfig, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Failed parsing prayer config:', e);
    }
    return defaultPrayerConfig;
  });

  const [completedPrayers, setCompletedPrayers] = useState<Record<string, boolean>>(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem(`nur_prayers_${today}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed parsing completed prayers:', e);
    }
    return { fajr: true, dhuhr: true };
  });

  const [quranProgress, setQuranProgress] = useState<QuranProgress>(() => {
    try {
      const saved = localStorage.getItem('nur_quran_progress');
      if (saved) return { ...defaultQuranProgress, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Failed parsing quran progress:', e);
    }
    return defaultQuranProgress;
  });

  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>(() => {
    try {
      const saved = localStorage.getItem('nur_bookmarks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed parsing bookmarks:', e);
    }
    return [
      {
        id: 'bm-1',
        surahNumber: 2,
        surahName: 'Al-Baqarah',
        ayahNumber: 255,
        arabicSnippet: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...',
        translationSnippet: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence...',
        createdAt: new Date().toISOString(),
        note: 'Ayat al-Kursi - greatest verse of the Qur\'an.',
        isFavorite: true
      },
      {
        id: 'bm-2',
        surahNumber: 94,
        surahName: 'Ash-Sharh',
        ayahNumber: 6,
        arabicSnippet: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
        translationSnippet: 'Indeed, with hardship [will be] ease.',
        createdAt: new Date().toISOString(),
        note: 'Deep comfort in times of trial.',
        isFavorite: true
      }
    ];
  });

  const [notes, setNotes] = useState<QuranNote[]>(() => {
    try {
      const saved = localStorage.getItem('nur_quran_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed parsing notes:', e);
    }
    return [
      {
        id: 'qn-1',
        surahNumber: 24,
        ayahNumber: 35,
        surahName: 'An-Nur',
        text: 'The verse of Light: Allah is the Light of the heavens and the earth. Reflecting upon spiritual illumination.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('nur_tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed parsing tasks:', e);
    }
    return defaultTasks;
  });

  const [duas, setDuas] = useState<DuaItem[]>(() => {
    try {
      const saved = localStorage.getItem('nur_duas');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => ({
            ...item,
            audioUrl: item.audioUrl || DUAS_COLLECTION.find((dua) => dua.id === item.id)?.audioUrl || '',
          }));
        }
      }
    } catch (e) {
      console.warn('Failed parsing duas:', e);
    }
    return DUAS_COLLECTION;
  });

  const [adhkarSets, setAdhkarSets] = useState<{
    morning: DhikrItem[];
    evening: DhikrItem[];
    afterPrayer: DhikrItem[];
    beforeSleep: DhikrItem[];
  }>(() => {
    try {
      const saved = localStorage.getItem('nur_adhkar_sets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.morning) && Array.isArray(parsed.evening)) {
          return {
            morning: parsed.morning || MORNING_ADHKAR,
            evening: parsed.evening || EVENING_ADHKAR,
            afterPrayer: parsed.afterPrayer || AFTER_PRAYER_ADHKAR,
            beforeSleep: parsed.beforeSleep || BEFORE_SLEEP_ADHKAR,
          };
        }
      }
    } catch (e) {
      console.warn('Failed parsing adhkar sets:', e);
    }
    return {
      morning: MORNING_ADHKAR,
      evening: EVENING_ADHKAR,
      afterPrayer: AFTER_PRAYER_ADHKAR,
      beforeSleep: BEFORE_SLEEP_ADHKAR,
    };
  });

  const [tasbihSessions, setTasbihSessions] = useState<TasbihSession[]>(() => {
    try {
      const saved = localStorage.getItem('nur_tasbih_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed parsing tasbih sessions:', e);
    }
    return [
      { id: 'ts-1', dhikrName: 'SubhanAllah', count: 33, target: 33, completedAt: new Date().toISOString() },
      { id: 'ts-2', dhikrName: 'Alhamdulillah', count: 33, target: 33, completedAt: new Date().toISOString() },
      { id: 'ts-3', dhikrName: 'Allahu Akbar', count: 34, target: 34, completedAt: new Date().toISOString() }
    ];
  });

  const [ramadanState, setRamadanState] = useState<RamadanState>(() => {
    try {
      const saved = localStorage.getItem('nur_ramadan_state');
      if (saved) return { ...defaultRamadanState, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Failed parsing ramadan state:', e);
    }
    return defaultRamadanState;
  });

  const [accountingEntries, setAccountingEntries] = useState<SelfAccountingEntry[]>(() => {
    try {
      const saved = localStorage.getItem('nur_accounting');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed parsing accounting:', e);
    }
    return [
      {
        id: 'acc-1',
        date: new Date().toISOString().split('T')[0],
        prompt: 'Daily Muhasabah',
        text: 'Felt a deep sense of tranquil presence during Maghrib prayer.',
        prayersCompleted: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
        quranRead: true,
        quranDetails: 'Read 2 pages of Surah Al-Kahf',
        adhkarDone: true,
        charityDone: true,
        spiritualRating: 5,
        gratitudeNotes: ['Peace of heart', 'Health and safety', 'Opportunity to remember Allah'],
        gratefulFor: ['Peace of heart', 'Health and safety', 'Opportunity to remember Allah'],
        improvementsTomorrow: 'Wake up 20 mins earlier for Tahajjud prayer',
        personalNotes: 'Felt a deep sense of tranquil presence during Maghrib prayer.',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>(() => {
    try {
      const saved = localStorage.getItem('nur_archive');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed parsing archive:', e);
    }
    return [
      {
        id: 'arch-1',
        type: 'ayah',
        title: 'Surah An-Nur 24:35 — The Verse of Light',
        content: 'Allah is the Light of the heavens and the earth. The example of His light is like a niche within which is a lamp...',
        arabicContent: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ۚ مَثَلُ نُورِهِ كَمِشْكَاةٍ فِيهَا مِصْبَاحٌ',
        tags: ['Light', 'Hope', 'Divine Presence'],
        date: new Date().toISOString().split('T')[0]
      },
      {
        id: 'arch-2',
        type: 'reflection',
        title: 'Night Reflection on Contentment (Rida)',
        content: 'True peace does not come from controlling every outcome, but from placing one\'s trust (Tawakkul) in the Most Wise.',
        tags: ['Reflection', 'Tawakkul', 'Peace'],
        date: new Date().toISOString().split('T')[0]
      }
    ];
  });

  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      text: 'Assalamu Alaikum wa Rahmatullahi wa Barakatuh. Welcome to NUR. I am your respectful Islamic companion. How can I assist your study of the Qur\'an, prayer reflections, or daily worship today?',
      content: 'Assalamu Alaikum wa Rahmatullahi wa Barakatuh. Welcome to NUR. I am your respectful Islamic companion. How can I assist your study of the Qur\'an, prayer reflections, or daily worship today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const [aiMemories, setAiMemories] = useState<AIMemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('nur_ai_memories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed parsing AI memories:', e);
    }
    return [
      { id: 'mem-1', key: 'quran_goal', value: '20 Ayahs per day', category: 'worship_goal', timestamp: new Date().toISOString() },
      { id: 'mem-2', key: 'reciter', value: 'Mishary Rashid Alafasy', category: 'reciter', timestamp: new Date().toISOString() },
      { id: 'mem-3', key: 'location', value: 'Makkah (MWL)', category: 'preference', timestamp: new Date().toISOString() }
    ];
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('nur_user_settings');
      if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Failed parsing settings:', e);
    }
    return defaultSettings;
  });

  // Save to localStorage effects
  useEffect(() => {
    localStorage.setItem('nur_prayer_config', JSON.stringify(prayerConfig));
  }, [prayerConfig]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`nur_prayers_${today}`, JSON.stringify(completedPrayers));
  }, [completedPrayers]);

  useEffect(() => {
    localStorage.setItem('nur_quran_progress', JSON.stringify(quranProgress));
  }, [quranProgress]);

  useEffect(() => {
    localStorage.setItem('nur_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('nur_quran_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('nur_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('nur_duas', JSON.stringify(duas));
  }, [duas]);

  useEffect(() => {
    localStorage.setItem('nur_adhkar_sets', JSON.stringify(adhkarSets));
  }, [adhkarSets]);

  useEffect(() => {
    localStorage.setItem('nur_tasbih_sessions', JSON.stringify(tasbihSessions));
  }, [tasbihSessions]);

  useEffect(() => {
    localStorage.setItem('nur_ramadan_state', JSON.stringify(ramadanState));
  }, [ramadanState]);

  useEffect(() => {
    localStorage.setItem('nur_accounting', JSON.stringify(accountingEntries));
  }, [accountingEntries]);

  useEffect(() => {
    localStorage.setItem('nur_archive', JSON.stringify(archiveItems));
  }, [archiveItems]);

  useEffect(() => {
    localStorage.setItem('nur_ai_memories', JSON.stringify(aiMemories));
  }, [aiMemories]);

  useEffect(() => {
    localStorage.setItem('nur_user_settings', JSON.stringify(settings));
    // Apply theme class if needed
    if (settings.theme === 'dawn') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [settings]);

  // Geolocation auto-detection if enabled
  useEffect(() => {
    if (prayerConfig.autoDetectLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPrayerConfig((prev) => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            cityName: 'Current Location',
            countryName: 'GPS Detected',
          }));
        },
        (err) => {
          console.warn('Geolocation access declined or unavailable:', err);
        }
      );
    }
  }, [prayerConfig.autoDetectLocation]);

  // Handlers
  const openQuranAt = (surah: number, ayah: number = 1) => {
    setTargetQuranSurah(surah);
    setTargetQuranAyah(ayah);
    setActiveSection('quran');
  };

  const togglePrayerCompleted = (prayerId: string) => {
    setCompletedPrayers((prev) => ({
      ...prev,
      [prayerId]: !prev[prayerId],
    }));
  };

  const addBookmark = (bm: Omit<QuranBookmark, 'id' | 'createdAt'>) => {
    const newBm: QuranBookmark = {
      ...bm,
      id: 'bm-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setBookmarks((prev) => [newBm, ...prev.filter(b => !(b.surahNumber === bm.surahNumber && b.ayahNumber === bm.ayahNumber))]);
    
    // Also save to archive
    addToArchive({
      type: 'ayah',
      title: `Surah ${bm.surahName} (${bm.surahNumber}:${bm.ayahNumber})`,
      content: bm.translationSnippet,
      arabicContent: bm.arabicSnippet,
      tags: ['Qur\'an', 'Bookmark', bm.surahName],
      date: new Date().toISOString().split('T')[0],
      referenceId: newBm.id,
    });
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const saveQuranNote = (surahNumber: number, ayahNumber: number, surahName: string, text: string) => {
    setNotes((prev) => {
      const existing = prev.find((n) => n.surahNumber === surahNumber && n.ayahNumber === ayahNumber);
      if (existing) {
        return prev.map((n) => (n.id === existing.id ? { ...n, text, updatedAt: new Date().toISOString() } : n));
      }
      return [
        {
          id: 'qn-' + Date.now(),
          surahNumber,
          ayahNumber,
          surahName,
          text,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });

    addToArchive({
      type: 'note',
      title: `Note on Surah ${surahName} (${surahNumber}:${ayahNumber})`,
      content: text,
      tags: ['Qur\'an Note', surahName],
      date: new Date().toISOString().split('T')[0],
    });
  };

  const deleteQuranNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const updateQuranDailyGoalProgress = (ayahsCount: number) => {
    setQuranProgress((prev) => ({
      ...prev,
      dailyGoalCompletedToday: prev.dailyGoalCompletedToday + ayahsCount,
      totalAyahsRead: prev.totalAyahsRead + ayahsCount,
    }));
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: 'task-' + Date.now(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...(prev || [])]);
  };

  const addNewTask = (title: string, category: string = 'Worship', frequency: string = 'daily') => {
    addTask({
      title,
      name: title,
      category,
      priority: 'medium',
      frequency,
      repeat: frequency,
      date: new Date().toISOString().split('T')[0],
      hasReminder: false,
    });
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      (prev || []).map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  };

  const toggleTaskCompleted = (id: string) => {
    toggleTask(id);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => (prev || []).filter((t) => t.id !== id));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => (prev || []).map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const toggleDuaFavorite = (id: string) => {
    setDuas((prev) =>
      (prev || []).map((d) => {
        if (d.id === id) {
          const isFav = !d.isFavorite;
          if (isFav) {
            addToArchive({
              type: 'dua',
              title: d.title,
              content: d.translation,
              arabicContent: d.arabic,
              tags: ['Dua', d.category],
              date: new Date().toISOString().split('T')[0],
              referenceId: d.id,
            });
          }
          return { ...d, isFavorite: isFav };
        }
        return d;
      })
    );
  };

  const incrementDhikr = (
    setKey: 'morning' | 'evening' | 'afterPrayer' | 'beforeSleep',
    id: string
  ) => {
    setAdhkarSets((prev) => {
      const targetSet = prev?.[setKey] || [];
      const updated = targetSet.map((item) => {
        if (item.id === id) {
          const newCount = (item.currentCount || 0) + 1;
          return {
            ...item,
            currentCount: newCount,
            completed: newCount >= item.targetCount,
          };
        }
        return item;
      });
      return { ...prev, [setKey]: updated };
    });
  };

  const resetDhikrSet = (setKey: 'morning' | 'evening' | 'afterPrayer' | 'beforeSleep') => {
    setAdhkarSets((prev) => {
      const targetSet = prev?.[setKey] || [];
      const reset = targetSet.map((item) => ({ ...item, currentCount: 0, completed: false }));
      return { ...prev, [setKey]: reset };
    });
  };

  const logTasbihSession = (session: Omit<TasbihSession, 'id' | 'completedAt'>) => {
    const newSession: TasbihSession = {
      ...session,
      id: 'ts-' + Date.now(),
      completedAt: new Date().toISOString(),
    };
    setTasbihSessions((prev) => [newSession, ...(prev || [])]);
  };

  const saveAccountingEntry = (entry: Omit<SelfAccountingEntry, 'id' | 'createdAt'>) => {
    const newEntry: SelfAccountingEntry = {
      ...entry,
      id: 'acc-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setAccountingEntries((prev) => [newEntry, ...(prev || []).filter((e) => e.date !== entry.date)]);

    addToArchive({
      type: 'reflection',
      title: `Daily Muhasabah Reflection (${entry.date})`,
      content: `Gratitude: ${(entry.gratefulFor || entry.gratitudeNotes || []).join(', ')}\nImprovements: ${entry.improvementsTomorrow || ''}\nNotes: ${entry.personalNotes || entry.text || ''}`,
      tags: ['Muhasabah', 'Reflection', 'Self-Accounting'],
      date: entry.date,
    });
  };

  const saveReflection = (entry: { prompt?: string; text: string; gratitudeNotes?: string[]; mood?: string }) => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: SelfAccountingEntry = {
      id: 'acc-' + Date.now(),
      date: today,
      prompt: entry.prompt || 'Reflection',
      text: entry.text,
      prayersCompleted: completedPrayers || {},
      quranRead: true,
      adhkarDone: true,
      charityDone: false,
      spiritualRating: 5,
      gratitudeNotes: entry.gratitudeNotes || [],
      gratefulFor: entry.gratitudeNotes || [],
      improvementsTomorrow: '',
      personalNotes: entry.text,
      mood: entry.mood,
      createdAt: new Date().toISOString(),
    };
    setAccountingEntries((prev) => [newEntry, ...(prev || []).filter((e) => e.id !== newEntry.id)]);

    addToArchive({
      type: 'reflection',
      title: `${entry.prompt || 'Daily Reflection'} (${today})`,
      content: entry.text + (entry.gratitudeNotes && entry.gratitudeNotes.length > 0 ? `\nGratitude: ${entry.gratitudeNotes.join(', ')}` : ''),
      tags: ['Reflection', entry.mood || 'Spiritual'],
      date: today,
    });
  };

  const deleteReflection = (id: string) => {
    setAccountingEntries((prev) => (prev || []).filter((e) => e.id !== id));
  };

  const addToArchive = (item: Omit<ArchiveItem, 'id'>) => {
    const newItem: ArchiveItem = {
      ...item,
      id: 'arch-' + Date.now(),
    };
    setArchiveItems((prev) => [newItem, ...(prev || [])]);
  };

  const removeFromArchive = (id: string) => {
    setArchiveItems((prev) => (prev || []).filter((item) => item.id !== id));
  };

  const saveAiMemory = (key: string, label: string, value: string, category: AIMemoryItem['category']) => {
    setAiMemories((prev) => {
      const list = prev || [];
      const existing = list.find((m) => m.key === key);
      if (existing) {
        return list.map((m) => (m.id === existing.id ? { ...m, value, timestamp: new Date().toISOString() } : m));
      }
      return [
        ...list,
        {
          id: 'mem-' + Date.now(),
          key,
          value,
          category,
          timestamp: new Date().toISOString(),
        },
      ];
    });
  };

  const deleteAiMemory = (id: string) => {
    setAiMemories((prev) => (prev || []).filter((m) => m.id !== id));
  };

  const addChatMessage = (role: 'user' | 'assistant', text: string, toolCalls?: any[]) => {
    const newMsg: AIMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      role,
      text,
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toolCalls,
    };
    setAiMessages((prev) => [...(prev || []), newMsg]);
  };

  const clearAiChat = () => {
    setAiMessages([
      {
        id: 'msg-reset',
        role: 'assistant',
        text: 'Assalamu Alaikum. How can I help you today with Qur\'an, prayers, or daily organization?',
        content: 'Assalamu Alaikum. How can I help you today with Qur\'an, prayers, or daily organization?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  const clearChatMessages = () => {
    clearAiChat();
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  // Calculate "Your Light Today" holistic spiritual deed progress (0 to 100)
  const prayersCount = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].filter((p) => completedPrayers && completedPrayers[p]).length;
  const prayersProgress = (prayersCount / 5) * 40; // 40 pts max

  const quranGoalVal = quranProgress?.dailyGoalValue || 20;
  const quranDoneVal = quranProgress?.dailyGoalCompletedToday || 0;
  const quranPercent = Math.min(1, quranDoneVal / Math.max(1, quranGoalVal));
  const quranScore = quranPercent * 25; // 25 pts max

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const completedTasksCount = safeTasks.filter((t) => t && t.completed).length;
  const taskScore = safeTasks.length > 0 ? (completedTasksCount / safeTasks.length) * 20 : 15; // 20 pts max

  const morningDone = ((adhkarSets && adhkarSets.morning) || []).filter((d) => d && d.completed).length > 0 ? 7.5 : 0;
  const eveningDone = ((adhkarSets && adhkarSets.evening) || []).filter((d) => d && d.completed).length > 0 ? 7.5 : 0;
  const adhkarScore = morningDone + eveningDone; // 15 pts max

  const lightScore = Math.round(Math.min(100, prayersProgress + quranScore + taskScore + adhkarScore));

  return (
    <AppContext.Provider
      value={{
        activeSection,
        setActiveSection,
        targetQuranSurah,
        targetQuranAyah,
        openQuranAt,
        prayerConfig,
        setPrayerConfig,
        completedPrayers,
        togglePrayerCompleted,
        quranProgress,
        setQuranProgress,
        bookmarks,
        addBookmark,
        removeBookmark,
        notes,
        saveQuranNote,
        deleteQuranNote,
        updateQuranDailyGoalProgress,
        tasks: safeTasks,
        addTask,
        addNewTask,
        toggleTask,
        toggleTaskCompleted,
        deleteTask,
        updateTask,
        duas: Array.isArray(duas) ? duas : DUAS_COLLECTION,
        toggleDuaFavorite,
        adhkarSets: adhkarSets || {
          morning: MORNING_ADHKAR,
          evening: EVENING_ADHKAR,
          afterPrayer: AFTER_PRAYER_ADHKAR,
          beforeSleep: BEFORE_SLEEP_ADHKAR,
        },
        incrementDhikr,
        resetDhikrSet,
        tasbihSessions: Array.isArray(tasbihSessions) ? tasbihSessions : [],
        logTasbihSession,
        ramadanState: ramadanState || defaultRamadanState,
        setRamadanState,
        accountingEntries: Array.isArray(accountingEntries) ? accountingEntries : [],
        reflections: Array.isArray(accountingEntries) ? accountingEntries : [],
        saveAccountingEntry,
        saveReflection,
        deleteReflection,
        archiveItems: Array.isArray(archiveItems) ? archiveItems : [],
        addToArchive,
        removeFromArchive,
        aiMessages: Array.isArray(aiMessages) ? aiMessages : [],
        chatMessages: Array.isArray(aiMessages) ? aiMessages : [],
        setAiMessages,
        addChatMessage,
        aiMemories: Array.isArray(aiMemories) ? aiMemories : [],
        saveAiMemory,
        deleteAiMemory,
        clearAiChat,
        clearChatMessages,
        settings: settings || defaultSettings,
        updateSettings,
        lightScore,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
