package com.nur.islamiccompanion.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nur.islamiccompanion.data.model.CalculationMethod
import com.nur.islamiccompanion.data.model.HighLatitudeRule
import com.nur.islamiccompanion.data.model.Madhab
import com.nur.islamiccompanion.data.model.PrayerName
import com.nur.islamiccompanion.ui.components.NurCard
import com.nur.islamiccompanion.ui.components.NurHeader
import com.nur.islamiccompanion.ui.theme.*
import com.nur.islamiccompanion.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val settings by viewModel.userSettings.collectAsState()

    var arabicFontSize by remember(settings.arabicFontSizeSp) { mutableStateOf(settings.arabicFontSizeSp) }
    var translationFontSize by remember(settings.translationFontSizeSp) { mutableStateOf(settings.translationFontSizeSp) }

    var expandedMethodDropdown by remember { mutableStateOf(false) }
    var expandedMadhabDropdown by remember { mutableStateOf(false) }
    var expandedHighLatDropdown by remember { mutableStateOf(false) }

    var manualCity by remember(settings.cityName) { mutableStateOf(settings.cityName) }
    var manualCountry by remember(settings.countryName) { mutableStateOf(settings.countryName) }
    var manualLat by remember(settings.customLatitude) { mutableStateOf(settings.customLatitude.toString()) }
    var manualLng by remember(settings.customLongitude) { mutableStateOf(settings.customLongitude.toString()) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 80.dp)
    ) {
        NurHeader(
            title = "Settings & Preferences",
            subtitle = "Adhan Alarms, Calculation & Audio",
            onBack = onBack
        )

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Adhan & Prayer Notification Alarms
            item {
                NurCard(
                    modifier = Modifier.fillMaxWidth(),
                    borderColor = NurGold
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Prayer Notifications & Adhan",
                                style = MaterialTheme.typography.titleMedium,
                                color = NurGold,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Enable exact alarm triggers at prayer times",
                                style = MaterialTheme.typography.bodySmall,
                                color = NurTextSecondary
                            )
                        }
                        Switch(
                            checked = settings.enablePrayerNotifications,
                            onCheckedChange = {
                                viewModel.updateSettings(settings.copy(enablePrayerNotifications = it))
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = NurMidnightDark,
                                checkedTrackColor = NurGold
                            )
                        )
                    }

                    if (settings.enablePrayerNotifications) {
                        Divider(modifier = Modifier.padding(vertical = 10.dp), color = NurCardBorder)

                        // Fajr Adhan Sound Switch
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Fajr Adhan Audio",
                                    color = NurTextPrimary,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Text(
                                    text = "Plays specialized Fajr Adhan (الصلاة خير من النوم)",
                                    fontSize = 12.sp,
                                    color = NurTextSecondary
                                )
                            }
                            Switch(
                                checked = settings.fajrAdhanEnabled,
                                onCheckedChange = {
                                    viewModel.updateSettings(settings.copy(fajrAdhanEnabled = it))
                                },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = NurMidnightDark,
                                    checkedTrackColor = NurGold
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Other Prayers Adhan Sound Switch
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Dhuhr, Asr, Maghrib, Isha Adhan",
                                    color = NurTextPrimary,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Text(
                                    text = "Plays standard authentic Adhan call to prayer",
                                    fontSize = 12.sp,
                                    color = NurTextSecondary
                                )
                            }
                            Switch(
                                checked = settings.otherPrayersAdhanEnabled,
                                onCheckedChange = {
                                    viewModel.updateSettings(settings.copy(otherPrayersAdhanEnabled = it))
                                },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = NurMidnightDark,
                                    checkedTrackColor = NurGold
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Vibration Switch
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Vibration with Alarm",
                                color = NurTextPrimary,
                                fontWeight = FontWeight.Medium
                            )
                            Switch(
                                checked = settings.enableVibration,
                                onCheckedChange = {
                                    viewModel.updateSettings(settings.copy(enableVibration = it))
                                },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = NurMidnightDark,
                                    checkedTrackColor = NurGold
                                )
                            )
                        }

                        Divider(modifier = Modifier.padding(vertical = 10.dp), color = NurCardBorder)

                        Text(
                            text = "Individual Prayer Alarm Toggles:",
                            style = MaterialTheme.typography.labelMedium,
                            color = NurGold
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        PrayerToggleRow(
                            name = "Fajr",
                            enabled = settings.fajrAlarmEnabled,
                            onToggle = { viewModel.updateSettings(settings.copy(fajrAlarmEnabled = it)) }
                        )
                        PrayerToggleRow(
                            name = "Dhuhr",
                            enabled = settings.dhuhrAlarmEnabled,
                            onToggle = { viewModel.updateSettings(settings.copy(dhuhrAlarmEnabled = it)) }
                        )
                        PrayerToggleRow(
                            name = "Asr",
                            enabled = settings.asrAlarmEnabled,
                            onToggle = { viewModel.updateSettings(settings.copy(asrAlarmEnabled = it)) }
                        )
                        PrayerToggleRow(
                            name = "Maghrib",
                            enabled = settings.maghribAlarmEnabled,
                            onToggle = { viewModel.updateSettings(settings.copy(maghribAlarmEnabled = it)) }
                        )
                        PrayerToggleRow(
                            name = "Isha",
                            enabled = settings.ishaAlarmEnabled,
                            onToggle = { viewModel.updateSettings(settings.copy(ishaAlarmEnabled = it)) }
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        // Test Buttons
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = { viewModel.testAdhan(PrayerName.FAJR) },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(containerColor = NurGold),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Test Fajr Adhan", color = NurMidnightDark, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                            }
                            Button(
                                onClick = { viewModel.testAlarm(5) },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(containerColor = NurEmerald),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Test 5s Wake Alarm", color = NurMidnightDark, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = { viewModel.testArabicTts() },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(containerColor = NurCardBorder),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Test Arabic TTS (بِسْمِ اللَّهِ)", color = NurGold, fontWeight = FontWeight.SemiBold, fontSize = 10.sp)
                            }
                            Button(
                                onClick = { viewModel.testUrduTts() },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(containerColor = NurCardBorder),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Test Urdu TTS", color = NurEmerald, fontWeight = FontWeight.SemiBold, fontSize = 10.sp)
                            }
                        }
                    }
                }
            }

            // Calculation Method & Jurisprudence (Madhhab)
            item {
                NurCard(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Astronomical Calculation Parameters",
                        style = MaterialTheme.typography.titleMedium,
                        color = NurGold,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    // Calculation Method
                    Text(text = "Calculation Method:", style = MaterialTheme.typography.labelMedium, color = NurTextSecondary)
                    Spacer(modifier = Modifier.height(4.dp))

                    ExposedDropdownMenuBox(
                        expanded = expandedMethodDropdown,
                        onExpandedChange = { expandedMethodDropdown = it }
                    ) {
                        OutlinedTextField(
                            value = settings.calculationMethod.displayName,
                            onValueChange = {},
                            readOnly = true,
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedMethodDropdown) },
                            modifier = Modifier.menuAnchor().fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = NurGold,
                                unfocusedBorderColor = NurCardBorder,
                                focusedTextColor = NurTextPrimary,
                                unfocusedTextColor = NurTextPrimary
                            )
                        )

                        ExposedDropdownMenu(
                            expanded = expandedMethodDropdown,
                            onDismissRequest = { expandedMethodDropdown = false }
                        ) {
                            CalculationMethod.values().forEach { method ->
                                DropdownMenuItem(
                                    text = { Text(method.displayName) },
                                    onClick = {
                                        viewModel.updateSettings(settings.copy(calculationMethod = method))
                                        expandedMethodDropdown = false
                                    }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Madhab (Asr Shadow Factor)
                    Text(text = "Jurisprudence (Asr Time):", style = MaterialTheme.typography.labelMedium, color = NurTextSecondary)
                    Spacer(modifier = Modifier.height(4.dp))

                    ExposedDropdownMenuBox(
                        expanded = expandedMadhabDropdown,
                        onExpandedChange = { expandedMadhabDropdown = it }
                    ) {
                        OutlinedTextField(
                            value = settings.madhab.displayName,
                            onValueChange = {},
                            readOnly = true,
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedMadhabDropdown) },
                            modifier = Modifier.menuAnchor().fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = NurGold,
                                unfocusedBorderColor = NurCardBorder,
                                focusedTextColor = NurTextPrimary,
                                unfocusedTextColor = NurTextPrimary
                            )
                        )

                        ExposedDropdownMenu(
                            expanded = expandedMadhabDropdown,
                            onDismissRequest = { expandedMadhabDropdown = false }
                        ) {
                            Madhab.values().forEach { madhab ->
                                DropdownMenuItem(
                                    text = { Text(madhab.displayName) },
                                    onClick = {
                                        viewModel.updateSettings(settings.copy(madhab = madhab))
                                        expandedMadhabDropdown = false
                                    }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // High Latitude Rule
                    Text(text = "High Latitude Rule:", style = MaterialTheme.typography.labelMedium, color = NurTextSecondary)
                    Spacer(modifier = Modifier.height(4.dp))

                    ExposedDropdownMenuBox(
                        expanded = expandedHighLatDropdown,
                        onExpandedChange = { expandedHighLatDropdown = it }
                    ) {
                        OutlinedTextField(
                            value = settings.highLatitudeRule.displayName,
                            onValueChange = {},
                            readOnly = true,
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedHighLatDropdown) },
                            modifier = Modifier.menuAnchor().fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = NurGold,
                                unfocusedBorderColor = NurCardBorder,
                                focusedTextColor = NurTextPrimary,
                                unfocusedTextColor = NurTextPrimary
                            )
                        )

                        ExposedDropdownMenu(
                            expanded = expandedHighLatDropdown,
                            onDismissRequest = { expandedHighLatDropdown = false }
                        ) {
                            HighLatitudeRule.values().forEach { rule ->
                                DropdownMenuItem(
                                    text = { Text(rule.displayName) },
                                    onClick = {
                                        viewModel.updateSettings(settings.copy(highLatitudeRule = rule))
                                        expandedHighLatDropdown = false
                                    }
                                )
                            }
                        }
                    }
                }
            }

            // Location Configuration
            item {
                NurCard(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Location Source",
                                style = MaterialTheme.typography.titleMedium,
                                color = NurGold,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = if (settings.autoDetectLocation) "Automatic GPS Location" else "Manual City & Coordinates",
                                style = MaterialTheme.typography.bodySmall,
                                color = NurTextSecondary
                            )
                        }
                        Switch(
                            checked = settings.autoDetectLocation,
                            onCheckedChange = {
                                viewModel.updateSettings(settings.copy(autoDetectLocation = it))
                                if (it) viewModel.refreshLocation()
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = NurMidnightDark,
                                checkedTrackColor = NurGold
                            )
                        )
                    }

                    if (!settings.autoDetectLocation) {
                        Spacer(modifier = Modifier.height(10.dp))
                        OutlinedTextField(
                            value = manualCity,
                            onValueChange = { manualCity = it },
                            label = { Text("City Name") },
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = NurGold,
                                unfocusedBorderColor = NurCardBorder,
                                focusedTextColor = NurTextPrimary,
                                unfocusedTextColor = NurTextPrimary
                            )
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = manualCountry,
                            onValueChange = { manualCountry = it },
                            label = { Text("Country") },
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = NurGold,
                                unfocusedBorderColor = NurCardBorder,
                                focusedTextColor = NurTextPrimary,
                                unfocusedTextColor = NurTextPrimary
                            )
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = manualLat,
                                onValueChange = { manualLat = it },
                                label = { Text("Latitude") },
                                modifier = Modifier.weight(1f),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = NurGold,
                                    unfocusedBorderColor = NurCardBorder,
                                    focusedTextColor = NurTextPrimary,
                                    unfocusedTextColor = NurTextPrimary
                                )
                            )
                            OutlinedTextField(
                                value = manualLng,
                                onValueChange = { manualLng = it },
                                label = { Text("Longitude") },
                                modifier = Modifier.weight(1f),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = NurGold,
                                    unfocusedBorderColor = NurCardBorder,
                                    focusedTextColor = NurTextPrimary,
                                    unfocusedTextColor = NurTextPrimary
                                )
                            )
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Button(
                            onClick = {
                                val lat = manualLat.toDoubleOrNull() ?: settings.customLatitude
                                val lng = manualLng.toDoubleOrNull() ?: settings.customLongitude
                                viewModel.setCustomLocation(lat, lng, manualCity, manualCountry)
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = NurGold),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Apply Custom Location", color = NurMidnightDark, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Qur'an Typography Settings
            item {
                NurCard(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Qur'an Typography",
                        style = MaterialTheme.typography.titleMedium,
                        color = NurGold,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Arabic Font Size: ${arabicFontSize.toInt()} sp",
                        color = NurTextPrimary
                    )
                    Slider(
                        value = arabicFontSize,
                        onValueChange = {
                            arabicFontSize = it
                            viewModel.updateSettings(settings.copy(arabicFontSizeSp = it))
                        },
                        valueRange = 20f..38f,
                        colors = SliderDefaults.colors(
                            thumbColor = NurGold,
                            activeTrackColor = NurGold
                        )
                    )

                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Translation Font Size: ${translationFontSize.toInt()} sp",
                        color = NurTextPrimary
                    )
                    Slider(
                        value = translationFontSize,
                        onValueChange = {
                            translationFontSize = it
                            viewModel.updateSettings(settings.copy(translationFontSizeSp = it))
                        },
                        valueRange = 12f..24f,
                        colors = SliderDefaults.colors(
                            thumbColor = NurGold,
                            activeTrackColor = NurGold
                        )
                    )
                }
            }

            // Application Information & Architecture
            item {
                NurCard(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "About NUR — Islamic Personal Companion",
                        style = MaterialTheme.typography.titleMedium,
                        color = NurGold,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Native Android Edition • Jetpack Compose\n" +
                                "• Strict separation of Arabic recitation / audio vs translation\n" +
                                "• Astronomical calculation engine with magnetic declination correction\n" +
                                "• Exact AlarmManager Adhan synchronization",
                        color = NurTextSecondary,
                        style = MaterialTheme.typography.bodyMedium,
                        lineHeight = 20.sp
                    )
                }
            }
        }
    }
}

@Composable
fun PrayerToggleRow(
    name: String,
    enabled: Boolean,
    onToggle: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = name, color = NurTextPrimary, fontSize = 14.sp)
        Switch(
            checked = enabled,
            onCheckedChange = onToggle,
            colors = SwitchDefaults.colors(
                checkedThumbColor = NurMidnightDark,
                checkedTrackColor = NurEmerald
            )
        )
    }
}
