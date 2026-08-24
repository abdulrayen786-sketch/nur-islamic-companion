package com.nur.islamiccompanion.service

import com.nur.islamiccompanion.data.model.PrayerCalculationConfig
import com.nur.islamiccompanion.data.model.PrayerName
import com.nur.islamiccompanion.data.model.PrayerTime
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import kotlin.math.*

data class CalculationMethodParameters(
    val name: String,
    val fajrAngle: Double,
    val ishaAngle: Double = 0.0,
    val ishaIntervalMinutes: Int = 0,
    val maghribAngle: Double = 0.0,
    val maghribIntervalMinutes: Int = 0
)

data class DayPrayerSchedule(
    val date: Date,
    val fajr: Long,
    val sunrise: Long,
    val dhuhr: Long,
    val asr: Long,
    val sunset: Long,
    val maghrib: Long,
    val isha: Long,
    val prayersList: List<PrayerTime>
)

class PrayerTimeService {

    companion object {
        val METHODS = mapOf(
            "MWL" to CalculationMethodParameters("Muslim World League", 18.0, ishaAngle = 17.0),
            "Egypt" to CalculationMethodParameters("Egyptian General Authority of Survey", 19.5, ishaAngle = 17.5),
            "Karachi" to CalculationMethodParameters("University of Islamic Sciences, Karachi", 18.0, ishaAngle = 18.0),
            "UmmAlQura" to CalculationMethodParameters("Umm Al-Qura University, Makkah", 18.5, ishaIntervalMinutes = 90),
            "Dubai" to CalculationMethodParameters("Dubai (UAE)", 18.2, ishaAngle = 18.2),
            "Moonsighting" to CalculationMethodParameters("Moonsighting Committee Worldwide", 18.0, ishaAngle = 18.0),
            "ISNA" to CalculationMethodParameters("Islamic Society of North America", 15.0, ishaAngle = 15.0),
            "Tehran" to CalculationMethodParameters("Institute of Geophysics, Tehran", 17.7, ishaAngle = 14.0, maghribAngle = 4.5),
            "Kuwait" to CalculationMethodParameters("Kuwait", 18.0, ishaAngle = 17.5),
            "Qatar" to CalculationMethodParameters("Qatar", 18.0, ishaIntervalMinutes = 90)
        )
    }

