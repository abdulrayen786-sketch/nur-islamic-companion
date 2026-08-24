import { PrayerCalculationConfig, PrayerName, PrayerTimeItem } from '../types';

// Coordinates of the Kaaba in Makkah al-Mukarramah
export const KAABA_COORDS = {
  latitude: 21.422487,
  longitude: 39.826206,
};

// Popular Worldwide Cities for Quick Switch
export const POPULAR_CITIES = [
  { name: 'Makkah', country: 'Saudi Arabia', lat: 21.3891, lng: 39.8579, timezone: 3 },
  { name: 'Madinah', country: 'Saudi Arabia', lat: 24.5247, lng: 39.5692, timezone: 3 },
  { name: 'Jerusalem (Al-Quds)', country: 'Palestine', lat: 31.7683, lng: 35.2137, timezone: 3 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, timezone: 2 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, timezone: 3 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, timezone: 1 },
  { name: 'New York', country: 'United States', lat: 40.7128, lng: -74.0060, timezone: -4 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, timezone: -4 },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lng: 55.2708, timezone: 4 },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, timezone: 7 },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lng: 101.6869, timezone: 8 },
  { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lng: 67.0011, timezone: 5 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, timezone: 5.5 },
  { name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lng: 90.4125, timezone: 6 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, timezone: 10 },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, timezone: 2 },
  { name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, timezone: 2 },
];

/**
 * Calculates Great-Circle Qibla Direction (Bearing in degrees 0-360) from user coordinates
 */
export function calculateQiblaDirection(latitude: number, longitude: number): number {
  const phiK = (KAABA_COORDS.latitude * Math.PI) / 180.0;
  const lambdaK = (KAABA_COORDS.longitude * Math.PI) / 180.0;
  const phi = (latitude * Math.PI) / 180.0;
  const lambda = (longitude * Math.PI) / 180.0;

  const deltaLambda = lambdaK - lambda;

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaLambda);

  let qiblaRad = Math.atan2(y, x);
  let qiblaDeg = (qiblaRad * 180.0) / Math.PI;
  qiblaDeg = (qiblaDeg + 360.0) % 360.0;

  return Math.round(qiblaDeg * 10) / 10;
}

/**
 * Calculates Distance to Kaaba in kilometers
 */
