package com.nur.islamiccompanion.service

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Build
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.speech.tts.Voice
import android.util.Log
import android.widget.Toast
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.Locale

data class TtsPlaybackState(
    val isSpeaking: Boolean = false,
    val activeItemId: String? = null,
    val errorMessage: String? = null,
    val isInitialized: Boolean = false
)

/**
 * Centralized Islamic Text-To-Speech Service for NUR.
 *
 * Strictly speaks ONLY original sacred Arabic / Urdu texts (Duas, Dhikr).
 * NEVER translates, transliterates, or reads metadata or UI labels.
 */
class IslamicTextToSpeechService(private val context: Context) : TextToSpeech.OnInitListener {

    companion object {
        private const val TAG = "IslamicTTS"
    }

    private var textToSpeech: TextToSpeech? = null
    private var isTtsInitialized = false
    private var isInitializing = false
    private var pendingRequest: (() -> Unit)? = null

    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private var audioFocusRequest: AudioFocusRequest? = null

    private val _ttsState = MutableStateFlow(TtsPlaybackState())
    val ttsState: StateFlow<TtsPlaybackState> = _ttsState.asStateFlow()

    init {
        initialize()
    }

    /**
     * Initializes the Android TextToSpeech engine
     */
    fun initialize() {
        if (textToSpeech != null) return

        isInitializing = true
        Log.d(TAG, "Initializing Android TextToSpeech engine...")
        try {
            textToSpeech = TextToSpeech(context.applicationContext, this)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to instantiate TextToSpeech: ${e.message}", e)
            isInitializing = false
            val errorMessage = "Voice service could not be initialized."
            _ttsState.value = _ttsState.value.copy(
                isInitialized = false,
                errorMessage = errorMessage
            )
            Toast.makeText(context, errorMessage, Toast.LENGTH_LONG).show()
        }
    }

    override fun onInit(status: Int) {
        isInitializing = false
        if (status == TextToSpeech.SUCCESS) {
            isTtsInitialized = true
            Log.i(TAG, "TextToSpeech successfully initialized.")
            _ttsState.value = _ttsState.value.copy(isInitialized = true, errorMessage = null)

            // Configure Utterance listener to track lifecycle and stop states
            textToSpeech?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {
                    Log.d(TAG, "TTS onStart: $utteranceId")
                    _ttsState.value = _ttsState.value.copy(
                        isSpeaking = true,
                        activeItemId = utteranceId,
                        errorMessage = null
                    )
                }

                override fun onDone(utteranceId: String?) {
                    Log.d(TAG, "TTS onDone: $utteranceId")
                    abandonAudioFocus()
                    _ttsState.value = _ttsState.value.copy(
                        isSpeaking = false,
                        activeItemId = null
                    )
                }

                override fun onError(utteranceId: String?) {
                    Log.e(TAG, "TTS onError: $utteranceId")
                    abandonAudioFocus()
                    _ttsState.value = _ttsState.value.copy(
                        isSpeaking = false,
                        activeItemId = null,
                        errorMessage = "Error occurred during audio playback."
                    )
                }

                override fun onError(utteranceId: String?, errorCode: Int) {
                    Log.e(TAG, "TTS onError code $errorCode for: $utteranceId")
                    abandonAudioFocus()
                    _ttsState.value = _ttsState.value.copy(
                        isSpeaking = false,
                        activeItemId = null,
                        errorMessage = "Playback error code: $errorCode"
                    )
                }
            })

