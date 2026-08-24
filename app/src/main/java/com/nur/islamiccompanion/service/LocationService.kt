package com.nur.islamiccompanion.service

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Address
import android.location.Geocoder
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import androidx.core.content.ContextCompat
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import kotlinx.coroutines.launch
import java.util.Locale
import java.util.TimeZone

data class UserLocationData(
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val accuracyMeters: Float = 0f,
    val altitudeMeters: Double = 0.0,
    val cityName: String = "Current Location",
    val countryName: String = "",
    val timezoneId: String = TimeZone.getDefault().id,
    val isAutoDetected: Boolean = false
)

class LocationService(private val context: Context) {

    private val _locationFlow = MutableStateFlow(UserLocationData())
    val locationFlow: StateFlow<UserLocationData> = _locationFlow.asStateFlow()

    private val fusedLocationClient by lazy {
        LocationServices.getFusedLocationProviderClient(context)
    }

    private val locationManager by lazy {
        context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    }
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val locationCallback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            result.lastLocation?.let { location ->
                serviceScope.launch {
                    publishLocation(location)
                }
            }
        }
    }

    fun hasLocationPermission(): Boolean {
        val fine = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        val coarse = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        return fine || coarse
    }

    @SuppressLint("MissingPermission")
    fun startLocationUpdates() {
        if (!hasLocationPermission()) return

        val request = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            5_000L
        ).setMinUpdateDistanceMeters(10f).build()

        try {
            fusedLocationClient.requestLocationUpdates(request, locationCallback, context.mainLooper)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun stopLocationUpdates() {
        fusedLocationClient.removeLocationUpdates(locationCallback)
    }

    fun release() {
        stopLocationUpdates()
        serviceScope.cancel()
    }

    @SuppressLint("MissingPermission")
    suspend fun fetchCurrentLocation(): UserLocationData = withContext(Dispatchers.IO) {
        if (!hasLocationPermission()) {
            return@withContext _locationFlow.value
        }

        try {
            val cts = CancellationTokenSource()
            val fusedTask = fusedLocationClient.getCurrentLocation(
                Priority.PRIORITY_BALANCED_POWER_ACCURACY,
                cts.token
            )

            val location: Location? = try {
                com.google.android.gms.tasks.Tasks.await(fusedTask)
            } catch (e: Exception) {
                null
            } ?: getLastKnownLocationFallback()

            if (location != null) {
                publishLocation(location)
                return@withContext _locationFlow.value
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        return@withContext _locationFlow.value
    }

    private fun publishLocation(location: Location) {
        val geo = resolveAddress(location.latitude, location.longitude)
        _locationFlow.value = UserLocationData(
            latitude = location.latitude,
            longitude = location.longitude,
            accuracyMeters = location.accuracy,
            altitudeMeters = if (location.hasAltitude()) location.altitude else 0.0,
            cityName = geo.first,
            countryName = geo.second,
            timezoneId = TimeZone.getDefault().id,
            isAutoDetected = true
        )
    }

    @SuppressLint("MissingPermission")
    private fun getLastKnownLocationFallback(): Location? {
        if (!hasLocationPermission()) return null
        return try {
            val gpsLoc = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
            val netLoc = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
            val passLoc = locationManager.getLastKnownLocation(LocationManager.PASSIVE_PROVIDER)

            listOfNotNull(gpsLoc, netLoc, passLoc).maxByOrNull { it.time }
        } catch (e: Exception) {
            null
        }
    }

    fun resolveAddress(lat: Double, lng: Double): Pair<String, String> {
        try {
            val geocoder = Geocoder(context, Locale.getDefault())
            val addresses: List<Address>? = geocoder.getFromLocation(lat, lng, 1)
            if (!addresses.isNullOrEmpty()) {
                val address = addresses[0]
                val city = address.locality
                    ?: address.subAdminArea
                    ?: address.adminArea
                    ?: "Current Location"
                val country = address.countryName ?: ""
                return Pair(city, country)
            }
        } catch (e: Exception) {
            // Geocoder might not be available or network constrained
        }
        return Pair("Current Location", "")
    }

    fun setManualLocation(lat: Double, lng: Double, cityName: String, countryName: String, timezoneId: String = TimeZone.getDefault().id) {
        _locationFlow.value = UserLocationData(
            latitude = lat,
            longitude = lng,
            accuracyMeters = 0f,
            altitudeMeters = 0.0,
            cityName = cityName,
            countryName = countryName,
            timezoneId = timezoneId,
            isAutoDetected = false
        )
    }
}
