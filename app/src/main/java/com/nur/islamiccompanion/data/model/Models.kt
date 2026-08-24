package com.nur.islamiccompanion.data.model

data class Surah(
    val number: Int,
    val nameArabic: String,
    val nameTransliteration: String,
    val nameEnglish: String,
    val totalVerses: Int,
    val revelationType: RevelationType,
    val startJuz: Int,
    val pageNumber: Int
)

enum class RevelationType {
    MECCAN, MEDINAN
}

data class Juz(
    val number: Int,
    val nameArabic: String,
    val nameEnglish: String,
    val startSurah: Int,
    val startAyah: Int,
    val endSurah: Int,
    val endAyah: Int
)

data class Ayah(
    val numberInSurah: Int,
    val overallNumber: Int,
    val arabicText: String,
    val translation: String,
    val transliteration: String = "",
    val surahNumber: Int,
    val juz: Int,
    val page: Int,
    val audioUrl: String? = null,
    val isSajda: Boolean = false
)

data class QuranBookmark(
    val id: String,
    val surahNumber: Int,
    val surahName: String,
    val ayahNumber: Int,
    val arabicSnippet: String,
    val translationSnippet: String,
    val timestamp: Long = System.currentTimeMillis(),
    val isFavorite: Boolean = false
)

data class QuranNote(
    val id: String,
    val surahNumber: Int,
    val surahName: String,
    val ayahNumber: Int,
    val noteText: String,
    val updatedAt: Long = System.currentTimeMillis()
)

data class ReadingProgress(
    val lastReadSurah: Int = 1,
    val lastReadAyah: Int = 1,
    val lastReadSurahName: String = "Al-Fatihah",
    val lastReadTimestamp: Long = System.currentTimeMillis(),
    val totalAyahsRead: Int = 0,
    val dailyGoalAyahs: Int = 10,
    val dailyCompletedAyahs: Int = 0
)

enum class PrayerName(val title: String, val arabic: String, val isObligatory: Boolean = true) {
    FAJR("Fajr", "الفجر", true),
    SUNRISE("Sunrise", "الشروق", false),
    DHUHR("Dhuhr", "الظهر", true),
    ASR("Asr", "العصر", true),
    SUNSET("Sunset", "الغروب", false),
    MAGHRIB("Maghrib", "المغرب", true),
    ISHA("Isha", "العشاء", true)
}

data class PrayerTime(
    val name: PrayerName,
    val timeFormatted: String,
    val timestamp: Long,
    val isPassed: Boolean = false,
    val isCurrent: Boolean = false,
    val isNext: Boolean = false,
    val isCompleted: Boolean = false
)

data class PrayerCalculationConfig(
    val cityName: String = "Makkah",
    val countryName: String = "Saudi Arabia",
    val latitude: Double = 21.422477,
    val longitude: Double = 39.826206,
    val timezoneId: String = "",
    val method: String = "MWL", // MWL, Egypt, Karachi, UmmAlQura, Dubai, Moonsighting, ISNA, Tehran
    val madhab: String = "Shafii", // Shafii (Standard), Hanafi
    val highLatitudeRule: String = "MiddleOfTheNight", // MiddleOfTheNight, OneSeventh, AngleBased
    val autoDetectLocation: Boolean = true
)

enum class DuaCategory(val displayName: String) {
    MORNING_EVENING("Morning & Evening"),
    DAILY_LIFE("Daily Life"),
    AFTER_PRAYER("After Prayer"),
    BEFORE_SLEEP("Before Sleep"),
    TRAVEL("Travel"),
    PROTECTION("Protection"),
    FORGIVENESS("Forgiveness"),
    GRATITUDE("Gratitude"),
    DISTRESS("Distress & Relief"),
    RAMADAN("Ramadan & Fasting")
}

data class Dua(
    val id: String,
    val title: String,
    val arabic: String,
    val transliteration: String,
    val translation: String,
    val reference: String,
    val category: DuaCategory,
    val benefits: String = "",
    val isFavorite: Boolean = false
) {
    val originalText: String
        get() = arabic
}

