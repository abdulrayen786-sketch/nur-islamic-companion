import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { calculatePrayerTimes, POPULAR_CITIES } from '../utils/prayerCalculator';
import { AudioService } from '../services/audioService';
import {
  Clock,
  CheckCircle2,
  Circle,
  MapPin,
  Compass,
  Sliders,
  Volume2,
  VolumeX,
  Bell,
  Sun,
  Moon,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

export const PrayerPage: React.FC = () => {
  const {
    prayerConfig,
    setPrayerConfig,
    completedPrayers,
    togglePrayerCompleted,
    setActiveSection,
  } = useApp();

  const [prayerData, setPrayerData] = useState(() =>
    calculatePrayerTimes(new Date(), prayerConfig, completedPrayers)
  );

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState(prayerConfig.cityName);
  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setPrayerData(calculatePrayerTimes(new Date(), prayerConfig, completedPrayers));
    }, 1000);
    return () => clearInterval(timer);
  }, [prayerConfig, completedPrayers]);

  const handleCitySelect = (cityName: string) => {
    const found = POPULAR_CITIES.find((c) => c.name === cityName);
    if (found) {
      setSelectedCity(found.name);
      setPrayerConfig((prev) => ({
        ...prev,
        cityName: found.name,
        countryName: found.country,
        latitude: found.lat,
        longitude: found.lng,
        autoDetectLocation: false,
      }));
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location services are not available in this browser.');
      return;
    }

    setIsLocating(true);
    setLocationMessage(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setSelectedCity('Current Location');
        setPrayerConfig((prev) => ({
          ...prev,
          latitude: coords.latitude,
          longitude: coords.longitude,
          cityName: 'Current Location',
          countryName: 'GPS detected',
          autoDetectLocation: true,
        }));
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setLocationMessage('Location permission was denied or unavailable.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 },
    );
  };

  const handleToggleAdhanPreview = () => {
    if (isPlayingAdhan) {
      AudioService.stop();
      setIsPlayingAdhan(false);
    } else {
      setIsPlayingAdhan(true);
      AudioService.playCompletionChime();
      setTimeout(() => setIsPlayingAdhan(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header & Location Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#111728] via-[#0E1424] to-[#0A0D18] border border-amber-500/20 rounded-3xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-arabic text-amber-300 text-lg">مواقيت الصلاة</span>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">• Daily Prayer Times</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center gap-2">
            <span>{prayerConfig.cityName}</span>
            <span className="text-sm font-normal text-slate-400">({prayerConfig.countryName})</span>
          </h1>
          <p className="text-xs text-slate-400">
            Calculation: {prayerConfig.method} • Madhab: {prayerConfig.madhab.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-200 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <MapPin className="w-4 h-4" />
            <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
          </button>
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Calculation Settings</span>
          </button>
          
          <button
            onClick={handleToggleAdhanPreview}
            className={`p-2.5 rounded-xl border transition-all ${
              isPlayingAdhan
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-300'
            }`}
            title="Preview Notification Sound"
          >
            {isPlayingAdhan ? <Volume2 className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </button>
        </div>
        {locationMessage && <p className="text-xs text-rose-300">{locationMessage}</p>}
      </div>

      {/* Hero Countdown Spotlight to Next Prayer */}
      {prayerData.nextPrayer && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-amber-600/20 via-[#141C30] to-[#0E1526] border border-amber-400/30 p-6 sm:p-8 shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Upcoming Prayer Window
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
                {prayerData.nextPrayer.name} <span className="font-arabic text-amber-300 font-normal">({prayerData.nextPrayer.arabicName})</span>
              </h2>
              <p className="text-sm text-slate-300">
                Adhan scheduled at <span className="text-amber-200 font-semibold">{prayerData.nextPrayer.time}</span>
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end">
              <span className="text-xs uppercase tracking-wider text-slate-400 mb-1">Time Remaining</span>
              <div className="flex items-center gap-2">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-center min-w-[65px]">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-300">
                    {String(prayerData.timeRemainingToNext.hours).padStart(2, '0')}
                  </span>
                  <p className="text-[10px] text-slate-500 uppercase mt-0.5">Hours</p>
                </div>
                <span className="text-2xl font-bold text-slate-600">:</span>
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-center min-w-[65px]">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-300">
                    {String(prayerData.timeRemainingToNext.minutes).padStart(2, '0')}
                  </span>
                  <p className="text-[10px] text-slate-500 uppercase mt-0.5">Mins</p>
                </div>
                <span className="text-2xl font-bold text-slate-600">:</span>
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-center min-w-[65px]">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-300">
                    {String(prayerData.timeRemainingToNext.seconds).padStart(2, '0')}
                  </span>
                  <p className="text-[10px] text-slate-500 uppercase mt-0.5">Secs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Prayer Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prayerData.prayers.map((prayer) => {
          const isSunrise = prayer.id === 'sunrise';
          const isCompleted = isSunrise ? true : !!completedPrayers[prayer.id];

          return (
            <div
              key={prayer.id}
              onClick={() => !isSunrise && togglePrayerCompleted(prayer.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                prayer.isCurrent
                  ? 'bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-900 border-amber-400/50 shadow-xl shadow-amber-500/5 ring-1 ring-amber-400/30'
                  : prayer.isNext
                  ? 'bg-slate-900/90 border-slate-700 hover:border-amber-500/30 shadow-md'
                  : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  {!isSunrise ? (
                    isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                    )
                  ) : (
                    <Sun className="w-5 h-5 text-amber-400/80" />
                  )}
                  <h3 className="text-base font-display font-semibold text-white">{prayer.name}</h3>
                </div>
                <span className="font-arabic text-base text-amber-300/80">{prayer.arabicName}</span>
              </div>

              <div className="my-4 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                  {prayer.time}
                </span>
                {prayer.isCurrent && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    Current
                  </span>
                )}
                {prayer.isNext && (
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                    Next
                  </span>
                )}
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{isSunrise ? 'Solar event' : isCompleted ? 'Marked Completed' : 'Tap to mark completed'}</span>
                {!isSunrise && (
                  <span className={isCompleted ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                    {isCompleted ? 'Done' : 'Pending'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Special Times (Tahajjud, Suhoor, Iftar, Qibla Link) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-2xl bg-[#0E1424] border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Qiyam / Tahajjud</span>
            <p className="text-base font-display font-bold text-amber-200">{prayerData.tahajjudTime}</p>
            <p className="text-[10px] text-slate-500">Last third of the night</p>
          </div>
          <Moon className="w-6 h-6 text-amber-400/40" />
        </div>

        <div className="p-4 rounded-2xl bg-[#0E1424] border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Suhoor Ends (Imsak)</span>
            <p className="text-base font-display font-bold text-amber-200">{prayerData.suhoorTime}</p>
            <p className="text-[10px] text-slate-500">10 mins before Fajr</p>
          </div>
          <Sparkles className="w-6 h-6 text-amber-400/40" />
        </div>

        <div 
          onClick={() => setActiveSection('qibla')}
          className="p-4 rounded-2xl bg-[#0E1424] border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Qibla Compass</span>
            <p className="text-base font-display font-bold text-white group-hover:text-amber-300 transition-colors">
              Find Kaaba
            </p>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>View compass & degrees</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
          <Compass className="w-6 h-6 text-indigo-400 group-hover:rotate-45 transition-transform duration-300" />
        </div>

      </div>

      {/* Settings Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-display font-bold text-white">Prayer Calculation Settings</h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* City Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select City</label>
              <select
                value={selectedCity}
                onChange={(e) => handleCitySelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
              >
                {POPULAR_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}, {c.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Method */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Calculation Method</label>
              <select
                value={prayerConfig.method}
                onChange={(e) => setPrayerConfig((prev) => ({ ...prev, method: e.target.value as any }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
              >
                <option value="MWL">Muslim World League (MWL - 18°/17°)</option>
                <option value="ISNA">ISNA (North America - 15°/15°)</option>
                <option value="Egypt">Egyptian General Authority (19.5°/17.5°)</option>
                <option value="Makkah">Umm al-Qura University, Makkah (18.5° / +90m)</option>
                <option value="Karachi">University of Islamic Sciences, Karachi (18°/18°)</option>
                <option value="Turkey">Diyanet İşleri Başkanlığı (Turkey)</option>
                <option value="France">Union des Organisations Islamiques de France (12°)</option>
              </select>
            </div>

            {/* Madhab */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Asr Juristic Method (Madhab)</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPrayerConfig((prev) => ({ ...prev, madhab: 'shafii' }))}
                  className={`p-3 rounded-xl text-xs font-medium border transition-all ${
                    prayerConfig.madhab === 'shafii'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Standard (Shafi'i, Maliki, Hanbali)
                </button>
                <button
                  type="button"
                  onClick={() => setPrayerConfig((prev) => ({ ...prev, madhab: 'hanafi' }))}
                  className={`p-3 rounded-xl text-xs font-medium border transition-all ${
                    prayerConfig.madhab === 'hanafi'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Hanafi (Double Shadow)
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
