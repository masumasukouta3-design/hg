

import { Crop, CropType, FacilityCategory, FacilityInfo, RuinType, Product, CompanyInfo } from './types';

export const GROW_TIME_MS = 60 * 1000; // 60 seconds for demo. Original request was 1 hour.

export const STAT_SELL_PRICE_MULTIPLIER = 0.1; // 10% bonus per stat point
export const RESEARCH_COST = 30; // 30 products
export const RESEARCH_SUCCESS_RATE = 0.2; // 20%

export const HARVEST_FRAGMENT_CHANCE = 0.05; // 5%
export const FRAGMENTS_TO_RUIN_COST = 100;
export const RUIN_PROFIT_DURATION_MS = 60 * 1000; // 60 seconds for demo. Original request was 1 hour.
export const BASE_PROFIT_PER_RUIN = 50000;

// Tenant and Company Constants
export const TENANT_COST = 1000000;
export const TENANT_COMPANY_CAPACITY = 5;
export const TENANT_PROFIT_DURATION_MS = 60 * 60 * 1000; // 1 hour
export const COMPANY_COST = 500000;

export const CITIZEN_VALUE_MULTIPLIER = 10000; // Increase in market value per citizen
export const PRODUCTION_RECORD_MULTIPLIER = 500; // Increase in market value per unit in production record
export const TENANT_PROFIT_MARKET_VALUE_MULTIPLIER = 0.05; // 5% of total market cap
export const TENANT_PROFIT_CITIZEN_BONUS = 1000; // Bonus profit per citizen in tenant

export const RUIN_DATA = {
    [RuinType.Maya]: {
        name: 'マヤの水捌け装置',
        fragmentName: 'マヤの水捌け装置の破片',
        fragmentId: 'maya',
    },
    [RuinType.NuevaEspana]: {
        name: 'ヌエバエスパーニャ',
        fragmentName: 'ヌエバエスパーニャの破片',
        fragmentId: 'nuevaEspana',
    }
} as const;


export const INITIAL_CROPS: Record<string, Crop> = {
  apple: { id: 'apple', name: 'りんご', type: CropType.Plant, buyPrice: 100, baseSellPrice: 200, stats: { taste: 0, durability: 0, appearance: 0 } },
  tomato: { id: 'tomato', name: 'トマト', type: CropType.Plant, buyPrice: 80, baseSellPrice: 160, stats: { taste: 0, durability: 0, appearance: 0 } },
  carrot: { id: 'carrot', name: 'にんじん', type: CropType.Plant, buyPrice: 60, baseSellPrice: 120, stats: { taste: 0, durability: 0, appearance: 0 } },
  saury: { id: 'saury', name: 'サンマ', type: CropType.Fish, buyPrice: 200, baseSellPrice: 400, stats: { taste: 0, durability: 0, appearance: 0 } },
  eel: { id: 'eel', name: 'うなぎ', type: CropType.Fish, buyPrice: 800, baseSellPrice: 1600, stats: { taste: 0, durability: 0, appearance: 0 } },
  beef_loin: { id: 'beef_loin', name: '牛(ロース)', type: CropType.Livestock, buyPrice: 1000, baseSellPrice: 2000, stats: { taste: 0, durability: 0, appearance: 0 } },
};

export const INITIAL_PRODUCTS: Record<string, Product> = {
    apple_pie: { id: 'apple_pie', name: 'アップルパイ', sellPrice: 500, recipe: { apple: 10 } },
    tomato_soup: { id: 'tomato_soup', name: 'トマトスープ', sellPrice: 400, recipe: { tomato: 10 } },
    grilled_saury: { id: 'grilled_saury', name: 'サンマの塩焼き', sellPrice: 800, recipe: { saury: 10 } },
    eel_bowl: { id: 'eel_bowl', name: 'うな重', sellPrice: 3500, recipe: { eel: 10 } },
};

export const INITIAL_COMPANIES: Record<string, CompanyInfo> = {
    gemini_foods: { id: 'gemini_foods', name: 'ジェミニフーズ', baseMarketValue: 200000, products: ['apple_pie', 'tomato_soup'] },
    oceans_bounty: { id: 'oceans_bounty', name: 'オーシャンズバウンティ', baseMarketValue: 350000, products: ['grilled_saury', 'eel_bowl'] },
};


export const CROP_CATEGORY_MAP: Record<CropType, FacilityCategory> = {
    [CropType.Plant]: FacilityCategory.Field,
    [CropType.Fish]: FacilityCategory.Sea,
    [CropType.Livestock]: FacilityCategory.Ranch,
};

export const FACILITIES_FOR_SALE: Record<string, FacilityInfo> = {
    field: { name: '畑', category: FacilityCategory.Field, capacity: 10, price: 50000 },
    ship: { name: '船', category: FacilityCategory.Sea, capacity: 10, price: 70000 },
    ranch: { name: '牧場', category: FacilityCategory.Ranch, capacity: 10, price: 60000 },
    center_pivot: { name: 'センターピボット', category: FacilityCategory.Field, capacity: 100, price: 500000 },
    large_fishing_boat: { name: '大型漁船', category: FacilityCategory.Sea, capacity: 100, price: 700000 },
    feedlot: { name: 'フィードロット', category: FacilityCategory.Ranch, capacity: 100, price: 600000 },
};