    /**
     * Calculates prayer times for a given date, coordinates, and calculation config.
     */
    fun calculateDaySchedule(
        date: Date,
        config: PrayerCalculationConfig
    ): DayPrayerSchedule {
        val tz = if (config.timezoneId.isNotBlank()) {
            TimeZone.getTimeZone(config.timezoneId)
        } else {
            TimeZone.getDefault()
        }

        val cal = Calendar.getInstance(tz).apply { time = date }
        val year = cal.get(Calendar.YEAR)
        val month = cal.get(Calendar.MONTH) + 1
        val day = cal.get(Calendar.DAY_OF_MONTH)

        val methodParams = METHODS[config.method] ?: METHODS["MWL"]!!
        val isHanafi = config.madhab.equals("Hanafi", ignoreCase = true)
        val shadowFactor = if (isHanafi) 2.0 else 1.0

        val timezoneOffsetHours = tz.getOffset(date.time) / 3600000.0
        val julianDay = computeJulianDay(year, month, day) - config.longitude / (15.0 * 24.0)

        // Solar parameters
        val sunCoords = computeSunCoordinates(julianDay)
        val declination = sunCoords.declination
        val eqOfTime = sunCoords.equationOfTime

        // Solar transit (Midday / Dhuhr base in hours)
        val dhuhrHours = 12.0 + timezoneOffsetHours - (config.longitude / 15.0) - eqOfTime

        // Sunrise & Sunset (solar depression 0.833 degrees)
        val sunAlt = 0.833
        val sunriseHourAngle = computeHourAngle(sunAlt, config.latitude, declination)
        val sunriseHours = dhuhrHours - sunriseHourAngle / 15.0
        val sunsetHours = dhuhrHours + sunriseHourAngle / 15.0

        // Fajr
        var fajrHours: Double
        val fajrHourAngle = computeHourAngle(methodParams.fajrAngle, config.latitude, declination)
        if (!fajrHourAngle.isNaN()) {
            fajrHours = dhuhrHours - fajrHourAngle / 15.0
        } else {
            // High latitude fallback
            fajrHours = applyHighLatitudeFajr(sunriseHours, sunsetHours, methodParams.fajrAngle, config.highLatitudeRule)
        }

        // Asr
        val asrAltitude = computeAsrAltitude(shadowFactor, config.latitude, declination)
        val asrHourAngle = computeHourAngle(-asrAltitude, config.latitude, declination)
        val asrHours = dhuhrHours + asrHourAngle / 15.0

        // Maghrib
        val maghribHours: Double = if (methodParams.maghribAngle > 0.0) {
            val maghribHourAngle = computeHourAngle(methodParams.maghribAngle, config.latitude, declination)
            if (!maghribHourAngle.isNaN()) dhuhrHours + maghribHourAngle / 15.0 else sunsetHours + 0.05
        } else if (methodParams.maghribIntervalMinutes > 0) {
            sunsetHours + (methodParams.maghribIntervalMinutes / 60.0)
        } else {
            sunsetHours
        }

        // Isha
        var ishaHours: Double
        if (methodParams.ishaIntervalMinutes > 0) {
            ishaHours = maghribHours + (methodParams.ishaIntervalMinutes / 60.0)
        } else {
            val ishaHourAngle = computeHourAngle(methodParams.ishaAngle, config.latitude, declination)
            if (!ishaHourAngle.isNaN()) {
                ishaHours = dhuhrHours + ishaHourAngle / 15.0
            } else {
                ishaHours = applyHighLatitudeIsha(maghribHours, sunriseHours, sunsetHours, methodParams.ishaAngle, config.highLatitudeRule)
            }
        }

        // Convert calculated hours into absolute timestamps
        val fajrTime = hoursToTimestamp(cal, fajrHours)
        val sunriseTime = hoursToTimestamp(cal, sunriseHours)
        val dhuhrTime = hoursToTimestamp(cal, dhuhrHours)
        val asrTime = hoursToTimestamp(cal, asrHours)
        val sunsetTime = hoursToTimestamp(cal, sunsetHours)
        val maghribTime = hoursToTimestamp(cal, maghribHours)
        val ishaTime = hoursToTimestamp(cal, ishaHours)

        val timeFormatter = SimpleDateFormat("h:mm a", Locale.getDefault()).apply { timeZone = tz }
        val now = System.currentTimeMillis()

        // List of all calculated times
        val rawList = listOf(
            PrayerTime(PrayerName.FAJR, timeFormatter.format(Date(fajrTime)), fajrTime),
            PrayerTime(PrayerName.SUNRISE, timeFormatter.format(Date(sunriseTime)), sunriseTime),
            PrayerTime(PrayerName.DHUHR, timeFormatter.format(Date(dhuhrTime)), dhuhrTime),
            PrayerTime(PrayerName.ASR, timeFormatter.format(Date(asrTime)), asrTime),
            PrayerTime(PrayerName.SUNSET, timeFormatter.format(Date(sunsetTime)), sunsetTime),
            PrayerTime(PrayerName.MAGHRIB, timeFormatter.format(Date(maghribTime)), maghribTime),
            PrayerTime(PrayerName.ISHA, timeFormatter.format(Date(ishaTime)), ishaTime)
        )

        // Mark passed, current, next
        val evaluatedList = evaluatePrayerStatuses(rawList, now)

        return DayPrayerSchedule(
            date = date,
            fajr = fajrTime,
            sunrise = sunriseTime,
            dhuhr = dhuhrTime,
            asr = asrTime,
            sunset = sunsetTime,
            maghrib = maghribTime,
            isha = ishaTime,
            prayersList = evaluatedList
        )
    }

    /**
     * Resolves the current active prayer and upcoming prayer, seamlessly rolling over to tomorrow's Fajr if needed.
     */
    fun resolveNextPrayer(
        todaySchedule: DayPrayerSchedule,
        tomorrowSchedule: DayPrayerSchedule,
        currentTime: Long = System.currentTimeMillis()
    ): Pair<PrayerTime?, PrayerTime> {
        val obligatoryPrayers = todaySchedule.prayersList.filter { it.name.isObligatory }

        val upcoming = obligatoryPrayers.firstOrNull { it.timestamp > currentTime }
        if (upcoming != null) {
            val currentIndex = obligatoryPrayers.indexOf(upcoming) - 1
            val current = if (currentIndex >= 0) obligatoryPrayers[currentIndex] else null
            return Pair(current, upcoming)
        }

        // If after Isha, the next prayer is Tomorrow's Fajr
        val tomorrowFajr = tomorrowSchedule.prayersList.first { it.name == PrayerName.FAJR }
        val current = obligatoryPrayers.lastOrNull() // Isha
        return Pair(current, tomorrowFajr.copy(isNext = true))
    }

