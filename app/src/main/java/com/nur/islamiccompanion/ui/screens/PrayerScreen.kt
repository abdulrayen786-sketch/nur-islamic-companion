package com.nur.islamiccompanion.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nur.islamiccompanion.data.model.PrayerName
import com.nur.islamiccompanion.data.model.PrayerTime
import com.nur.islamiccompanion.ui.components.NurCard
import com.nur.islamiccompanion.ui.components.NurHeader
import com.nur.islamiccompanion.ui.theme.*
import com.nur.islamiccompanion.ui.viewmodel.MainViewModel

@Composable
fun PrayerScreen(
    viewModel: MainViewModel,
    onOpenQibla: () -> Unit
) {
    val prayers by viewModel.prayerTimes.collectAsState()
    val settings by viewModel.userSettings.collectAsState()
    val nextPrayer by viewModel.nextPrayer.collectAsState()
    val currentPrayer by viewModel.currentPrayer.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 80.dp)
    ) {
        NurHeader(
            title = "Prayer Times",
            subtitle = "${settings.cityName}, ${settings.countryName}",
            actions = {
                IconButton(onClick = { viewModel.refreshLocation() }) {
                    Icon(
                        imageVector = Icons.Filled.MyLocation,
                        contentDescription = "Refresh GPS Location",
                        tint = NurGold
                    )
                }
            }
        )

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Next Prayer Spotlight
            item {
                NurCard(
                    modifier = Modifier.fillMaxWidth(),
                    borderColor = NurGold,
                    backgroundColor = NurCardDark
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = NurGold.copy(alpha = 0.15f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, NurGold)
                        ) {
                            Text(
                                text = "NEXT PRAYER",
                                style = MaterialTheme.typography.labelSmall,
                                color = NurGold,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = nextPrayer?.name?.title ?: "Fajr",
                            style = MaterialTheme.typography.displayMedium,
                            color = NurTextPrimary,
                            fontWeight = FontWeight.Bold
                        )

                        Text(
                            text = nextPrayer?.name?.arabic ?: "الفجر",
                            style = MaterialTheme.typography.titleLarge,
                            color = NurGold,
                            fontWeight = FontWeight.SemiBold
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = nextPrayer?.timeFormatted ?: "--:--",
                            style = MaterialTheme.typography.headlineLarge,
                            color = NurGoldLight,
                            fontWeight = FontWeight.Bold
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = "Calculation Parameters",
                                tint = NurEmerald,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "${settings.calculationMethod} Method • ${settings.madhab} Madhab",
                                style = MaterialTheme.typography.bodySmall,
                                color = NurTextSecondary
                            )
                        }
                    }
                }
            }

            // Quick Adhan Audio / Alarm Developer Test Controls
            item {
                NurCard(
                    modifier = Modifier.fillMaxWidth(),
                    backgroundColor = NurMidnightDark
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Adhan & Alarm Testing",
                                style = MaterialTheme.typography.titleSmall,
                                color = NurTextPrimary,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Test audio playback and background exact alarm wakeup",
                                style = MaterialTheme.typography.bodySmall,
                                color = NurTextSecondary
                            )
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = { viewModel.testAdhan(nextPrayer?.name ?: PrayerName.FAJR) },
                                colors = ButtonDefaults.buttonColors(containerColor = NurGold),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.VolumeUp,
                                    contentDescription = "Test Adhan",
                                    tint = NurMidnightDark,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "Test Adhan",
                                    color = NurMidnightDark,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            Button(
                                onClick = { viewModel.testAlarm(5) },
                                colors = ButtonDefaults.buttonColors(containerColor = NurEmerald),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Alarm,
                                    contentDescription = "5s Alarm",
                                    tint = NurMidnightDark,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "5s Alarm",
                                    color = NurMidnightDark,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }

            // Daily 7 Prayer & Solar Times List
            items(prayers, key = { it.name.name }) { prayer ->
                PrayerTimeCardItem(
                    prayer = prayer,
                    isNext = prayer.timestamp == nextPrayer?.timestamp,
                    isCurrent = prayer.timestamp == currentPrayer?.timestamp
                )
            }

            // Qibla Shortcut Card
            item {
                NurCard(
                    modifier = Modifier.fillMaxWidth(),
                    onClick = onOpenQibla
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Qibla Direction",
                                style = MaterialTheme.typography.titleMedium,
                                color = NurTextPrimary,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Live sensor compass pointing to Makkah",
                                style = MaterialTheme.typography.bodyMedium,
                                color = NurTextSecondary
                            )
                        }
                        Button(
                            onClick = onOpenQibla,
                            colors = ButtonDefaults.buttonColors(containerColor = NurGold)
                        ) {
                            Text("Open Compass", color = NurMidnightDark, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PrayerTimeCardItem(
    prayer: PrayerTime,
    isNext: Boolean,
    isCurrent: Boolean
) {
    val prayerIcon = when (prayer.name) {
        PrayerName.FAJR -> Icons.Filled.NightsStay
        PrayerName.SUNRISE -> Icons.Filled.WbTwilight
        PrayerName.DHUHR -> Icons.Filled.WbSunny
        PrayerName.ASR -> Icons.Filled.LightMode
        PrayerName.SUNSET -> Icons.Filled.WbTwilight
        PrayerName.MAGHRIB -> Icons.Filled.NightsStay
        PrayerName.ISHA -> Icons.Filled.Bedtime
    }

    val iconTint = when {
        isNext -> NurGold
        isCurrent -> NurEmerald
        prayer.isPassed -> NurTextMuted
        else -> NurTextPrimary
    }

    val borderColor = when {
        isNext -> NurGold
        isCurrent -> NurEmerald
        else -> NurCardBorder
    }

    val bgColor = when {
        isNext -> NurCardDark
        isCurrent -> NurCardDark
        else -> NurCardDark.copy(alpha = 0.6f)
    }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = bgColor,
        border = androidx.compose.foundation.BorderStroke(if (isNext || isCurrent) 2.dp else 1.dp, borderColor)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(if (isNext) NurGold.copy(alpha = 0.2f) else NurMidnightDark),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = prayerIcon,
                        contentDescription = prayer.name.title,
                        tint = iconTint,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = prayer.name.title,
                            style = MaterialTheme.typography.titleMedium,
                            color = if (isNext) NurGold else if (isCurrent) NurEmerald else NurTextPrimary,
                            fontWeight = if (isNext || isCurrent) FontWeight.Bold else FontWeight.Medium
                        )

                        if (!prayer.name.isObligatory) {
                            Spacer(modifier = Modifier.width(6.dp))
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = NurCardBorder
                            ) {
                                Text(
                                    text = "Solar",
                                    fontSize = 10.sp,
                                    color = NurTextMuted,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }

                    Text(
                        text = prayer.name.arabic,
                        style = MaterialTheme.typography.bodySmall,
                        color = NurTextSecondary
                    )
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = prayer.timeFormatted,
                    style = MaterialTheme.typography.titleMedium,
                    color = if (isNext) NurGoldLight else if (isCurrent) NurEmerald else NurTextPrimary,
                    fontWeight = FontWeight.Bold
                )

                Text(
                    text = when {
                        isNext -> "Next"
                        isCurrent -> "Active Now"
                        prayer.isPassed -> "Passed"
                        else -> "Upcoming"
                    },
                    style = MaterialTheme.typography.labelSmall,
                    color = if (isNext) NurGold else if (isCurrent) NurEmerald else NurTextMuted
                )
            }
        }
    }
}
