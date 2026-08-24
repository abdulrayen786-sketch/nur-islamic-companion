export type ActiveSection =
  | 'home'
  | 'quran'
  | 'prayer'
  | 'duas'
  | 'adhkar'
  | 'tasbih'
  | 'qibla'
  | 'calendar'
  | 'ramadan'
  | 'chat'
  | 'ai'
  | 'tasks'
  | 'reflection'
  | 'archive'
  | 'settings';

export type NavSection = ActiveSection;

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
  numberInQuran?: number;
  overallNumber?: number;
  arabicText: string;
  translation: string;
  transliteration?: string;
  audioUrl?: string;
  juz: number;
  page: number;
  sajda?: boolean;
}

export interface QuranProgress {
  lastReadSurah: number;
  lastReadAyah: number;
  lastReadSurahName: string;
  lastReadTimestamp: string;
  totalAyahsRead?: number;
  dailyGoalAyahs?: number;
  dailyGoalCompletedToday: number;
  dailyGoalValue: number;
  dailyGoalType?: string;
  history?: Array<{ date: string; ayahsRead: number; surah?: number; ayah?: number; minutesSpent?: number }>;
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabicSnippet: string;
  translationSnippet: string;
  createdAt: string;
  isFavorite?: boolean;
}

export type QuranBookmark = Bookmark;

export interface QuranNote {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  updatedAt: string;
}

export type DuaCategory =
  | 'Daily Life'
  | 'Morning & Evening'
  | 'Morning'
  | 'Evening'
  | 'Protection'
  | 'Forgiveness'
  | 'Gratitude'
  | 'Distress & Anxiety'
  | 'Distress'
  | 'Travel'
  | 'Ramadan & Fasting'
  | 'Ramadan'
  | 'After Prayer'
  | 'Before Sleep'
  | 'Upon Waking'
  | 'Food'
  | 'Quranic Duas'
  | 'Daily Duas';

export interface DuaItem {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  category: DuaCategory;
  urdu?: string;
  urduTranslation?: string;
  urduMeaning?: string;
  translationUrdu?: string;
  meaningUrdu?: string;
  translationLanguage?: string;
  audioUrl: string;
  audioFallbackUrl?: string;
  benefits?: string;
  isFavorite?: boolean;
}

export interface DhikrItem {
  id: string;
  category?: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  urdu?: string;
  urduTranslation?: string;
  urduMeaning?: string;
  translationUrdu?: string;
  meaningUrdu?: string;
  translationLanguage?: string;
}

export interface AdhkarCollection {
  morning: DhikrItem[];
  evening: DhikrItem[];
  afterPrayer: DhikrItem[];
  beforeSleep: DhikrItem[];
}

export interface TasbihSession {
  id: string;
  dhikrName: string;
  count: number;
  target: number;
  completedAt: string;
}

export interface TaskItem {
  id: string;
  title?: string;
  name?: string;
  category: string;
  priority?: 'low' | 'medium' | 'high';
  completed: boolean;
  completedAt?: string;
  frequency?: 'daily' | 'weekly' | 'custom' | string;
  repeat?: string;
  time?: string;
  hasReminder?: boolean;
  date?: string;
  createdAt: string;
}

export type Task = TaskItem;

export interface ReflectionEntry {
  id: string;
  prompt?: string;
  text?: string;
  gratitudeNotes?: string[];
  gratefulFor?: string[];
  improvementsTomorrow?: string | string[];
  personalNotes?: string;
  date?: string;
  mood?: string;
  spiritualRating?: number;
  quranRead?: boolean;
  quranDetails?: string;
  adhkarDone?: boolean;
  charityDone?: boolean;
  prayersCompleted?: Record<string, boolean>;
  createdAt: string;
}

export type SelfAccountingEntry = ReflectionEntry;

export interface ArchiveItem {
  id: string;
  title: string;
  category?: string;
  type?: string;
  content: string;
  arabicContent?: string;
  tags?: string[];
  date?: string;
  referenceId?: string;
  savedAt?: string;
}

export interface RamadanState {
  isActive?: boolean;
  currentDay: number;
  fastingStatusToday: 'fasting' | 'completed' | 'exempt';
  quranJuzGoalForDay: number;
  taraweehRakatsCompleted: number;
  charityDonatedToday: number;
  suhoorTime?: string;
  iftarTime?: string;
  dailyCharityGoalAmount?: number;
  ramadanNotes?: string[] | string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  content?: string;
  timestamp: string;
  toolCalls?: Array<{
    name: string;
    args: any;
  }>;
}

export type AIMessage = ChatMessage;

export interface AIMemoryItem {
  id: string;
  key: string;
  value: string;
  category?: string;
  timestamp: string;
}

export interface AppSettings {
  userName: string;
  appLanguage?: string;
  aiLanguage?: string;
  voiceLanguage?: string;
  theme?: string;
  arabicFontSize: number;
  translationFontSize?: number;
  lineSpacing?: string | number;
  quranTranslationLanguage: string;
  preferredReciterId: string;
  enableSoundFeedback?: boolean;
  enablePrayerNotifications?: boolean;
  audioAutoPlayNext?: boolean;
  enableVibrations?: boolean;
  aiMemoryEnabled?: boolean;
  notifications?: Record<string, boolean>;
  themeTone?: 'midnight' | 'emerald' | 'amber';
}

export type UserSettings = AppSettings;

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimeItem {
  id: PrayerName;
  name: string;
  arabicName: string;
  time: string;
  dateObj?: Date;
  timestamp: Date;
  isPassed: boolean;
  isNext: boolean;
  isCurrent: boolean;
  isCompleted?: boolean;
}

export interface PrayerConfig {
  cityName: string;
  countryName: string;
  latitude: number;
  longitude: number;
  method: 'MWL' | 'ISNA' | 'Egypt' | 'Makkah' | 'Karachi' | 'Tehran' | 'Turkey' | 'France';
  madhab: 'shafii' | 'hanafi';
  highLatitudeRule: 'MiddleOfTheNight' | 'SeventhOfTheNight' | 'TwilightAngle' | 'middleOfTheNight' | 'seventhOfTheNight' | 'twilightAngle';
  autoDetectLocation: boolean;
}

export type PrayerCalculationConfig = PrayerConfig;
