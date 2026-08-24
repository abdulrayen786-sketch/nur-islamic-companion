import React, { useState } from 'react';
import {
  Archive,
  Search,
  Sparkles,
  BookOpen,
  Award,
  ChevronRight,
  Share2,
  Check,
  Heart
} from 'lucide-react';

interface NameOfAllah {
  number: number;
  arabic: string;
  transliteration: string;
  meaning: string;
  explanation: string;
}

const ASMA_UL_HUSNA: NameOfAllah[] = [
  { number: 1, arabic: 'الرَّحْمَٰنُ', transliteration: 'Ar-Rahman', meaning: 'The Entirely Merciful', explanation: 'The One who has extensive and encompassing mercy for all of creation.' },
  { number: 2, arabic: 'الرَّحِيمُ', transliteration: 'Ar-Raheem', meaning: 'The Especially Merciful', explanation: 'The One who bestows specific, enduring mercy upon those who believe.' },
  { number: 3, arabic: 'الْمَلِكُ', transliteration: 'Al-Malik', meaning: 'The Sovereign King', explanation: 'The absolute ruler and owner of the entire universe without partners.' },
  { number: 4, arabic: 'الْقُدُّوسُ', transliteration: 'Al-Quddus', meaning: 'The Most Sacred & Pure', explanation: 'The One who is absolutely free from any imperfection, blemish, or deficiency.' },
  { number: 5, arabic: 'السَّلَامُ', transliteration: 'As-Salam', meaning: 'The Source of Peace', explanation: 'The One who is free from all defects and the granter of peace and security to His creation.' },
  { number: 6, arabic: 'الْمُؤْمِنُ', transliteration: 'Al-Mu\'min', meaning: 'The Granter of Security', explanation: 'The One who affirms His oneness and grants safety and faith to His servants.' },
  { number: 7, arabic: 'الْمُهَيْمِنُ', transliteration: 'Al-Muhaymin', meaning: 'The Preserver of Safety', explanation: 'The Guardian, Overseer, and Protector who watches over all things.' },
  { number: 8, arabic: 'الْعَزِيزُ', transliteration: 'Al-Aziz', meaning: 'The All-Mighty', explanation: 'The Invincible One who cannot be overcome, yet is infinitely just and wise.' },
  { number: 9, arabic: 'الْجَبَّارُ', transliteration: 'Al-Jabbar', meaning: 'The Restorer & Compeller', explanation: 'The One who mends the brokenhearted and sets right the affairs of His creation.' },
  { number: 10, arabic: 'الْمُتَكَبِّرُ', transliteration: 'Al-Mutakabbir', meaning: 'The Supreme & Majestic', explanation: 'The One who is above all creation and alone worthy of all true greatness.' },
  { number: 11, arabic: 'الْخَالِقُ', transliteration: 'Al-Khaliq', meaning: 'The Creator', explanation: 'The One who brings everything from non-existence into existence with precision.' },
  { number: 12, arabic: 'الْبَارِئُ', transliteration: 'Al-Bari', meaning: 'The Originator', explanation: 'The One who crafts creation in perfect proportion and harmony.' },
  { number: 13, arabic: 'الْمُصَوِّرُ', transliteration: 'Al-Musawwir', meaning: 'The Fashioner of Forms', explanation: 'The One who shapes each creation with distinct beauty and unique design.' },
  { number: 14, arabic: 'الْغَفَّارُ', transliteration: 'Al-Ghaffar', meaning: 'The Perpetual Forgiver', explanation: 'The One who forgives sins repeatedly and veils human shortcomings.' },
  { number: 15, arabic: 'الْقَهَّارُ', transliteration: 'Al-Qahhar', meaning: 'The All-Subduing', explanation: 'The One who holds absolute power and sovereignty over all that exists.' },
  { number: 16, arabic: 'الْوَهَّابُ', transliteration: 'Al-Wahhab', meaning: 'The Supreme Bestower', explanation: 'The One who continuously gives gifts and blessings without asking anything in return.' },
  { number: 17, arabic: 'الرَّزَّاقُ', transliteration: 'Ar-Razzaq', meaning: 'The All-Provider', explanation: 'The One who sustains every living soul with physical nourishment and spiritual light.' },
  { number: 18, arabic: 'الْفَتَّاحُ', transliteration: 'Al-Fattah', meaning: 'The Opener of All Doors', explanation: 'The One who opens the doors of mercy, victory, knowledge, and relief.' },
  { number: 19, arabic: 'الْعَلِيمُ', transliteration: 'Al-Aleem', meaning: 'The All-Knowing', explanation: 'The One whose knowledge encompasses everything in the heavens and earth, secret and manifest.' },
  { number: 20, arabic: 'الْقَابِضُ', transliteration: 'Al-Qabid', meaning: 'The Withholder', explanation: 'The One who tightens sustenance or breath according to supreme wisdom.' },
  { number: 21, arabic: 'الْبَاسِطُ', transliteration: 'Al-Basit', meaning: 'The Expander', explanation: 'The One who expands hearts, provisions, and relief with infinite generosity.' },
  { number: 22, arabic: 'الْحَكِيمُ', transliteration: 'Al-Hakeem', meaning: 'The All-Wise', explanation: 'The One who places everything in its right place with flawless precision.' },
  { number: 23, arabic: 'الْوَدُودُ', transliteration: 'Al-Wadud', meaning: 'The Most Loving', explanation: 'The One who is full of tender love and affection for His righteous servants.' },
  { number: 24, arabic: 'النُّورُ', transliteration: 'An-Nur', meaning: 'The Light', explanation: 'The One who illuminates the heavens and earth and guides lost souls to the truth.' },
];

