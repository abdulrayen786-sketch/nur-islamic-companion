import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { AudioService } from '../services/audioService';
import { DhikrItem } from '../types';
import {
  Sparkles,
  Sun,
  Moon,
  Clock,
  RotateCcw,
  CheckCircle2,
  Circle,
  Volume2,
  Share2,
  Check
  ,Play, Pause, Square, SkipBack, SkipForward, AlertCircle
} from 'lucide-react';

type AdhkarSetKey = 'morning' | 'evening' | 'afterPrayer' | 'beforeSleep';

export const AdhkarPage: React.FC = () => {
  const { adhkarSets, incrementDhikr, resetDhikrSet, settings } = useApp();
  const [activeTab, setActiveTab] = useState<AdhkarSetKey>('morning');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeCollection: DhikrItem[] = adhkarSets[activeTab];
  const completedCount = activeCollection.filter((i) => i.completed).length;
  const totalCount = activeCollection.length;
  const progressPercent = Math.round((completedCount / Math.max(1, totalCount)) * 100);

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [playAll, setPlayAll] = useState(false);
  const [speechRate, setSpeechRate] = useState(() => Number(localStorage.getItem('nur_speech_rate') || '0.9'));
  const [speechMessage, setSpeechMessage] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState(AudioService.getVoiceStatus('ur-PK'));
  const currentIndexRef = useRef(-1);

  useEffect(() => () => AudioService.stopSpeech(), []);
  useEffect(() => AudioService.subscribeToVoices(() => setVoiceStatus(AudioService.getVoiceStatus('ur-PK'))), []);
  useEffect(() => {
    AudioService.stopSpeech();
    setPlayingId(null);
    setIsPaused(false);
    setPlayAll(false);
  }, [activeTab]);

  const handleIncrement = (item: DhikrItem) => {
    if (item.completed) return;

    if (settings.enableSoundFeedback) {
      AudioService.playTasbihClick();
    }

    incrementDhikr(activeTab, item.id);

    if (item.currentCount + 1 >= item.targetCount) {
      if (settings.enableSoundFeedback) {
        AudioService.playCompletionChime();
      }
    }
  };

  const handleCopy = (item: DhikrItem) => {
    const text = `${item.arabic}\n\n${item.transliteration}\n\n"${item.translation}"\n\nReference: ${item.reference}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const stopReading = () => {
    AudioService.stop();
    setPlayingId(null);
    setIsPaused(false);
    setPlayAll(false);
  };

  const readItem = (index: number, continuous: boolean, repetition = 0) => {
    const item = activeCollection[index];
    if (!item) return stopReading();
    if (item.currentCount >= item.targetCount) {
      if (continuous && index < activeCollection.length - 1) return readItem(index + 1, true);
      return stopReading();
    }
    currentIndexRef.current = index;
    setPlayingId(item.id);
    setPlayAll(continuous);
    setIsPaused(false);
    setSpeechMessage(null);
    const spokenText = item.arabic;
    if (!spokenText?.trim()) {
      setSpeechMessage('No translation is available for this item.');
      setPlayingId(null);
      setPlayAll(false);
      return;
    }
    AudioService.playTextAudio(spokenText, 'ar', () => {
      incrementDhikr(activeTab, item.id);
      const nextRepetition = repetition + 1;
      if (item.currentCount + nextRepetition < item.targetCount) {
        readItem(index, continuous, nextRepetition);
      } else if (continuous && index < activeCollection.length - 1) {
        readItem(index + 1, true);
      } else {
        stopReading();
      }
    }, speechRate, (message) => {
      setSpeechMessage(message);
      setPlayingId(null);
      setPlayAll(false);
    });
  };

  const handlePlayAudio = (item: DhikrItem) => {
    if (playingId === item.id && !isPaused) {
      AudioService.pause();
      setIsPaused(true);
    } else if (playingId === item.id && isPaused) {
      AudioService.resume();
      setIsPaused(false);
    } else {
      AudioService.playTextAudio(item.arabic, 'ar', () => {
        setPlayingId(null);
        setIsPaused(false);
      }, speechRate, () => {
        setPlayingId(null);
        setIsPaused(false);
      });
      setPlayingId(item.id);
      setIsPaused(false);
      setPlayAll(false);
    }
  };

  const moveItem = (direction: -1 | 1) => {
    const nextIndex = currentIndexRef.current + direction;
    if (nextIndex >= 0 && nextIndex < activeCollection.length) readItem(nextIndex, playAll);
  };

  const updateSpeechRate = (value: number) => {
    setSpeechRate(value);
    localStorage.setItem('nur_speech_rate', String(value));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-[#0E1424] border border-amber-500/20 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-arabic text-amber-300 text-lg">الأذكار اليومية</span>
              <span className="text-xs uppercase tracking-wider text-slate-400">• Daily Remembrance</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Daily Adhkar</h1>
            <p className="text-xs text-slate-400">Authentic daily remembrance routines for tranquility and spiritual protection.</p>
          </div>

          <button
            onClick={() => resetDhikrSet(activeTab)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Counters</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Set Completion ({completedCount}/{totalCount})</span>
            <span className="font-bold text-amber-300">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4">
          <button onClick={() => readItem(Math.max(0, currentIndexRef.current), true)} className="flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-950"><Play className="h-3.5 w-3.5" /> Play All</button>
          <button onClick={() => readItem(Math.max(0, currentIndexRef.current), false)} className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200"><Play className="h-3.5 w-3.5" /> Play Current</button>
          <button onClick={stopReading} className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300"><Square className="h-3.5 w-3.5" /> Stop</button>
          <button onClick={() => moveItem(-1)} title="Previous dhikr" className="rounded-xl bg-slate-900 p-2 text-slate-300"><SkipBack className="h-3.5 w-3.5" /></button>
          <button onClick={() => moveItem(1)} title="Next dhikr" className="rounded-xl bg-slate-900 p-2 text-slate-300"><SkipForward className="h-3.5 w-3.5" /></button>
          <label className="ml-auto flex items-center gap-2 text-xs text-slate-400">Speed
            <select value={speechRate} onChange={e => updateSpeechRate(Number(e.target.value))} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200">
              {[0.6, 0.8, 0.9, 1, 1.2].map(rate => <option key={rate} value={rate}>{rate}x</option>)}
            </select>
          </label>
          {playingId && <span className="w-full text-xs text-amber-300">Reading item {currentIndexRef.current + 1} of {totalCount}</span>}
          <span className={`w-full text-xs ${voiceStatus === 'ready' ? 'text-emerald-300' : 'text-amber-300'}`}>
            {voiceStatus === 'ready' ? '✓ Urdu voice ready' : voiceStatus === 'loading' ? 'Checking Urdu voice…' : '⚠ Urdu voice unavailable on this device/browser'}
          </span>
          {speechMessage && <span className="flex w-full items-center gap-1 text-xs text-rose-300"><AlertCircle className="h-3.5 w-3.5" /> {speechMessage}</span>}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setActiveTab('morning')}
          className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'morning'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-[#0E1424] border-slate-800 text-slate-300 hover:bg-slate-900'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>Morning (أذكار الصباح)</span>
        </button>

        <button
          onClick={() => setActiveTab('evening')}
          className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'evening'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-[#0E1424] border-slate-800 text-slate-300 hover:bg-slate-900'
          }`}
        >
          <Moon className="w-4 h-4" />
          <span>Evening (أذكار المساء)</span>
        </button>

        <button
          onClick={() => setActiveTab('afterPrayer')}
          className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'afterPrayer'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-[#0E1424] border-slate-800 text-slate-300 hover:bg-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>After Salah (بعد الصلاة)</span>
        </button>

        <button
          onClick={() => setActiveTab('beforeSleep')}
          className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'beforeSleep'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-[#0E1424] border-slate-800 text-slate-300 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Before Sleep (قبل النوم)</span>
        </button>
      </div>

      {/* Adhkar Items List */}
      <div className="space-y-4">
        {activeCollection.map((item) => {
          const isDone = item.completed || item.currentCount >= item.targetCount;
          return (
            <div
              key={item.id}
              className={`p-6 rounded-3xl border transition-all ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-[#0E1424]/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Header with Target Counter Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Target:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-amber-300 text-xs font-bold font-mono">
                    {item.targetCount} {item.targetCount === 1 ? 'time' : 'times'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlayAudio(item)}
                    className={`p-1.5 rounded-lg transition-all ${
                      playingId === item.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-amber-300'
                    }`}
                    aria-label="Read Arabic text"
                    title="Read Arabic text"
                  >
                    {playingId === item.id && !isPaused ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleCopy(item)}
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Arabic Text */}
              <div className="text-right py-2">
                <p className="font-arabic text-xl sm:text-2xl text-amber-100 leading-[2.3]" dir="rtl">
                  {item.arabic}
                </p>
              </div>

              {/* Transliteration */}
              <p className="text-xs text-amber-200/70 italic my-2">
                {item.transliteration}
              </p>

              {/* Translation */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 my-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  "{item.translation}"
                </p>
              </div>

              {/* Reference & Interactive Tap Counter Surface */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800/60">
                <span className="text-[11px] text-slate-400">{item.reference}</span>

                {/* Big Interactive Tap Counter */}
                <button
                  onClick={() => handleIncrement(item)}
                  disabled={isDone}
                  className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-3 transition-all ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Completed ({item.targetCount}/{item.targetCount})</span>
                    </>
                  ) : (
                    <>
                      <span>Tap to Recite</span>
                      <span className="bg-slate-950/30 px-2 py-0.5 rounded-lg text-xs font-mono">
                        {item.currentCount} / {item.targetCount}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
