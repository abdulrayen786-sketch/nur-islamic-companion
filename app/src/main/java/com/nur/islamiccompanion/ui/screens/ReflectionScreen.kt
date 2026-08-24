package com.nur.islamiccompanion.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nur.islamiccompanion.ui.components.NurCard
import com.nur.islamiccompanion.ui.components.NurHeader
import com.nur.islamiccompanion.ui.theme.*
import com.nur.islamiccompanion.ui.viewmodel.MainViewModel

@Composable
fun ReflectionScreen(
    viewModel: MainViewModel
) {
    var mood by remember { mutableStateOf("Peaceful") }
    var gratitudeText by remember { mutableStateOf("") }
    var improvementText by remember { mutableStateOf("") }
    var journalText by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 80.dp)
    ) {
        NurHeader(
            title = "Self-Accounting (Muhasabah)",
            subtitle = "Contemplate your day before Allah"
        )

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Heart State / Mood
            item {
                NurCard(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "How is your heart state today?",
                        style = MaterialTheme.typography.titleMedium,
                        color = NurGold,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("Peaceful", "Grateful", "Humble", "Repentant").forEach { m ->
                            FilterChip(
                                selected = mood == m,
                                onClick = { mood = m },
                                label = { Text(m) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = NurGold,
                                    selectedLabelColor = NurMidnightDark
                                )
                            )
                        }
                    }
                }
            }

            // Gratitude Note
            item {
                NurCard(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "What blessings are you grateful for today?",
                        style = MaterialTheme.typography.titleMedium,
                        color = NurTextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = gratitudeText,
                        onValueChange = { gratitudeText = it },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("Family, health, guidance, safety...", color = NurTextMuted) },
                        minLines = 2
                    )
                }
            }

            // Improvement Tomorrow
            item {
                NurCard(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "What can I improve tomorrow in worship & character?",
                        style = MaterialTheme.typography.titleMedium,
                        color = NurTextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = improvementText,
                        onValueChange = { improvementText = it },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("Focus in Salah, extra Sunnah, patience...", color = NurTextMuted) },
                        minLines = 2
                    )
                }
            }

            // Journal Entry
            item {
                NurCard(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Personal Reflection Journal",
                        style = MaterialTheme.typography.titleMedium,
                        color = NurTextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = journalText,
                        onValueChange = { journalText = it },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("Write your thoughts freely...", color = NurTextMuted) },
                        minLines = 3
                    )
                }
            }
        }
    }
}