interface HadithSummary {
  number: number;
  title: string;
  arabicExcerpt: string;
  english: string;
  lesson: string;
}

const NAWAWI_HADITHS: HadithSummary[] = [
  { number: 1, title: 'Actions are by Intentions', arabicExcerpt: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ', english: 'Actions are judged solely by intentions, and every person will get what they intended.', lesson: 'Purity of intention is the foundation of every spiritual and worldly deed.' },
  { number: 2, title: 'Islam, Iman, and Ihsan', arabicExcerpt: 'أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ', english: 'Ihsan is to worship Allah as if you see Him, and if you do not see Him, know that He sees you.', lesson: 'Living in constant mindful awareness of Allah transforms one\'s character.' },
  { number: 12, title: 'Leaving What Does Not Concern You', arabicExcerpt: 'مِنْ حُسْنِ إِسْلاَمِ الْمَرْءِ تَرْكُهُ مَا لاَ يَعْنِيهِ', english: 'Part of the perfection of a person\'s Islam is leaving that which does not concern them.', lesson: 'Shield your heart from idle gossip, distractions, and vanity.' },
  { number: 13, title: 'Loving for Your Brother', arabicExcerpt: 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ', english: 'None of you truly believes until he loves for his brother what he loves for himself.', lesson: 'True faith manifests in empathy, benevolence, and sincere goodwill toward all.' },
  { number: 16, title: 'Do Not Become Angry', arabicExcerpt: 'لاَ تَغْضَبْ', english: 'A man said to the Prophet ﷺ: "Advise me." He said: "Do not become angry," repeating it several times.', lesson: 'Self-mastery and emotional restraint protect one from injustice and regret.' },
  { number: 34, title: 'Reforming Injustice with Wisdom', arabicExcerpt: 'مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ', english: 'Whoever among you sees an evil, let him change it with his hand; if unable, with his tongue; if unable, with his heart, and that is the weakest of faith.', lesson: 'Active engagement with positive change according to one\'s lawful ability.' },
];

export const ArchivePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'names' | 'hadith'>('names');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredNames = ASMA_UL_HUSNA.filter((n) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      n.transliteration.toLowerCase().includes(q) ||
      n.meaning.toLowerCase().includes(q) ||
      n.arabic.includes(q) ||
      n.explanation.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-[#0E1424] border border-amber-500/20 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-arabic text-amber-300 text-lg">الأرشيف المعرفي</span>
              <span className="text-xs uppercase tracking-wider text-slate-400">• Quiet Knowledge Archive</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Quiet Archive & Islamic Treasures</h1>
            <p className="text-xs text-slate-400">Offline-first treasury of the 99 Beautiful Names of Allah and timeless prophetic wisdom.</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('names')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'names'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              99 Names of Allah
            </button>
            <button
              onClick={() => setActiveTab('hadith')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'hadith'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Essential Hadiths
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative pt-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search divine names, attributes, meanings, or hadiths..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* 99 Names View */}
      {activeTab === 'names' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredNames.map((item) => (
            <div
              key={item.number}
              className="p-5 rounded-3xl bg-[#0E1424]/90 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-md"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-xs font-bold flex items-center justify-center">
                    {item.number}
                  </span>
                  <button
                    onClick={() => handleCopy(`${item.arabic} - ${item.transliteration} (${item.meaning})\n${item.explanation}`, `name-${item.number}`)}
                    className="text-slate-500 hover:text-white p-1"
                  >
                    {copiedKey === `name-${item.number}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="text-center my-3 space-y-1">
                  <p className="font-arabic text-2xl text-amber-200 group-hover:text-amber-100 transition-colors">
                    {item.arabic}
                  </p>
                  <h3 className="text-sm font-display font-bold text-white">
                    {item.transliteration}
                  </h3>
                  <p className="text-xs text-amber-400/90 font-medium">
                    "{item.meaning}"
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-300 leading-relaxed">
                {item.explanation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hadiths View */}
      {activeTab === 'hadith' && (
        <div className="space-y-4">
          {NAWAWI_HADITHS.map((h) => (
            <div
              key={h.number}
              className="p-6 rounded-3xl bg-[#0E1424] border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300 font-display">
                    Hadith #{h.number} of An-Nawawi
                  </span>
                  <span className="text-xs text-slate-400">• {h.title}</span>
                </div>
                <button
                  onClick={() => handleCopy(`Hadith #${h.number}: "${h.english}"\nLesson: ${h.lesson}`, `hadith-${h.number}`)}
                  className="text-slate-500 hover:text-white p-1"
                >
                  {copiedKey === `hadith-${h.number}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="text-right py-1">
                <p className="font-arabic text-lg text-amber-200" dir="rtl">
                  {h.arabicExcerpt}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  "{h.english}"
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-950/15 border border-amber-500/20 text-xs text-amber-200/90">
                <strong>Core Spiritual Lesson: </strong> {h.lesson}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
