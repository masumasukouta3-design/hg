

export enum FacilityCategory {
  Field = 'Field',
  Sea = 'Sea',
  Ranch = 'Ranch',
}

export enum CropType {
  Plant = 'Plant',
  Fish = 'Fish',
  Livestock = 'Livestock',
}

export enum RuinType {
  Maya = 'Maya',
  NuevaEspana = 'NuevaEspana',
}

export interface Crop {
  id: string;
  name: string;
  type: CropType;
  buyPrice: number;
  baseSellPrice: number;
  stats: {
    taste: number;
    durability: number;
    appearance: number;
  };
}

export interface PlantedCrop {
  cropId: string;
  quantity: number;
  plantedAt: number;
}

export interface Facility {
  id:string;
  name: string;
  category: FacilityCategory;
  capacity: number;
  plantedCrop: PlantedCrop | null;
}

export interface FacilityInfo {
    name: string;
    category: FacilityCategory;
    capacity: number;
    price: number;
}

export interface Product {
    id: string;
    name: string;
    sellPrice: number;
    recipe: Record<string, number>; // cropId -> quantity
}

export interface CompanyInfo {
    id: string;
    name: string;
    baseMarketValue: number;
    products: string[]; // productId[]
}

export interface Company {
    id: string; // unique instance id
    typeId: string; // CompanyInfo id
    name: string; // "Gemini Foods #1"
    marketValue: number;
    productionRecord: number;
    assignedCitizens: number;
    tenantId: string | null;
}

export interface Tenant {
    id: string;
    name: string;
    assignedCitizens: number;
}

export interface GameState {
  money: number;
  facilities: Facility[];
  products: Record<string, number>; // Harvested crops: cropId -> quantity
  seeds: Record<string, number>; // Seeds/Juveniles: cropId -> quantity
  cropData: Record<string, Crop>;
  fragments: {
    something: number;
    maya: number;
    nuevaEspana: number;
  };
  ruins: Record<RuinType, number>;
  ruinProfitState: {
    startTime: number | null;
  };
  // New State for Tenant/Company feature
  citizens: number;
  tenants: Tenant[];
  companies: Company[];
  companyProducts: Record<string, number>; // productId -> quantity
  productData: Record<string, Product>;
  companyData: Record<string, CompanyInfo>;
  tenantProfitState: Record<string, { startTime: number | null }>; // tenantId -> state
}

export type GameAction =
  | { type: 'BUY_SEEDS'; payload: { cropId: string; quantity: number; cost: number } }
  | { type: 'BUY_FACILITY'; payload: { facility: Facility; cost: number } }
  | { type: 'PLANT'; payload: { facilityId: string; cropId: string } }
  | { type: 'HARVEST'; payload: { facilityId: string } }
  | { type: 'SELL'; payload: { cropId: string; quantity: number; earnings: number } }
  | { type: 'RESEARCH'; payload: { cropId: string; statToUpgrade: keyof Crop['stats'] | null } }
  | { type: 'EXCHANGE_FRAGMENT'; payload: { toFragment: 'maya' | 'nuevaEspana' } }
  | { type: 'ASSEMBLE_RUIN'; payload: { ruinType: RuinType } }
  | { type: 'START_PROFIT_COLLECTION' }
  | { type: 'CLAIM_PROFIT'; payload: { earnings: number } }
  // New Actions for Tenant/Company feature
  | { type: 'BUY_TENANT'; payload: { tenant: Tenant; cost: number } }
  | { type: 'BUY_COMPANY'; payload: { company: Company; cost: number } }
  | { type: 'ASSIGN_COMPANY_TO_TENANT'; payload: { companyId: string; tenantId: string } }
  | { type: 'REMOVE_COMPANY_FROM_TENANT'; payload: { companyId: string } }
  | { type: 'PRODUCE_PRODUCT'; payload: { companyId: string; productId: string; quantity: number } }
  | { type: 'SELL_COMPANY_PRODUCT'; payload: { productId: string; quantity: number; earnings: number } }
  | { type: 'ASSIGN_CITIZENS'; payload: { targetId: string; targetType: 'company' | 'tenant'; amount: number } }
  | { type: 'WITHDRAW_CITIZENS'; payload: { targetId: string; targetType: 'company' | 'tenant'; amount: number } }
  | { type: 'START_TENANT_PROFIT_COLLECTION'; payload: { tenantId: string } }
  | { type: 'CLAIM_TENANT_PROFIT'; payload: { tenantId: string; earnings: number } };
