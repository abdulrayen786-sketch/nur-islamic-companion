import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_TRANSLATIONS, RECITERS_LIST } from '../data/quranMetadata';
import {
  Settings as SettingsIcon,
  Sliders,
  Volume2,
  Bell,
  BookOpen,
  Type,
  Download,
  RotateCcw,
  Sparkles,
  Check,
  ShieldCheck,
  User
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    prayerConfig,
    setPrayerConfig,
    tasks,
    bookmarks,
    notes,
    reflections,
  } = useApp();

  const [exportSuccess, setExportSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExportData = () => {
    const backupData = {
      app: 'NUR - Islamic Personal Companion',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      tasks,
      bookmarks,
      notes,
      reflections,
      settings,
      prayerConfig,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nur-islamic-companion-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleResetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-[#0E1424] border border-amber-500/20 rounded-3xl p-6 shadow-xl space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-arabic text-amber-300 text-lg">الإعدادات والتفضيلات</span>
          <span className="text-xs uppercase tracking-wider text-slate-400">• Settings & Preferences</span>
        </div>
        <h1 className="text-2xl font-display font-bold text-white">Application Preferences</h1>
        <p className="text-xs text-slate-400">Personalize your reading fonts, reciters, sound effects, and prayer parameters.</p>
      </div>

      {/* 1. Profile & Identity */}
      <div className="p-6 rounded-3xl bg-[#0E1424] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <User className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-display font-semibold text-white">Personal Profile</h3>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Your Preferred Name / Kunya</label>
          <input
            type="text"
            value={settings.userName}
            onChange={(e) => updateSettings({ userName: e.target.value })}
            placeholder="e.g. Abdullah, Fatima..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 max-w-md"
          />
        </div>
      </div>

      {/* 2. Qur'an Reading Preferences */}
      <div className="p-6 rounded-3xl bg-[#0E1424] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-display font-semibold text-white">Qur'an Display & Recitation</h3>
        </div>

        {/* Translation Language */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Default Translation</label>
          <select
            value={settings.quranTranslationLanguage}
            onChange={(e) => updateSettings({ quranTranslationLanguage: e.target.value })}
            className="w-full max-w-md bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            {SUPPORTED_TRANSLATIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.language} ({t.author})
              </option>
            ))}
          </select>
        </div>

        {/* Reciter Audio Voice */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Preferred Reciter Voice</label>
          <select
            value={settings.preferredReciterId}
            onChange={(e) => updateSettings({ preferredReciterId: e.target.value })}
            className="w-full max-w-md bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            {RECITERS_LIST.map((r) => (
              <option key={r.id} value={r.subfolder}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Arabic Font Size */}
        <div className="space-y-2 max-w-md">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
            <span>Arabic Script Size</span>
            <span className="font-mono text-amber-300">{settings.arabicFontSize}px</span>
          </div>
          <input
            type="range"
            min="20"
            max="44"
            value={settings.arabicFontSize}
            onChange={(e) => updateSettings({ arabicFontSize: parseInt(e.target.value, 10) })}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>
      </div>

      {/* 3. Audio & Haptic Feedback */}
      <div className="p-6 rounded-3xl bg-[#0E1424] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Volume2 className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-display font-semibold text-white">Audio & Interaction Feedback</h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-850 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-white">Tasbih Click & Chime Feedback</p>
              <p className="text-[11px] text-slate-400">Play soft crystalline sound upon each bead tap and cycle completion</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableSoundFeedback}
              onChange={(e) => updateSettings({ enableSoundFeedback: e.target.checked })}
              className="rounded text-amber-500 focus:ring-0 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-850 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-white">Prayer Time Notifications</p>
              <p className="text-[11px] text-slate-400">Display browser notifications when prayer times arrive</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enablePrayerNotifications}
              onChange={(e) => updateSettings({ enablePrayerNotifications: e.target.checked })}
              className="rounded text-amber-500 focus:ring-0 w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* 4. Data Backup & Reset */}
      <div className="p-6 rounded-3xl bg-[#0E1424] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-display font-semibold text-white">Data Sanctuary & Backup</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-300 font-semibold">Export Local Data</p>
            <p className="text-[11px] text-slate-500">Download a JSON archive of all your bookmarks, notes, habits, and journal entries.</p>
          </div>

          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            {exportSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            <span>{exportSuccess ? 'Backup Downloaded!' : 'Export Backup'}</span>
          </button>
        </div>

        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-rose-300 font-semibold">Reset Application</p>
            <p className="text-[11px] text-slate-500">Clear all local storage and restore NUR to factory default state.</p>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-colors"
          >
            Reset All Data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-display font-bold text-white">Reset NUR Application?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will erase your bookmarks, personal notes, journal entries, and customized settings from this browser. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
