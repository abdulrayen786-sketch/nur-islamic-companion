package com.nur.islamiccompanion.data.repository

import com.nur.islamiccompanion.data.model.ChatMessage
import com.nur.islamiccompanion.data.model.MessageRole
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext

class AiRepository {

    suspend fun sendMessage(
        query: String,
        conversationHistory: List<ChatMessage>,
        language: String = "English"
    ): ChatMessage = withContext(Dispatchers.IO) {
        delay(600) // Realistic thoughtful processing delay

        val trimmed = query.trim().lowercase()

        val replyText: String
        val reference: String?

        when {
            trimmed.contains("light") || trimmed.contains("nur") || trimmed.contains("نور") -> {
                replyText = "Allah is the Light of the heavens and the earth (Allahu noorus-samawati wal-ard). The likeness of His light is as a niche wherein is a lamp, the lamp in a glass, the glass as it were a shining star..."
                reference = "Surah An-Nur (24:35)"
            }
            trimmed.contains("prayer") || trimmed.contains("salah") || trimmed.contains("namaz") -> {
                replyText = "Indeed, prayer has been decreed upon the believers at specified times. Regular prayer purifies the soul and guards against indecency and wrongdoing."
                reference = "Surah An-Nisa (4:103) & Surah Al-'Ankabut (29:45)"
            }
            trimmed.contains("dua") || trimmed.contains("supplication") -> {
                replyText = "And when My servants ask you concerning Me, indeed I am near. I respond to the invocation of the caller when he calls upon Me."
                reference = "Surah Al-Baqarah (2:186)"
            }
            trimmed.contains("remind") || trimmed.contains("task") || trimmed.contains("habit") -> {
                replyText = "I have noted your reminder request. You can also view or edit your scheduled task in the Tasks section."
                reference = "NUR Task Manager"
            }
            trimmed.contains("forgiveness") || trimmed.contains("istighfar") -> {
                replyText = "Say, 'O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful.'"
                reference = "Surah Az-Zumar (39:53)"
            }
            else -> {
                replyText = "Wa Alaikum Assalam. In Islam, every sincere effort to seek knowledge, maintain daily remembrance (Dhikr), and fulfill your duties with excellence (Ihsan) brings immense spiritual peace and reward."
                reference = "Sahih Muslim 2699"
            }
        }

        return@withContext ChatMessage(
            id = "msg_${System.currentTimeMillis()}",
            role = MessageRole.ASSISTANT,
            text = replyText,
            timestamp = System.currentTimeMillis(),
            verifiedReference = reference
        )
    }
}
