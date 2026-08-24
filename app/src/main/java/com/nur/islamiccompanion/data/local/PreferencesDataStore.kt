package com.nur.islamiccompanion.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import com.nur.islamiccompanion.data.model.ReadingProgress
import com.nur.islamiccompanion.data.model.UserSettings
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "nur_user_prefs")

class PreferencesDataStore(private val context: Context) {

    private val KEY_USER_NAME = stringPreferencesKey("user_name")
    private val KEY_APP_LANG = stringPreferencesKey("app_lang")
    private val KEY_AI_LANG = stringPreferencesKey("ai_lang")
    private val KEY_VOICE_LANG = stringPreferencesKey("voice_lang")
    private val KEY_QURAN_TRANSLATION_LANG = stringPreferencesKey("quran_translation_lang")
    private val KEY_RECITER = stringPreferencesKey("preferred_reciter")
    private val KEY_ARABIC_FONT_SIZE = floatPreferencesKey("arabic_font_size")
    private val KEY_TRANSLATION_FONT_SIZE = floatPreferencesKey("translation_font_size")
    private val KEY_ENABLE_VIBRATION = booleanPreferencesKey("enable_vibration")
    private val KEY_ENABLE_SOUND = booleanPreferencesKey("enable_sound")
    private val KEY_ENABLE_PRAYER_NOTIF = booleanPreferencesKey("enable_prayer_notif")
    private val KEY_CALC_METHOD = stringPreferencesKey("calc_method")
    private val KEY_MADHAB = stringPreferencesKey("madhab")
    private val KEY_HIGH_LAT_RULE = stringPreferencesKey("high_lat_rule")
    private val KEY_FAJR_ADHAN = booleanPreferencesKey("fajr_adhan_enabled")
    private val KEY_OTHER_ADHAN = booleanPreferencesKey("other_adhan_enabled")
    private val KEY_FAJR_ALARM = booleanPreferencesKey("fajr_alarm_enabled")
    private val KEY_DHUHR_ALARM = booleanPreferencesKey("dhuhr_alarm_enabled")
    private val KEY_ASR_ALARM = booleanPreferencesKey("asr_alarm_enabled")
    private val KEY_MAGHRIB_ALARM = booleanPreferencesKey("maghrib_alarm_enabled")
    private val KEY_ISHA_ALARM = booleanPreferencesKey("isha_alarm_enabled")
    private val KEY_AUTO_LOCATION = booleanPreferencesKey("auto_location")
    private val KEY_CUSTOM_LAT = doublePreferencesKey("custom_lat")
    private val KEY_CUSTOM_LNG = doublePreferencesKey("custom_lng")
    private val KEY_CITY_NAME = stringPreferencesKey("city_name")
    private val KEY_COUNTRY_NAME = stringPreferencesKey("country_name")
    private val KEY_TIMEZONE_ID = stringPreferencesKey("timezone_id")
    private val KEY_ONBOARDING_DONE = booleanPreferencesKey("onboarding_done")

    // Reading Progress keys
    private val KEY_LAST_SURAH = intPreferencesKey("last_surah")
    private val KEY_LAST_AYAH = intPreferencesKey("last_ayah")
    private val KEY_LAST_SURAH_NAME = stringPreferencesKey("last_surah_name")
    private val KEY_LAST_TIMESTAMP = longPreferencesKey("last_timestamp")
    private val KEY_TOTAL_AYAHS_READ = intPreferencesKey("total_ayahs_read")
    private val KEY_DAILY_GOAL = intPreferencesKey("daily_goal_ayahs")
    private val KEY_DAILY_COMPLETED = intPreferencesKey("daily_completed_ayahs")

    val userSettingsFlow: Flow<UserSettings> = context.dataStore.data.map { prefs ->
        UserSettings(
            userName = prefs[KEY_USER_NAME] ?: "Servant of Allah",
            appLanguage = prefs[KEY_APP_LANG] ?: "English",
            aiLanguage = prefs[KEY_AI_LANG] ?: "English",
            voiceLanguage = prefs[KEY_VOICE_LANG] ?: "English",
            quranTranslationLanguage = prefs[KEY_QURAN_TRANSLATION_LANG] ?: "English",
            preferredReciter = prefs[KEY_RECITER] ?: "Mishary Rashid Alafasy",
            arabicFontSizeSp = prefs[KEY_ARABIC_FONT_SIZE] ?: 24f,
            translationFontSizeSp = prefs[KEY_TRANSLATION_FONT_SIZE] ?: 16f,
            enableVibration = prefs[KEY_ENABLE_VIBRATION] ?: true,
            enableSoundFeedback = prefs[KEY_ENABLE_SOUND] ?: true,
            enablePrayerNotifications = prefs[KEY_ENABLE_PRAYER_NOTIF] ?: true,
            calculationMethod = prefs[KEY_CALC_METHOD] ?: "MWL",
            madhab = prefs[KEY_MADHAB] ?: "Shafii",
            highLatitudeRule = prefs[KEY_HIGH_LAT_RULE] ?: "MiddleOfTheNight",
            fajrAdhanEnabled = prefs[KEY_FAJR_ADHAN] ?: true,
            otherPrayersAdhanEnabled = prefs[KEY_OTHER_ADHAN] ?: true,
            fajrAlarmEnabled = prefs[KEY_FAJR_ALARM] ?: true,
            dhuhrAlarmEnabled = prefs[KEY_DHUHR_ALARM] ?: true,
            asrAlarmEnabled = prefs[KEY_ASR_ALARM] ?: true,
            maghribAlarmEnabled = prefs[KEY_MAGHRIB_ALARM] ?: true,
            ishaAlarmEnabled = prefs[KEY_ISHA_ALARM] ?: true,
            autoDetectLocation = prefs[KEY_AUTO_LOCATION] ?: true,
            customLatitude = prefs[KEY_CUSTOM_LAT] ?: 0.0,
            customLongitude = prefs[KEY_CUSTOM_LNG] ?: 0.0,
            cityName = prefs[KEY_CITY_NAME] ?: "Current Location",
            countryName = prefs[KEY_COUNTRY_NAME] ?: "Saudi Arabia",
            timezoneId = prefs[KEY_TIMEZONE_ID] ?: "",
            onboardingCompleted = prefs[KEY_ONBOARDING_DONE] ?: false
        )
    }