    private fun evaluatePrayerStatuses(prayers: List<PrayerTime>, now: Long): List<PrayerTime> {
        var foundNext = false
        var lastPassedIndex = -1

        for (i in prayers.indices) {
            if (prayers[i].timestamp <= now) {
                lastPassedIndex = i
            } else if (!foundNext) {
                foundNext = true
            }
        }

        return prayers.mapIndexed { index, prayer ->
            val isPassed = prayer.timestamp <= now
            val isCurrent = (index == lastPassedIndex)
            val isNext = (!isPassed && (!prayers.take(index).any { !it.isPassed }))
            prayer.copy(
                isPassed = isPassed,
                isCurrent = isCurrent,
                isNext = isNext
            )
        }
    }

    // --- Astronomical Formulas ---

    private fun computeJulianDay(year: Int, month: Int, day: Int): Double {
        var y = year
        var m = month
        if (m <= 2) {
            y -= 1
            m += 12
        }
        val a = floor(y / 100.0)
        val b = 2.0 - a + floor(a / 4.0)
        return floor(365.25 * (y + 4716)) + floor(30.6001 * (m + 1)) + day + b - 1524.5
    }

    private data class SunCoordinates(val declination: Double, val equationOfTime: Double)

    private fun computeSunCoordinates(jd: Double): SunCoordinates {
        val d = jd - 2451545.0
        val g = fixAngle(357.529 + 0.98560028 * d)
        val q = fixAngle(280.459 + 0.98564736 * d)
        val l = fixAngle(q + 1.915 * sin(Math.toRadians(g)) + 0.020 * sin(Math.toRadians(2 * g)))

        val e = 23.439 - 0.00000036 * d
        val ra = fixAngle(Math.toDegrees(atan2(cos(Math.toRadians(e)) * sin(Math.toRadians(l)), cos(Math.toRadians(l))))) / 15.0
        val sinDelta = sin(Math.toRadians(e)) * sin(Math.toRadians(l))
        val delta = Math.toDegrees(asin(sinDelta))

        val eqT = q / 15.0 - ra
        return SunCoordinates(declination = delta, equationOfTime = eqT)
    }

    private fun computeHourAngle(angle: Double, latitude: Double, declination: Double): Double {
        val phi = Math.toRadians(latitude)
        val delta = Math.toRadians(declination)
        val alpha = Math.toRadians(angle)

        val cosH = (-sin(alpha) - sin(phi) * sin(delta)) / (cos(phi) * cos(delta))
        if (cosH < -1.0 || cosH > 1.0) {
            return Double.NaN
        }
        return Math.toDegrees(acos(cosH))
    }

    private fun computeAsrAltitude(shadowFactor: Double, latitude: Double, declination: Double): Double {
        val delta = abs(latitude - declination)
        val tanDelta = tan(Math.toRadians(delta))
        val arccot = Math.toDegrees(atan(1.0 / (shadowFactor + tanDelta)))
        return 90.0 - arccot
    }

    private fun applyHighLatitudeFajr(sunrise: Double, sunset: Double, angle: Double, rule: String): Double {
        val night = 24.0 - sunset + sunrise
        val portion = when (rule) {
            "OneSeventh" -> night / 7.0
            "AngleBased" -> (angle / 60.0) * night
            else -> night / 2.0 // MiddleOfTheNight
        }
        return sunrise - portion
    }

    private fun applyHighLatitudeIsha(maghrib: Double, sunrise: Double, sunset: Double, angle: Double, rule: String): Double {
        val night = 24.0 - sunset + sunrise
        val portion = when (rule) {
            "OneSeventh" -> night / 7.0
            "AngleBased" -> (angle / 60.0) * night
            else -> night / 2.0 // MiddleOfTheNight
        }
        return maghrib + portion
    }

    private fun fixAngle(angle: Double): Double {
        var a = angle - 360.0 * floor(angle / 360.0)
        if (a < 0) a += 360.0
        return a
    }

    private fun hoursToTimestamp(cal: Calendar, hours: Double): Long {
        val c = cal.clone() as Calendar
        val normalizedHours = if (hours < 0) hours + 24.0 else if (hours >= 24.0) hours - 24.0 else hours
        val h = floor(normalizedHours).toInt()
        val remainderMinutes = (normalizedHours - h) * 60.0
        val m = floor(remainderMinutes).toInt()
        val s = floor((remainderMinutes - m) * 60.0).toInt()

        c.set(Calendar.HOUR_OF_DAY, h)
        c.set(Calendar.MINUTE, m)
        c.set(Calendar.SECOND, s)
        c.set(Calendar.MILLISECOND, 0)
        return c.timeInMillis
    }
}
