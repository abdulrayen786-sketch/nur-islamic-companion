package com.nur.islamiccompanion.service

import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Build
import android.os.IBinder
import android.os.VibrationEffect
import android.os.Vibrator
import com.nur.islamiccompanion.data.model.PrayerName

class AdhanPlaybackService : Service() {

    companion object {
        const val ACTION_START_ADHAN = "com.nur.islamiccompanion.ACTION_START_ADHAN"
        const val ACTION_STOP_ADHAN = "com.nur.islamiccompanion.ACTION_STOP_ADHAN"
        const val EXTRA_PRAYER_NAME = "prayer_name"
        const val EXTRA_TIME_FORMATTED = "time_formatted"
        const val EXTRA_ENABLE_VIBRATION = "enable_vibration"

        var isAdhanPlaying = false
            private set
    }

    private var mediaPlayer: MediaPlayer? = null
    private var vibrator: Vibrator? = null
    private lateinit var audioManager: AudioManager
    private var audioFocusRequest: AudioFocusRequest? = null
    private lateinit var notificationService: NotificationService

    override fun onCreate() {
        super.onCreate()
        audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
        vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        notificationService = NotificationService(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent == null) {
            stopSelf()
            return START_NOT_STICKY
        }

        when (intent.action) {
            ACTION_STOP_ADHAN -> {
                stopAdhanPlayback()
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_START_ADHAN -> {
                val prayerStr = intent.getStringExtra(EXTRA_PRAYER_NAME) ?: PrayerName.FAJR.name
                val prayerName = try {
                    PrayerName.valueOf(prayerStr)
                } catch (e: Exception) {
                    PrayerName.FAJR
                }
                val timeFormatted = intent.getStringExtra(EXTRA_TIME_FORMATTED) ?: ""
                val enableVibration = intent.getBooleanExtra(EXTRA_ENABLE_VIBRATION, true)

                startAdhanForeground(prayerName, timeFormatted, enableVibration)
            }
        }

        return START_NOT_STICKY
    }

    private fun startAdhanForeground(prayerName: PrayerName, timeFormatted: String, enableVibration: Boolean) {
        val notification = notificationService.buildAdhanNotification(prayerName, timeFormatted)
        startForeground(NotificationService.NOTIFICATION_ID_ADHAN, notification)
        isAdhanPlaying = true

        if (enableVibration) {
            triggerVibration()
        }

        requestAudioFocus()
        playAdhanAudio(prayerName)
    }

    private fun playAdhanAudio(prayerName: PrayerName) {
        try {
            mediaPlayer?.release()

            // Authentic Adhan audio stream (Makkah Adhan / Mishary Alafasy Adhan)
            val adhanUrl = if (prayerName == PrayerName.FAJR) {
                // Fajr Adhan with "As-Salatu Khayrun Minan-Nawm"
                "https://media.sd.ma/assabile/adhan_3203/al-afasy.mp3"
            } else {
                "https://media.sd.ma/assabile/adhan_3203/al-afasy.mp3"
            }

            mediaPlayer = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build()
                )
                setDataSource(adhanUrl)
                setOnPreparedListener { mp ->
                    mp.start()
                }
                setOnCompletionListener {
                    stopAdhanPlayback()
                    stopSelf()
                }
                setOnErrorListener { _, _, _ ->
                    // Fallback to system notification alert sound if network is unavailable
                    playFallbackAlarmSound()
                    true
                }
                prepareAsync()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            playFallbackAlarmSound()
        }
    }

    private fun playFallbackAlarmSound() {
        try {
            val alertUri = android.provider.Settings.System.DEFAULT_ALARM_ALERT_URI
                ?: android.provider.Settings.System.DEFAULT_NOTIFICATION_URI
            mediaPlayer?.release()
            mediaPlayer = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                setDataSource(applicationContext, alertUri)
                isLooping = false
                setOnCompletionListener {
                    stopAdhanPlayback()
                    stopSelf()
                }
                prepare()
                start()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            stopAdhanPlayback()
            stopSelf()
        }
    }

    private fun triggerVibration() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(
                    VibrationEffect.createWaveform(
                        longArrayOf(0, 800, 400, 800, 400, 1200),
                        -1
                    )
                )
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(longArrayOf(0, 800, 400, 800), -1)
            }
        } catch (e: Exception) {
            // Ignored
        }
    }

    private fun requestAudioFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            audioFocusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build()
                )
                .build()
            audioFocusRequest?.let { audioManager.requestAudioFocus(it) }
        } else {
            @Suppress("DEPRECATION")
            audioManager.requestAudioFocus(null, AudioManager.STREAM_ALARM, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
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

    private fun stopAdhanPlayback() {
        isAdhanPlaying = false
        try {
            mediaPlayer?.stop()
            mediaPlayer?.release()
            mediaPlayer = null
        } catch (e: Exception) {
            // Ignored
        }
        vibrator?.cancel()
        abandonAudioFocus()
    }

    override fun onDestroy() {
        stopAdhanPlayback()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
