import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskItem } from '../types';
import {
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
  Tag,
  Clock,
  Filter
} from 'lucide-react';

const CATEGORIES = ['All', 'Salah & Worship', 'Qur\'an', 'Dhikr & Dua', 'Character & Sadaqah', 'Knowledge', 'General'];

export const TasksPage: React.FC = () => {
  const { tasks, toggleTaskCompleted, addNewTask, deleteTask } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Salah & Worship');
  const [newFrequency, setNewFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addNewTask(newTitle.trim(), newCategory, newFrequency);
    setNewTitle('');
    setShowAddModal(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedCategory === 'All') return true;
    return t.category === selectedCategory;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = Math.round((completedCount / Math.max(1, totalCount)) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-[#0E1424] border border-amber-500/20 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-arabic text-amber-300 text-lg">المهام اليومية</span>
              <span className="text-xs uppercase tracking-wider text-slate-400">• Spiritual Habits & Routine</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Spiritual Tasks & Habits</h1>
            <p className="text-xs text-slate-400">Build consistent prophetic habits in worship, character, and daily life.</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-colors shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Habit</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Today's Habits Completed ({completedCount}/{totalCount})</span>
            <span className="font-bold text-amber-300">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all ${
              selectedCategory === cat
                ? 'bg-amber-500 text-slate-950 font-semibold border-amber-400 shadow-sm'
                : 'bg-[#0E1424] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center bg-[#0E1424] border border-slate-800 rounded-3xl text-slate-400 text-xs">
            No habits found in this category. Tap "Add New Habit" above to get started.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTaskCompleted(task.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-4 ${
                task.completed
                  ? 'bg-emerald-950/15 border-emerald-500/20 opacity-80'
                  : 'bg-[#0E1424]/90 border-slate-800 hover:border-amber-500/30'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600 hover:text-amber-400 shrink-0 transition-colors" />
                )}
                <div className="min-w-0">
                  <p className={`text-sm font-semibold truncate ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-amber-300/90 font-mono">
                      {task.category}
                    </span>
                    <span className="capitalize">{task.frequency}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(task.id);
                }}
                className="text-slate-500 hover:text-rose-400 p-2 shrink-0 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTask}
            className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-display font-bold text-white">Create Spiritual Habit</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Habit / Task Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Read Surah Al-Mulk, Send 100 Salawat..."
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Frequency</label>
              <div className="grid grid-cols-3 gap-2">
                {(['daily', 'weekly', 'custom'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setNewFrequency(freq)}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                      newFrequency === freq
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors"
              >
                Save Habit
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
