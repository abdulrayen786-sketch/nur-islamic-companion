package com.nur.islamiccompanion.service

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Build
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

enum class AudioPlaybackState {
    IDLE,
    PLAYING_RECITATION,
    PLAYING_TTS,
    PAUSED,
    ERROR
}

data class AudioStatus(
    val state: AudioPlaybackState = AudioPlaybackState.IDLE,
    val currentSurah: Int = 0,
    val currentAyah: Int = 0,
    val playingDuaOrDhikrId: String? = null,
    val errorMessage: String? = null
)

class AudioService(private val context: Context) {

    val ttsService = IslamicTextToSpeechService(context)

    private var quranMediaPlayer: MediaPlayer? = null
    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private var audioFocusRequest: AudioFocusRequest? = null

    private val _audioStatus = MutableStateFlow(AudioStatus())
    val audioStatus: StateFlow<AudioStatus> = _audioStatus.asStateFlow()

    private val serviceScope = CoroutineScope(Dispatchers.Main)

    init {
        // Observe TTS state and sync with overall AudioStatus
        serviceScope.launch {
            ttsService.ttsState.collect { tts ->
                if (tts.isSpeaking) {
                    _audioStatus.value = AudioStatus(
                        state = AudioPlaybackState.PLAYING_TTS,
                        playingDuaOrDhikrId = tts.activeItemId,
                        errorMessage = null
                    )
                } else if (_audioStatus.value.state == AudioPlaybackState.PLAYING_TTS) {
                    _audioStatus.value = AudioStatus(
                        state = AudioPlaybackState.IDLE,
                        playingDuaOrDhikrId = null,
                        errorMessage = tts.errorMessage
                    )
                }
            }
        }
    }

    /**
     * Reads ONLY the original Arabic or Urdu text.
     * NEVER speaks translation, transliteration, or UI description.
     */
    fun speakOriginalText(
        originalText: String,
        languageCode: String = "ar",
        itemId: String = "dua_item",
        onVoiceUnavailable: (() -> Unit)? = null
    ) {
        stopQuranRecitation()
        ttsService.speakOriginalText(
            originalText = originalText,
            languageCode = languageCode,
            itemId = itemId,
            onVoiceUnavailable = onVoiceUnavailable
        )
    }

    /**
     * Plays authentic verified Qur'an recitation (Mishary Rashid Alafasy) streaming from trusted Qur'an CDN.
     * NEVER uses generic Text-to-Speech for Qur'an recitation.
     */
    fun playQuranRecitation(surahNumber: Int, ayahNumberInSurah: Int, overallAyahNumber: Int) {
        stopAllAudio()

        try {
            requestAudioFocus()

            // Islamic Network authentic Quran audio CDN with verified Mishary Rashid Alafasy recitations
            val audioUrl = "https://cdn.islamic.network/quran/audio/128/ar.alafasy/$overallAyahNumber.mp3"

            quranMediaPlayer = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .build()
                )
                setDataSource(audioUrl)
                setOnPreparedListener { mp ->
                    mp.start()
                    _audioStatus.value = AudioStatus(
                        state = AudioPlaybackState.PLAYING_RECITATION,
                        currentSurah = surahNumber,
                        currentAyah = ayahNumberInSurah
                    )
                }
                setOnCompletionListener {
                    stopAllAudio()
                }
                setOnErrorListener { _, _, _ ->
                    _audioStatus.value = AudioStatus(
                        state = AudioPlaybackState.ERROR,
                        errorMessage = "Unable to stream recitation audio. Please check internet connection."
                    )
                    true
                }
                prepareAsync()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            _audioStatus.value = AudioStatus(
                state = AudioPlaybackState.ERROR,
                errorMessage = "Failed to start recitation: ${e.localizedMessage}"
            )
        }
    }

    fun stopQuranRecitation() {
        try {
            quranMediaPlayer?.stop()
            quranMediaPlayer?.release()
            quranMediaPlayer = null
        } catch (e: Exception) {
            // Ignored
        }
    }

    fun stopAllAudio() {
        ttsService.stop()
        stopQuranRecitation()
        abandonAudioFocus()

        _audioStatus.value = AudioStatus(
            state = AudioPlaybackState.IDLE,
            currentSurah = 0,
            currentAyah = 0,
            playingDuaOrDhikrId = null
        )
    }

    fun testArabicTts() {
        ttsService.testArabicTts()
    }

    fun testUrduTts() {
        ttsService.testUrduTts()
    }

    private fun requestAudioFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            audioFocusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build()
                )
                .build()
            audioFocusRequest?.let { audioManager.requestAudioFocus(it) }
        } else {
            @Suppress("DEPRECATION")
            audioManager.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
        }
    }

    private fun abandonAudioFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            audioFocusRequest?.let { audioManager.abandonAudioFocusRequest(it) }
        } else {
            @Suppress("DEPRECATION")
            audioManager.abandonAudioFocus(null)
        }
    }

    fun release() {
        stopAllAudio()
        ttsService.release()
    }
}
