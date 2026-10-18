/**
 * Bilingual Localization System (Persian 'fa' & English 'en') for Sproutling: Grove Guardian 3D.
 * Defaults to Persian ('fa') with persistent user preference and infinite chapter story translation.
 */

import type {
  ChapterStoryInfo,
  WeatherType,
  TimePhase,
  BodyType,
  HairstyleType,
  FacialFeatureType,
  ClothingStyleType,
  RoofStyleType,
  HearthStyleType,
  GardenStyleType,
  PerformanceQuality,
} from './rules.ts';
import { generateChapterInfo } from './rules.ts';

export type Language = 'fa' | 'en';

const LANG_STORAGE_KEY = 'sproutling_lang_v1';

export function getSavedLanguage(): Language {
  if (typeof window === 'undefined') return 'fa';
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'en' || saved === 'fa') return saved;
  } catch {
    // ignore storage errors
  }
  return 'fa';
}

export function saveLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}

const FA_ADJECTIVES = [
  'نجواگر',
  'آفتابی',
  'ستاره‌باران',
  'شکوفا',
  'شبنم‌زده',
  'بلورین',
  'مخملی',
  'زمردین',
  'کهربایی',
  'لالایی‌خوان',
  'مهتابی',
  'هم‌آوا',
];

const FA_PLACES = [
  'مرغزار',
  'بیشه بید',
  'دره عسل',
  'پناهگاه شکوفه',
  'دره سرخس',
  'تاج خزه‌ای',
  'باغ فانوس',
  'گذرگاه تمشک',
  'حوضچه بذر خورشید',
  'باغستان ارواح',
];

const FA_SPIRITS = [
  'روح بلوط کهنسال',
  'مرغ نغمه‌خوان سحر',
  'بانوی کرم‌های شب‌تاب',
  'بافنده خورشید باستان',
  'نگهبان شبنم',
  'لاک‌پشت خزه‌ای خفته',
  'گوزن گلبرگ‌ستاره',
  'جغد زنگوله‌باد',
];

export const WEATHER_LABELS: Record<Language, Record<WeatherType, string>> = {
  fa: {
    sunshine: 'آفتابی (+امتیاز)',
    rain: 'بارانی (+شارژ جهش)',
    snow: 'برفی (کندی دشمنان)',
    petals: 'نسیم شکوفه',
  },
  en: {
    sunshine: 'Sunshine (+Score)',
    rain: 'Rain (+Regen/Dash)',
    snow: 'Snow (Slows Foes)',
    petals: 'Sakura Breeze',
  },
};

export const WEATHER_SHORT_LABELS: Record<Language, Record<WeatherType, string>> = {
  fa: {
    sunshine: 'آفتابی',
    rain: 'بارانی',
    snow: 'برفی',
    petals: 'شکوفه‌باران',
  },
  en: {
    sunshine: 'Sunshine',
    rain: 'Rain',
    snow: 'Snow',
    petals: 'Petals',
  },
};

export const TIME_PHASE_LABELS: Record<Language, Record<TimePhase, string>> = {
  fa: {
    dawn: 'سپیده‌دم',
    day: 'روز',
    sunset: 'غروب',
    night: 'شب',
  },
  en: {
    dawn: 'Dawn',
    day: 'Day',
    sunset: 'Sunset',
    night: 'Night',
  },
};

export function getLocalizedChapterInfo(chapterNumber: number, lang: Language): ChapterStoryInfo {
  const base = generateChapterInfo(chapterNumber);
  if (lang === 'en') return base;

  const lvl = base.chapterNumber;
  const adj = FA_ADJECTIVES[(lvl - 1) % FA_ADJECTIVES.length];
  const place = FA_PLACES[((lvl - 1) * 3) % FA_PLACES.length];
  const spirit = FA_SPIRITS[((lvl - 1) * 5) % FA_SPIRITS.length];
  const weatherFa = WEATHER_SHORT_LABELS.fa[base.featuredWeather];

  const storyParagraph =
    lvl === 1
      ? `«پیپ» در ${place} ${adj} چشم باز می‌کند. موجودات بازیگوش تاریکی نور ۴ نیایشگاه باستانی را کم‌سو کرده و «${spirit}» را در خارهای خواب‌آلود پیچیده‌اند. بذرهای طلایی خورشید را جمع کنید تا گرما و روشنایی به جنگل بازگردد!`
      : `با طنین‌انداز شدن نغمه شادی در بیشه قبلی، کورهراهی درخشان به سوی فصل ${lvl} یعنی «${place} ${adj}» گشوده می‌شود. در اینجا «${spirit}» چشم‌به‌راه عصای بلوط شماست تا ۴ نیایشگاه مقدس را زیر آسمان ${weatherFa} بیدار کنید!`;

  return {
    ...base,
    title: `فصل ${lvl}: ${place} ${adj}`,
    subtitle: `برکت ${spirit}`,
    storyParagraph,
  };
}

