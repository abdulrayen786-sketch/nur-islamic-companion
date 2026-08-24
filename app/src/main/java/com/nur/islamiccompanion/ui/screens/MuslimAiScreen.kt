package com.nur.islamiccompanion.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nur.islamiccompanion.data.model.ChatMessage
import com.nur.islamiccompanion.data.model.MessageRole
import com.nur.islamiccompanion.ui.components.NurCard
import com.nur.islamiccompanion.ui.components.NurHeader
import com.nur.islamiccompanion.ui.theme.*
import com.nur.islamiccompanion.ui.viewmodel.MainViewModel

@Composable
fun MuslimAiScreen(
    viewModel: MainViewModel
) {
    val messages by viewModel.chatMessages.collectAsState()
    val settings by viewModel.userSettings.collectAsState()
    var inputQuery by remember { mutableStateOf("") }
    var isVoiceActive by remember { mutableStateOf(false) }

    val suggestedQuestions = listOf(
        "Explain Ayah of Light (Surah An-Nur 24:35)",
        "What is the virtue of Istighfar?",
        "Dua for anxiety and peace of heart",
        "Remind me to read 5 pages of Qur'an"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 80.dp)
            .background(NurMidnightDark)
    ) {
        NurHeader(
            title = "Muslim AI Companion",
            subtitle = "Grounded Islamic Knowledge & Personal Guidance (${settings.aiLanguage})"
        )

        // Conversation history
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(messages, key = { it.id }) { msg ->
                ChatBubble(msg = msg)
            }
        }

        // Suggestions
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(suggestedQuestions) { q ->
                AssistChip(
                    onClick = { viewModel.sendAiMessage(q) },
                    label = { Text(q, fontSize = 12.sp) },
                    colors = AssistChipDefaults.assistChipColors(
                        labelColor = NurGoldLight,
                        containerColor = NurCardDark
                    )
                )
            }
        }

        // Input Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { isVoiceActive = !isVoiceActive },
                modifier = Modifier
                    .clip(CircleShape)
                    .background(if (isVoiceActive) NurEmerald else NurCardDark)
            ) {
                Icon(
                    imageVector = Icons.Default.Mic,
                    contentDescription = "Voice Input",
                    tint = if (isVoiceActive) NurMidnightDark else NurGold
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            OutlinedTextField(
                value = inputQuery,
                onValueChange = { inputQuery = it },
                modifier = Modifier.weight(1f),
                placeholder = { Text("Ask about Qur'an, Salah, Duas...", color = NurTextMuted) },
                shape = RoundedCornerShape(24.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = NurGold,
                    unfocusedBorderColor = NurCardBorder,
                    focusedTextColor = NurTextPrimary,
                    unfocusedTextColor = NurTextPrimary
                )
            )

            Spacer(modifier = Modifier.width(8.dp))

            IconButton(
                onClick = {
                    if (inputQuery.isNotBlank()) {
                        viewModel.sendAiMessage(inputQuery)
                        inputQuery = ""
                    }
                },
                modifier = Modifier
                    .clip(CircleShape)
                    .background(NurGold)
            ) {
                Icon(
                    imageVector = Icons.Default.Send,
                    contentDescription = "Send",
                    tint = NurMidnightDark
                )
            }
        }
    }
}

@Composable
fun ChatBubble(msg: ChatMessage) {
    val isUser = msg.role == MessageRole.USER
    val alignment = if (isUser) Alignment.End else Alignment.Start
    val bgColor = if (isUser) NurCardDark else NurSurfaceDark
    val textColor = if (isUser) NurTextPrimary else NurTextPrimary
    val borderColor = if (isUser) NurGold.copy(alpha = 0.4f) else NurCardBorder

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = alignment
    ) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = bgColor,
            border = androidx.compose.foundation.BorderStroke(1.dp, borderColor),
            modifier = Modifier.fillMaxWidth(0.9f)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = if (isUser) "You" else "NUR Muslim AI",
                    style = MaterialTheme.typography.labelMedium,
                    color = if (isUser) NurGoldLight else NurGold,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = msg.text,
                    style = MaterialTheme.typography.bodyLarge,
                    color = textColor,
                    lineHeight = 22.sp
                )
                msg.verifiedReference?.let { ref ->
                    Spacer(modifier = Modifier.height(8.dp))
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = NurGold.copy(alpha = 0.1f)
                    ) {
                        Text(
                            text = "Verified Reference: $ref",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                            color = NurGold,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }
    }
}
