import React, { useState } from 'react';
import { HIJRI_MONTHS, MAJOR_ISLAMIC_EVENTS, getApproximateHijriDate, IslamicEvent } from '../data/calendarEvents';
import {
  Calendar as CalendarIcon,
  Moon,
  Sun,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const currentHijri = getApproximateHijriDate();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentHijri.month);
  const [selectedEvent, setSelectedEvent] = useState<IslamicEvent | null>(null);

  const monthObj = HIJRI_MONTHS[selectedMonth - 1];

  // Events in this month
  const monthEvents = MAJOR_ISLAMIC_EVENTS.filter((e) => e.hijriMonth === selectedMonth);

  // Generate 29 or 30 days grid
  const daysCount = 30; // standard Islamic month length
  const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-[#0E1424] border border-amber-500/20 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-arabic text-amber-300 text-lg">التقويم الهجري</span>
            <span className="text-xs uppercase tracking-wider text-slate-400">• Islamic Hijri Calendar</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Hijri Calendar & Sacred Days</h1>
          <p className="text-xs text-slate-400">Track lunar Islamic months, Sunnah fasting days (Ayyam al-Beed), and historic Islamic events.</p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold text-center">
          <p className="text-[10px] text-slate-400">Today:</p>
          <p className="font-bold">{currentHijri.formattedHijri}</p>
        </div>
      </div>

      {/* Month Navigator Toolbar */}
      <div className="p-4 rounded-3xl bg-[#0E1424] border border-slate-800 flex items-center justify-between">
        <button
          onClick={() => setSelectedMonth((prev) => (prev > 1 ? prev - 1 : 12))}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center space-y-0.5">
          <h2 className="text-xl font-display font-bold text-white flex items-center justify-center gap-2">
            <span>{monthObj.name}</span>
            <span className="font-arabic text-amber-300 text-lg">({monthObj.arabic})</span>
          </h2>
          <p className="text-xs text-slate-400">
            Month {monthObj.number} of 12 {monthObj.isSacred && '• Sacred Month (الأشهر الحرم)'}
          </p>
        </div>

        <button
          onClick={() => setSelectedMonth((prev) => (prev < 12 ? prev + 1 : 1))}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Days Grid */}
      <div className="bg-[#0E1424] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white">Days of {monthObj.name}</h3>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>White Days (Fasting)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>Major Event</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 gap-3">
          {daysArray.map((dayNum) => {
            const isWhiteDay = dayNum === 13 || dayNum === 14 || dayNum === 15;
            const eventOnDay = MAJOR_ISLAMIC_EVENTS.find(
              (e) => e.hijriMonth === selectedMonth && e.hijriDay === dayNum
            );
            const isToday = currentHijri.month === selectedMonth && currentHijri.day === dayNum;

            return (
              <div
                key={dayNum}
                onClick={() => eventOnDay && setSelectedEvent(eventOnDay)}
                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between min-h-[90px] ${
                  isToday
                    ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/40 shadow-lg'
                    : isWhiteDay
                    ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60'
                    : eventOnDay
                    ? 'bg-slate-900 border-amber-500/40 hover:border-amber-500 cursor-pointer'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-base font-display font-bold ${isToday ? 'text-amber-300' : 'text-white'}`}>
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                      Today
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1">
                  {isWhiteDay && (
                    <span className="text-[10px] text-emerald-300 font-medium block">
                      Sunnah Fast
                    </span>
                  )}
                  {eventOnDay && (
                    <span className="text-[10px] text-amber-300 font-bold block truncate" title={eventOnDay.name}>
                      ★ {eventOnDay.name}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Major Events of the Year List */}
      <div className="bg-[#0E1424] border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-base font-display font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Major Islamic Events Across the Hijri Year</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {MAJOR_ISLAMIC_EVENTS.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-amber-300">{event.name}</span>
                  <span className="font-arabic text-xs text-amber-200">{event.arabicName}</span>
                </div>
                <p className="text-xs text-slate-300 my-2 line-clamp-2">{event.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Month {event.hijriMonth}, Day {event.hijriDay}</span>
                <span className="text-amber-400 group-hover:underline">View Sunnah Practices</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-display font-bold text-white">{selectedEvent.name}</h3>
                <p className="font-arabic text-amber-300 text-sm mt-0.5">{selectedEvent.arabicName}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{selectedEvent.description}</p>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-amber-300">Spiritual Significance:</span>
              <p className="text-xs text-slate-300">{selectedEvent.significance}</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300">Recommended Sunnah Actions:</span>
              <ul className="space-y-1.5">
                {selectedEvent.recommendedActions.map((action, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
