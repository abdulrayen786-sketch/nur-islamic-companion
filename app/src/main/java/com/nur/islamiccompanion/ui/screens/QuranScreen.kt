package com.nur.islamiccompanion.ui.screens

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nur.islamiccompanion.data.model.Juz
import com.nur.islamiccompanion.data.model.Surah
import com.nur.islamiccompanion.ui.components.NurCard
import com.nur.islamiccompanion.ui.components.NurHeader
import com.nur.islamiccompanion.ui.navigation.Screen
import com.nur.islamiccompanion.ui.theme.*
import com.nur.islamiccompanion.ui.viewmodel.MainViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun QuranScreen(
    viewModel: MainViewModel,
    onNavigateToReader: (Int, Int) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val pagerState = rememberPagerState(pageCount = { 2 })
    var searchQuery by remember { mutableStateOf("") }

    val allSurahs = remember(searchQuery) {
        viewModel.quranRepo.searchQuran(searchQuery)
    }
    val allJuz = remember {
        viewModel.quranRepo.getAllJuz()
    }
    val readingProgress by viewModel.readingProgress.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 80.dp)
    ) {
        NurHeader(
            title = "The Holy Qur'an",
            subtitle = "القرآن الكريم — 114 Surahs & 30 Juz"
        )

        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            placeholder = { Text("Search Surah name or number...", color = NurTextMuted) },
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

        // Continue Reading Banner
        NurCard(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            onClick = {
                onNavigateToReader(readingProgress.lastReadSurah, readingProgress.lastReadAyah)
            }
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "LAST READ",
                        style = MaterialTheme.typography.labelMedium,
                        color = NurGold,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${readingProgress.lastReadSurahName} (Ayah ${readingProgress.lastReadAyah})",
                        style = MaterialTheme.typography.titleMedium,
                        color = NurTextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                }
                Icon(
                    imageVector = Icons.Default.Bookmark,
                    contentDescription = "Bookmark",
                    tint = NurGold
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Tabs for Surahs vs Juz
        TabRow(
            selectedTabIndex = pagerState.currentPage,
            containerColor = NurSurfaceDark,
            contentColor = NurGold
        ) {
            Tab(
                selected = pagerState.currentPage == 0,
                onClick = { coroutineScope.launch { pagerState.animateScrollToPage(0) } },
                text = { Text("All Surahs (114)", fontWeight = FontWeight.Bold) }
            )
            Tab(
                selected = pagerState.currentPage == 1,
                onClick = { coroutineScope.launch { pagerState.animateScrollToPage(1) } },
                text = { Text("All Juz (30)", fontWeight = FontWeight.Bold) }
            )
        }

        HorizontalPager(
            state = pagerState,
            modifier = Modifier.fillMaxSize()
        ) { page ->
            if (page == 0) {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(allSurahs, key = { it.number }) { surah ->
                        SurahListItem(
                            surah = surah,
                            onClick = { onNavigateToReader(surah.number, 1) }
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(allJuz, key = { it.number }) { juz ->
                        JuzListItem(
                            juz = juz,
                            onClick = { onNavigateToReader(juz.startSurah, juz.startAyah) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SurahListItem(
    surah: Surah,
    onClick: () -> Unit
) {
    NurCard(
        modifier = Modifier.fillMaxWidth(),
        onClick = onClick
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    shape = CircleShape,
                    color = NurGold.copy(alpha = 0.12f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, NurGold.copy(alpha = 0.3f)),
                    modifier = Modifier.size(40.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = "${surah.number}",
                            color = NurGold,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Text(
                        text = surah.nameTransliteration,
                        style = MaterialTheme.typography.titleMedium,
                        color = NurTextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${surah.nameEnglish} • ${surah.totalVerses} Ayahs • ${surah.revelationType.name}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = NurTextSecondary
                    )
                }
            }

            Text(
                text = surah.nameArabic,
                fontSize = 20.sp,
                color = NurGold,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
fun JuzListItem(
    juz: Juz,
    onClick: () -> Unit
) {
    NurCard(
        modifier = Modifier.fillMaxWidth(),
        onClick = onClick
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    shape = CircleShape,
                    color = NurGold.copy(alpha = 0.12f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, NurGold.copy(alpha = 0.3f)),
                    modifier = Modifier.size(40.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = "${juz.number}",
                            color = NurGold,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Text(
                        text = "Juz ${juz.number}",
                        style = MaterialTheme.typography.titleMedium,
                        color = NurTextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = juz.nameEnglish,
                        style = MaterialTheme.typography.bodyMedium,
                        color = NurTextSecondary
                    )
                }
            }

            Text(
                text = juz.nameArabic,
                fontSize = 18.sp,
                color = NurGold,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
