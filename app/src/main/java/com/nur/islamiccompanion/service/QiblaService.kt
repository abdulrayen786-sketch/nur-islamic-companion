package com.nur.islamiccompanion.service

import android.content.Context
import android.hardware.GeomagneticField
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.view.Surface
import android.view.WindowManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.math.*

data class TestLocation(
    val cityName: String,
    val countryName: String,
    val latitude: Double,
    val longitude: Double,
    val expectedBearingApprox: Double
)

data class QiblaCompassState(
    val userLatitude: Double = 0.0,
    val userLongitude: Double = 0.0,
    val locationAccuracyMeters: Float = 0f,
    val hasLocation: Boolean = false,
    val sensorAvailable: Boolean = false,
    val qiblaBearing: Float = 0f,
    val trueDeviceHeading: Float = 0f,
    val magneticHeading: Float = 0f,
    val magneticDeclination: Float = 0f,
    val relativeQiblaAngle: Float = 0f,
    val distanceToKaabaKm: Double = 0.0,
    val sensorAccuracy: Int = SensorManager.SENSOR_STATUS_ACCURACY_HIGH,
    val isLowAccuracy: Boolean = false,
    val isAlignedWithQibla: Boolean = false
)

class QiblaService(private val context: Context) : SensorEventListener {