            // Execute any queued request that was received before initialization completed
            pendingRequest?.let {
                val action = it
                pendingRequest = null
                action.invoke()
            }
        } else {
            isTtsInitialized = false
            pendingRequest = null
            val errorMessage = "Voice service could not be initialized."
            Log.e(TAG, "$errorMessage Android status: $status")
            try {
                textToSpeech?.shutdown()
            } catch (e: Exception) {
                Log.w(TAG, "Could not shut down failed TTS engine: ${e.message}")
            }
            textToSpeech = null
            _ttsState.value = _ttsState.value.copy(
                isInitialized = false,
                errorMessage = errorMessage
            )
            Toast.makeText(context, errorMessage, Toast.LENGTH_LONG).show()
        }
    }

    /**
     * Speaks ONLY the original Islamic text (Arabic or Urdu).
     * Strictly verifies and sets the appropriate language voice.
     * NEVER reads translations, transliterations, or UI text.
     */
    fun speakOriginalText(
        originalText: String,
        languageCode: String = "ar",
        itemId: String = "dua_item",
        onVoiceUnavailable: (() -> Unit)? = null
    ) {
        // Validate original text is not empty or blank
        val cleanText = originalText.trim()
        if (cleanText.isBlank()) {
            val msg = "Original text is unavailable."
            Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
            Log.w(TAG, "speakOriginalText called with empty text.")
            return
        }

        // If currently initializing, queue this request
        if (!isTtsInitialized) {
            if (isInitializing) {
                Log.d(TAG, "TTS is currently initializing. Queuing request for $itemId...")
                pendingRequest = {
                    speakOriginalText(cleanText, languageCode, itemId, onVoiceUnavailable)
                }
                Toast.makeText(context, "Voice engine initializing...", Toast.LENGTH_SHORT).show()
                return
            } else {
                // Re-attempt init
                initialize()
                pendingRequest = {
                    speakOriginalText(cleanText, languageCode, itemId, onVoiceUnavailable)
                }
                val errorMessage = "Voice service could not be initialized."
                Toast.makeText(context, errorMessage, Toast.LENGTH_SHORT).show()
                onVoiceUnavailable?.invoke()
                return
            }
        }

        // Prevent overlapping voices - always stop previous speech first
        stop()

        val tts = textToSpeech ?: return

        // Resolve Target Locale for sacred text
        val targetLocale = when (languageCode.lowercase().trim()) {
            "ur", "urdu" -> Locale("ur", "PK")
            else -> Locale("ar", "SA")
        }

        val fallbackLocale = when (languageCode.lowercase().trim()) {
            "ur", "urdu" -> Locale("ur")
            else -> Locale("ar")
        }

        // Check language availability
        var selectedLocale: Locale? = null
        val primaryResult = tts.isLanguageAvailable(targetLocale)
        Log.d(TAG, "Language = ${targetLocale.language}; availability = $primaryResult")

        if (isLocaleSupported(primaryResult)) {
            selectedLocale = targetLocale
        } else {
            val fallbackResult = tts.isLanguageAvailable(fallbackLocale)
            Log.d(TAG, "Language = ${fallbackLocale.language}; availability = $fallbackResult")
            if (isLocaleSupported(fallbackResult)) {
                selectedLocale = fallbackLocale
            } else {
                // Also check Egypt / UAE locales for Arabic
                if (languageCode.lowercase().startsWith("ar")) {
                    val egLocale = Locale("ar", "EG")
                    if (isLocaleSupported(tts.isLanguageAvailable(egLocale))) {
                        selectedLocale = egLocale
                    }
                }
            }
        }

        if (selectedLocale == null) {
            val languageDataMissing = primaryResult == TextToSpeech.LANG_MISSING_DATA ||
                    primaryResult == TextToSpeech.LANG_NOT_SUPPORTED ||
                    tts.isLanguageAvailable(fallbackLocale) == TextToSpeech.LANG_MISSING_DATA
            val errorMsg = if (languageDataMissing) {
                "Arabic/Urdu voice is not installed on this device. Please install the required Android TTS language data."
            } else {
                "Arabic/Urdu voice is not installed on this device."
            }
            Log.e(TAG, errorMsg)
            Toast.makeText(context, errorMsg, Toast.LENGTH_LONG).show()
            onVoiceUnavailable?.invoke()
            _ttsState.value = _ttsState.value.copy(
                isSpeaking = false,
                errorMessage = errorMsg
            )
            // STRICT RELIGIOUS REQUIREMENT: NEVER fall back to reading the translation!
            return
        }

        try {
            tts.language = selectedLocale
            // Match voice if possible
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                try {
                    val matchingVoice = tts.voices?.firstOrNull { voice ->
                        voice.locale.language == selectedLocale.language && !voice.isNetworkConnectionRequired
                    } ?: tts.voices?.firstOrNull { voice ->
                        voice.locale.language == selectedLocale.language
                    }
                    if (matchingVoice != null) {
                        tts.voice = matchingVoice
                        Log.d(TAG, "Selected voice: ${matchingVoice.name}")
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "Could not set custom voice: ${e.message}")
                }
            }

            // Adjust speech rate slightly for clear, respectful Tajweed pace
            tts.setSpeechRate(0.88f)
            tts.setPitch(1.0f)

            // Request Audio Focus
            requestAudioFocus()
            if (audioManager.getStreamVolume(AudioManager.STREAM_MUSIC) == 0) {
                Log.w(TAG, "Device media/TTS volume is zero")
                Toast.makeText(context, "Device media volume is muted.", Toast.LENGTH_SHORT).show()
            }

            Log.i(TAG, "Speaking original Islamic text; language=$selectedLocale; text length=${cleanText.length}")
            val speakResult = tts.speak(cleanText, TextToSpeech.QUEUE_FLUSH, null, itemId)
            if (speakResult != TextToSpeech.SUCCESS) {
                Log.e(TAG, "tts.speak returned error code: $speakResult")
                abandonAudioFocus()
                _ttsState.value = _ttsState.value.copy(
                    isSpeaking = false,
                    errorMessage = "Failed to start speech synthesis (Code: $speakResult)"
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception during speakOriginalText: ${e.message}", e)
            abandonAudioFocus()
            _ttsState.value = _ttsState.value.copy(
                isSpeaking = false,
                errorMessage = e.localizedMessage
            )
        }
    }

    private fun isLocaleSupported(result: Int): Boolean {
        return result == TextToSpeech.LANG_AVAILABLE ||
                result == TextToSpeech.LANG_COUNTRY_AVAILABLE ||
                result == TextToSpeech.LANG_COUNTRY_VAR_AVAILABLE
    }

    /**
     * Immediately stops active speech and releases audio focus
     */
    fun stop() {
        try {
            if (textToSpeech?.isSpeaking == true) {
                textToSpeech?.stop()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping TTS: ${e.message}")
        } finally {
            abandonAudioFocus()
            _ttsState.value = _ttsState.value.copy(
                isSpeaking = false,
                activeItemId = null
            )
        }
    }

    /**
     * Checks if TTS is currently speaking
     */
    fun isSpeaking(): Boolean {
        return _ttsState.value.isSpeaking || (textToSpeech?.isSpeaking == true)
    }

    /**
     * Developer test function for Arabic TTS
     */
    fun testArabicTts() {
        speakOriginalText(
            originalText = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
            languageCode = "ar",
            itemId = "test_arabic"
        )
    }

    /**
     * Developer test function for Urdu TTS
     */
    fun testUrduTts() {
        speakOriginalText(
            originalText = "شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے",
            languageCode = "ur",
            itemId = "test_urdu"
        )
    }

    private fun requestAudioFocus() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                audioFocusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_MEDIA)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                            .build()
                    )
                    .build()
                audioFocusRequest?.let { audioManager.requestAudioFocus(it) }
            } else {
                @Suppress("DEPRECATION")
                audioManager.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to request audio focus: ${e.message}")
        }
    }

    private fun abandonAudioFocus() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                audioFocusRequest?.let { audioManager.abandonAudioFocusRequest(it) }
            } else {
                @Suppress("DEPRECATION")
                audioManager.abandonAudioFocus(null)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to abandon audio focus: ${e.message}")
        }
    }

    /**
     * Releases all TTS resources
     */
    fun release() {
        stop()
        pendingRequest = null
        isInitializing = false
        try {
            textToSpeech?.shutdown()
        } catch (e: Exception) {
            Log.e(TAG, "Error shutting down TTS: ${e.message}")
        } finally {
            textToSpeech = null
            isTtsInitialized = false
        }
    }
}
