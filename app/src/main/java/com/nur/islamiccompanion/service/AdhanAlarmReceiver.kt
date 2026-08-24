package com.nur.islamiccompanion.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat
import com.nur.islamiccompanion.data.local.PreferencesDataStore
import com.nur.islamiccompanion.data.model.PrayerName
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class AdhanAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return

        when (action) {
            "com.nur.islamiccompanion.ACTION_PRAYER_ALARM" -> {
                val prayerStr = intent.getStringExtra("prayer_name") ?: PrayerName.FAJR.name
                val prayerName = try {
                    PrayerName.valueOf(prayerStr)
                } catch (e: Exception) {
                    PrayerName.FAJR
                }
                val timeFormatted = intent.getStringExtra("time_formatted") ?: ""

                handlePrayerAlarm(context, prayerName, timeFormatted)
            }
            "com.nur.islamiccompanion.ACTION_TEST_ALARM" -> {
                val prayerStr = intent.getStringExtra("prayer_name") ?: PrayerName.FAJR.name
                val prayerName = try {
                    PrayerName.valueOf(prayerStr)
                } catch (e: Exception) {
                    PrayerName.FAJR
                }
                val playIntent = Intent(context, AdhanPlaybackService::class.java).apply {
                    this.action = AdhanPlaybackService.ACTION_START_ADHAN
                    putExtra(AdhanPlaybackService.EXTRA_PRAYER_NAME, prayerName.name)
                    putExtra(AdhanPlaybackService.EXTRA_TIME_FORMATTED, "Test Time")
                    putExtra(AdhanPlaybackService.EXTRA_ENABLE_VIBRATION, true)
                }
                ContextCompat.startForegroundService(context, playIntent)
            }
            "com.nur.islamiccompanion.ACTION_STOP_ADHAN" -> {
                val stopIntent = Intent(context, AdhanPlaybackService::class.java).apply {
                    this.action = AdhanPlaybackService.ACTION_STOP_ADHAN
                }
                context.startService(stopIntent)
            }
            "com.nur.islamiccompanion.ACTION_MARK_PRAYED" -> {
                val stopIntent = Intent(context, AdhanPlaybackService::class.java).apply {
                    this.action = AdhanPlaybackService.ACTION_STOP_ADHAN
                }
                context.startService(stopIntent)
            }
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_TIME_CHANGED,
            Intent.ACTION_TIMEZONE_CHANGED,
            Intent.ACTION_MY_PACKAGE_REPLACED -> {
                // Reschedule all prayer alarms after reboot or time change
                val adhanService = AdhanService(context)
                adhanService.rescheduleAlarms()
            }
        }
    }

    private fun handlePrayerAlarm(context: Context, prayerName: PrayerName, timeFormatted: String) {
        CoroutineScope(Dispatchers.IO).launch {
            val dataStore = PreferencesDataStore(context)
            val settings = dataStore.userSettingsFlow.first()

            if (!settings.enablePrayerNotifications) return@launch

            // Check if alarm is enabled for this specific prayer
            val isPrayerEnabled = when (prayerName) {
                PrayerName.FAJR -> settings.fajrAlarmEnabled
                PrayerName.DHUHR -> settings.dhuhrAlarmEnabled
                PrayerName.ASR -> settings.asrAlarmEnabled
                PrayerName.MAGHRIB -> settings.maghribAlarmEnabled
                PrayerName.ISHA -> settings.ishaAlarmEnabled
                else -> false
            }

            if (!isPrayerEnabled) return@launch

            // Check if Adhan sound should be played
            val shouldPlayAdhan = if (prayerName == PrayerName.FAJR) {
                settings.fajrAdhanEnabled
            } else {
                settings.otherPrayersAdhanEnabled
            }

            if (shouldPlayAdhan) {
                val playIntent = Intent(context, AdhanPlaybackService::class.java).apply {
                    action = AdhanPlaybackService.ACTION_START_ADHAN
                    putExtra(AdhanPlaybackService.EXTRA_PRAYER_NAME, prayerName.name)
                    putExtra(AdhanPlaybackService.EXTRA_TIME_FORMATTED, timeFormatted)
                    putExtra(AdhanPlaybackService.EXTRA_ENABLE_VIBRATION, settings.enableVibration)
                }
                ContextCompat.startForegroundService(context, playIntent)
            } else {
                val notificationService = NotificationService(context)
                notificationService.showPrayerNotification(prayerName, timeFormatted, settings.enableVibration)
            }

            // Reschedule upcoming alarms
            val adhanService = AdhanService(context)
            adhanService.rescheduleAlarms()
        }
    }
}
