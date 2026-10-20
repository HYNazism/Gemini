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
  AdNetworkProvider,
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
  const storyByModeFa: Record<string, string> = {
    rescue_escort: `در «${base.biomeNameFa}»، نیازی به روشن کردن نیایشگاه‌ها نیست! ۳ جوانه کوچک در قفس‌های خاردار اسیر شده‌اند. قفس‌هایشان را با عصای بلوط بشکنید و کاروان پران و بامزه آن‌ها را به حیاط کلبه امن هدایت کنید!`,
    harmonic_bells: `در «${base.biomeNameFa}»، از دالان‌های باد صورتی برای سرعت گرفتن عبور کنید و ۴ زنگوله باستانی دره را به صدا درآورید تا پل‌های بلورین روشن شده و دروازه معبد مرکزی ساکورا باز شود!`,
    heart_tree_defense: `در مرکز «${base.biomeNameFa}»، درخت کهنسال قلب کهربایی در برابر ۳ موج کوتاه از مهاجمان ایستاده است! با ضربه زدن به توتم‌های موج طلایی، درخت را شفا دهید و مهاجمان را دفع کنید!`,
    meteor_rush: `آسمان «${base.biomeNameFa}» غرق در شهاب‌باران است! روی سکوهای شتاب‌دهنده یخی بپرید و ۶ شهاب‌سنگ ستاره‌ای را پیش از آنکه نورشان در برف خاموش شود شکار کنید!`,
    boss_duel: `وارد میدان کیهانی «${base.biomeNameFa}» شده‌اید! ستون‌های تشدید اخترتاب را (بدون نیاز به بذر!) فعال کنید تا پادشاه خارهای باستانی گیج شده و با ضربات۳برابری پاکسازی شود!`,
  };

  return {
    ...base,
    title: `فصل ${lvl}: ${base.biomeNameFa}`,
    subtitle: `${base.missionBadgeFa}`,
    storyParagraph: storyByModeFa[base.missionMode] || storyByModeFa.rescue_escort,
  };
}

export function localizeShrinePrompt(rawPrompt: string, lang: Language): string {
  if (lang === 'en' || !rawPrompt) return rawPrompt;
  if (rawPrompt.includes('Break Bramble Cage')) {
    return 'کلید E یا دکمه «ضربه/احیا» را بزنید تا قفس شکسته و جوانه آزاد شود!';
  }
  if (rawPrompt.includes('Ring Ancient Chime Bell')) {
    return 'کلید E یا دکمه «ضربه/احیا» را بزنید تا زنگوله باستانی طنین اندازد!';
  }
  if (rawPrompt.includes('Enter Central Sakura Pavilion')) {
    return 'وارد معبد مرکزی ساکورا شدید! دکمه E یا ضربه را برای تکمیل مرحله بزنید!';
  }
  if (rawPrompt.includes('Trigger Healing Pulse Totem')) {
    return 'کلید E یا ضربه را بزنید تا موج شفابخش توتم طلایی فعال شود!';
  }
  if (rawPrompt.includes('Activate Starlight Pillar')) {
    return 'کلید E یا ضربه را بزنید تا ستون اخترتاب غول را گیج کند (بدون نیاز به بذر)!';
  }
  const depositMatch = rawPrompt.match(/\((\d+)\/(\d+)\)/);
  if (rawPrompt.includes('Press E') && depositMatch) {
    return `کلید E یا دکمه «احیا» را بزنید تا بذر خورشید اهدا شود (${depositMatch[1]}/${depositMatch[2]})`;
  }
  const needMatch = rawPrompt.match(/Need (\d+)/);
  if (needMatch) {
    return `برای بیدار کردن این نیایشگاه به ${needMatch[1]} بذر خورشید دیگر نیاز دارید!`;
  }
  return 'کلید E یا دکمه «احیا» را برای تعامل فشار دهید';
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
    ultra: 'اولترا (جزئیات حداکثری)',
  },
  en: {
    eco: 'Eco (Weak Phones)',
    balanced: 'Balanced',
    high: 'High',
    ultra: 'Ultra (Max Detail)',
  },
};

export const AD_PROVIDER_LABELS: Record<Language, Record<AdNetworkProvider, string>> = {
  fa: {
    admob: 'گوگل ادموب (AdMob)',
    tapsell: 'تپسل پلاس (Tapsell)',
    yektanet: 'یکتانت (Yektanet)',
  },
  en: {
    admob: 'Google AdMob',
    tapsell: 'Tapsell Plus (IR)',
    yektanet: 'Yektanet (IR)',
  },
};

export function localizeDailyQuest(
  quest: {
    type:
      | 'harvest_seeds'
      | 'cleanse_gloomlings'
      | 'restore_shrines'
      | 'bloom_spins'
      | 'leaf_dashes'
      | 'combo_finishers';
    title: string;
    description: string;
    target: number;
  },
  lang: Language
): { title: string; description: string } {
  if (lang === 'en') {
    return { title: quest.title, description: quest.description };
  }

  const t = quest.target;
  switch (quest.type) {
    case 'harvest_seeds':
      return {
        title: `جمع‌آوری ${t} بذر خورشید`,
        description: `${t} بذر طلایی و درخشان خورشید را در سراسر بیشه جمع کنید.`,
      };
    case 'cleanse_gloomlings':
      return {
        title: `پاکسازی ${t} موجود تاریکی`,
        description: `${t} موجود بازیگوش تاریکی را با عصای بلوط خود پاکسازی کنید.`,
      };
    case 'restore_shrines':
      return {
        title: `احیای ${t} نیایشگاه باستانی`,
        description: `با اهدای بذر خورشید، ${t} نیایشگاه کم‌سو را در جنگل بیدار کنید.`,
      };
    case 'bloom_spins':
      return {
        title: `اجرای ${t} چرخش شکوفه`,
        description: `${t} بار مهارت «چرخش گرده شکوفه» را در مرغزار اجرا کنید.`,
      };
    case 'leaf_dashes':
      return {
        title: `انجام ${t} جهش برگی`,
        description: `${t} بار با استفاده از «جهش برگی» به سرعت حرکت کنید.`,
      };
    case 'combo_finishers':
      return {
        title: `اجرای ${t} ضربه نهایی کمبو`,
        description: `${t} بار ضربه سوم و سنگین زنجیره‌ای عصای بلوط را فرود آورید.`,
      };
  }
}

