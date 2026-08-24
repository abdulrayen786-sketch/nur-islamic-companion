export interface IslamicEvent {
  id: string;
  hijriDay: number;
  hijriMonth: number; // 1 to 12
  name: string;
  arabicName: string;
  description: string;
  significance: string;
  recommendedActions: string[];
}

export const HIJRI_MONTHS = [
  { number: 1, name: "Muharram", arabic: "مُحَرَّم", isSacred: true },
  { number: 2, name: "Safar", arabic: "صَفَر", isSacred: false },
  { number: 3, name: "Rabi' al-Awwal", arabic: "رَبِيع الأَوَّل", isSacred: false },
  { number: 4, name: "Rabi' al-Thani", arabic: "رَبِيع الآخِر", isSacred: false },
  { number: 5, name: "Jumada al-Awwal", arabic: "جُمَادَى الأُولَى", isSacred: false },
  { number: 6, name: "Jumada al-Thani", arabic: "جُمَادَى الآخِرَة", isSacred: false },
  { number: 7, name: "Rajab", arabic: "رَجَب", isSacred: true },
  { number: 8, name: "Sha'ban", arabic: "شَعْبَان", isSacred: false },
  { number: 9, name: "Ramadan", arabic: "رَمَضَان", isSacred: false },
  { number: 10, name: "Shawwal", arabic: "شَوَّال", isSacred: false },
  { number: 11, name: "Dhu al-Qi'dah", arabic: "ذُو القَعْدَة", isSacred: true },
  { number: 12, name: "Dhu al-Hijjah", arabic: "ذُو الحِجَّة", isSacred: true }
];

