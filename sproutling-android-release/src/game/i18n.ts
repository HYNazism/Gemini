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
    rescue_escort: `در قلمرو «${base.biomeNameFa}»، سه نگهبان متحد در قفس‌های رونیک سایه به اسارت درآمده‌اند. با تیغه اخترتاب مهرهای زندان را درهم بشکنید و کاروان نگهبانان را تا دژ مقدس اسکورت کنید!`,
    harmonic_bells: `در قلمرو «${base.biomeNameFa}»، از جریان‌های باد اخترتاب برای شتاب تاکتیکی بهره بگیرید و ۴ ناقوس تشدید باستانی را به صدا درآورید تا پل‌های بلورین تالار مرکزی بازگشایی شوند!`,
    heart_tree_defense: `در مرکز «${base.biomeNameFa}»، هسته درخت باستانی در محاصره ۳ لشکر از زره‌پوشان سایه قرار گرفته است! با کمبوهای ۳-ضربه‌ای و فعال‌سازی ستون‌های شوک طلایی، محاصره را درهم بشکنید!`,
    meteor_rush: `آسمان «${base.biomeNameFa}» شکافته شده و شهاب‌سنگ‌های اخترتاب در حال سقوط‌اند! با جاخالی تاکتیکی از روی سکوهای شتاب عبور کنید و ۶ هسته اخترتاب را پیش از فروپاشی مهار کنید!`,
    boss_duel: `وارد میدان نبرد نهایی «${base.biomeNameFa}» شده‌اید! ستون‌های تشدید اخترتاب را فعال کنید تا سپر فرمانروای سایه شکسته شود و با ضربات بحرانی ۳برابری او را سرنگون سازید!`,
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
    return 'کلید E یا دکمه «برش/تثبیت» را بزنید تا مهر زندان شکسته و نگهبان آزاد شود!';
  }
  if (rawPrompt.includes('Ring Ancient Chime Bell')) {
    return 'کلید E یا دکمه «برش/تثبیت» را بزنید تا ناقوس باستانی طنین اندازد!';
  }
  if (rawPrompt.includes('Enter Central Sakura Pavilion')) {
    return 'وارد تالار مرکزی شدید! کلید E یا دکمه ضربه را برای فتح مرحله بزنید!';
  }
  if (rawPrompt.includes('Trigger Healing Pulse Totem')) {
    return 'کلید E یا ضربه را بزنید تا موج شوک ستون طلایی آزاد شود!';
  }
  if (rawPrompt.includes('Activate Starlight Pillar')) {
    return 'کلید E یا ضربه را بزنید تا ستون تشدید اخترتاب سپر باس را درهم بشکند!';
  }
  const depositMatch = rawPrompt.match(/\((\d+)\/(\d+)\)/);
  if (rawPrompt.includes('Press E') && depositMatch) {
    return `کلید E یا دکمه «احیا» را بزنید تا بلور اخترتاب تزریق شود (${depositMatch[1]}/${depositMatch[2]})`;
  }
  const needMatch = rawPrompt.match(/Need (\d+)/);
  if (needMatch) {
    return `برای احیا و فعال‌سازی این ستون رونیک به ${needMatch[1]} بلور اخترتاب دیگر نیاز دارید!`;
  }
  return 'کلید E یا دکمه «احیا» را برای فعال‌سازی فشار دهید';
}

export const BODY_TYPE_LABELS: Record<Language, Record<BodyType, string>> = {
  fa: {
    sprout: 'نگهبان متوازن',
    nimble: 'شمشیرزن چابک',
    sturdy: 'سپهدار زره‌پوش',
    tall: 'تکاور بلندقامت',
  },
  en: {
    sprout: 'Balanced Warden',
    nimble: 'Swift Bladedancer',
    sturdy: 'Vanguard Juggernaut',
    tall: 'Astral Ranger',
  },
};

export const FACIAL_FEATURE_LABELS: Record<Language, Record<FacialFeatureType, string>> = {
  fa: {
    cheerful: 'نگاه مصمم جنگجو',
    starry: 'چشمان درخشان اخترتاب',
    'sleepy-cozy': 'آرامش استاد ذن',
    'scholar-glasses': 'نقاب تاکتیکی رونیک',
  },
  en: {
    cheerful: 'Stoic Resolve',
    starry: 'Astral Glowing Eyes',
    'sleepy-cozy': 'Zen Master Calm',
    'scholar-glasses': 'Runic Tactical Visor',
  },
};

