import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReflectionEntry } from '../types';
import {
  Feather,
  Sparkles,
  Heart,
  Plus,
  Trash2,
  Calendar,
  Smile,
  BookOpen,
  Send,
  History
} from 'lucide-react';

const SPIRITUAL_MOODS = [
  { id: 'Peaceful', label: 'Peaceful', arabic: 'مطمئن' },
  { id: 'Grateful', label: 'Grateful', arabic: 'شاكر' },
  { id: 'Hopeful', label: 'Hopeful', arabic: 'راجٍ' },
  { id: 'Repentant', label: 'Repentant', arabic: 'تائب' },
  { id: 'Reflective', label: 'Reflective', arabic: 'متفكر' },
];

export const ReflectionPage: React.FC = () => {
  const { reflections, saveReflection, deleteReflection } = useApp();

  const [prompt, setPrompt] = useState('What unmerited blessing did you receive from Allah today, and what made your heart feel closer to peace?');
  const [reflectionText, setReflectionText] = useState('');
  const [gratitudeText, setGratitudeText] = useState('');
  const [selectedMood, setSelectedMood] = useState('Peaceful');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText.trim() && !gratitudeText.trim()) return;

    saveReflection({
      prompt,
      text: reflectionText.trim(),
      gratitudeNotes: gratitudeText.trim() ? [gratitudeText.trim()] : [],
      mood: selectedMood,
    });

    setReflectionText('');
    setGratitudeText('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-[#0E1424] border border-amber-500/20 rounded-3xl p-6 shadow-xl space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-arabic text-amber-300 text-lg">المحاسبة والتأمل</span>
          <span className="text-xs uppercase tracking-wider text-slate-400">• Muhasabah & Sacred Journal</span>
        </div>
        <h1 className="text-2xl font-display font-bold text-white">Daily Reflection & Muhasabah</h1>
        <p className="text-xs text-slate-400">
          "Take account of yourselves before you are taken to account." (Umar ibn al-Khattab رضي الله عنه)
        </p>
      </div>

      {/* Write Today's Journal Entry */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#0E1424] border border-slate-800 shadow-xl space-y-5">
        
        {/* Daily Spiritual Inscription Prompt */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/20 space-y-1">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today's Contemplation Prompt:</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 italic font-display">
            "{prompt}"
          </p>
        </div>

        {/* State of the Heart / Mood Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">State of Your Heart Today:</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {SPIRITUAL_MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMood(m.id)}
                className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                  selectedMood === m.id
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <p>{m.label}</p>
                <p className="font-arabic text-[11px] opacity-80 mt-0.5">{m.arabic}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Reflection Body */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Your Reflection & Lessons:</label>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Write your raw thoughts, struggles, prayers, and lessons learned today..."
            rows={4}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed"
          />
        </div>

        {/* Gratitude Box (Shukr) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Alhamdulillah For (Specific Gratitude):</span>
          </label>
          <input
            type="text"
            value={gratitudeText}
            onChange={(e) => setGratitudeText(e.target.value)}
            placeholder="Name 1 or 2 specific blessings you are grateful for today..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="submit"
            disabled={!reflectionText.trim() && !gratitudeText.trim()}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-2 shadow-md"
          >
            <Feather className="w-4 h-4" />
            <span>Save Entry to Sanctuary</span>
          </button>
        </div>

      </form>

      {/* Past Journal Entries */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <History className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-display font-semibold text-white">Journal History ({reflections.length})</h3>
        </div>

        {reflections.length === 0 ? (
          <div className="p-8 text-center bg-[#0E1424] border border-slate-800 rounded-3xl text-slate-400 text-xs">
            No journal entries recorded yet. Begin your daily habit of reflection above.
          </div>
        ) : (
          reflections.map((entry) => (
            <div
              key={entry.id}
              className="p-6 rounded-3xl bg-[#0E1424] border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">
                    {new Date(entry.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  {entry.mood && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-amber-300 text-[10px] font-medium">
                      Heart: {entry.mood}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => deleteReflection(entry.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {entry.prompt && (
                <p className="text-xs text-amber-200/80 italic font-display">
                  "{entry.prompt}"
                </p>
              )}

              <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                {entry.text}
              </p>

              {entry.gratitudeNotes && entry.gratitudeNotes.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Gratitude:</strong> {entry.gratitudeNotes.join(', ')}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
