package com.nur.islamiccompanion.data.repository

import com.nur.islamiccompanion.data.model.PrayerCalculationConfig
import com.nur.islamiccompanion.data.model.PrayerTime
import com.nur.islamiccompanion.service.DayPrayerSchedule
import com.nur.islamiccompanion.service.PrayerTimeService
import com.nur.islamiccompanion.service.QiblaService
import java.util.Date

class PrayerRepository(
    private val prayerTimeService: PrayerTimeService = PrayerTimeService()
) {

    fun calculateDaySchedule(
        date: Date = Date(),
        config: PrayerCalculationConfig = PrayerCalculationConfig()
    ): DayPrayerSchedule {
        return prayerTimeService.calculateDaySchedule(date, config)
    }

    fun calculatePrayerTimes(
        date: Date = Date(),
        config: PrayerCalculationConfig = PrayerCalculationConfig()
    ): List<PrayerTime> {
        val schedule = calculateDaySchedule(date, config)
        return schedule.prayersList
    }

    fun calculateQiblaBearing(latitude: Double, longitude: Double): Double {
        val service = QiblaService.KAABA_LATITUDE
        val phi1 = Math.toRadians(latitude)
        val phi2 = Math.toRadians(QiblaService.KAABA_LATITUDE)
        val deltaLng = Math.toRadians(QiblaService.KAABA_LONGITUDE - longitude)

        val y = Math.sin(deltaLng) * Math.cos(phi2)
        val x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLng)

        var bearing = Math.toDegrees(Math.atan2(y, x))
        bearing = (bearing + 360.0) % 360.0
        return Math.round(bearing * 100.0) / 100.0
    }
}