export function calculateDistanceToKaaba(latitude: number, longitude: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((KAABA_COORDS.latitude - latitude) * Math.PI) / 180;
  const dLon = ((KAABA_COORDS.longitude - longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((latitude * Math.PI) / 180) *
      Math.cos((KAABA_COORDS.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Astronomical Solar Calculation Engine for Islamic Prayer Times
 */
export function calculatePrayerTimes(
  date: Date,
  config: PrayerCalculationConfig,
  completedMap: Record<string, boolean> = {}
): {
  prayers: PrayerTimeItem[];
  currentPrayer: PrayerTimeItem | null;
  nextPrayer: PrayerTimeItem | null;
  timeRemainingToNext: { hours: number; minutes: number; seconds: number };
  suhoorTime: string;
  iftarTime: string;
  tahajjudTime: string;
} {
  const lat = config.latitude;
  const lng = config.longitude;

  // Calculation parameters based on convention
  let fajrAngle = 18.0;
  let ishaAngle = 17.0;
  let ishaInterval: number | null = null; // for Umm al-Qura (90 mins after Maghrib)

  switch (config.method) {
    case 'MWL':
      fajrAngle = 18.0;
      ishaAngle = 17.0;
      break;
    case 'ISNA':
      fajrAngle = 15.0;
      ishaAngle = 15.0;
      break;
    case 'Egypt':
      fajrAngle = 19.5;
      ishaAngle = 17.5;
      break;
    case 'Makkah':
      fajrAngle = 18.5;
      ishaInterval = 90; // 90 mins after Maghrib
      break;
    case 'Karachi':
      fajrAngle = 18.0;
      ishaAngle = 18.0;
      break;
    case 'Tehran':
      fajrAngle = 17.7;
      ishaAngle = 14.0;
      break;
    case 'Turkey':
      fajrAngle = 18.0;
      ishaAngle = 17.0;
      break;
    case 'France':
      fajrAngle = 12.0;
      ishaAngle = 12.0;
      break;
    default:
      fajrAngle = 18.0;
      ishaAngle = 17.0;
  }

  // Day of year
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Solar declination and Equation of time
  const B = ((360 / 365) * (dayOfYear - 81) * Math.PI) / 180;
  const EoT = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); // in minutes
  const delta = (23.45 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180) * Math.PI) / 180; // in radians

  const phi = (lat * Math.PI) / 180;

  // Timezone offset in hours
  const tzOffset = -date.getTimezoneOffset() / 60;

  // Solar noon (Dhuhr)
  const solarNoonHour = 12 + (tzOffset * 15 - lng) / 15 - EoT / 60;
  const dhuhrDate = new Date(date);
  setDecimalHours(dhuhrDate, solarNoonHour + 2 / 60); // +2 min safety

  // Sunrise and Sunset calculation (solar altitude = -0.833 deg)
  const sunAngle = (-0.833 * Math.PI) / 180;
  const cosHourAngleSun = (Math.sin(sunAngle) - Math.sin(phi) * Math.sin(delta)) / (Math.cos(phi) * Math.cos(delta));
  const clampedCosSun = Math.max(-1, Math.min(1, cosHourAngleSun));
  const hourAngleSun = (Math.acos(clampedCosSun) * 180) / (Math.PI * 15); // in hours

  const sunriseDate = new Date(date);
  setDecimalHours(sunriseDate, solarNoonHour - hourAngleSun);

  const maghribDate = new Date(date);
  setDecimalHours(maghribDate, solarNoonHour + hourAngleSun + 2 / 60);

  // Fajr calculation
  const fajrAlt = (-fajrAngle * Math.PI) / 180;
  const cosHourAngleFajr = (Math.sin(fajrAlt) - Math.sin(phi) * Math.sin(delta)) / (Math.cos(phi) * Math.cos(delta));
  const clampedCosFajr = Math.max(-1, Math.min(1, cosHourAngleFajr));
  const hourAngleFajr = (Math.acos(clampedCosFajr) * 180) / (Math.PI * 15);

  const fajrDate = new Date(date);
  setDecimalHours(fajrDate, solarNoonHour - hourAngleFajr);

  // Asr calculation (Madhab: Standard 1:1 or Hanafi 2:1)
  const shadowFactor = config.madhab === 'hanafi' ? 2 : 1;
  const asrAlt = Math.atan(1 / (shadowFactor + Math.tan(Math.abs(phi - delta))));
  const cosHourAngleAsr = (Math.sin(asrAlt) - Math.sin(phi) * Math.sin(delta)) / (Math.cos(phi) * Math.cos(delta));
  const clampedCosAsr = Math.max(-1, Math.min(1, cosHourAngleAsr));
  const hourAngleAsr = (Math.acos(clampedCosAsr) * 180) / (Math.PI * 15);

  const asrDate = new Date(date);
  setDecimalHours(asrDate, solarNoonHour + hourAngleAsr);

  // Isha calculation
  const ishaDate = new Date(date);
  if (ishaInterval !== null) {
    ishaDate.setTime(maghribDate.getTime() + ishaInterval * 60 * 1000);
  } else {
    const ishaAlt = (-ishaAngle * Math.PI) / 180;
    const cosHourAngleIsha = (Math.sin(ishaAlt) - Math.sin(phi) * Math.sin(delta)) / (Math.cos(phi) * Math.cos(delta));
    const clampedCosIsha = Math.max(-1, Math.min(1, cosHourAngleIsha));
    const hourAngleIsha = (Math.acos(clampedCosIsha) * 180) / (Math.PI * 15);
    setDecimalHours(ishaDate, solarNoonHour + hourAngleIsha);
  }

  // Suhoor (10 mins before Fajr)
  const suhoorDate = new Date(fajrDate.getTime() - 10 * 60 * 1000);
  // Tahajjud / Last third of the night
  const nightLength = fajrDate.getTime() - maghribDate.getTime();
  const tahajjudDate = new Date(fajrDate.getTime() - nightLength / 3);

  const now = new Date();

  const prayerItems: PrayerTimeItem[] = [
    {
      id: 'fajr',
      name: 'Fajr',
      arabicName: 'الفجر',
      time: formatTimeString(fajrDate),
      timestamp: fajrDate,
      isPassed: now > fajrDate,
      isCurrent: false,
      isNext: false,
      isCompleted: !!completedMap['fajr'],
    },
    {
      id: 'sunrise',
      name: 'Sunrise',
      arabicName: 'الشروق',
      time: formatTimeString(sunriseDate),
      timestamp: sunriseDate,
      isPassed: now > sunriseDate,
      isCurrent: false,
      isNext: false,
      isCompleted: true, // Sunrise is not a fardh prayer
    },
    {
      id: 'dhuhr',
      name: 'Dhuhr',
      arabicName: 'الظهر',
      time: formatTimeString(dhuhrDate),
      timestamp: dhuhrDate,
      isPassed: now > dhuhrDate,
      isCurrent: false,
      isNext: false,
      isCompleted: !!completedMap['dhuhr'],
    },
    {
      id: 'asr',
      name: 'Asr',
      arabicName: 'العصر',
      time: formatTimeString(asrDate),
      timestamp: asrDate,
      isPassed: now > asrDate,
      isCurrent: false,
      isNext: false,
      isCompleted: !!completedMap['asr'],
    },
    {
      id: 'maghrib',
      name: 'Maghrib',
      arabicName: 'المغرب',
      time: formatTimeString(maghribDate),
      timestamp: maghribDate,
      isPassed: now > maghribDate,
      isCurrent: false,
      isNext: false,
      isCompleted: !!completedMap['maghrib'],
    },
    {
      id: 'isha',
      name: 'Isha',
      arabicName: 'العشاء',
      time: formatTimeString(ishaDate),
      timestamp: ishaDate,
      isPassed: now > ishaDate,
      isCurrent: false,
      isNext: false,
      isCompleted: !!completedMap['isha'],
    },
  ];

  // Determine current and next prayer
  let currentPrayer: PrayerTimeItem | null = null;
  let nextPrayer: PrayerTimeItem | null = null;

  for (let i = 0; i < prayerItems.length; i++) {
    const item = prayerItems[i];
    if (item.id === 'sunrise') continue; // only count actual prayer windows

    if (now >= item.timestamp) {
      currentPrayer = item;
    } else if (!nextPrayer && now < item.timestamp) {
      nextPrayer = item;
    }
  }

  if (!currentPrayer) {
    // Before Fajr: current prayer is Isha of previous night
    currentPrayer = prayerItems[prayerItems.length - 1];
  }

  if (!nextPrayer) {
    // After Isha: next prayer is Fajr tomorrow
    const tomorrowFajr = new Date(fajrDate);
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    nextPrayer = {
      ...prayerItems[0],
      timestamp: tomorrowFajr,
    };
  }

  // Update flags
  prayerItems.forEach((p) => {
    if (currentPrayer && p.id === currentPrayer.id) p.isCurrent = true;
    if (nextPrayer && p.id === nextPrayer.id) p.isNext = true;
  });

  // Calculate countdown
  let diffMs = nextPrayer ? nextPrayer.timestamp.getTime() - now.getTime() : 0;
  if (diffMs < 0) diffMs = 0;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    prayers: prayerItems,
    currentPrayer,
    nextPrayer,
    timeRemainingToNext: { hours, minutes, seconds },
    suhoorTime: formatTimeString(suhoorDate),
    iftarTime: formatTimeString(maghribDate),
    tahajjudTime: formatTimeString(tahajjudDate),
  };
}

function setDecimalHours(target: Date, decimalHours: number) {
  let hrs = Math.floor(decimalHours);
  let remainderMin = (decimalHours - hrs) * 60;
  let mins = Math.floor(remainderMin);
  let secs = Math.floor((remainderMin - mins) * 60);

  target.setHours(hrs, mins, secs, 0);
}

function formatTimeString(d: Date): string {
  let hours = d.getHours();
  let minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const minStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minStr} ${ampm}`;
}
