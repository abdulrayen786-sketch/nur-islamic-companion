package com.nur.islamiccompanion.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nur.islamiccompanion.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onSplashFinished: () -> Unit
) {
    val scale = remember { Animatable(0.8f) }
    val alpha = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        alpha.animateTo(1f, animationSpec = tween(800))
        scale.animateTo(1f, animationSpec = tween(800, easing = OvershootInterpolatorEasing))
        delay(1200)
        onSplashFinished()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(NurMidnightDark),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
                .scale(scale.value)
                .alpha(alpha.value)
        ) {
            Icon(
                imageVector = Icons.Default.AutoAwesome,
                contentDescription = "NUR Light Logo",
                tint = NurGold,
                modifier = Modifier.size(72.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "NUR",
                fontSize = 40.sp,
                fontWeight = FontWeight.Bold,
                color = NurGold,
                letterSpacing = 6.sp
            )
            Text(
                text = "Islamic Personal Companion",
                fontSize = 14.sp,
                color = NurTextSecondary,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

private val OvershootInterpolatorEasing = Easing { x ->
    val tension = 1.5f
    val t = x - 1.0f
    t * t * ((tension + 1) * t + tension) + 1.0f
}

@Composable
fun OnboardingScreen(
    onComplete: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(NurMidnightDark)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = Icons.Default.AutoAwesome,
                contentDescription = "NUR Welcome",
                tint = NurGold,
                modifier = Modifier.size(64.dp)
            )
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = "Welcome to NUR",
                style = MaterialTheme.typography.headlineMedium,
                color = NurGold,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Your serene Islamic companion for Qur'an, daily prayers, authentic Duas, reflection, and respectful AI assistance.",
                style = MaterialTheme.typography.bodyLarge,
                color = NurTextSecondary,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
            Spacer(modifier = Modifier.height(36.dp))
            Button(
                onClick = onComplete,
                modifier = Modifier.fillMaxWidth(0.8f),
                colors = ButtonDefaults.buttonColors(containerColor = NurGold)
            ) {
                Text(
                    text = "Begin Journey (Bismillah)",
                    color = NurMidnightDark,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
