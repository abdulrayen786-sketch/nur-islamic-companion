package com.nur.islamiccompanion.service

import android.app.Notification
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.nur.islamiccompanion.MainActivity
import com.nur.islamiccompanion.NurApp
import com.nur.islamiccompanion.R
import com.nur.islamiccompanion.data.model.PrayerName

class NotificationService(private val context: Context) {

    companion object {
        const val NOTIFICATION_ID_ADHAN = 1001
        const val NOTIFICATION_ID_PRAYER_BASE = 2000
    }

    /**
     * Builds the persistent media playback notification for Adhan
     */
    fun buildAdhanNotification(prayerName: PrayerName, timeFormatted: String): Notification {
        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("navigate_to", "prayer")
        }
        val openAppPendingIntent = PendingIntent.getActivity(
            context,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Stop Adhan Intent
        val stopIntent = Intent(context, AdhanAlarmReceiver::class.java).apply {
            action = "com.nur.islamiccompanion.ACTION_STOP_ADHAN"
        }
        val stopPendingIntent = PendingIntent.getBroadcast(
            context,
            1,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Mark as Prayed Intent
        val markPrayedIntent = Intent(context, AdhanAlarmReceiver::class.java).apply {
            action = "com.nur.islamiccompanion.ACTION_MARK_PRAYED"
            putExtra("prayer_name", prayerName.name)
        }
        val markPrayedPendingIntent = PendingIntent.getBroadcast(
            context,
            2,
            markPrayedIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val title = "Hayya 'alas-Salah — Time for ${prayerName.title}"
        val body = "The adhan is calling for ${prayerName.title} prayer ($timeFormatted). May Allah accept your salah."

        return NotificationCompat.Builder(context, NurApp.CHANNEL_ADHAN)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setContentIntent(openAppPendingIntent)
            .setAutoCancel(false)
            .setOngoing(true)
            .addAction(android.R.drawable.ic_media_pause, "Mute / Stop Adhan", stopPendingIntent)
            .addAction(android.R.drawable.checkbox_on_background, "Mark as Prayed", markPrayedPendingIntent)
            .build()
    }

    /**
     * Shows a standard prayer arrival or reminder notification
     */
    fun showPrayerNotification(prayerName: PrayerName, timeFormatted: String, isVibrationEnabled: Boolean = true) {
        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("navigate_to", "prayer")
        }
        val openAppPendingIntent = PendingIntent.getActivity(
            context,
            prayerName.ordinal,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val markPrayedIntent = Intent(context, AdhanAlarmReceiver::class.java).apply {
            action = "com.nur.islamiccompanion.ACTION_MARK_PRAYED"
            putExtra("prayer_name", prayerName.name)
        }
        val markPrayedPendingIntent = PendingIntent.getBroadcast(
            context,
            100 + prayerName.ordinal,
            markPrayedIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val title = "Time for ${prayerName.title} Prayer (${prayerName.arabic})"
        val body = "${prayerName.title} is at $timeFormatted. Turn towards Allah in remembrance and prayer."

        val builder = NotificationCompat.Builder(context, NurApp.CHANNEL_PRAYER)
            .setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(openAppPendingIntent)
            .setAutoCancel(true)
            .addAction(android.R.drawable.checkbox_on_background, "Mark as Prayed", markPrayedPendingIntent)

        if (isVibrationEnabled) {
            builder.setVibrate(longArrayOf(0, 400, 200, 400))
        }

        try {
            val notificationManager = NotificationManagerCompat.from(context)
            if (notificationManager.areNotificationsEnabled()) {
                notificationManager.notify(NOTIFICATION_ID_PRAYER_BASE + prayerName.ordinal, builder.build())
            }
        } catch (e: SecurityException) {
            // Notification permission might be missing
        }
    }
}
