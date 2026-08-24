package com.nur.islamiccompanion.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nur.islamiccompanion.data.model.PrayerName
import com.nur.islamiccompanion.ui.components.NurCard
import com.nur.islamiccompanion.ui.components.NurHeader
import com.nur.islamiccompanion.ui.components.NurOrb
import com.nur.islamiccompanion.ui.navigation.Screen
import com.nur.islamiccompanion.ui.theme.*
import com.nur.islamiccompanion.ui.viewmodel.MainViewModel

@Composable
fun HomeScreen(
    viewModel: MainViewModel,
    onNavigate: (Screen) -> Unit
) {
    val userSettings by viewModel.userSettings.collectAsState()
    val progress by viewModel.readingProgress.collectAsState()
    val prayers by viewModel.prayerTimes.collectAsState()
    val tasks by viewModel.tasks.collectAsState()

    val nextPrayer = prayers.find { it.isNext } ?: prayers.firstOrNull()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 80.dp),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            NurHeader(
                title = "Assalamu Alaikum,",
                subtitle = userSettings.userName,
                actions = {
                    IconButton(onClick = { onNavigate(Screen.Settings) }) {
                        Icon(
                            imageVector = Icons.Outlined.Settings,
                            contentDescription = "Settings",
                            tint = NurGold
                        )
                    }
                }
            )
        }

        // NUR Light Orb
        item {
            NurCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = NurCardDark
            ) {
                NurOrb(
                    title = "NUR Beacon",
                    subtitle = "Next: ${nextPrayer?.name?.title ?: "Fajr"}"
                ) {
                    onNavigate(Screen.MuslimAi)
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = nextPrayer?.name?.title ?: "Fajr",
                            style = MaterialTheme.typography.titleMedium,
                            color = NurGold,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = nextPrayer?.timeFormatted ?: "--:--",
                            style = MaterialTheme.typography.bodyMedium,
                            color = NurTextPrimary
                        )
                    }

                    Divider(
                        modifier = Modifier
                            .height(36.dp)
                            .width(1.dp),
                        color = NurCardBorder
                    )

                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "Daily Qur'an",
                            style = MaterialTheme.typography.titleMedium,
                            color = NurGold,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "${progress.dailyCompletedAyahs}/${progress.dailyGoalAyahs} Ayahs",
                            style = MaterialTheme.typography.bodyMedium,
                            color = NurTextPrimary
                        )
                    }
                }
            }
        }

        // Quick Actions
        item {
            Text(
                text = "Quick Actions",
                style = MaterialTheme.typography.titleMedium,
                color = NurTextPrimary,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                QuickActionItem(
                    modifier = Modifier.weight(1f),
                    title = "Qur'an",
                    icon = Icons.Filled.MenuBook,
                    onClick = { onNavigate(Screen.Quran) }
                )
                QuickActionItem(
                    modifier = Modifier.weight(1f),
                    title = "Tasbih",
                    icon = Icons.Filled.TouchApp,
                    onClick = { onNavigate(Screen.Tasbih) }
                )
                QuickActionItem(
                    modifier = Modifier.weight(1f),
                    title = "Qibla",
                    icon = Icons.Filled.Navigation,
                    onClick = { onNavigate(Screen.Qibla) }
                )
                QuickActionItem(
                    modifier = Modifier.weight(1f),
                    title = "Adhkar",
                    icon = Icons.Filled.WbSunny,
                    onClick = { onNavigate(Screen.Adhkar) }
                )
            }
        }

        // Continue Reading
        item {
            NurCard(
                modifier = Modifier.fillMaxWidth(),
                onClick = {
                    onNavigate(Screen.QuranReader)
                }
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Continue Reading",
                            style = MaterialTheme.typography.labelMedium,
                            color = NurGold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "${progress.lastReadSurahName} (Ayah ${progress.lastReadAyah})",
                            style = MaterialTheme.typography.titleMedium,
                            color = NurTextPrimary,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Icon(
                        imageVector = Icons.Filled.ArrowForwardIos,
                        contentDescription = "Open Qur'an",
                        tint = NurGold,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }

        // Ramadan & Reflections Shortcuts
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                NurCard(
                    modifier = Modifier.weight(1f),
                    onClick = { onNavigate(Screen.Ramadan) }
                ) {
                    Icon(
                        imageVector = Icons.Filled.NightsStay,
                        contentDescription = "Ramadan",
                        tint = NurGold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Ramadan",
                        style = MaterialTheme.typography.titleMedium,
                        color = NurTextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Fasting & Taraweeh",
                        style = MaterialTheme.typography.labelMedium,
                        color = NurTextSecondary
                    )
                }

                NurCard(
                    modifier = Modifier.weight(1f),
                    onClick = { onNavigate(Screen.Reflection) }
                ) {
                    Icon(
                        imageVector = Icons.Filled.SelfImprovement,
                        contentDescription = "Reflection",
                        tint = NurEmerald
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Muhasabah",
                        style = MaterialTheme.typography.titleMedium,
                        color = NurTextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Self-Accounting",
                        style = MaterialTheme.typography.labelMedium,
                        color = NurTextSecondary
                    )
                }
            }
        }

        // Today's Tasks
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Today's Tasks",
                    style = MaterialTheme.typography.titleMedium,
                    color = NurTextPrimary,
                    fontWeight = FontWeight.Bold
                )
                TextButton(onClick = { onNavigate(Screen.Tasks) }) {
                    Text(text = "View All", color = NurGold)
                }
            }

            if (tasks.isEmpty()) {
                NurCard(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "No pending tasks. Tap below to create your daily spiritual and life tasks.",
                        color = NurTextSecondary,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            } else {
                tasks.take(3).forEach { task ->
                    NurCard(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        onClick = { viewModel.toggleTask(task.id, !task.completed) }
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Checkbox(
                                checked = task.completed,
                                onCheckedChange = { viewModel.toggleTask(task.id, it) },
                                colors = CheckboxDefaults.colors(
                                    checkedColor = NurEmerald,
                                    checkmarkColor = NurMidnightDark,
                                    uncheckedColor = NurTextMuted
                                )
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = task.name,
                                style = MaterialTheme.typography.bodyLarge,
                                color = if (task.completed) NurTextMuted else NurTextPrimary
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun QuickActionItem(
    modifier: Modifier = Modifier,
    title: String,
    icon: ImageVector,
    onClick: () -> Unit
) {
    Surface(
        modifier = modifier,
        shape = CircleShape,
        color = NurCardDark,
        border = androidx.compose.foundation.BorderStroke(1.dp, NurCardBorder),
        onClick = onClick
    ) {
        Column(
            modifier = Modifier.padding(vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = NurGold,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = title,
                fontSize = 11.sp,
                color = NurTextPrimary,
                fontWeight = FontWeight.Medium
            )
        }
    }
}
