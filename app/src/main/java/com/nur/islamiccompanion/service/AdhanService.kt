package com.nur.islamiccompanion.service

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.widget.Toast
import com.nur.islamiccompanion.data.local.PreferencesDataStore
import com.nur.islamiccompanion.data.model.PrayerCalculationConfig
import com.nur.islamiccompanion.data.model.PrayerName
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.util.Calendar
import java.util.Date

class AdhanService(private val context: Context) {

    private val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    private val prayerTimeService = PrayerTimeService()
    private val preferencesDataStore = PreferencesDataStore(context)

    /**
     * Schedules exact alarms for all upcoming daily prayers
     */
    fun rescheduleAlarms() {
        CoroutineScope(Dispatchers.IO).launch {
            val settings = preferencesDataStore.userSettingsFlow.first()
            if (!settings.enablePrayerNotifications) {
                cancelAllAlarms()
                return@launch
            }

            val config = PrayerCalculationConfig(
                cityName = settings.cityName,
                countryName = settings.countryName,
                latitude = settings.customLatitude,
                longitude = settings.customLongitude,
                timezoneId = settings.timezoneId,
                method = settings.calculationMethod,
                madhab = settings.madhab,
                highLatitudeRule = settings.highLatitudeRule,
                autoDetectLocation = settings.autoDetectLocation
            )

            val now = System.currentTimeMillis()
            val todaySchedule = prayerTimeService.calculateDaySchedule(Date(now), config)

            val tomorrowCal = Calendar.getInstance().apply {
                add(Calendar.DAY_OF_YEAR, 1)
            }
            val tomorrowSchedule = prayerTimeService.calculateDaySchedule(tomorrowCal.time, config)

            // Schedule for today's remaining prayers
            todaySchedule.prayersList.filter { it.name.isObligatory }.forEach { prayer ->
                if (prayer.timestamp > now) {
                    val isEnabled = isPrayerAlarmEnabled(prayer.name, settings)
                    if (isEnabled) {
                        scheduleExactAlarm(prayer.name, prayer.timestamp, prayer.timeFormatted)
                    }
                }
            }

            // Also schedule tomorrow's Fajr
            val tomorrowFajr = tomorrowSchedule.prayersList.first { it.name == PrayerName.FAJR }
            if (settings.fajrAlarmEnabled) {
                scheduleExactAlarm(PrayerName.FAJR, tomorrowFajr.timestamp, tomorrowFajr.timeFormatted, requestCodeOffset = 10)
            }
        }
    }

    private fun isPrayerAlarmEnabled(
        name: PrayerName,
        settings: com.nur.islamiccompanion.data.model.UserSettings
    ): Boolean {
        return when (name) {
            PrayerName.FAJR -> settings.fajrAlarmEnabled
            PrayerName.DHUHR -> settings.dhuhrAlarmEnabled
            PrayerName.ASR -> settings.asrAlarmEnabled
            PrayerName.MAGHRIB -> settings.maghribAlarmEnabled
            PrayerName.ISHA -> settings.ishaAlarmEnabled
            else -> false
        }
    }

    private fun scheduleExactAlarm(
        prayerName: PrayerName,
        triggerAtMillis: Long,
        timeFormatted: String,
        requestCodeOffset: Int = 0
    ) {
        val intent = Intent(context, AdhanAlarmReceiver::class.java).apply {
            action = "com.nur.islamiccompanion.ACTION_PRAYER_ALARM"
            putExtra("prayer_name", prayerName.name)
            putExtra("time_formatted", timeFormatted)
        }

        val requestCode = prayerName.ordinal + requestCodeOffset
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setAlarmClock(
                        AlarmManager.AlarmClockInfo(triggerAtMillis, pendingIntent),
                        pendingIntent
                    )
                } else {
                    alarmManager.setAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerAtMillis,
                        pendingIntent
                    )
                }
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
            }
        } catch (e: SecurityException) {
            e.printStackTrace()
        }
    }

    fun cancelAllAlarms() {
        PrayerName.values().forEachIndexed { index, prayerName ->
            val intent = Intent(context, AdhanAlarmReceiver::class.java).apply {
                action = "com.nur.islamiccompanion.ACTION_PRAYER_ALARM"
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                index,
                intent,
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
            )
            pendingIntent?.let { alarmManager.cancel(it) }

            val tomorrowPendingIntent = PendingIntent.getBroadcast(
                context,
                index + 10,
                intent,
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
            )
            tomorrowPendingIntent?.let { alarmManager.cancel(it) }
        }
    }

    /**
     * Developer / Test Mode: Trigger Adhan immediate playback test
     */
    fun testAdhanNow(prayerName: PrayerName = PrayerName.FAJR) {
        val intent = Intent(context, AdhanAlarmReceiver::class.java).apply {
            action = "com.nur.islamiccompanion.ACTION_TEST_ALARM"
            putExtra("prayer_name", prayerName.name)
        }
        context.sendBroadcast(intent)
        Toast.makeText(context, "Testing Adhan for ${prayerName.title}...", Toast.LENGTH_SHORT).show()
    }

    /**
     * Developer / Test Mode: Schedule an alarm to fire in seconds to verify background wake-up
     */
    fun testAlarmInSeconds(seconds: Int = 5, prayerName: PrayerName = PrayerName.ASR) {
        val triggerTime = System.currentTimeMillis() + (seconds * 1000L)
        val intent = Intent(context, AdhanAlarmReceiver::class.java).apply {
            action = "com.nur.islamiccompanion.ACTION_PRAYER_ALARM"
            putExtra("prayer_name", prayerName.name)
            putExtra("time_formatted", "Test Alarm ($seconds s)")
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            999,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent)
        } else {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent)
        }

        Toast.makeText(context, "Test alarm scheduled for $seconds seconds from now", Toast.LENGTH_SHORT).show()
    }
}
