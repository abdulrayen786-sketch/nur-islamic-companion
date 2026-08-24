package com.nur.islamiccompanion.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.nur.islamiccompanion.data.local.NurDatabase
import com.nur.islamiccompanion.data.local.PreferencesDataStore
import com.nur.islamiccompanion.data.model.*
import com.nur.islamiccompanion.data.repository.*
import com.nur.islamiccompanion.service.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.Date
import java.util.UUID

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val db = NurDatabase.getDatabase(application)
    val prefs = PreferencesDataStore(application)

    val quranRepo = QuranRepository()
    val prayerRepo = PrayerRepository()
    val duaRepo = DuaRepository()
    val adhkarRepo = AdhkarRepository()
    val taskRepo = TaskRepository(db)
    val reflectionRepo = ReflectionRepository(db)
    val archiveRepo = ArchiveRepository(db)
    val aiRepo = AiRepository()

    // Dedicated Services
    val locationService = LocationService(application)
    val prayerTimeService = PrayerTimeService()
    val qiblaService = QiblaService(application)
    val audioService = AudioService(application)
    val adhanService = AdhanService(application)

    // Preferences and settings
    val userSettings: StateFlow<UserSettings> = prefs.userSettingsFlow
        .stateIn(viewModelScope, SharingStarted.Eagerly, UserSettings())

    val readingProgress: StateFlow<ReadingProgress> = prefs.readingProgressFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), ReadingProgress())

    // Location state
    val locationData: StateFlow<UserLocationData> = locationService.locationFlow

    // Compass state
    val compassState: StateFlow<QiblaCompassState> = qiblaService.compassState

    // Audio status state
    val audioStatus: StateFlow<AudioStatus> = audioService.audioStatus

    // Prayer times state (evaluated list of 7 prayer times for today)
    private val _prayerTimes = MutableStateFlow<List<PrayerTime>>(emptyList())
    val prayerTimes: StateFlow<List<PrayerTime>> = _prayerTimes.asStateFlow()

    private val _daySchedule = MutableStateFlow<DayPrayerSchedule?>(null)
    val daySchedule: StateFlow<DayPrayerSchedule?> = _daySchedule.asStateFlow()

    private val _nextPrayer = MutableStateFlow<PrayerTime?>(null)
    val nextPrayer: StateFlow<PrayerTime?> = _nextPrayer.asStateFlow()

    private val _currentPrayer = MutableStateFlow<PrayerTime?>(null)
    val currentPrayer: StateFlow<PrayerTime?> = _currentPrayer.asStateFlow()

    // Active Surah Ayahs in reader
    private val _currentAyahs = MutableStateFlow<List<Ayah>>(emptyList())
    val currentAyahs: StateFlow<List<Ayah>> = _currentAyahs.asStateFlow()

    private val _isLoadingAyahs = MutableStateFlow(false)
    val isLoadingAyahs: StateFlow<Boolean> = _isLoadingAyahs.asStateFlow()

    // Tasks list
    val tasks: StateFlow<List<Task>> = taskRepo.allTasksFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // AI Messages
    private val _chatMessages = MutableStateFlow<List<ChatMessage>>(
        listOf(
            ChatMessage(
                id = "welcome",
                role = MessageRole.ASSISTANT,
                text = "Assalamu Alaikum. How can I help you today on your spiritual journey with the Qur'an, Salah, Duas, or daily reflection?"
            )
        )
    )
    val chatMessages: StateFlow<List<ChatMessage>> = _chatMessages.asStateFlow()

    // Tasbih state
    private val _tasbihState = MutableStateFlow(TasbihState())
    val tasbihState: StateFlow<TasbihState> = _tasbihState.asStateFlow()

    init {
        // Automatically observe settings changes to recalculate prayer times & reschedule adhan alarms
        viewModelScope.launch {
            combine(userSettings, locationData) { settings, loc ->
                Pair(settings, loc)
            }.collect { (settings, loc) ->
                val activeLat = if (settings.autoDetectLocation && loc.isAutoDetected) loc.latitude else settings.customLatitude
                val activeLng = if (settings.autoDetectLocation && loc.isAutoDetected) loc.longitude else settings.customLongitude
                val activeCity = if (settings.autoDetectLocation && loc.isAutoDetected) loc.cityName else settings.cityName
                val activeCountry = if (settings.autoDetectLocation && loc.isAutoDetected) loc.countryName else settings.countryName

                // Qibla uses a live fix when automatic location is enabled.
                if (!settings.autoDetectLocation || loc.isAutoDetected) {
                    qiblaService.updateLocation(
                        activeLat,
                        activeLng,
                        if (settings.autoDetectLocation) loc.accuracyMeters else 0f,
                        if (settings.autoDetectLocation) loc.altitudeMeters else 0.0
                    )
                }

                // Recalculate Prayer Times
                val config = PrayerCalculationConfig(
                    cityName = activeCity,
                    countryName = activeCountry,
                    latitude = activeLat,
                    longitude = activeLng,
                    timezoneId = settings.timezoneId,
                    method = settings.calculationMethod,
                    madhab = settings.madhab,
                    highLatitudeRule = settings.highLatitudeRule,
                    autoDetectLocation = settings.autoDetectLocation
                )

                val todaySchedule = prayerTimeService.calculateDaySchedule(Date(), config)
                _daySchedule.value = todaySchedule
                _prayerTimes.value = todaySchedule.prayersList

                val tomorrowCal = java.util.Calendar.getInstance().apply { add(java.util.Calendar.DAY_OF_YEAR, 1) }
                val tomorrowSchedule = prayerTimeService.calculateDaySchedule(tomorrowCal.time, config)

                val (curr, nxt) = prayerTimeService.resolveNextPrayer(todaySchedule, tomorrowSchedule)
                _currentPrayer.value = curr
                _nextPrayer.value = nxt

                // Reschedule Adhan Alarms
                adhanService.rescheduleAlarms()
            }
        }

        // Try detecting location on startup
        refreshLocation()
    }

    fun refreshLocation() {
        viewModelScope.launch {
            val loc = locationService.fetchCurrentLocation()
            if (loc.isAutoDetected) {
                val current = userSettings.value
                updateSettings(
                    current.copy(
                        customLatitude = loc.latitude,
                        customLongitude = loc.longitude,
                        cityName = loc.cityName,
                        countryName = loc.countryName
                    )
                )
            }
        }
    }

    fun setCustomLocation(lat: Double, lng: Double, city: String, country: String) {
        viewModelScope.launch {
            locationService.setManualLocation(lat, lng, city, country)
            val current = userSettings.value
            updateSettings(
                current.copy(
                    autoDetectLocation = false,
                    customLatitude = lat,
                    customLongitude = lng,
                    cityName = city,
                    countryName = country
                )
            )
        }
    }

    /**
     * Reads ONLY original Arabic or Urdu text via TTS.
     * Never reads translations or descriptions.
     */
    fun speakOriginalText(originalText: String, languageCode: String = "ar", id: String = "item") {
        audioService.speakOriginalText(originalText, languageCode, id)
    }

    /**
     * Plays authentic verified Qur'an recitation (Mishary Rashid Alafasy).
     */
    fun playQuranRecitation(surahNumber: Int, ayahNumberInSurah: Int, overallAyahNumber: Int) {
        audioService.playQuranRecitation(surahNumber, ayahNumberInSurah, overallAyahNumber)
    }

    fun stopAudio() {
        audioService.stopAllAudio()
    }

    fun testArabicTts() {
        audioService.testArabicTts()
    }

    fun testUrduTts() {
        audioService.testUrduTts()
    }

    fun testAdhan(prayerName: PrayerName = PrayerName.FAJR) {
        adhanService.testAdhanNow(prayerName)
    }

    fun testAlarm(seconds: Int = 5) {
        adhanService.testAlarmInSeconds(seconds)
    }

    fun startQiblaCompass() {
        qiblaService.startListening()
        locationService.startLocationUpdates()
    }

    fun stopQiblaCompass() {
        qiblaService.stopListening()
        locationService.release()
    }

    fun loadSurah(surahNumber: Int, lang: String = "English") {
        viewModelScope.launch {
            _isLoadingAyahs.value = true
            val ayahs = quranRepo.getSurahAyahs(surahNumber, lang)
            _currentAyahs.value = ayahs
            _isLoadingAyahs.value = false
        }
    }

    fun saveProgress(surah: Int, ayah: Int, surahName: String) {
        viewModelScope.launch {
            prefs.saveReadingProgress(surah, ayah, surahName)
        }
    }

    fun incrementTasbih() {
        val current = _tasbihState.value
        val newCount = current.count + 1
        val isCycleCompleted = newCount >= current.target
        _tasbihState.value = current.copy(
            count = if (isCycleCompleted) 0 else newCount,
            totalAllTime = current.totalAllTime + 1,
            cycleCount = if (isCycleCompleted) current.cycleCount + 1 else current.cycleCount
        )
    }

    fun resetTasbih() {
        _tasbihState.value = _tasbihState.value.copy(count = 0)
    }

    fun setTasbihDhikr(dhikr: String, target: Int = 33) {
        _tasbihState.value = _tasbihState.value.copy(
            currentDhikr = dhikr,
            target = target,
            count = 0
        )
    }

    fun toggleTask(taskId: String, completed: Boolean) {
        viewModelScope.launch {
            taskRepo.toggleTaskCompleted(taskId, completed)
        }
    }

    fun addTask(name: String, category: String = "Spiritual", priority: TaskPriority = TaskPriority.MEDIUM) {
        viewModelScope.launch {
            val task = Task(
                id = UUID.randomUUID().toString(),
                name = name,
                category = category,
                priority = priority,
                completed = false
            )
            taskRepo.insertTask(task)
        }
    }

    fun sendAiMessage(prompt: String) {
        val userMsg = ChatMessage(
            id = UUID.randomUUID().toString(),
            role = MessageRole.USER,
            text = prompt
        )
        _chatMessages.value = _chatMessages.value + userMsg

        viewModelScope.launch {
            val reply = aiRepo.sendMessage(
                query = prompt,
                conversationHistory = _chatMessages.value,
                language = userSettings.value.aiLanguage
            )
            _chatMessages.value = _chatMessages.value + reply
        }
    }

    fun updateSettings(newSettings: UserSettings) {
        viewModelScope.launch {
            prefs.updateSettings(newSettings)
        }
    }

    override fun onCleared() {
        super.onCleared()
        audioService.release()
        qiblaService.stopListening()
        locationService.stopLocationUpdates()
    }
}
