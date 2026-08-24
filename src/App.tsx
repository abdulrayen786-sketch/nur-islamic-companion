import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { QuranPage } from './pages/QuranPage';
import { PrayerPage } from './pages/PrayerPage';
import { DuasPage } from './pages/DuasPage';
import { AdhkarPage } from './pages/AdhkarPage';
import { TasbihPage } from './pages/TasbihPage';
import { QiblaPage } from './pages/QiblaPage';
import { CalendarPage } from './pages/CalendarPage';
import { RamadanPage } from './pages/RamadanPage';
import { AiChatPage } from './pages/AiChatPage';
import { TasksPage } from './pages/TasksPage';
import { ReflectionPage } from './pages/ReflectionPage';
import { ArchivePage } from './pages/ArchivePage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { activeSection } = useApp();

  const renderActivePage = () => {
    switch (activeSection) {
      case 'home':
        return <HomePage />;
      case 'quran':
        return <QuranPage />;
      case 'prayer':
        return <PrayerPage />;
      case 'duas':
        return <DuasPage />;
      case 'adhkar':
        return <AdhkarPage />;
      case 'tasbih':
        return <TasbihPage />;
      case 'qibla':
        return <QiblaPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'ramadan':
        return <RamadanPage />;
      case 'chat':
      case 'ai':
        return <AiChatPage />;
      case 'tasks':
        return <TasksPage />;
      case 'reflection':
        return <ReflectionPage />;
      case 'archive':
        return <ArchivePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header />

      {/* Main Responsive Body with Sidebar */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Desktop Sidebar Navigation */}
        <Navigation />

        {/* Dynamic Page Content Canvas */}
        <main className="flex-1 min-w-0">
          {renderActivePage()}
        </main>
      </div>

      {/* Mobile Bottom Dock Padding */}
      <div className="h-16 md:hidden"></div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
