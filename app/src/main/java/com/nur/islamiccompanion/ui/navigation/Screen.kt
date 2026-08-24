package com.nur.islamiccompanion.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Splash : Screen("splash", "Splash")
    object Onboarding : Screen("onboarding", "Onboarding")
    object Home : Screen("home", "Home")
    object Prayer : Screen("prayer", "Prayer")
    object Quran : Screen("quran", "Qur'an")
    object QuranReader : Screen("quran_reader/{surahNumber}/{ayahNumber}", "Qur'an Reader") {
        fun createRoute(surahNumber: Int, ayahNumber: Int = 1) = "quran_reader/$surahNumber/$ayahNumber"
    }
    object Duas : Screen("duas", "Duas")
    object Adhkar : Screen("adhkar", "Adhkar")
    object Tasbih : Screen("tasbih", "Tasbih")
    object Qibla : Screen("qibla", "Qibla")
    object Calendar : Screen("calendar", "Calendar")
    object Ramadan : Screen("ramadan", "Ramadan")
    object Tasks : Screen("tasks", "Tasks")
    object Reflection : Screen("reflection", "Reflection")
    object QuietArchive : Screen("archive", "Archive")
    object MuslimAi : Screen("ai", "Muslim AI")
    object Settings : Screen("settings", "Settings")
}