export function localizeShrinePrompt(rawPrompt: string, lang: Language): string {
  if (lang === 'en' || !rawPrompt) return rawPrompt;
  // Convert "Press E or Tap RESTORE to deposit Sun-Seed (1/3)" or "Need 2 more Sun-Seeds to restore Shrine!"
  const depositMatch = rawPrompt.match(/\((\d+)\/(\d+)\)/);
  if (rawPrompt.includes('Press E') && depositMatch) {
    return `کلید E یا دکمه «احیا» را بزنید تا بذر خورشید اهدا شود (${depositMatch[1]}/${depositMatch[2]})`;
  }
  const needMatch = rawPrompt.match(/Need (\d+)/);
  if (needMatch) {
    return `برای بیدار کردن این نیایشگاه به ${needMatch[1]} بذر خورشید دیگر نیاز دارید!`;
  }
  return 'کلید E یا دکمه «احیا» را برای اهدای بذر خورشید فشار دهید';
}

export const BODY_TYPE_LABELS: Record<Language, Record<BodyType, string>> = {
  fa: {
    sprout: 'جوانه گردالو',
    nimble: 'پری چابک',
    sturdy: 'بلوط تنومند',
    tall: 'رهگذر بلندقامت',
  },
  en: {
    sprout: 'Plump Sprout',
    nimble: 'Nimble Sprite',
    sturdy: 'Sturdy Acorn',
    tall: 'Willow Wanderer',
  },
};

export const FACIAL_FEATURE_LABELS: Record<Language, Record<FacialFeatureType, string>> = {
  fa: {
    cheerful: 'خندان و گلی',
    starry: 'چشمان ستاره‌ای',
    'sleepy-cozy': 'لبخند آرام',
    'scholar-glasses': 'عینک گرد جنگلی',
  },
  en: {
    cheerful: 'Rosy & Cheerful',
    starry: 'Starry Eyes & Freckles',
    'sleepy-cozy': 'Cozy Gentle Smile',
    'scholar-glasses': 'Woodland Round Glasses',
  },
};

export const HAIRSTYLE_LABELS: Record<Language, Record<HairstyleType, string>> = {
  fa: {
    'twin-sprout': 'برگ‌های جوانه دوقلو',
    'fluffy-bob': 'موی پف‌دار نرم',
    'braided-crown': 'تاج بافت جنگلی',
    'mushroom-beret': 'کلاه قارچی',
    'sun-halo': 'تاج گل آفتابگردان',
  },
  en: {
    'twin-sprout': 'Twin Sprout Leaves',
    'fluffy-bob': 'Cozy Fluffy Bob',
    'braided-crown': 'Woodland Braids',
    'mushroom-beret': 'Toadstool Beret',
    'sun-halo': 'Sunflower Crest',
  },
};

export const CLOTHING_STYLE_LABELS: Record<Language, Record<ClothingStyleType, string>> = {
  fa: {
    'leaf-cloak': 'شنل برگ زمردین',
    'traveler-poncho': 'پانچو بافت مسافران',
    'sun-robe': 'ردای بافنده خورشید',
    'berry-overalls': 'تونیک و شال باغبان',
  },
  en: {
    'leaf-cloak': 'Emerald Leaf Cloak',
    'traveler-poncho': 'Woven Traveler Poncho',
    'sun-robe': 'Royal Sun-Weaver Mantle',
    'berry-overalls': 'Gardener Tunic & Scarf',
  },
};

export const ROOF_STYLE_LABELS: Record<Language, Record<RoofStyleType, string>> = {
  fa: {
    moss: 'خزه‌ای',
    terracotta: 'سفالی',
    slate: 'سنگی',
    sakura: 'شکوفه صورتی',
  },
  en: {
    moss: 'Moss',
    terracotta: 'Terracotta',
    slate: 'Slate',
    sakura: 'Sakura',
  },
};

export const HEARTH_STYLE_LABELS: Record<Language, Record<HearthStyleType, string>> = {
  fa: {
    campfire: 'آتش هیزمی',
    fountain: 'چشمه نور',
    lantern: 'فانوس کهربا',
  },
  en: {
    campfire: 'Campfire',
    fountain: 'Fountain',
    lantern: 'Lantern',
  },
};

export const GARDEN_STYLE_LABELS: Record<Language, Record<GardenStyleType, string>> = {
  fa: {
    flowers: 'گل‌های وحشی',
    mushrooms: 'قارچ‌های شب‌تاب',
    stones: 'سنگ‌چین باستانی',
  },
  en: {
    flowers: 'Flowers',
    mushrooms: 'Mushrooms',
    stones: 'Stones',
  },
};

export const PERFORMANCE_LABELS: Record<Language, Record<PerformanceQuality, string>> = {
  fa: {
    eco: 'اقتصادی (گوشی ضعیف)',
    balanced: 'متعادل',
    high: 'کیفیت بالا',
  },
  en: {
    eco: 'Eco (Weak Phones)',
    balanced: 'Balanced',
    high: 'High',
  },
};
