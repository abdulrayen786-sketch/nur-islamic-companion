package com.nur.islamiccompanion.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nur.islamiccompanion.data.model.ArchiveItem
import com.nur.islamiccompanion.ui.components.NurCard
import com.nur.islamiccompanion.ui.components.NurHeader
import com.nur.islamiccompanion.ui.theme.*
import com.nur.islamiccompanion.ui.viewmodel.MainViewModel

@Composable
fun QuietArchiveScreen(
    viewModel: MainViewModel
) {
    val asmaUlHusna = remember { viewModel.archiveRepo.getAsmaUlHusna() }
    val fortyHadith = remember { viewModel.archiveRepo.getFortyHadith() }

    var selectedTab by remember { mutableStateOf(0) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 80.dp)
    ) {
        NurHeader(
            title = "Quiet Archive",
            subtitle = "99 Names of Allah, Hadith, and Personal Gems"
        )

        TabRow(
            selectedTabIndex = selectedTab,
            containerColor = NurSurfaceDark,
            contentColor = NurGold
        ) {
            Tab(
                selected = selectedTab == 0,
                onClick = { selectedTab = 0 },
                text = { Text("Asma ul-Husna", fontWeight = FontWeight.Bold) }
            )
            Tab(
                selected = selectedTab == 1,
                onClick = { selectedTab = 1 },
                text = { Text("40 Hadith", fontWeight = FontWeight.Bold) }
            )
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            val list = if (selectedTab == 0) asmaUlHusna else fortyHadith
            items(list) { item ->
                NurCard(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = item.title,
                        style = MaterialTheme.typography.titleMedium,
                        color = NurGold,
                        fontWeight = FontWeight.Bold
                    )
                    item.arabicContent?.let { ar ->
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = ar,
                            fontSize = 20.sp,
                            color = NurGoldLight,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = item.content,
                        style = MaterialTheme.typography.bodyMedium,
                        color = NurTextPrimary
                    )
                }
            }
        }
    }
}
