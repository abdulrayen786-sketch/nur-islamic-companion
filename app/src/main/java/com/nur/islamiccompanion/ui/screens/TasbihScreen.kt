package com.nur.islamiccompanion.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nur.islamiccompanion.ui.components.NurCard
import com.nur.islamiccompanion.ui.components.NurHeader
import com.nur.islamiccompanion.ui.theme.*
import com.nur.islamiccompanion.ui.viewmodel.MainViewModel

@Composable
fun TasbihScreen(
    viewModel: MainViewModel
) {
    val tasbihState by viewModel.tasbihState.collectAsState()

    val phrases = listOf(
        "SubhanAllah" to "سُبْحَانَ اللَّهِ",
        "Alhamdulillah" to "الْحَمْدُ لِلَّهِ",
        "Allahu Akbar" to "اللَّهُ أَكْبَرُ",
        "Astaghfirullah" to "أَسْتَغْفِرُ اللَّهَ",
        "La ilaha illallah" to "لَا إِلَهَ إِلَّا اللَّهُ"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 80.dp)
    ) {
        NurHeader(
            title = "Digital Tasbih",
            subtitle = "Glorification & Remembrance",
            actions = {
                IconButton(onClick = { viewModel.resetTasbih() }) {
                    Icon(Icons.Default.Refresh, contentDescription = "Reset", tint = NurGold)
                }
            }
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Dhikr selector
            NurCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = tasbihState.currentDhikr,
                    style = MaterialTheme.typography.titleLarge,
                    color = NurGold,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    phrases.take(3).forEach { (en, _) ->
                        AssistChip(
                            onClick = { viewModel.setTasbihDhikr(en, 33) },
                            label = { Text(en) },
                            colors = AssistChipDefaults.assistChipColors(
                                labelColor = if (tasbihState.currentDhikr == en) NurGold else NurTextSecondary
                            )
                        )
                    }
                }
            }

            // Big Interactive Bead Counter
            Box(
                modifier = Modifier
                    .size(240.dp)
                    .clip(CircleShape)
                    .background(
                        Brush.radialGradient(
                            colors = listOf(NurGoldDark, NurCardDark, NurMidnightDark)
                        )
                    )
                    .clickable { viewModel.incrementTasbih() },
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "${tasbihState.count}",
                        fontSize = 54.sp,
                        fontWeight = FontWeight.Bold,
                        color = NurTextPrimary
                    )
                    Text(
                        text = "/ ${tasbihState.target}",
                        fontSize = 18.sp,
                        color = NurGoldLight
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Tap Bead",
                        fontSize = 12.sp,
                        color = NurTextMuted
                    )
                }
            }

            // Summary stats
            NurCard(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Cycles", color = NurTextSecondary, fontSize = 12.sp)
                        Text("${tasbihState.cycleCount}", color = NurGold, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Total All Time", color = NurTextSecondary, fontSize = 12.sp)
                        Text("${tasbihState.totalAllTime}", color = NurGold, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    }
                }
            }
        }
    }
}
