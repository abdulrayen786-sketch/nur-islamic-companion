package com.nur.islamiccompanion.ui.navigation

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.navArgument
import com.nur.islamiccompanion.ui.screens.*
import com.nur.islamiccompanion.ui.theme.NurMidnightDark
import com.nur.islamiccompanion.ui.viewmodel.MainViewModel

@Composable
fun AppNavHost(
    navController: NavHostController,
    viewModel: MainViewModel
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val bottomBarRoutes = listOf(
        Screen.Home.route,
        Screen.Prayer.route,
        Screen.Quran.route,
        Screen.Duas.route,
        Screen.MuslimAi.route
    )

    val showBottomBar = currentRoute in bottomBarRoutes

    Scaffold(
        containerColor = NurMidnightDark,
        bottomBar = {
            if (showBottomBar) {
                BottomNavBar(
                    currentRoute = currentRoute,
                    onNavigate = { screen ->
                        navController.navigate(screen.route) {
                            popUpTo(Screen.Home.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Splash.route,
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            composable(Screen.Splash.route) {
                SplashScreen(
                    onSplashFinished = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Onboarding.route) {
                OnboardingScreen(
                    onComplete = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Onboarding.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Home.route) {
                HomeScreen(
                    viewModel = viewModel,
                    onNavigate = { screen ->
                        if (screen == Screen.QuranReader) {
                            navController.navigate(Screen.QuranReader.createRoute(1, 1))
                        } else {
                            navController.navigate(screen.route)
                        }
                    }
                )
            }

            composable(Screen.Prayer.route) {
                PrayerScreen(
                    viewModel = viewModel,
                    onOpenQibla = { navController.navigate(Screen.Qibla.route) }
                )
            }

            composable(Screen.Quran.route) {
                QuranScreen(
                    viewModel = viewModel,
                    onNavigateToReader = { surah, ayah ->
                        navController.navigate(Screen.QuranReader.createRoute(surah, ayah))
                    }
                )
            }

            composable(
                route = Screen.QuranReader.route,
                arguments = listOf(
                    navArgument("surahNumber") { type = NavType.IntType; defaultValue = 1 },
                    navArgument("ayahNumber") { type = NavType.IntType; defaultValue = 1 }
                )
            ) { backStackEntry ->
                val surahNumber = backStackEntry.arguments?.getInt("surahNumber") ?: 1
                val ayahNumber = backStackEntry.arguments?.getInt("ayahNumber") ?: 1
                QuranReaderScreen(
                    surahNumber = surahNumber,
                    initialAyahNumber = ayahNumber,
                    viewModel = viewModel,
                    onBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Duas.route) {
                DuasScreen(viewModel = viewModel)
            }

            composable(Screen.Adhkar.route) {
                AdhkarScreen(viewModel = viewModel)
            }

            composable(Screen.Tasbih.route) {
                TasbihScreen(viewModel = viewModel)
            }

            composable(Screen.Qibla.route) {
                QiblaScreen(viewModel = viewModel)
            }

            composable(Screen.Calendar.route) {
                CalendarScreen(viewModel = viewModel)
            }

            composable(Screen.Ramadan.route) {
                RamadanScreen(viewModel = viewModel)
            }

            composable(Screen.Tasks.route) {
                TasksScreen(viewModel = viewModel)
            }

            composable(Screen.Reflection.route) {
                ReflectionScreen(viewModel = viewModel)
            }

            composable(Screen.QuietArchive.route) {
                QuietArchiveScreen(viewModel = viewModel)
            }

            composable(Screen.MuslimAi.route) {
                MuslimAiScreen(viewModel = viewModel)
            }

            composable(Screen.Settings.route) {
                SettingsScreen(
                    viewModel = viewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}
