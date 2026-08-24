package com.nur.islamiccompanion.data.repository

import com.nur.islamiccompanion.data.model.DhikrItem
import com.nur.islamiccompanion.data.model.Dua
import com.nur.islamiccompanion.data.model.DuaCategory

class DuaRepository {

    private val allDuas = listOf(
        Dua(
            id = "dua_waking_up",
            title = "Upon Waking Up",
            arabic = "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
            transliteration = "Alhamdu lillahil-lathee ahyana ba'da ma amatana wa-ilayhin-nushoor",
            translation = "All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.",
            reference = "Sahih al-Bukhari 6312",
            category = DuaCategory.DAILY_LIFE,
            benefits = "Expresses gratitude for the blessing of waking up to a new day of worship."
        ),
        Dua(
            id = "dua_sleeping",
            title = "Before Going to Sleep",
            arabic = "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
            transliteration = "Bismika Allahumma amootu wa-ahya",
            translation = "In Your Name, O Allah, I die and I live.",
            reference = "Sahih al-Bukhari 6324",
            category = DuaCategory.BEFORE_SLEEP,
            benefits = "Entrusts one's soul into Allah's care through the night."
        ),
        Dua(
            id = "dua_leaving_home",
            title = "When Leaving the House",
            arabic = "بِسْمِ اللَّهِ ، تَوَكَّلْتُ عَلَى اللَّهِ ، وَلا حَوْلَ وَلا قُوَّةَ إِلاَّ بِاللَّهِ",
            transliteration = "Bismillahi tawakkaltu 'alallahi wa la hawla wa la quwwata illa billah",
            translation = "In the Name of Allah, I place my trust in Allah, and there is no power nor might except with Allah.",
            reference = "Sunan Abi Dawud 5095",
            category = DuaCategory.PROTECTION,
            benefits = "Angel protection throughout the departure and journey."
        ),
        Dua(
            id = "dua_forgiveness_sayyid",
            title = "Sayyid al-Istighfar (Master Supplication for Forgiveness)",
            arabic = "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ ، خَلَقْتَنِي وَأَنَا عَبْدُكَ ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
            transliteration = "Allahumma anta Rabbi la ilaha illa anta, khalaqtanee wa-ana 'abduka, wa-ana 'ala 'ahdika wa-wa'dika mas-tata'tu...",
            translation = "O Allah, You are my Lord, none has the right to be worshipped but You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can.",
            reference = "Sahih al-Bukhari 6306",
            category = DuaCategory.FORGIVENESS,
            benefits = "Whoever recites it with firm faith during the day or night and dies will be among the people of Paradise."
        ),
        Dua(
            id = "dua_anxiety",
            title = "Dua for Relief from Distress & Anxiety",
            arabic = "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ ، وَالْعَجْزِ وَالْكَسَلِ ، وَالْبُخْلِ وَالْجُبْنِ",
            transliteration = "Allahumma innee a'oodhu bika minal-hammi wal-hazani, wal-'ajzi wal-kasali, wal-bukhli wal-jubn",
            translation = "O Allah, I seek refuge in You from grief and sadness, from weakness and laziness, and from stinginess and cowardice.",
            reference = "Sahih al-Bukhari 2893",
            category = DuaCategory.DISTRESS,
            benefits = "Dispels overwhelming sorrow and provides mental clarity and serenity."
        ),
        Dua(
            id = "dua_travel",
            title = "Dua for Boarding a Vehicle / Travel",
            arabic = "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ",
            transliteration = "Subhanallathee sakh-khara lana hatha wama kunna lahoo muqrineen, wa-inna ila Rabbina lamunqaliboon",
            translation = "Glory to Him who has brought this under our control, for we could never have done it by ourselves. And indeed, to our Lord we will surely return.",
            reference = "Surah Az-Zukhruf (43:13-14)",
            category = DuaCategory.TRAVEL,
            benefits = "Safeguards travelers and reminds one of the ultimate journey."
        ),
        Dua(
            id = "dua_fasting_iftar",
            title = "Dua upon Breaking the Fast (Iftar)",
            arabic = "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ",
            transliteration = "Dhahaba adh-dhama'u wabtallatil-'urooqu wa thabatal-ajru in sha Allah",
            translation = "The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.",
            reference = "Sunan Abi Dawud 2357",
            category = DuaCategory.RAMADAN,
            benefits = "Sunnah supplication to say when breaking one's fast."
        )
    )

