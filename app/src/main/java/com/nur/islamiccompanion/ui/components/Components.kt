package com.nur.islamiccompanion.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nur.islamiccompanion.data.model.Ayah
import com.nur.islamiccompanion.data.model.PrayerTime
import com.nur.islamiccompanion.ui.theme.*

@Composable
fun NurCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    borderColor: Color = NurCardBorder,
    backgroundColor: Color = NurCardDark,
    content: @Composable ColumnScope.() -> Unit
) {
    val shape = RoundedCornerShape(16.dp)
    val cardModifier = if (onClick != null) {
        modifier
            .clip(shape)
            .border(1.dp, borderColor, shape)
            .background(backgroundColor)
            .clickable { onClick() }
            .padding(16.dp)
    } else {
        modifier
            .clip(shape)
            .border(1.dp, borderColor, shape)
            .background(backgroundColor)
            .padding(16.dp)
    }

    Column(modifier = cardModifier) {
        content()
    }
}

@Composable
fun NurOrb(
    modifier: Modifier = Modifier,
    title: String = "NUR Light",
    subtitle: String = "Assalamu Alaikum",
    onClick: () -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition(label = "orb")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(2400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse"
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        // Outer aura
        Box(
            modifier = Modifier
                .size(160.dp)
                .scale(pulseScale)
                .clip(CircleShape)
                .background(
                    Brush.radialGradient(
                        colors = listOf(
                            NurGold.copy(alpha = 0.35f),
                            NurGold.copy(alpha = 0.1f),
                            Color.Transparent
                        )
                    )
                )
        )
        // Center glowing orb
        Box(
            modifier = Modifier
                .size(90.dp)
                .clip(CircleShape)
                .background(
                    Brush.linearGradient(
                        colors = listOf(NurGoldLight, NurGold, NurGoldDark)
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.AutoAwesome,
                contentDescription = "NUR Light",
                tint = NurMidnightDark,
                modifier = Modifier.size(36.dp)
            )
        }
    }
}

@Composable
fun NurHeader(
    title: String,
    subtitle: String? = null,
    onBack: (() -> Unit)? = null,
    actions: @Composable RowScope.() -> Unit = {}
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (onBack != null) {
            IconButton(onClick = onBack) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = NurGold
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
        }

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                color = NurTextPrimary,
                fontWeight = FontWeight.Bold
            )
            if (subtitle != null) {
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = NurTextSecondary
                )
            }
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
            actions()
        }
    }
}

@Composable
fun AyahItemView(
    ayah: Ayah,
    arabicFontSizeSp: Float = 24f,
    translationFontSizeSp: Float = 16f,
    isBookmarked: Boolean = false,
    isPlaying: Boolean = false,
    onBookmarkToggle: () -> Unit,
    onPlayAudio: () -> Unit,
    onAddNote: () -> Unit,
    onCopyShare: () -> Unit
) {
    NurCard(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = CircleShape,
                color = NurGold.copy(alpha = 0.15f),
                border = androidx.compose.foundation.BorderStroke(1.dp, NurGold.copy(alpha = 0.3f))
            ) {
                Text(
                    text = "${ayah.numberInSurah}",
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                    color = NurGold,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
            }

            Row {
                IconButton(onClick = onPlayAudio) {
                    Icon(
                        imageVector = if (isPlaying) Icons.Default.PauseCircle else Icons.Default.PlayCircle,
                        contentDescription = "Play Recitation",
                        tint = if (isPlaying) NurEmerald else NurGold
                    )
                }
                IconButton(onClick = onBookmarkToggle) {
                    Icon(
                        imageVector = if (isBookmarked) Icons.Filled.Bookmark else Icons.Outlined.BookmarkBorder,
                        contentDescription = "Bookmark",
                        tint = if (isBookmarked) NurGold else NurTextMuted
                    )
                }
                IconButton(onClick = onAddNote) {
                    Icon(
                        imageVector = Icons.Outlined.EditNote,
                        contentDescription = "Note",
                        tint = NurTextMuted
                    )
                }
                IconButton(onClick = onCopyShare) {
                    Icon(
                        imageVector = Icons.Outlined.Share,
                        contentDescription = "Share",
                        tint = NurTextMuted
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Arabic text
        Text(
            text = ayah.arabicText,
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Right,
            fontSize = arabicFontSizeSp.sp,
            lineHeight = (arabicFontSizeSp * 1.6f).sp,
            color = NurTextPrimary,
            fontWeight = FontWeight.SemiBold
        )

        if (ayah.transliteration.isNotEmpty()) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = ayah.transliteration,
                fontSize = (translationFontSizeSp - 2).sp,
                color = NurGold.copy(alpha = 0.85f),
                fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Translation
        Text(
            text = ayah.translation,
            fontSize = translationFontSizeSp.sp,
            lineHeight = (translationFontSizeSp * 1.4f).sp,
            color = NurTextSecondary
        )
    }
}

@Composable
fun PrayerTimeRow(
    prayer: PrayerTime,
    onToggleCompleted: (Boolean) -> Unit
) {
    val borderColor = if (prayer.isNext) NurGold else NurCardBorder
    val bgColor = if (prayer.isNext) NurGold.copy(alpha = 0.08f) else NurCardDark

    NurCard(
        modifier = Modifier.fillMaxWidth(),
        borderColor = borderColor,
        backgroundColor = bgColor
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(
                    checked = prayer.isCompleted,
                    onCheckedChange = { onToggleCompleted(it) },
                    colors = CheckboxDefaults.colors(
                        checkedColor = NurEmerald,
                        checkmarkColor = NurMidnightDark,
                        uncheckedColor = NurTextMuted
                    )
                )
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = prayer.name.title,
                            style = MaterialTheme.typography.titleMedium,
                            color = if (prayer.isNext) NurGold else NurTextPrimary,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = prayer.name.arabic,
                            style = MaterialTheme.typography.bodyMedium,
                            color = NurTextMuted
                        )
                    }
                    if (prayer.isNext) {
                        Text(
                            text = "Next Prayer",
                            style = MaterialTheme.typography.labelMedium,
                            color = NurGold
                        )
                    }
                }
            }

            Text(
                text = prayer.timeFormatted,
                style = MaterialTheme.typography.titleMedium,
                color = if (prayer.isNext) NurGold else NurTextPrimary,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