    val readingProgressFlow: Flow<ReadingProgress> = context.dataStore.data.map { prefs ->
        ReadingProgress(
            lastReadSurah = prefs[KEY_LAST_SURAH] ?: 1,
            lastReadAyah = prefs[KEY_LAST_AYAH] ?: 1,
            lastReadSurahName = prefs[KEY_LAST_SURAH_NAME] ?: "Al-Fatihah",
            lastReadTimestamp = prefs[KEY_LAST_TIMESTAMP] ?: System.currentTimeMillis(),
            totalAyahsRead = prefs[KEY_TOTAL_AYAHS_READ] ?: 0,
            dailyGoalAyahs = prefs[KEY_DAILY_GOAL] ?: 10,
            dailyCompletedAyahs = prefs[KEY_DAILY_COMPLETED] ?: 0
        )
    }

    suspend fun saveReadingProgress(surah: Int, ayah: Int, surahName: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_LAST_SURAH] = surah
            prefs[KEY_LAST_AYAH] = ayah
            prefs[KEY_LAST_SURAH_NAME] = surahName
            prefs[KEY_LAST_TIMESTAMP] = System.currentTimeMillis()
            val currentTotal = prefs[KEY_TOTAL_AYAHS_READ] ?: 0
            prefs[KEY_TOTAL_AYAHS_READ] = currentTotal + 1
            val currentDaily = prefs[KEY_DAILY_COMPLETED] ?: 0
            prefs[KEY_DAILY_COMPLETED] = currentDaily + 1
        }
    }

    suspend fun updateSettings(settings: UserSettings) {
        context.dataStore.edit { prefs ->
            prefs[KEY_USER_NAME] = settings.userName
            prefs[KEY_APP_LANG] = settings.appLanguage
            prefs[KEY_AI_LANG] = settings.aiLanguage
            prefs[KEY_VOICE_LANG] = settings.voiceLanguage
            prefs[KEY_QURAN_TRANSLATION_LANG] = settings.quranTranslationLanguage
            prefs[KEY_RECITER] = settings.preferredReciter
            prefs[KEY_ARABIC_FONT_SIZE] = settings.arabicFontSizeSp
            prefs[KEY_TRANSLATION_FONT_SIZE] = settings.translationFontSizeSp
            prefs[KEY_ENABLE_VIBRATION] = settings.enableVibration
            prefs[KEY_ENABLE_SOUND] = settings.enableSoundFeedback
            prefs[KEY_ENABLE_PRAYER_NOTIF] = settings.enablePrayerNotifications
            prefs[KEY_CALC_METHOD] = settings.calculationMethod
            prefs[KEY_MADHAB] = settings.madhab
            prefs[KEY_HIGH_LAT_RULE] = settings.highLatitudeRule
            prefs[KEY_FAJR_ADHAN] = settings.fajrAdhanEnabled
            prefs[KEY_OTHER_ADHAN] = settings.otherPrayersAdhanEnabled
            prefs[KEY_FAJR_ALARM] = settings.fajrAlarmEnabled
            prefs[KEY_DHUHR_ALARM] = settings.dhuhrAlarmEnabled
            prefs[KEY_ASR_ALARM] = settings.asrAlarmEnabled
            prefs[KEY_MAGHRIB_ALARM] = settings.maghribAlarmEnabled
            prefs[KEY_ISHA_ALARM] = settings.ishaAlarmEnabled
            prefs[KEY_AUTO_LOCATION] = settings.autoDetectLocation
            prefs[KEY_CUSTOM_LAT] = settings.customLatitude
            prefs[KEY_CUSTOM_LNG] = settings.customLongitude
            prefs[KEY_CITY_NAME] = settings.cityName
            prefs[KEY_COUNTRY_NAME] = settings.countryName
            prefs[KEY_TIMEZONE_ID] = settings.timezoneId
            prefs[KEY_ONBOARDING_DONE] = settings.onboardingCompleted
        }
    }
}
