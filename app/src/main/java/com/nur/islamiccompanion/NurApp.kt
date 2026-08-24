package com.nur.islamiccompanion

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.os.Build
import androidx.core.app.NotificationManagerCompat

class NurApp : Application() {

    companion object {
        const val CHANNEL_ADHAN = "nur_adhan_channel"
        const val CHANNEL_PRAYER = "nur_prayer_channel"
        const val CHANNEL_REMINDERS = "nur_reminders_channel"
        lateinit var instance: NurApp
            private set
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            // High priority channel for Adhan with sound & vibration
            val adhanChannel = NotificationChannel(
                CHANNEL_ADHAN,
                "Adhan & Call to Prayer",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Plays Adhan and alerts when prayer time arrives"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 500, 200, 500, 200, 800)
                setSound(
                    android.provider.Settings.System.DEFAULT_NOTIFICATION_URI,
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
            }

            // Standard Prayer notifications channel
            val prayerChannel = NotificationChannel(
                CHANNEL_PRAYER,
                "Prayer Reminders",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Notifications for upcoming and current prayer times"
                enableVibration(true)
            }

            // General Islamic tasks & reminders channel
            val remindersChannel = NotificationChannel(
                CHANNEL_REMINDERS,
                "Daily Islamic Reminders",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Daily Adhkar, Qur'an reading goals, and reflections"
            }

            notificationManager.createNotificationChannels(
                listOf(adhanChannel, prayerChannel, remindersChannel)
            )
        }
    }
}