    fun getAllDuas(): List<Dua> = allDuas

    fun getDuasByCategory(category: DuaCategory): List<Dua> {
        return allDuas.filter { it.category == category }
    }

    fun searchDuas(query: String): List<Dua> {
        val q = query.trim().lowercase()
        if (q.isEmpty()) return allDuas
        return allDuas.filter {
            it.title.lowercase().contains(q) ||
            it.translation.lowercase().contains(q) ||
            it.transliteration.lowercase().contains(q) ||
            it.reference.lowercase().contains(q)
        }
    }
}

class AdhkarRepository {

    fun getMorningAdhkar(): List<DhikrItem> = listOf(
        DhikrItem("m1", "Ayat al-Kursi", "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ", "Allahu la ilaha illa huwal-Hayyul-Qayyoom", "Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence.", 1, 0, "Surah Al-Baqarah 2:255"),
        DhikrItem("m2", "Tasbih, Tahmid, Takbir", "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", "Subhanallahi wa bihamdihi", "Glory is to Allah and praise is to Him.", 100, 0, "Sahih Muslim 2692"),
        DhikrItem("m3", "Protection from Harm", "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ", "Bismillahil-lathee la yadurru ma'as-mihi shay'un", "In the Name of Allah, with Whose Name nothing can cause harm.", 3, 0, "Sunan Abi Dawud 5088"),
        DhikrItem("m4", "Tawhid & Gratitude", "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", "La ilaha illallahu wahdahu la shareeka lah", "None has the right to be worshipped except Allah alone, without partner.", 10, 0, "Sahih al-Bukhari 3293")
    )

    fun getEveningAdhkar(): List<DhikrItem> = listOf(
        DhikrItem("e1", "Ayat al-Kursi", "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ", "Allahu la ilaha illa huwal-Hayyul-Qayyoom", "Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence.", 1, 0, "Surah Al-Baqarah 2:255"),
        DhikrItem("e2", "Evening Supplication", "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ", "Amsayna wa-amsal-mulku lillah", "We have reached the evening and the kingdom belongs to Allah.", 1, 0, "Sahih Muslim 2723"),
        DhikrItem("e3", "Seeking Refuge in Allah's Words", "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", "A'oodhu bikalimatil-lahit-tammati min sharri ma khalaq", "I seek refuge in the Perfect Words of Allah from the evil of what He has created.", 3, 0, "Sahih Muslim 2709"),
        DhikrItem("e4", "Istighfar", "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", "Astaghfirullaha wa-atoobu ilayh", "I seek the forgiveness of Allah and repent to Him.", 100, 0, "Sahih al-Bukhari 6307")
    )

    fun getAfterPrayerAdhkar(): List<DhikrItem> = listOf(
        DhikrItem("p1", "Astaghfirullah", "أَسْتَغْفِرُ اللَّهَ", "Astaghfirullah", "I ask Allah for forgiveness.", 3, 0, "Sahih Muslim 591"),
        DhikrItem("p2", "Allahumma Antas-Salam", "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ", "Allahumma Antas-Salamu wa minkas-salam", "O Allah, You are Peace and from You comes peace.", 1, 0, "Sahih Muslim 592"),
        DhikrItem("p3", "SubhanAllah", "سُبْحَانَ اللَّهِ", "SubhanAllah", "Glory be to Allah.", 33, 0, "Sahih Muslim 597"),
        DhikrItem("p4", "Alhamdulillah", "الْحَمْدُ لِلَّهِ", "Alhamdulillah", "Praise be to Allah.", 33, 0, "Sahih Muslim 597"),
        DhikrItem("p5", "Allahu Akbar", "اللَّهُ أَكْبَرُ", "Allahu Akbar", "Allah is the Greatest.", 33, 0, "Sahih Muslim 597")
    )
}
