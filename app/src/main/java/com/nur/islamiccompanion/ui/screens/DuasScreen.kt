package com.nur.islamiccompanion.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import com.nur.islamiccompanion.data.model.Dua
import com.nur.islamiccompanion.data.model.DuaCategory
import com.nur.islamiccompanion.service.AudioPlaybackState
import com.nur.islamiccompanion.ui.components.NurCard
import com.nur.islamiccompanion.ui.components.NurHeader
import com.nur.islamiccompanion.ui.theme.*
import com.nur.islamiccompanion.ui.viewmodel.MainViewModel

@Composable
fun DuasScreen(
    viewModel: MainViewModel
) {
    var selectedCategory by remember { mutableStateOf<DuaCategory?>(null) }
    var searchQuery by remember { mutableStateOf("") }
    val audioStatus by viewModel.audioStatus.collectAsState()

    val allDuas = remember(selectedCategory, searchQuery) {
        val base = if (selectedCategory != null) {
            viewModel.duaRepo.getDuasByCategory(selectedCategory!!)
        } else {
            viewModel.duaRepo.getAllDuas()
        }
        if (searchQuery.isNotEmpty()) {
            base.filter {
                it.title.contains(searchQuery, ignoreCase = true) ||
                it.translation.contains(searchQuery, ignoreCase = true)
            }
        } else {
            base
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 80.dp)
    ) {
        NurHeader(
            title = "Supplications (Duas)",
            subtitle = "Authentic Qur'anic and Sunnah prayers",
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

        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            placeholder = { Text("Search Duas by title or meaning...", color = NurTextMuted) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = NurGold) },
            singleLine = true,
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = NurGold,
                unfocusedBorderColor = NurCardBorder,
                focusedTextColor = NurTextPrimary,
                unfocusedTextColor = NurTextPrimary
            )
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Category Chips
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                FilterChip(
                    selected = selectedCategory == null,
                    onClick = { selectedCategory = null },
                    label = { Text("All") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = NurGold,
                        selectedLabelColor = NurMidnightDark
                    )
                )
            }
            items(DuaCategory.values()) { category ->
                FilterChip(
                    selected = selectedCategory == category,
                    onClick = { selectedCategory = category },
                    label = { Text(category.displayName) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = NurGold,
                        selectedLabelColor = NurMidnightDark
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(allDuas, key = { it.id }) { dua ->
                val isPlaying = audioStatus.playingDuaOrDhikrId == dua.id &&
                        audioStatus.state == AudioPlaybackState.PLAYING_TTS

                DuaCardItem(
                    dua = dua,
                    isPlaying = isPlaying,
                    onListen = {
                        if (isPlaying) {
                            viewModel.stopAudio()
                        } else {
                            // STRICT REQUIREMENT: Reads ONLY original Arabic text, never translation or UI text
                            viewModel.speakOriginalText(dua.originalText, "ar", dua.id)
                        }
                    }
                )
            }
        }
    }
}

@Composable
fun DuaCardItem(
    dua: Dua,
    isPlaying: Boolean,
    onListen: () -> Unit
) {
    NurCard(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = dua.title,
                style = MaterialTheme.typography.titleMedium,
                color = NurGold,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.weight(1f)
            )

            Surface(
                shape = RoundedCornerShape(8.dp),
                color = NurGold.copy(alpha = 0.1f)
            ) {
                Text(
                    text = dua.category.displayName,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                    color = NurGold,
                    fontSize = 11.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Original Arabic Text (Distinct separate container)
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(8.dp),
            color = NurMidnightDark.copy(alpha = 0.5f),
            border = androidx.compose.foundation.BorderStroke(1.dp, NurCardBorder)
        ) {
            Text(
                text = dua.arabic,
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

        Spacer(modifier = Modifier.height(10.dp))

        // Transliteration
        Text(
            text = dua.transliteration,
            fontSize = 14.sp,
            color = NurGoldLight,
            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
        )

        Spacer(modifier = Modifier.height(6.dp))

        // Translation
        Text(
            text = dua.translation,
            fontSize = 15.sp,
            color = NurTextSecondary
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Bottom Controls: Reference & Listen Button (Arabic Only)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Reference: ${dua.reference}",
                fontSize = 11.sp,
                color = NurTextMuted,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.weight(1f)
            )

            Button(
                onClick = onListen,
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isPlaying) NurEmerald else NurCardBorder
                ),
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                shape = RoundedCornerShape(8.dp)
            ) {
                Icon(
                    imageVector = if (isPlaying) Icons.Filled.Stop else Icons.Filled.VolumeUp,
                    contentDescription = if (isPlaying) "Stop Speech" else "Read Arabic Text",
                    tint = if (isPlaying) NurMidnightDark else NurGold,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = if (isPlaying) "Stop" else "Read",
                    fontSize = 13.sp,
                    color = if (isPlaying) NurMidnightDark else NurTextPrimary,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
