package com.nur.islamiccompanion.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.FormatSize
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nur.islamiccompanion.service.AudioPlaybackState
import com.nur.islamiccompanion.ui.components.AyahItemView
import com.nur.islamiccompanion.ui.components.NurCard
import com.nur.islamiccompanion.ui.components.NurHeader
import com.nur.islamiccompanion.ui.theme.*
import com.nur.islamiccompanion.ui.viewmodel.MainViewModel

@Composable
fun QuranReaderScreen(
    surahNumber: Int,
    initialAyahNumber: Int = 1,
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val userSettings by viewModel.userSettings.collectAsState()
    val ayahs by viewModel.currentAyahs.collectAsState()
    val isLoading by viewModel.isLoadingAyahs.collectAsState()
    val audioStatus by viewModel.audioStatus.collectAsState()
    val listState = rememberLazyListState()

    val surah = remember(surahNumber) {
        viewModel.quranRepo.getSurahByNumber(surahNumber)
    }

    var bookmarkedAyahs by remember { mutableStateOf(setOf<Int>()) }

    LaunchedEffect(surahNumber) {
        viewModel.loadSurah(surahNumber, userSettings.quranTranslationLanguage)
        surah?.let {
            viewModel.saveProgress(surahNumber, initialAyahNumber, it.nameTransliteration)
        }
    }

    LaunchedEffect(initialAyahNumber, ayahs.size) {
        if (initialAyahNumber > 1 && ayahs.isNotEmpty()) {
            val targetIndex = (initialAyahNumber - 1).coerceIn(0, ayahs.size - 1)
            listState.animateScrollToItem(targetIndex)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(NurMidnightDark)
    ) {
        NurHeader(
            title = surah?.nameTransliteration ?: "Qur'an Reader",
            subtitle = "${surah?.nameArabic} • Surah ${surah?.number}",
            onBack = {
                viewModel.stopAudio()
                onBack()
            },
            actions = {
                if (audioStatus.state == AudioPlaybackState.PLAYING_RECITATION) {
                    IconButton(onClick = { viewModel.stopAudio() }) {
                        Icon(
                            imageVector = Icons.Filled.Stop,
                            contentDescription = "Stop Recitation",
                            tint = NurGold
                        )
                    }
                }
            }
        )

        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = NurGold)
            }
        } else {
            LazyColumn(
                state = listState,
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Surah Banner Header
                item {
                    NurCard(modifier = Modifier.fillMaxWidth()) {
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = surah?.nameArabic ?: "",
                                fontSize = 28.sp,
                                color = NurGold,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "${surah?.nameEnglish} • ${surah?.totalVerses} Verses • ${userSettings.preferredReciter}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = NurTextSecondary
                            )
                            if (surahNumber != 9) { // At-Tawbah does not start with Bismillah
                                Spacer(modifier = Modifier.height(12.dp))
                                Text(
                                    text = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                                    fontSize = 22.sp,
                                    color = NurGoldLight,
                                    fontWeight = FontWeight.SemiBold,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    }
                }

                // Ayahs list
                items(ayahs, key = { it.numberInSurah }) { ayah ->
                    val isPlayingAyah = audioStatus.state == AudioPlaybackState.PLAYING_RECITATION &&
                            audioStatus.currentSurah == surahNumber &&
                            audioStatus.currentAyah == ayah.numberInSurah

                    AyahItemView(
                        ayah = ayah,
                        arabicFontSizeSp = userSettings.arabicFontSizeSp,
                        translationFontSizeSp = userSettings.translationFontSizeSp,
                        isBookmarked = bookmarkedAyahs.contains(ayah.numberInSurah),
                        isPlaying = isPlayingAyah,
                        onBookmarkToggle = {
                            bookmarkedAyahs = if (bookmarkedAyahs.contains(ayah.numberInSurah)) {
                                bookmarkedAyahs - ayah.numberInSurah
                            } else {
                                bookmarkedAyahs + ayah.numberInSurah
                            }
                        },
                        onPlayAudio = {
                            if (isPlayingAyah) {
                                viewModel.stopAudio()
                            } else {
                                // STRICT REQUIREMENT: Verified Qur'an recitation audio streaming (Mishary Rashid Alafasy)
                                // Never generic TTS, never speaks translation automatically
                                viewModel.playQuranRecitation(surahNumber, ayah.numberInSurah, ayah.overallNumber)
                            }
                        },
                        onAddNote = { /* Open private reflection note */ },
                        onCopyShare = { /* Share Ayah */ }
                    )
                }
            }
        }
    }
}
