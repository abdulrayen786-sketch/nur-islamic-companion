export type NavSection =
  | 'home'
  | 'prayer'
  | 'quran'
  | 'duas'
  | 'adhkar'
  | 'tasbih'
  | 'qibla'
  | 'calendar'
  | 'ramadan'
  | 'tasks'
  | 'reflection'
  | 'archive'
  | 'ai'
  | 'settings';

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimeItem {
  id: PrayerName;
  name: string;
  arabicName: string;
  time: string; // "05:12"
  timestamp: Date;
  isPassed: boolean;
  isCurrent: boolean;
  isNext: boolean;
  isCompleted: boolean;
}

export interface PrayerCalculationConfig {
  method: 'MWL' | 'ISNA' | 'Egypt' | 'Makkah' | 'Karachi' | 'Tehran' | 'Gulf' | 'Kuwait' | 'Qatar' | 'Singapore' | 'Turkey' | 'France';
  madhab: 'shafii' | 'hanafi';
  highLatitudeRule: 'middleOfTheNight' | 'seventhOfTheNight' | 'twilightAngle';
  latitude: number;
  longitude: number;
  cityName: string;
  countryName: string;
  timezoneOffset?: number;
  autoDetectLocation: boolean;
}

export interface SurahMeta {
  number: number;
  nameArabic: string;
  nameTransliteration: string;
  nameEnglish: string;
  totalVerses: number;
  revelationType: 'Meccan' | 'Medinan';
  startJuz: number;
  pageNumber: number;
}

export interface JuzMeta {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

export interface Ayah {
  numberInSurah: number;
  numberInQuran: number;
  juz: number;
  page: number;
  arabicText: string;
  transliteration?: string;
  translation: string;
  audioUrl?: string;
}

export interface QuranBookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabicSnippet: string;
  translationSnippet: string;
  createdAt: string;
  note?: string;
  isFavorite?: boolean;
}

export interface QuranNote {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuranProgress {
  lastReadSurah: number;
  lastReadAyah: number;
  lastReadSurahName: string;
  lastReadTimestamp: string;
  totalAyahsRead: number;
  dailyGoalType: 'pages' | 'ayahs' | 'minutes' | 'juz';
  dailyGoalValue: number;
  dailyGoalCompletedToday: number;
  history: {
    date: string;
    ayahsRead: number;
    minutesSpent: number;
  }[];
}

export type TaskCategory =
  | 'Worship'
  | 'Qur\'an'
  | 'Study'
  | 'Work'
  | 'Health'
  | 'Family'
  | 'Personal'
  | 'Custom';

export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskRepeat =
  | 'once'
  | 'daily'
  | 'weekdays'
  | 'weekends'
  | 'selected_days'
  | 'weekly'
  | 'monthly';

export interface Task {
  id: string;
  name: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  hasReminder: boolean;
  repeat: TaskRepeat;
  selectedDays?: number[]; // 0 for Sun, 1 for Mon...
  notes?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface DuaItem {
  id: string;
  category: 'Morning' | 'Evening' | 'After Prayer' | 'Before Sleep' | 'Travel' | 'Protection' | 'Gratitude' | 'Forgiveness' | 'Daily Life' | 'Ramadan' | 'Distress';
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  benefits?: string;
  audioUrl?: string;
  isFavorite?: boolean;
}

export interface DhikrItem {
  id: string;
  category: 'Morning' | 'Evening' | 'After Prayer' | 'Before Sleep' | 'General';
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  audioUrl?: string;
}

export interface TasbihSession {
  id: string;
  dhikrName: string;
  arabicText?: string;
  count: number;
  target: number;
  completedAt: string;
}

export interface SelfAccountingEntry {
  id: string;
  date: string; // YYYY-MM-DD
  prayersCompleted: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    tahajjud?: boolean;
    rawatib?: boolean;
  };
  quranRead: boolean;
  quranDetails?: string;
  adhkarDone: boolean;
  charityDone?: boolean;
  spiritualRating: number; // 1 to 5
  gratefulFor: string[];
  improvementsTomorrow: string;
  personalNotes: string;
  createdAt: string;
}

export interface ArchiveItem {
  id: string;
  type: 'reflection' | 'journal' | 'ayah' | 'dua' | 'note' | 'memory';
  title: string;
  content: string;
  arabicContent?: string;
  tags: string[];
  date: string;
  referenceId?: string;
}

export interface RamadanState {
  isActive: boolean;
  currentDay: number;
  fastingStatusToday: 'fasting' | 'completed' | 'exempt' | 'not_fasting';
  suhoorTime: string;
  iftarTime: string;
  taraweehRakatsCompleted: number;
  dailyCharityGoalAmount: number;
  charityDonatedToday: number;
  quranJuzGoalForDay: number;
  ramadanNotes: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  language?: string;
  toolInvocations?: {
    toolName: string;
    args: Record<string, any>;
    result?: Record<string, any>;
  }[];
  references?: {
    type: 'quran' | 'hadith' | 'tafsir' | 'dua';
    title: string;
    arabic?: string;
    translation?: string;
    source: string;
  }[];
}

export interface AIMemoryItem {
  id: string;
  key: string;
  label: string;
  value: string;
  category: 'preference' | 'worship_goal' | 'language' | 'reciter' | 'routine';
  updatedAt: string;
}

export interface UserSettings {
  userName: string;
  appLanguage: string;
  aiLanguage: string;
  quranTranslationLanguage: string;
  voiceLanguage: string;
  theme: 'midnight' | 'emerald' | 'royal' | 'dawn' | 'system';
  arabicFontSize: number; // 24 to 48
  translationFontSize: number; // 14 to 24
  lineSpacing: number; // 1.5 to 3.0
  preferredReciterId: string;
  audioAutoPlayNext: boolean;
  enableVibrations: boolean;
  enableSoundFeedback: boolean;
  aiMemoryEnabled: boolean;
  notifications: {
    prayerAdhan: boolean;
    prayerReminders: boolean;
    dailyQuranGoal: boolean;
    morningAdhkar: boolean;
    eveningAdhkar: boolean;
    ramadanAlerts: boolean;
    customTasks: boolean;
  };
}
