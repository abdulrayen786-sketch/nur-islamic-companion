import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { calculateQiblaDirection, calculateDistanceToKaaba, POPULAR_CITIES, KAABA_COORDS } from '../utils/prayerCalculator';
import {
  Compass,
  MapPin,
  RotateCw,
  Sparkles,
  Sliders,
  Navigation,
  Globe,
  ChevronRight
} from 'lucide-react';

export const QiblaPage: React.FC = () => {
  const { prayerConfig, setPrayerConfig } = useApp();

  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [headingOffset, setHeadingOffset] = useState(0);
  const [isDeviceCompassActive, setIsDeviceCompassActive] = useState(false);
  const [compassMessage, setCompassMessage] = useState<string | null>(null);

  useEffect(() => {
    const angle = calculateQiblaDirection(prayerConfig.latitude, prayerConfig.longitude);
    const dist = calculateDistanceToKaaba(prayerConfig.latitude, prayerConfig.longitude);
    setQiblaAngle(angle);
    setDistanceKm(dist);
  }, [prayerConfig.latitude, prayerConfig.longitude]);

  const enableLiveCompass = async () => {
    const OrientationEvent = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (!OrientationEvent) {
      setCompassMessage('Live compass is not available on this device.');
      return;
    }
    if (OrientationEvent.requestPermission) {
      let permission: 'granted' | 'denied';
      try {
        permission = await OrientationEvent.requestPermission();
      } catch {
        setCompassMessage('Compass permission could not be requested.');
        return;
      }
      if (permission !== 'granted') {
        setCompassMessage('Compass permission was denied.');
        return;
      }
    }
    setCompassMessage(null);
    compassCleanup?.();
    const handleOrientation = (event: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
      const heading = typeof event.webkitCompassHeading === 'number'
        ? event.webkitCompassHeading
        : event.alpha === null ? null : (360 - event.alpha) % 360;
      if (heading !== null) {
        setIsDeviceCompassActive(true);
        setHeadingOffset(Math.round(heading));
      }
    };
    window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener);
    window.addEventListener('deviceorientation', handleOrientation as EventListener);
    setCompassCleanup(() => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener);
      window.removeEventListener('deviceorientation', handleOrientation as EventListener);
    });
  };

  const [compassCleanup, setCompassCleanup] = useState<(() => void) | null>(null);
  useEffect(() => () => compassCleanup?.(), [compassCleanup]);
  useEffect(() => {
    const OrientationEvent = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (OrientationEvent && !OrientationEvent.requestPermission) void enableLiveCompass();
  }, []);

  const effectiveRotation = (qiblaAngle - headingOffset + 360) % 360;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-[#0E1424] border border-amber-500/20 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-arabic text-amber-300 text-lg">اتجاه القبلة</span>
            <span className="text-xs uppercase tracking-wider text-slate-400">• Sacred Direction</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Qibla Compass</h1>
          <p className="text-xs text-slate-400">Accurate Great-Circle bearing towards the Holy Kaaba in Makkah al-Mukarramah.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300">
            {prayerConfig.cityName}, {prayerConfig.countryName}
          </div>
        </div>
      </div>

      {/* Main Compass Visual Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#131B2F] via-[#0E1527] to-[#0A0D18] border border-amber-500/30 p-8 sm:p-12 text-center shadow-2xl space-y-8">
        
        {/* Background Sacred Geometric Overlay */}
        <div className="absolute inset-0 bg-islamic-pattern opacity-10 pointer-events-none"></div>

        {/* Direction & Distance Details */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 sm:gap-12">
          <div className="text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Qibla Bearing</span>
            <p className="text-3xl sm:text-4xl font-display font-bold text-amber-300">
              {qiblaAngle}° <span className="text-xs text-slate-400 font-normal">from True North</span>
            </p>
          </div>

          <div className="h-10 w-px bg-slate-800 hidden sm:block"></div>

          <div className="text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Distance to Kaaba</span>
            <p className="text-3xl sm:text-4xl font-display font-bold text-white">
              {distanceKm.toLocaleString()} <span className="text-xs text-slate-400 font-normal">km ({Math.round(distanceKm * 0.621371).toLocaleString()} mi)</span>
            </p>
          </div>
        </div>

        {/* The Animated Compass Dial */}
        <div className="relative z-10 flex justify-center py-4">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-slate-950 border-4 border-slate-800 shadow-2xl flex items-center justify-center">
            
            {/* Cardinal Points */}
            <span className="absolute top-3 font-bold text-xs text-amber-400">N</span>
            <span className="absolute right-3 font-bold text-xs text-slate-500">E</span>
            <span className="absolute bottom-3 font-bold text-xs text-slate-500">S</span>
            <span className="absolute left-3 font-bold text-xs text-slate-500">W</span>

            {/* Inner Ticks */}
            <div className="absolute inset-6 rounded-full border border-slate-800 border-dashed"></div>

            {/* The Rotating Needle pointing to Kaaba */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out"
              style={{ transform: `rotate(${effectiveRotation}deg)` }}
            >
              {/* Gold Kaaba Pointer Arrow */}
              <div className="absolute top-6 flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-300 shadow-lg flex items-center justify-center text-slate-950 font-bold text-[10px] shadow-amber-400/30">
                  كعبة
                </div>
                <div className="w-1 h-20 bg-gradient-to-b from-amber-400 to-transparent rounded-full mt-1"></div>
              </div>

              {/* Counter Weight Needle Base */}
              <div className="absolute bottom-10 w-1.5 h-12 bg-slate-700 rounded-full"></div>
            </div>

            {/* Center Golden Pivot */}
            <div className="relative z-20 w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center shadow-lg">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
            </div>

          </div>
        </div>

        {/* Orientation Status & Manual Slider Fallback */}
        <div className="relative z-10 space-y-3 max-w-md mx-auto">
          {isDeviceCompassActive ? (
            <p className="text-xs text-emerald-400 font-medium flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live hardware compass active (Heading: {headingOffset}°)</span>
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Manual Device Heading Rotation:</span>
                <span className="font-mono text-amber-300 font-semibold">{headingOffset}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={headingOffset}
                onChange={(e) => setHeadingOffset(parseInt(e.target.value, 10))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <button onClick={enableLiveCompass} className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/20">
                Enable Live Compass
              </button>
              {compassMessage && <p className="text-xs text-rose-300">{compassMessage}</p>}
            </div>
          )}
        </div>

      </div>

      {/* Quick City Coordinates Switcher */}
      <div className="bg-[#0E1424] border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-display font-semibold text-white">Calculate from Worldwide Cities</h3>
          </div>
          <span className="text-xs text-slate-400">Kaaba: 21.42° N, 39.83° E</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {POPULAR_CITIES.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                setPrayerConfig((prev) => ({
                  ...prev,
                  cityName: c.name,
                  countryName: c.country,
                  latitude: c.lat,
                  longitude: c.lng,
                  autoDetectLocation: false,
                }));
              }}
              className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                prayerConfig.cityName === c.name
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
              }`}
            >
              <p className="font-semibold">{c.name}</p>
              <p className="text-[10px] text-slate-400">{c.country}</p>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
