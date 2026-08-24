package com.nur.islamiccompanion.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.vector.ImageVector
import com.nur.islamiccompanion.ui.theme.NurCardDark
import com.nur.islamiccompanion.ui.theme.NurGold
import com.nur.islamiccompanion.ui.theme.NurTextMuted
import com.nur.islamiccompanion.ui.theme.NurTextSecondary

data class NavItem(
    val screen: Screen,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
    val label: String
)

@Composable
fun BottomNavBar(
    currentRoute: String?,
    onNavigate: (Screen) -> Unit
) {
    val items = listOf(
        NavItem(Screen.Home, Icons.Filled.Home, Icons.Outlined.Home, "Home"),
        NavItem(Screen.Prayer, Icons.Filled.AccessTime, Icons.Outlined.AccessTime, "Prayer"),
        NavItem(Screen.Quran, Icons.Filled.MenuBook, Icons.Outlined.MenuBook, "Qur'an"),
        NavItem(Screen.Duas, Icons.Filled.Favorite, Icons.Outlined.FavoriteBorder, "Duas"),
        NavItem(Screen.MuslimAi, Icons.Filled.AutoAwesome, Icons.Outlined.AutoAwesome, "NUR AI")
    )

    NavigationBar(
        containerColor = NurCardDark,
        contentColor = NurTextSecondary
    ) {
        items.forEach { item ->
            val selected = currentRoute == item.screen.route
            NavigationBarItem(
                selected = selected,
                onClick = { onNavigate(item.screen) },
                icon = {
                    Icon(
                        imageVector = if (selected) item.selectedIcon else item.unselectedIcon,
                        contentDescription = item.label
                    )
                },
                label = { Text(item.label) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = NurGold,
                    selectedTextColor = NurGold,
                    indicatorColor = NurGold.copy(alpha = 0.15f),
                    unselectedIconColor = NurTextMuted,
                    unselectedTextColor = NurTextMuted
                )
            )
        }
    }
}
