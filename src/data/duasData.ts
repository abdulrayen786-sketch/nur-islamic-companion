import { DuaItem } from '../types';

const QURAN_AUDIO_BASE_URL = 'https://everyayah.com/data/Alafasy_128kbps';
const QURAN_NETWORK_AUDIO_BASE_URL = 'https://cdn.islamic.network/quran/audio/128/ar.alafasy';

const DUAS_COLLECTION_SOURCE: Omit<DuaItem, 'audioUrl'>[] = [
  {
    id: "dua-morning-1",
    category: "Morning",
    title: "Morning Affirmation of Faith",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Asbahna wa-asbahal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer.",
    translation: "We have entered the morning and kingdom belongs to Allah, and all praise is to Allah. None has the right to be worshipped except Allah alone, without partner. To Him belongs the dominion and to Him is the praise, and He has power over all things.",
    reference: "Sahih Muslim 2723",
    benefits: "Recited every morning for divine protection and blessing in one's day."
  },
  {
    id: "dua-morning-2",
    category: "Morning",
    title: "Sayyid al-Istighfar (The Master of Forgiveness)",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration: "Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata't, a'udhu bika min sharri ma sana't, abu'u laka bini'matika 'alayya, wa abu'u bidhanbi faghfir li fa-innahu la yaghfirudh-dhunuba illa Ant.",
    translation: "O Allah, You are my Lord; there is no deity except You. You created me and I am Your servant, and I uphold Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me, and I acknowledge my sin, so forgive me, for none forgives sins except You.",
    reference: "Sahih al-Bukhari 6306",
    benefits: "Whoever recites it during the day with conviction and dies that day before evening will be among the people of Paradise."
  },
  {
    id: "dua-evening-1",
    category: "Evening",
    title: "Evening Refuge from All Harm",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Amsayna wa-amsal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer.",
    translation: "We have reached the evening and the kingdom belongs to Allah, and all praise is to Allah. None has the right to be worshipped except Allah alone, without partner. To Him belongs the dominion and to Him is the praise, and He is over all things capable.",
    reference: "Sahih Muslim 2723",
    benefits: "Grants serenity and protection from the evils of the night."
  },
  {
    id: "dua-protection-1",
    category: "Protection",
    title: "Protection with the Name of Allah (3 Times)",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahi-lladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Sami'ul-'Alim.",
    translation: "In the name of Allah, with whose name nothing on earth or in the sky can cause harm, and He is the All-Hearing, the All-Knowing.",
    reference: "Sunan Abi Dawud 5088, Sunan at-Tirmidhi 3388 (Sahih)",
    benefits: "Nothing shall harm the servant who recites this thrice in the morning and thrice in the evening."
  },
  {
    id: "dua-protection-2",
    category: "Protection",
    title: "Refuge in the Perfect Words of Allah",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq.",
    translation: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    reference: "Sahih Muslim 2709",
    benefits: "No harm or sting of poisonous creature will afflict you."
  },
  {
    id: "dua-after-prayer-1",
    category: "After Prayer",
    title: "Supplication for Peace and Perfection",
    arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    transliteration: "Allahumma Antas-Salamu wa minkas-salam, tabarakta ya Dhal-Jalali wal-Ikram.",
    translation: "O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of Majesty and Honor.",
    reference: "Sahih Muslim 591",
    benefits: "Recited immediately after the concluding salam of the obligatory prayer."
  },
  {
    id: "dua-after-prayer-2",
    category: "After Prayer",
    title: "Seeking Assistance in Worship",
    arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ",
    transliteration: "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik.",
    translation: "O Allah, assist me in remembering You, thanking You, and worshipping You with excellence.",
    reference: "Sunan Abi Dawud 1522, Sunan an-Nasa'i 1303 (Sahih)",
    benefits: "Taught by the Prophet ﷺ to Mu'adh ibn Jabal (RA) to never leave after any prayer."
  },
  {
    id: "dua-sleep-1",
    category: "Before Sleep",
    title: "Dua Before Sleeping",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amootu wa ahya.",
    translation: "In Your name, O Allah, I die and I live.",
    reference: "Sahih al-Bukhari 6324",
    benefits: "Entrusting one's soul into Allah's care during the state of sleep."
  },
  {
    id: "dua-sleep-2",
    category: "Before Sleep",
    title: "Dua Upon Waking Up",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushoor.",
    translation: "All praise is for Allah who gave us life after having given us death, and unto Him is the resurrection.",
    reference: "Sahih al-Bukhari 6312",
    benefits: "Gratitude for being granted another day of life to worship and do good."
  },
  {
    id: "dua-travel-1",
    category: "Travel",
    title: "Supplication for Journey & Riding a Vehicle",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ",
    transliteration: "Subhanal-ladhi sakh-khara lana hadha wa ma kunna lahu muqrineen, wa inna ila Rabbina lamunqaliboon.",
    translation: "Glory to Him who has brought this under our control, though we were not able to subjugate it ourselves. And indeed, to our Lord we will surely return.",
    reference: "Surah Az-Zukhruf (43:13-14) / Sahih Muslim 1342",
    benefits: "Protects the traveler and reminds of the journey to the Hereafter."
  },
  {
    id: "dua-gratitude-1",
    category: "Gratitude",
    title: "Gratitude for Parents and Upbringing",
    arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَدْخِلْنِي بِرَحْمَتِكَ فِي عِبَادِكَ الصَّالِحِينَ",
    transliteration: "Rabbi awzi'ni an ashkura ni'matakal-lati an'amta 'alayya wa 'ala walidayya wa an a'mala salihan tardahu wa adkhilni birahmatika fee 'ibadikas-saliheen.",
    translation: "My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents and to do righteousness of which You approve. And admit me by Your mercy into the ranks of Your righteous servants.",
    reference: "Surah An-Naml (27:19)",
    benefits: "The Qur'anic dua of Prophet Sulaiman (AS) for lifelong gratitude."
  },
  {
    id: "dua-forgiveness-1",
    category: "Forgiveness",
    title: "Dua of Prophet Yunus (AS) in Distress",
    arabic: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa Anta subhanaka inni kuntu minaz-zalimeen.",
    translation: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    reference: "Surah Al-Anbiya (21:87) / Jami' at-Tirmidhi 3505",
    benefits: "No Muslim supplicates with this in any situation except that Allah relieves their distress."
  },
  {
    id: "dua-distress-1",
    category: "Distress",
    title: "Relief from Anxiety, Sorrow, and Debt",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan, wal-'ajzi wal-kasal, wal-bukhli wal-jubn, wa dala'id-dayni wa ghalabatir-rijal.",
    translation: "O Allah, I seek refuge in You from grief and sorrow, from inability and laziness, from stinginess and cowardice, and from the burden of debt and the oppression of men.",
    reference: "Sahih al-Bukhari 2893",
    benefits: "Lifts the heaviest burdens of worry, sorrow, and financial hardship."
  },
  {
    id: "dua-ramadan-1",
    category: "Ramadan",
    title: "Dua Upon Breaking Fast (Iftar)",
    arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ",
    transliteration: "Dhahabadh-dhama'u wabtallatil-'urooqu wa thabatal-ajru in sha Allah.",
    translation: "The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills.",
    reference: "Sunan Abi Dawud 2357 (Hasan)",
    benefits: "Recited at the blessed moment of Iftar when supplications are answered."
  },
  {
    id: "dua-ramadan-2",
    category: "Ramadan",
    title: "Dua for Laylat al-Qadr (The Night of Decree)",
    arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    transliteration: "Allahumma innaka 'Afuwwun tuhibbul-'afwa fa'fu 'anni.",
    translation: "O Allah, You are Most Forgiving, and You love forgiveness; so forgive me.",
    reference: "Jami' at-Tirmidhi 3513, Sunan Ibn Majah 3850 (Sahih)",
    benefits: "Taught by Prophet Muhammad ﷺ to Aisha (RA) for the last ten nights of Ramadan."
  }
];

export const DUAS_COLLECTION: DuaItem[] = DUAS_COLLECTION_SOURCE.map((dua) => ({
  ...dua,
  audioUrl: dua.id === 'dua-travel-1'
    ? `${QURAN_AUDIO_BASE_URL}/043013.mp3`
    : dua.id === 'dua-gratitude-1'
      ? `${QURAN_AUDIO_BASE_URL}/027019.mp3`
      : dua.id === 'dua-forgiveness-1'
        ? `${QURAN_AUDIO_BASE_URL}/021087.mp3`
        : '',
  audioFallbackUrl: dua.id === 'dua-travel-1'
    ? `${QURAN_NETWORK_AUDIO_BASE_URL}/6224.mp3`
    : dua.id === 'dua-gratitude-1'
      ? `${QURAN_NETWORK_AUDIO_BASE_URL}/3544.mp3`
      : dua.id === 'dua-forgiveness-1'
        ? `${QURAN_NETWORK_AUDIO_BASE_URL}/3367.mp3`
        : '',
}));
