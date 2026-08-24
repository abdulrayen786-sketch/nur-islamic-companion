package com.nur.islamiccompanion.ui.screens

import android.Manifest
import android.content.pm.PackageManager
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nur.islamiccompanion.service.QiblaService
import com.nur.islamiccompanion.ui.components.NurCard
import com.nur.islamiccompanion.ui.components.NurHeader
import com.nur.islamiccompanion.ui.theme.*
import com.nur.islamiccompanion.ui.viewmodel.MainViewModel
import androidx.core.content.ContextCompat

@Composable
fun QiblaScreen(
    viewModel: MainViewModel
) {
    val compassState by viewModel.compassState.collectAsState()
    val userSettings by viewModel.userSettings.collectAsState()
    val locationData by viewModel.locationData.collectAsState()
    val context = LocalContext.current
    var hasLocationPermission by remember {
        mutableStateOf(viewModel.locationService.hasLocationPermission())
    }
    val locationPermissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        hasLocationPermission = granted || ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        if (hasLocationPermission) viewModel.refreshLocation()
    }

    var showDebugPanel by remember { mutableStateOf(false) }

    DisposableEffect(Unit) {
        viewModel.startQiblaCompass()
        onDispose {
            viewModel.stopQiblaCompass()
        }
    }

    val animatedDialRotation by animateFloatAsState(
        targetValue = -compassState.trueDeviceHeading,
        animationSpec = spring(stiffness = 200f),
        label = "compassDial"
    )

    val animatedQiblaAngle by animateFloatAsState(
        targetValue = compassState.relativeQiblaAngle,
        animationSpec = spring(stiffness = 200f),
        label = "qiblaNeedle"
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 80.dp),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            NurHeader(
                title = "Qibla Compass",
                subtitle = "Align with the Holy Kaaba in Makkah al-Mukarramah",
                actions = {
                    IconButton(onClick = { viewModel.refreshLocation() }) {
                        Icon(
                            imageVector = Icons.Filled.MyLocation,
                            contentDescription = "Refresh Location",
                            tint = NurGold
                        )
                    }
                    IconButton(onClick = { showDebugPanel = !showDebugPanel }) {
                        Icon(
                            imageVector = if (showDebugPanel) Icons.Filled.BugReport else Icons.Outlined.BugReport,
                            contentDescription = "Toggle Debug Info",
                            tint = if (showDebugPanel) NurEmerald else NurTextSecondary
                        )
                    }
                }
            )
        }

        if (!hasLocationPermission) {
            item {
                NurCard(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Location permission is required to find the Qibla.",
                        color = NurTextPrimary,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = {
                            locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = NurGold)
                    ) {
                        Text("Enable Location", color = NurMidnightDark, fontWeight = FontWeight.Bold)
                    }
                }
            }
        } else if (!compassState.hasLocation) {
            item {
                Text(
                    text = "Waiting for your current location...",
                    modifier = Modifier.fillMaxWidth(),
                    color = NurTextSecondary
                )
            }
        }

        if (!compassState.sensorAvailable) {
            item {
                Text(
                    text = "Your device does not support the required compass sensors.",
                    modifier = Modifier.fillMaxWidth(),
                    color = NurGold
                )
            }
        }

        // Low Accuracy Calibration Banner
        if (compassState.isLowAccuracy) {
            item {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFF4A3B12),
                    border = androidx.compose.foundation.BorderStroke(1.dp, NurGold)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Filled.WarningAmber,
                            contentDescription = "Calibrate",
                            tint = NurGold,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "Compass accuracy is low. Move your phone in a figure-eight motion (∞) to calibrate.",
                            style = MaterialTheme.typography.bodySmall,
                            color = NurGold
                        )
                    }
                }
            }
        }

        // Current Location & Bearing Card
        item {
            NurCard(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = when {
                                userSettings.autoDetectLocation && locationData.isAutoDetected ->
                                    "${locationData.cityName}, ${locationData.countryName}"
                                userSettings.autoDetectLocation -> "Current Location"
                                else -> "${userSettings.cityName}, ${userSettings.countryName}"
                            },
                            style = MaterialTheme.typography.titleMedium,
                            color = NurTextPrimary,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = if (compassState.hasLocation) {
                                "Latitude: %.5f\nLongitude: %.5f".format(
                                    compassState.userLatitude,
                                    compassState.userLongitude
                                )
                            } else {
                                "Coordinates unavailable"
                            },
                            style = MaterialTheme.typography.bodySmall,
                            color = NurTextSecondary
                        )
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = if (compassState.hasLocation) {
                                "%.1f°".format(compassState.qiblaBearing)
                            } else {
                                "--"
                            },
                            style = MaterialTheme.typography.headlineMedium,
                            color = NurGold,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Qibla Bearing",
                            style = MaterialTheme.typography.labelSmall,
                            color = NurTextSecondary
                        )
                        if (compassState.hasLocation) {
                            Text(
                                text = "GPS: %.0f m".format(compassState.locationAccuracyMeters),
                                style = MaterialTheme.typography.labelSmall,
                                color = NurTextSecondary
                            )
                        }
                    }
                }
            }
        }

        // Alignment Status Banner
        if (compassState.hasLocation && compassState.sensorAvailable) item {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = if (compassState.isAlignedWithQibla) NurEmerald.copy(alpha = 0.2f) else NurCardDark,
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    if (compassState.isAlignedWithQibla) NurEmerald else NurCardBorder
                )
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = if (compassState.isAlignedWithQibla) Icons.Filled.CheckCircle else Icons.Filled.Navigation,
                        contentDescription = null,
                        tint = if (compassState.isAlignedWithQibla) NurEmerald else NurGold,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (compassState.isAlignedWithQibla) "You are facing the Kaaba (Qibla)" else "Turn device until needle points straight up",
                        style = MaterialTheme.typography.labelMedium,
                        color = if (compassState.isAlignedWithQibla) NurEmerald else NurTextPrimary,
                        fontWeight = if (compassState.isAlignedWithQibla) FontWeight.Bold else FontWeight.Normal
                    )
                }
            }
        }

        // Compass Visual Dial
        if (compassState.hasLocation && compassState.sensorAvailable) item {
            Box(
                modifier = Modifier
                    .size(280.dp)
                    .clip(CircleShape)
                    .border(
                        width = if (compassState.isAlignedWithQibla) 3.dp else 2.dp,
                        color = if (compassState.isAlignedWithQibla) NurEmerald else NurCardBorder,
                        shape = CircleShape
                    )
                    .background(NurCardDark),
                contentAlignment = Alignment.Center
            ) {
                // Rotating Compass Dial (N, E, S, W)
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .rotate(animatedDialRotation),
                    contentAlignment = Alignment.Center
                ) {
                    // North
                    Column(
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                            .padding(top = 10.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(text = "N", color = NurGold, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Box(modifier = Modifier.size(4.dp, 8.dp).background(NurGold))
                    }

                    // East
                    Row(
                        modifier = Modifier
                            .align(Alignment.CenterEnd)
                            .padding(end = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(modifier = Modifier.size(8.dp, 4.dp).background(NurTextSecondary))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "E", color = NurTextSecondary, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                    }

                    // South
                    Column(
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(bottom = 10.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(modifier = Modifier.size(4.dp, 8.dp).background(NurTextSecondary))
                        Text(text = "S", color = NurTextSecondary, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                    }

                    // West
                    Row(
                        modifier = Modifier
                            .align(Alignment.CenterStart)
                            .padding(start = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "W", color = NurTextSecondary, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                        Spacer(modifier = Modifier.width(4.dp))
                        Box(modifier = Modifier.size(8.dp, 4.dp).background(NurTextSecondary))
                    }

                    // Sub-cardinals (NE, SE, SW, NW)
                    Text(text = "NE", color = NurTextMuted, fontSize = 11.sp, modifier = Modifier.align(Alignment.TopEnd).padding(top = 40.dp, end = 40.dp))
                    Text(text = "SE", color = NurTextMuted, fontSize = 11.sp, modifier = Modifier.align(Alignment.BottomEnd).padding(bottom = 40.dp, end = 40.dp))
                    Text(text = "SW", color = NurTextMuted, fontSize = 11.sp, modifier = Modifier.align(Alignment.BottomStart).padding(bottom = 40.dp, start = 40.dp))
                    Text(text = "NW", color = NurTextMuted, fontSize = 11.sp, modifier = Modifier.align(Alignment.TopStart).padding(top = 40.dp, start = 40.dp))
                }

                // Center Kaaba Needle (points to relative Qibla angle)
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .rotate(animatedQiblaAngle),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Filled.Navigation,
                        contentDescription = "Qibla Direction",
                        tint = if (compassState.isAlignedWithQibla) NurEmerald else NurGold,
                        modifier = Modifier.size(90.dp)
                    )
                    Spacer(modifier = Modifier.height(20.dp))
                }

                // Center Kaaba Emblem
                Surface(
                    modifier = Modifier.size(36.dp),
                    shape = CircleShape,
                    color = NurMidnightDark,
                    border = androidx.compose.foundation.BorderStroke(1.dp, NurGold)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = "🕋",
                            fontSize = 16.sp
                        )
                    }
                }
            }
        }

        // Live Heading & Distance readout
        if (compassState.hasLocation && compassState.sensorAvailable) item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "%.0f°".format(compassState.qiblaBearing),
                        style = MaterialTheme.typography.titleLarge,
                        color = NurGold,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Qibla",
                        style = MaterialTheme.typography.labelSmall,
                        color = NurTextSecondary
                    )
                }

                Divider(
                    modifier = Modifier
                        .height(30.dp)
                        .width(1.dp),
                    color = NurCardBorder
                )

                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "%.0f°".format(compassState.trueDeviceHeading),
                        style = MaterialTheme.typography.titleLarge,
                        color = NurTextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Current Heading",
                        style = MaterialTheme.typography.labelSmall,
                        color = NurTextSecondary
                    )
                }

                Divider(
                    modifier = Modifier
                        .height(30.dp)
                        .width(1.dp),
                    color = NurCardBorder
                )

                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "%,.0f km".format(compassState.distanceToKaabaKm),
                        style = MaterialTheme.typography.titleLarge,
                        color = NurEmerald,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Distance to Kaaba",
                        style = MaterialTheme.typography.labelSmall,
                        color = NurTextSecondary
                    )
                }
            }
        }

        // Developer Debug Panel & Test Locations (Expandable)
        item {
            AnimatedVisibility(visible = showDebugPanel) {
                NurCard(
                    modifier = Modifier.fillMaxWidth(),
                    backgroundColor = NurMidnightDark
                ) {
                    Text(
                        text = "Qibla Debug & Diagnostics",
                        style = MaterialTheme.typography.titleMedium,
                        color = NurEmerald,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    Text(text = "• User Coordinates: %.4f, %.4f".format(compassState.userLatitude, compassState.userLongitude), color = NurTextPrimary, fontSize = 12.sp)
                    Text(text = "• True Qibla Bearing: %.2f°".format(compassState.qiblaBearing), color = NurTextPrimary, fontSize = 12.sp)
                    Text(text = "• True Device Heading: %.2f°".format(compassState.trueDeviceHeading), color = NurTextPrimary, fontSize = 12.sp)
                    Text(text = "• Magnetic Heading: %.2f°".format(compassState.magneticHeading), color = NurTextPrimary, fontSize = 12.sp)
                    Text(text = "• Magnetic Declination: %.2f°".format(compassState.magneticDeclination), color = NurTextPrimary, fontSize = 12.sp)
                    Text(text = "• Relative Qibla Angle: %.2f°".format(compassState.relativeQiblaAngle), color = NurTextPrimary, fontSize = 12.sp)
                    Text(text = "• Sensor Accuracy Code: ${compassState.sensorAccuracy} (Low: ${compassState.isLowAccuracy})", color = NurTextPrimary, fontSize = 12.sp)

                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Test Locations (Tap to simulate):",
                        style = MaterialTheme.typography.labelMedium,
                        color = NurGold
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(QiblaService.TEST_LOCATIONS) { loc ->
                            Button(
                                onClick = {
                                    viewModel.setCustomLocation(loc.latitude, loc.longitude, loc.cityName, loc.countryName)
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = NurCardBorder),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = "${loc.cityName} (~${loc.expectedBearingApprox.toInt()}°)",
                                    fontSize = 11.sp,
                                    color = NurTextPrimary
                                )
                            }
                        }
                    }
                }
            }
        }

        // Kaaba Sanctuary Reference Information Card
        item {
            NurCard(modifier = Modifier.fillMaxWidth()) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "🕋",
                        fontSize = 24.sp
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "The Kaaba (Al-Masjid al-Haram)",
                            style = MaterialTheme.typography.titleSmall,
                            color = NurTextPrimary,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Makkah al-Mukarramah (21.4225° N, 39.8262° E)",
                            style = MaterialTheme.typography.bodySmall,
                            color = NurTextSecondary
                        )
                    }
                }
            }
        }
    }
}
