package com.nur.islamiccompanion.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nur.islamiccompanion.data.model.PrayerName
import com.nur.islamiccompanion.data.model.RamadanState
import com.nur.islamiccompanion.ui.components.NurCard
import com.nur.islamiccompanion.ui.components.NurHeader
import com.nur.islamiccompanion.ui.theme.*
import com.nur.islamiccompanion.ui.viewmodel.MainViewModel

@Composable
fun RamadanScreen(
    viewModel: MainViewModel
) {
    val daySchedule by viewModel.daySchedule.collectAsState()
    val prayers by viewModel.prayerTimes.collectAsState()
    val settings by viewModel.userSettings.collectAsState()

    var state by remember { mutableStateOf(RamadanState()) }

    val suhoorTime = daySchedule?.fajr?.timeFormatted
        ?: prayers.find { it.name == PrayerName.FAJR }?.timeFormatted
        ?: "--:--"

    val iftarTime = daySchedule?.maghrib?.timeFormatted
        ?: prayers.find { it.name == PrayerName.MAGHRIB }?.timeFormatted
        ?: "--:--"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 80.dp)
    ) {
        NurHeader(
            title = "Ramadan Sanctuary",
            subtitle = "Fasting & Taraweeh • ${settings.cityName}"
        )

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Suhoor & Iftar Times (Astronomically Calculated)
            item {
                NurCard(
                    modifier = Modifier.fillMaxWidth(),
                    borderColor = NurGold
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(text = "Suhoor Ends (Imsak / Fajr)", color = NurTextSecondary, fontSize = 12.sp)
                            Text(text = suhoorTime, color = NurGold, fontWeight = FontWeight.Bold, fontSize = 22.sp)
                        }
                        Divider(
                            modifier = Modifier
                                .height(40.dp)
                                .width(1.dp),
                            color = NurCardBorder
                        )
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(text = "Iftar Time (Maghrib)", color = NurTextSecondary, fontSize = 12.sp)
                            Text(text = iftarTime, color = NurEmerald, fontWeight = FontWeight.Bold, fontSize = 22.sp)
                        }
                    }
                }
            }

            // Fasting Status
            item {
                NurCard(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Fasting Status",
                        style = MaterialTheme.typography.titleMedium,
                        color = NurTextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("Fasting", "Completed", "Exempt").forEach { status ->
                            FilterChip(
                                selected = state.fastingStatusToday == status,
                                onClick = { state = state.copy(fastingStatusToday = status) },
                                label = { Text(status) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = NurEmerald,
                                    selectedLabelColor = NurMidnightDark
                                )
                            )
                        }
                    }
                }
            }

            // Taraweeh & Qur'an Progress
            item {
                NurCard(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Taraweeh Rakats",
                        style = MaterialTheme.typography.titleMedium,
                        color = NurTextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "${state.taraweehRakatsCompleted} / 20 Rakats Completed",
                            style = MaterialTheme.typography.bodyLarge,
                            color = NurGold
                        )
                        Button(
                            onClick = {
                                state = state.copy(taraweehRakatsCompleted = (state.taraweehRakatsCompleted + 2).coerceAtMost(20))
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = NurGold)
                        ) {
                            Text("+2 Rakats", color = NurMidnightDark, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Daily Sadaqah Tracker
            item {
                NurCard(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Daily Sadaqah (Charity)",
                        style = MaterialTheme.typography.titleMedium,
                        color = NurTextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "$${state.charityDonatedToday} logged today for the pleasure of Allah.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = NurTextSecondary
                    )
                }
            }
        }
    }
}