    companion object {
        const val KAABA_LATITUDE = 21.4225
        const val KAABA_LONGITUDE = 39.8262

        val TEST_LOCATIONS = listOf(
            TestLocation("Ahmedabad", "India", 23.0225, 72.5714, 278.0),
            TestLocation("Mumbai", "India", 19.0760, 72.8777, 283.0),
            TestLocation("Delhi", "India", 28.6139, 77.2090, 265.0),
            TestLocation("Makkah", "Saudi Arabia", 21.4225, 39.8262, 0.0),
            TestLocation("Dubai", "UAE", 25.2048, 55.2708, 258.0),
            TestLocation("London", "UK", 51.5074, -0.1278, 119.0),
            TestLocation("New York", "USA", 40.7128, -74.0060, 58.0),
            TestLocation("Jakarta", "Indonesia", -6.2088, 106.8456, 295.0)
        )
    }

    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val rotationSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
    private val accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private val magnetometer = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)

    private val _compassState = MutableStateFlow(QiblaCompassState())
    val compassState: StateFlow<QiblaCompassState> = _compassState.asStateFlow()

    private var currentLatitude: Double = 0.0
    private var currentLongitude: Double = 0.0
    private var currentAltitude: Float = 0f
    private var qiblaBearing: Float = 0f

    private var smoothedHeading: Float = 0f
    private val filterAlpha: Float = 0.15f // Low pass filter damping factor

    private val rotationMatrix = FloatArray(9)
    private val remappedMatrix = FloatArray(9)
    private val orientationAngles = FloatArray(3)

    private val gravityValues = FloatArray(3)
    private val geomagneticValues = FloatArray(3)
    private var hasGravity = false
    private var hasGeomagnetic = false

    fun startListening() {
        val sensorAvailable = rotationSensor != null || (accelerometer != null && magnetometer != null)
        _compassState.value = _compassState.value.copy(sensorAvailable = sensorAvailable)
        if (!sensorAvailable) return

        if (rotationSensor != null) {
            sensorManager.registerListener(this, rotationSensor, SensorManager.SENSOR_DELAY_UI)
        } else {
            accelerometer?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_UI) }
            magnetometer?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_UI) }
        }
    }

    fun stopListening() {
        sensorManager.unregisterListener(this)
    }

    fun updateLocation(latitude: Double, longitude: Double, accuracyMeters: Float = 0f, altitudeMeters: Double = 0.0) {
        if (!latitude.isFinite() || !longitude.isFinite()) return
        currentLatitude = latitude
        currentLongitude = longitude
        currentAltitude = altitudeMeters.toFloat()
        qiblaBearing = calculateQiblaBearing(latitude, longitude)
        _compassState.value = _compassState.value.copy(
            userLatitude = latitude,
            userLongitude = longitude,
            locationAccuracyMeters = accuracyMeters,
            qiblaBearing = qiblaBearing,
            distanceToKaabaKm = calculateDistanceToKaabaKm(latitude, longitude),
            hasLocation = true
        )
        if (_compassState.value.sensorAvailable) {
            updateCompassState(smoothedHeading, _compassState.value.sensorAccuracy)
        }
    }

    /**
     * Great Circle True Qibla Bearing Calculation
     */
    fun calculateQiblaBearing(userLat: Double, userLng: Double): Float {
        val lat1 = Math.toRadians(userLat)
        val lat2 = Math.toRadians(KAABA_LATITUDE)
        val deltaLng = Math.toRadians(KAABA_LONGITUDE - userLng)

        val y = sin(deltaLng) * cos(lat2)
        val x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(deltaLng)

        var bearing = Math.toDegrees(atan2(y, x))
        bearing = (bearing + 360.0) % 360.0
        return bearing.toFloat()
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null) return

        when (event.sensor.type) {
            Sensor.TYPE_ROTATION_VECTOR -> {
                SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values)
                computeHeadingFromMatrix(rotationMatrix, event.accuracy)
            }
            Sensor.TYPE_ACCELEROMETER -> {
                System.arraycopy(event.values, 0, gravityValues, 0, 3)
                hasGravity = true
                if (hasGeomagnetic) {
                    if (SensorManager.getRotationMatrix(rotationMatrix, null, gravityValues, geomagneticValues)) {
                        computeHeadingFromMatrix(rotationMatrix, event.accuracy)
                    }
                }
            }
            Sensor.TYPE_MAGNETIC_FIELD -> {
                System.arraycopy(event.values, 0, geomagneticValues, 0, 3)
                hasGeomagnetic = true
                if (hasGravity) {
                    if (SensorManager.getRotationMatrix(rotationMatrix, null, gravityValues, geomagneticValues)) {
                        computeHeadingFromMatrix(rotationMatrix, event.accuracy)
                    }
                }
            }
        }
    }

    private fun computeHeadingFromMatrix(matrix: FloatArray, accuracy: Int) {
        // Adjust for display rotation
        val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as? WindowManager
        val rotation = windowManager?.defaultDisplay?.rotation ?: Surface.ROTATION_0

        var axisX = SensorManager.AXIS_X
        var axisY = SensorManager.AXIS_Y

        when (rotation) {
            Surface.ROTATION_90 -> {
                axisX = SensorManager.AXIS_Y
                axisY = SensorManager.AXIS_MINUS_X
            }
            Surface.ROTATION_180 -> {
                axisX = SensorManager.AXIS_MINUS_X
                axisY = SensorManager.AXIS_MINUS_Y
            }
            Surface.ROTATION_270 -> {
                axisX = SensorManager.AXIS_MINUS_Y
                axisY = SensorManager.AXIS_X
            }
        }

        SensorManager.remapCoordinateSystem(matrix, axisX, axisY, remappedMatrix)
        SensorManager.getOrientation(remappedMatrix, orientationAngles)

        var azimuthDegrees = Math.toDegrees(orientationAngles[0].toDouble()).toFloat()
        azimuthDegrees = (azimuthDegrees + 360f) % 360f

        // Apply smooth low pass filter with circular degree wrap-around handling
        val diff = ((azimuthDegrees - smoothedHeading + 540f) % 360f) - 180f
        smoothedHeading = (smoothedHeading + filterAlpha * diff + 360f) % 360f

        updateCompassState(smoothedHeading, accuracy)
    }

    private fun updateCompassState(rawMagneticHeading: Float, accuracy: Int) {
        // Compute magnetic declination
        val geoField = GeomagneticField(
            currentLatitude.toFloat(),
            currentLongitude.toFloat(),
            currentAltitude,
            System.currentTimeMillis()
        )
        val declination = geoField.declination

        // True Heading = Magnetic Heading + Declination
        val trueHeading = (rawMagneticHeading + declination + 360f) % 360f

        // Relative Qibla Angle = (Qibla Bearing - True Heading + 360) % 360
        val relativeAngle = (qiblaBearing - trueHeading + 360f) % 360f

        val isLow = accuracy == SensorManager.SENSOR_STATUS_ACCURACY_LOW || accuracy == SensorManager.SENSOR_STATUS_UNRELIABLE
        val isAligned = abs(((relativeAngle + 180f) % 360f) - 180f) <= 3.0f
        val distanceKm = calculateDistanceToKaabaKm(currentLatitude, currentLongitude)

        _compassState.value = QiblaCompassState(
            userLatitude = currentLatitude,
            userLongitude = currentLongitude,
            locationAccuracyMeters = _compassState.value.locationAccuracyMeters,
            hasLocation = true,
            sensorAvailable = _compassState.value.sensorAvailable,
            qiblaBearing = qiblaBearing,
            trueDeviceHeading = trueHeading,
            magneticHeading = rawMagneticHeading,
            magneticDeclination = declination,
            relativeQiblaAngle = relativeAngle,
            distanceToKaabaKm = distanceKm,
            sensorAccuracy = accuracy,
            isLowAccuracy = isLow,
            isAlignedWithQibla = isAligned
        )
    }

    /**
     * Great Circle Distance to Kaaba in kilometers
     */
    fun calculateDistanceToKaabaKm(userLat: Double, userLng: Double): Double {
        val earthRadiusKm = 6371.0
        val dLat = Math.toRadians(KAABA_LATITUDE - userLat)
        val dLng = Math.toRadians(KAABA_LONGITUDE - userLng)
        val a = sin(dLat / 2.0).pow(2.0) + cos(Math.toRadians(userLat)) * cos(Math.toRadians(KAABA_LATITUDE)) * sin(dLng / 2.0).pow(2.0)
        val c = 2.0 * atan2(sqrt(a), sqrt(1.0 - a))
        return earthRadiusKm * c
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        val isLow = accuracy == SensorManager.SENSOR_STATUS_ACCURACY_LOW || accuracy == SensorManager.SENSOR_STATUS_UNRELIABLE
        _compassState.value = _compassState.value.copy(
            sensorAccuracy = accuracy,
            isLowAccuracy = isLow
        )
    }
}