export const HAIRSTYLE_LABELS: Record<Language, Record<HairstyleType, string>> = {
  fa: {
    'twin-sprout': 'تاج شاخ‌دار اخترتاب',
    'fluffy-bob': 'موی رزمی کوتاه',
    'braided-crown': 'تاج بافت سلحشوران',
    'mushroom-beret': 'کلاهخود نگهبان کهن',
    'sun-halo': 'دیهیم طلایی خورشیدزاد',
  },
  en: {
    'twin-sprout': 'Astral Horned Crest',
    'fluffy-bob': 'Battle-Worn Crop',
    'braided-crown': 'Valkyrie War-Braids',
    'mushroom-beret': 'Ancient Warden Helm',
    'sun-halo': 'Sunforged Diadem',
  },
};

export const CLOTHING_STYLE_LABELS: Record<Language, Record<ClothingStyleType, string>> = {
  fa: {
    'leaf-cloak': 'زره و شنل نگهبان زمردین',
    'traveler-poncho': 'ردای تاکتیکی تکاوران',
    'sun-robe': 'جوشن طلایی محفل خورشید',
    'berry-overalls': 'زره رزمی شوالیه اخترتاب',
  },
  en: {
    'leaf-cloak': 'Emerald Warden Armor',
    'traveler-poncho': 'Ranger Tactical Mantle',
    'sun-robe': 'Sun-Order Plate & Cloak',
    'berry-overalls': 'Astral Knight Cuirass',
  },
};

export const ROOF_STYLE_LABELS: Record<Language, Record<RoofStyleType, string>> = {
  fa: {
    moss: 'سبز باستانی',
    terracotta: 'سفال کهربایی',
    slate: 'سنگ ابسیدین',
    sakura: 'بلور سرخ‌فام',
  },
  en: {
    moss: 'Ancient Moss',
    terracotta: 'Amber Tile',
    slate: 'Obsidian Slate',
    sakura: 'Crimson Quartz',
  },
};

export const HEARTH_STYLE_LABELS: Record<Language, Record<HearthStyleType, string>> = {
  fa: {
    campfire: 'آتشدان مقدس',
    fountain: 'چشمه اخترتاب',
    lantern: 'ستون رونیک طلایی',
  },
  en: {
    campfire: 'Sacred Brazier',
    fountain: 'Astral Wellspring',
    lantern: 'Golden Runic Obelisk',
  },
};

export const GARDEN_STYLE_LABELS: Record<Language, Record<GardenStyleType, string>> = {
  fa: {
    flowers: 'گیاهان نورانی',
    mushrooms: 'بلورهای مانا',
    stones: 'سنگ‌نگاره‌های رونیک',
  },
  en: {
    flowers: 'Luminous Flora',
    mushrooms: 'Mana Crystals',
    stones: 'Runic Monoliths',
  },
};

export const PERFORMANCE_LABELS: Record<Language, Record<PerformanceQuality, string>> = {
  fa: {
    eco: 'اقتصادی (نرخ فریم بالا)',
    balanced: 'متعادل (استاندارد)',
    high: 'کیفیت بالا (PBR)',
    ultra: 'اولترا (حداکثر جزئیات سه‌بعدی)',
  },
  en: {
    eco: 'Performance (60 FPS)',
    balanced: 'Balanced',
    high: 'High Fidelity',
    ultra: 'Ultra (Max PBR)',
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
        title: `تسخیر ${t} بلور اخترتاب`,
        description: `${t} بلور درخشان اخترتاب را در میدان نبرد جمع‌آوری کنید.`,
      };
    case 'cleanse_gloomlings':
      return {
        title: `سرنگونی ${t} دشمن سایه‌زاد`,
        description: `${t} مهاجم فاسد سایه‌زاد را با سلاح رونیک خود از پای درآورید.`,
      };
    case 'restore_shrines':
      return {
        title: `بیدار کردن ${t} ستون رونیک`,
        description: `با تزریق بلور اخترتاب، ${t} ستون باستانی را در قلمرو فعال سازید.`,
      };
    case 'bloom_spins':
      return {
        title: `آزادسازی ${t} موج اخترتاب (Nova)`,
        description: `${t} بار مهارت «موج انفجاری اخترتاب» (کلید Q) را در نبرد اجرا کنید.`,
      };
    case 'leaf_dashes':
      return {
        title: `اجرای ${t} جاخالی تاکتیکی`,
        description: `${t} بار با استفاده از «جاخالی تاکتیکی» (Shift) از حملات عبور کنید.`,
      };
    case 'combo_finishers':
      return {
        title: `فرود آوردن ${t} ضربه نهایی کمبو`,
        description: `${t} بار ضربه سوم و شکافنده زنجیره کمبو را بر دشمنان وارد کنید.`,
      };
  }
}

