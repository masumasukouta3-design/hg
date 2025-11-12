

import { Crop, CropType, FacilityCategory, FacilityInfo, RuinType, Product, CompanyInfo, Mineral, Weapon, CountryId, CountryInfo, SpecialtyGood } from './types';

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

// Mining and Smithing Constants
export const MINING_DURATION_MS = 60 * 60 * 1000; // 1 hour
export const MINERALS_PER_RUN = 20;

export const MINERAL_TYPES = [
    'diamond', 'gold', 'platinum', 'iron', 'copper', 'silver', 'aluminum', 'tin', 'sulfur', 'brass'
];

export const INITIAL_MINERALS: Record<string, Mineral> = {
  diamond: { id: 'diamond', name: 'ダイヤモンド', sellPrice: 50000 },
  gold: { id: 'gold', name: '金', sellPrice: 30000 },
  platinum: { id: 'platinum', name: 'プラチナ', sellPrice: 40000 },
  iron: { id: 'iron', name: '鉄', sellPrice: 5000 },
  copper: { id: 'copper', name: '銅', sellPrice: 4000 },
  silver: { id: 'silver', name: '銀', sellPrice: 10000 },
  aluminum: { id: 'aluminum', name: 'アルミニウム', sellPrice: 3000 },
  tin: { id: 'tin', name: 'スズ', sellPrice: 2000 },
  sulfur: { id: 'sulfur', name: '硫黄', sellPrice: 1500 },
  brass: { id: 'brass', name: '真鍮', sellPrice: 6000 },
};

export const INITIAL_WEAPONS: Record<string, Weapon> = {
  musket: { id: 'musket', name: 'マスケット銃', sellPrice: 150000, recipe: { iron: 1, copper: 1, aluminum: 1, tin: 1, sulfur: 1, brass: 1 } },
  charlemagnes_sword: { id: 'charlemagnes_sword', name: 'カール大帝の剣', sellPrice: 1000000, recipe: { diamond: 2, gold: 2, platinum: 2 } },
};

// Country Constants
export const COUNTRY_PRODUCTION_DURATION_MS = 60 * 60 * 1000; // 1 hour
export const BASE_GOODS_PER_PRODUCTION = 1;
export const BASE_BONDS_PER_PRODUCTION = 20;
export const RANK_UPGRADE_BASE_COST = 20;

export const INITIAL_SPECIALTY_GOODS: Record<string, SpecialtyGood> = {
  taco_bell_tacos: { id: 'taco_bell_tacos', name: 'タコベルのタコス', sellPrice: 50000 },
  maple_syrup: { id: 'maple_syrup', name: 'カナダ産メープルシロップ', sellPrice: 60000 },
  vodka: { id: 'vodka', name: 'プーチン愛飲のウォッカ', sellPrice: 80000 },
  shumai_bento: { id: 'shumai_bento', name: '崎陽軒焼売弁当', sellPrice: 40000 },
};

export const COUNTRY_DATA: Record<CountryId, CountryInfo> = {
  usa: {
    id: 'usa',
    name: 'アメリカ',
    specialtyGoodId: 'taco_bell_tacos',
    conquestRequirements: { musket: 1, charlemagnes_sword: 1 },
    conquestCitizenReward: 100,
  },
  canada: {
    id: 'canada',
    name: 'カナダ',
    specialtyGoodId: 'maple_syrup',
    conquestRequirements: { musket: 5, charlemagnes_sword: 2 },
    conquestCitizenReward: 150,
  },
  russia: {
    id: 'russia',
    name: 'ロシア',
    specialtyGoodId: 'vodka',
    conquestRequirements: { musket: 10, charlemagnes_sword: 5 },
    conquestCitizenReward: 200,
  },
  japan: {
    id: 'japan',
    name: '日本',
    specialtyGoodId: 'shumai_bento',
    conquestRequirements: { musket: 15, charlemagnes_sword: 10 },
    conquestCitizenReward: 250,
  },
};

export const ALL_COUNTRIES: CountryId[] = ['usa', 'canada', 'russia', 'japan'];


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
    gemini_foods: { id: 'gemini_foods', name: '富士山麓フーズ', baseMarketValue: 200000, products: ['apple_pie', 'tomato_soup'] },
    oceans_bounty: { id: 'oceans_bounty', name: '町田商店', baseMarketValue: 350000, products: ['grilled_saury', 'eel_bowl'] },
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
