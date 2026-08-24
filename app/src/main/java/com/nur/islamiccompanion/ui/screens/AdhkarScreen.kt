package com.nur.islamiccompanion.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nur.islamiccompanion.data.model.DhikrItem
import com.nur.islamiccompanion.service.AudioPlaybackState
import com.nur.islamiccompanion.ui.components.NurCard
import com.nur.islamiccompanion.ui.components.NurHeader
import com.nur.islamiccompanion.ui.theme.*
import com.nur.islamiccompanion.ui.viewmodel.MainViewModel

@Composable
fun AdhkarScreen(
    viewModel: MainViewModel
) {
    var selectedTab by remember { mutableStateOf(0) }
    val tabTitles = listOf("Morning", "Evening", "After Prayer")
    val audioStatus by viewModel.audioStatus.collectAsState()

    val adhkarList = remember(selectedTab) {
        when (selectedTab) {
            0 -> viewModel.adhkarRepo.getMorningAdhkar()
            1 -> viewModel.adhkarRepo.getEveningAdhkar()
            else -> viewModel.adhkarRepo.getAfterPrayerAdhkar()
        }
    }

    var itemsState by remember(selectedTab) { mutableStateOf(adhkarList) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 80.dp)
    ) {
        NurHeader(
            title = "Adhkar (Remembrance)",
            subtitle = "Daily fortress of the believer",
            actions = {
                if (audioStatus.state == AudioPlaybackState.PLAYING_TTS) {
                    IconButton(onClick = { viewModel.stopAudio() }) {
                        Icon(
                            imageVector = Icons.Filled.Stop,
                            contentDescription = "Stop Audio",
                            tint = NurGold
                        )
                    }
                }
            }
        )

        TabRow(
            selectedTabIndex = selectedTab,
            containerColor = NurSurfaceDark,
            contentColor = NurGold
        ) {
            tabTitles.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { Text(title, fontWeight = FontWeight.Bold) }
                )
            }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(itemsState, key = { it.id }) { item ->
                val isPlaying = audioStatus.playingDuaOrDhikrId == item.id &&
                        audioStatus.state == AudioPlaybackState.PLAYING_TTS

                AdhkarCounterCard(
                    item = item,
                    isPlaying = isPlaying,
                    onListen = {
                        if (isPlaying) {
                            viewModel.stopAudio()
                        } else {
                            // STRICT REQUIREMENT: Reads ONLY original Arabic text
                            viewModel.speakOriginalText(item.originalText, "ar", item.id)
                        }
                    },
                    onIncrement = {
                        itemsState = itemsState.map {
                            if (it.id == item.id) {
                                val nextCount = (it.currentCount + 1).coerceAtMost(it.targetCount)
                                it.copy(currentCount = nextCount, completed = nextCount >= it.targetCount)
                            } else it
                        }
                    }
                )
            }
        }
    }
}

@Composable
fun AdhkarCounterCard(
    item: DhikrItem,
    isPlaying: Boolean,
    onListen: () -> Unit,
    onIncrement: () -> Unit
) {
    val isDone = item.completed || item.currentCount >= item.targetCount
    val borderColor = if (isDone) NurEmerald else NurCardBorder

    NurCard(
        modifier = Modifier.fillMaxWidth(),
        borderColor = borderColor
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = item.title,
                style = MaterialTheme.typography.titleMedium,
                color = if (isDone) NurEmerald else NurGold,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.weight(1f)
            )

            Row(verticalAlignment = Alignment.CenterVertically) {
                // Read Button (Arabic Only)
                Button(
                    onClick = onListen,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isPlaying) NurEmerald else NurMidnightDark
                    ),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (isPlaying) NurEmerald else NurCardBorder
                    )
                ) {
                    Icon(
                        imageVector = if (isPlaying) Icons.Filled.Stop else Icons.Filled.VolumeUp,
                        contentDescription = if (isPlaying) "Stop Speech" else "Read Arabic Dhikr",
                        tint = if (isPlaying) NurMidnightDark else NurGold,
                        modifier = Modifier.size(15.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = if (isPlaying) "Stop" else "Read",
                        fontSize = 12.sp,
                        color = if (isPlaying) NurMidnightDark else NurTextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.width(8.dp))

                Surface(
                    shape = CircleShape,
                    color = if (isDone) NurEmerald.copy(alpha = 0.15f) else NurGold.copy(alpha = 0.12f)
                ) {
                    Text(
                        text = "${item.currentCount} / ${item.targetCount}",
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        color = if (isDone) NurEmerald else NurGold,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Original Arabic Text (Separate container)
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(8.dp),
            color = NurMidnightDark.copy(alpha = 0.5f),
            border = androidx.compose.foundation.BorderStroke(1.dp, NurCardBorder)
        ) {
            Text(
                text = item.arabic,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                textAlign = TextAlign.Right,
                fontSize = 20.sp,
                lineHeight = 32.sp,
                color = NurTextPrimary,
                fontWeight = FontWeight.SemiBold
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = item.transliteration,
            fontSize = 14.sp,
            color = NurGoldLight,
            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = item.translation,
            fontSize = 14.sp,
            color = NurTextSecondary
        )

        Spacer(modifier = Modifier.height(12.dp))

        Button(
            onClick = onIncrement,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = if (isDone) NurEmerald else NurGold
            ),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text(
                text = if (isDone) "Completed (${item.targetCount}x) ✓" else "Tap to Count (+1)",
                color = NurMidnightDark,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