data class DhikrItem(
    val id: String,
    val title: String,
    val arabic: String,
    val transliteration: String,
    val translation: String,
    val targetCount: Int = 33,
    val currentCount: Int = 0,
    val reference: String = "",
    val completed: Boolean = false
) {
    val originalText: String
        get() = arabic
}

data class TasbihState(
    val currentDhikr: String = "SubhanAllah",
    val count: Int = 0,
    val target: Int = 33,
    val totalAllTime: Int = 0,
    val cycleCount: Int = 0
)

enum class TaskPriority {
    LOW, MEDIUM, HIGH
}

enum class TaskRepeat {
    ONCE, DAILY, WEEKDAYS, WEEKENDS, WEEKLY, MONTHLY
}

data class Task(
    val id: String,
    val name: String,
    val description: String = "",
    val category: String = "Spiritual",
    val priority: TaskPriority = TaskPriority.MEDIUM,
    val date: String = "",
    val time: String = "",
    val hasReminder: Boolean = false,
    val repeat: TaskRepeat = TaskRepeat.DAILY,
    val completed: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)

data class Reflection(
    val id: String,
    val date: String,
    val mood: String = "Peaceful",
    val prayerStatus: String = "5/5 Completed",
    val quranMinutes: Int = 15,
    val gratitudeNotes: List<String> = emptyList(),
    val improvementsTomorrow: List<String> = emptyList(),
    val journalText: String = "",
    val timestamp: Long = System.currentTimeMillis()
)

data class ArchiveItem(
    val id: String,
    val title: String,
    val category: String,
    val content: String,
    val arabicContent: String? = null,
    val tags: List<String> = emptyList(),
    val date: String = "",
    val timestamp: Long = System.currentTimeMillis()
)

data class RamadanState(
    val isActive: Boolean = true,
    val currentDay: Int = 14,
    val fastingStatusToday: String = "Fasting", // Fasting, Completed, Exempt
    val suhoorTime: String = "04:52 AM",
    val iftarTime: String = "06:45 PM",
    val quranJuzGoalForDay: Int = 14,
    val taraweehRakatsCompleted: Int = 8,
    val charityDonatedToday: Double = 10.0,
    val dailyCharityGoal: Double = 10.0,
    val ramadanNotes: String = "Seek Laylat al-Qadr in the last ten nights."
)

enum class MessageRole {
    USER, ASSISTANT
}

data class ChatMessage(
    val id: String,
    val role: MessageRole,
    val text: String,
    val timestamp: Long = System.currentTimeMillis(),
    val verifiedReference: String? = null
)

data class AiMemoryItem(
    val id: String,
    val key: String,
    val value: String,
    val category: String = "Preferences",
    val timestamp: Long = System.currentTimeMillis()
)

data class UserSettings(
    val userName: String = "Servant of Allah",
    val appLanguage: String = "English",
    val aiLanguage: String = "English",
    val voiceLanguage: String = "English",
    val quranTranslationLanguage: String = "English",
    val preferredReciter: String = "Mishary Rashid Alafasy",
    val arabicFontSizeSp: Float = 24f,
    val translationFontSizeSp: Float = 16f,
    val enableVibration: Boolean = true,
    val enableSoundFeedback: Boolean = true,
    val enablePrayerNotifications: Boolean = true,
    val calculationMethod: String = "MWL",
    val madhab: String = "Shafii",
    val highLatitudeRule: String = "MiddleOfTheNight",
    val fajrAdhanEnabled: Boolean = true,
    val otherPrayersAdhanEnabled: Boolean = true,
    val fajrAlarmEnabled: Boolean = true,
    val dhuhrAlarmEnabled: Boolean = true,
    val asrAlarmEnabled: Boolean = true,
    val maghribAlarmEnabled: Boolean = true,
    val ishaAlarmEnabled: Boolean = true,
    val autoDetectLocation: Boolean = true,
    val customLatitude: Double = 0.0,
    val customLongitude: Double = 0.0,
    val cityName: String = "Current Location",
    val countryName: String = "",
    val timezoneId: String = "",
    val onboardingCompleted: Boolean = true
)
