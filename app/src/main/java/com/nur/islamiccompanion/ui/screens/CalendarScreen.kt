package com.nur.islamiccompanion.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nur.islamiccompanion.ui.components.NurCard
import com.nur.islamiccompanion.ui.components.NurHeader
import com.nur.islamiccompanion.ui.theme.*
import com.nur.islamiccompanion.ui.viewmodel.MainViewModel

data class IslamicEvent(
    val hijriDate: String,
    val gregorianDate: String,
    val name: String,
    val arabicName: String,
    val description: String
)

@Composable
fun CalendarScreen(
    viewModel: MainViewModel
) {
    val events = listOf(
        IslamicEvent("1 Muharram 1448", "June 2026", "Islamic New Year", "رأس السنة الهجرية", "Beginning of the Hijri calendar year."),
        IslamicEvent("10 Muharram 1448", "July 2026", "Day of Ashura", "يوم عاشوراء", "Day Prophet Musa (AS) was saved by Allah."),
        IslamicEvent("12 Rabi' al-Awwal 1448", "August 2026", "Mawlid an-Nabi", "المولد النبوي", "Commemoration of the birth of Prophet Muhammad (PBUH)."),
        IslamicEvent("27 Rajab 1448", "December 2026", "Isra and Mi'raj", "الإسراء والمعراج", "The Night Journey and Heavenly Ascension."),
        IslamicEvent("1 Ramadan 1448", "January 2027", "First Day of Ramadan", "أول رمضان", "Beginning of the holy month of fasting and revelation of the Qur'an."),
        IslamicEvent("27 Ramadan 1448", "February 2027", "Laylat al-Qadr", "ليلة القدر", "The Night of Decree, better than a thousand months."),
        IslamicEvent("1 Shawwal 1448", "February 2027", "Eid al-Fitr", "عيد الفطر", "Festival of breaking the fast."),
        IslamicEvent("9 Dhul-Hijjah 1448", "May 2027", "Day of Arafah", "يوم عرفة", "The peak day of Hajj pilgrimage."),
        IslamicEvent("10 Dhul-Hijjah 1448", "May 2027", "Eid al-Adha", "عيد الأضحى", "Festival of the Sacrifice honoring Prophet Ibrahim (AS).")
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 80.dp)
    ) {
        NurHeader(
            title = "Islamic Calendar",
            subtitle = "1448 Hijri Lunar Calendar & Significant Milestones"
        )

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(events) { event ->
                NurCard(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = event.name,
                                style = MaterialTheme.typography.titleMedium,
                                color = NurGold,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "${event.hijriDate} • ${event.gregorianDate}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = NurTextSecondary
                            )
                        }
                        Text(
                            text = event.arabicName,
                            fontSize = 16.sp,
                            color = NurGoldLight,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = event.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = NurTextPrimary
                    )
                }
            }
        }
    }
}