export const MAJOR_ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    id: "islamic-new-year",
    hijriDay: 1,
    hijriMonth: 1,
    name: "Islamic New Year (1st of Muharram)",
    arabicName: "رأس السنة الهجرية",
    description: "The beginning of the new Islamic Hijri year commemorating the Hijrah of the Prophet ﷺ from Makkah to Madinah.",
    significance: "Sacred month of Muharram where righteous deeds hold multiplied reward.",
    recommendedActions: ["Self-accounting and renewal of intentions", "Voluntary fasting", "Giving charity"]
  },
  {
    id: "day-of-ashura",
    hijriDay: 10,
    hijriMonth: 1,
    name: "Day of 'Ashura",
    arabicName: "يوم عاشوراء",
    description: "The day Allah saved Prophet Musa (AS) and Bani Isra'il from Pharaoh.",
    significance: "Fasting on this day expiates the minor sins of the preceding year.",
    recommendedActions: ["Fast the 10th of Muharram and preferably the 9th or 11th with it", "Generosity towards one's family"]
  },
  {
    id: "mawlid",
    hijriDay: 12,
    hijriMonth: 3,
    name: "Mawlid an-Nabi ﷺ",
    arabicName: "المولد النبوي الشريف",
    description: "Remembering the blessed birth and mercy of the Prophet Muhammad ﷺ.",
    significance: "Sent as a mercy to all the worlds (Rahman li'l-'Alameen).",
    recommendedActions: ["Abundant Salawat upon the Prophet ﷺ", "Studying the Seerah", "Charity and community feeding"]
  },
  {
    id: "isra-miraj",
    hijriDay: 27,
    hijriMonth: 7,
    name: "Al-Isra' wal-Mi'raj",
    arabicName: "الإسراء والمعراج",
    description: "The miraculous Night Journey and Heavenly Ascension where the 5 daily prayers were gifted to the Ummah.",
    significance: "A profound miracle of faith and intimacy with Allah.",
    recommendedActions: ["Reflecting upon the gift of Salah", "Tahajjud prayer", "Sending peace upon the Prophet ﷺ"]
  },
  {
    id: "mid-shaban",
    hijriDay: 15,
    hijriMonth: 8,
    name: "Nisf Sha'ban (Mid-Sha'ban)",
    arabicName: "ليلة النصف من شعبان",
    description: "A night of divine pardon and preparation for the approaching month of Ramadan.",
    significance: "Allah gazes upon His creation with immense forgiveness.",
    recommendedActions: ["Dua and seeking forgiveness", "Voluntary fasting during the White Days"]
  },
  {
    id: "ramadan-start",
    hijriDay: 1,
    hijriMonth: 9,
    name: "First Day of Ramadan",
    arabicName: "أول يوم من شهر رمضان المبارك",
    description: "The commencement of the holy month of fasting, Qur'an revelation, and divine mercy.",
    significance: "Gates of Paradise opened, gates of Hell closed, devils chained.",
    recommendedActions: ["Fasting with pure faith and expectation of reward", "Reciting the complete Qur'an", "Taraweeh prayers"]
  },
  {
    id: "laylat-al-qadr",
    hijriDay: 27,
    hijriMonth: 9,
    name: "Laylat al-Qadr (The Night of Decree)",
    arabicName: "ليلة القدر المباركة",
    description: "Better than a thousand months of worship. The night the Holy Qur'an was revealed from Al-Lawh al-Mahfuz.",
    significance: "Angels descend with peace until the emergence of dawn.",
    recommendedActions: ["Qiyam al-Layl (Night prayers)", "Reciting Dua: 'Allahumma innaka 'afuwwun...'", "I'tikaf"]
  },
  {
    id: "eid-al-fitr",
    hijriDay: 1,
    hijriMonth: 10,
    name: "Eid al-Fitr (Festival of Fast-Breaking)",
    arabicName: "عيد الفطر المبارك",
    description: "Joyful Islamic celebration concluding the blessed month of Ramadan.",
    significance: "Gratitude to Allah for enabling the completion of the fast.",
    recommendedActions: ["Payment of Zakat al-Fitr before prayer", "Eid prayer in congregation", "Spreading joy and family visits"]
  },
  {
    id: "day-of-arafah",
    hijriDay: 9,
    hijriMonth: 12,
    name: "Day of 'Arafah",
    arabicName: "يوم عرفة",
    description: "The pinnacle day of the Hajj pilgrimage where millions stand at the plain of 'Arafat.",
    significance: "Fasting on this day expiates sins of the past year and coming year for non-pilgrims.",
    recommendedActions: ["Fasting for non-pilgrims", "Abundant supplication and Tahleel (La ilaha illallah)", "Repentance"]
  },
  {
    id: "eid-al-adha",
    hijriDay: 10,
    hijriMonth: 12,
    name: "Eid al-Adha & Days of Tashreeq",
    arabicName: "عيد الأضحى المبارك وأيام التشريق",
    description: "Festival of the Sacrifice commemorating the devotion of Prophet Ibrahim (AS) and Ismail (AS).",
    significance: "Sacred days of remembrance, Takbeer, and Udhiyah/Qurbani.",
    recommendedActions: ["Eid prayer", "Sacrifice (Udhiyah)", "Takbeerat of Tashreeq after every fardh prayer"]
  }
];

/**
 * Calculates current approximate Hijri Date based on astronomical calculations
 */
export function getApproximateHijriDate(gregorianDate: Date = new Date()): {
  day: number;
  month: number;
  monthName: string;
  monthArabic: string;
  year: number;
  isWhiteDay: boolean;
  formattedHijri: string;
} {
  // Using astronomical julian day computation for reliable Hijri date
  const day = gregorianDate.getDate();
  const month = gregorianDate.getMonth();
  const year = gregorianDate.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

  const z = jd - 1948439.5;
  const hYear = Math.floor((30 * z + 10646) / 10631);
  const hMonth = Math.min(12, Math.ceil((z - 29 - Math.floor((10631 * hYear - 10646) / 30)) / 29.5));
  const hDay = Math.floor(z - Math.floor((10631 * hYear - 10646) / 30) - Math.floor((29.5 * (hMonth - 1)) + 0.5)) + 1;

  const safeMonthIdx = Math.max(0, Math.min(11, hMonth - 1));
  const monthObj = HIJRI_MONTHS[safeMonthIdx];

  const clampedDay = Math.max(1, Math.min(30, hDay));
  const isWhiteDay = clampedDay === 13 || clampedDay === 14 || clampedDay === 15;

  return {
    day: clampedDay,
    month: hMonth,
    monthName: monthObj.name,
    monthArabic: monthObj.arabic,
    year: hYear,
    isWhiteDay,
    formattedHijri: `${clampedDay} ${monthObj.name} ${hYear} AH`
  };
}
