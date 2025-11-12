

import React, { useState, useReducer, useEffect, useMemo, useCallback } from 'react';
import { GameState, GameAction, Facility, FacilityCategory, RuinType, Company, Tenant, CountryId } from './types';
import { 
    INITIAL_CROPS, FACILITIES_FOR_SALE, RESEARCH_COST, RESEARCH_SUCCESS_RATE, HARVEST_FRAGMENT_CHANCE, 
    FRAGMENTS_TO_RUIN_COST, RUIN_DATA, BASE_PROFIT_PER_RUIN, INITIAL_PRODUCTS, INITIAL_COMPANIES,
    TENANT_COST, COMPANY_COST, CITIZEN_VALUE_MULTIPLIER, PRODUCTION_RECORD_MULTIPLIER, TENANT_PROFIT_MARKET_VALUE_MULTIPLIER, TENANT_PROFIT_CITIZEN_BONUS,
    INITIAL_MINERALS, INITIAL_WEAPONS, COUNTRY_DATA, RANK_UPGRADE_BASE_COST
} from './constants';
import FarmView from './components/FarmView';
import WarehouseView from './components/WarehouseView';
import MarketView from './components/MarketView';
import LabView from './components/LabView';
import RuinsView from './components/RuinsView';
import CompanyView from './components/CompanyView';
import TenantView from './components/TenantView';
import MineView from './components/MineView';
import SmithyView from './components/SmithyView';
import CountryView from './components/CountryView';
import SystemView from './components/SystemView';
import { MoneyIcon, FarmIcon, WarehouseIcon, MarketIcon, LabIcon, RuinsIcon, CompanyIcon, TenantIcon, CitizenIcon, MineIcon, SmithyIcon, CountryIcon, SystemIcon } from './components/icons';

const initialGameState: GameState = {
  money: 10000000000000,
  facilities: [
    { id: `fac-${Date.now()}-1`, name: '畑', category: FacilityCategory.Field, capacity: 10, plantedCrop: null },
    { id: `fac-${Date.now()}-2`, name: '船', category: FacilityCategory.Sea, capacity: 10, plantedCrop: null },
    { id: `fac-${Date.now()}-3`, name: '牧場', category: FacilityCategory.Ranch, capacity: 10, plantedCrop: null },
  ],
  products: {},
  seeds: {},
  cropData: INITIAL_CROPS,
  fragments: {
    something: 0,
    maya: 0,
    nuevaEspana: 0,
  },
  ruins: {
    [RuinType.Maya]: 0,
    [RuinType.NuevaEspana]: 0,
  },
  ruinProfitState: {
    startTime: null,
  },
  citizens: 10,
  tenants: [],
  companies: [],
  companyProducts: {},
  productData: INITIAL_PRODUCTS,
  companyData: INITIAL_COMPANIES,
  tenantProfitState: {},
  minerals: {},
  weapons: {},
  mineState: {
    startTime: null,
  },
  countries: {},
  specialtyGoods: {},
};

function calculateMarketValue(company: Company, companyData: GameState['companyData']): number {
    const baseInfo = companyData[company.typeId];
    if (!baseInfo) return 0;
    return baseInfo.baseMarketValue + (company.productionRecord * PRODUCTION_RECORD_MULTIPLIER) + (company.assignedCitizens * CITIZEN_VALUE_MULTIPLIER);
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'BUY_SEEDS': {
      const { cropId, quantity, cost } = action.payload;
      return {
        ...state,
        money: state.money - cost,
        seeds: {
          ...state.seeds,
          [cropId]: (state.seeds[cropId] || 0) + quantity,
        },
      };
    }
    case 'BUY_FACILITY': {
      const { facility, cost } = action.payload;
      return {
        ...state,
        money: state.money - cost,
        facilities: [...state.facilities, facility],
      };
    }
    case 'PLANT': {
      const { facilityId, cropId } = action.payload;
      const facility = state.facilities.find(f => f.id === facilityId);
      if (!facility) return state;

      return {
        ...state,
        seeds: {
          ...state.seeds,
          [cropId]: (state.seeds[cropId] || 0) - facility.capacity,
        },
        facilities: state.facilities.map(f =>
          f.id === facilityId
            ? { ...f, plantedCrop: { cropId, quantity: f.capacity, plantedAt: Date.now() } }
            : f
        ),
      };
    }
    case 'HARVEST': {
      const { facilityId } = action.payload;
      const facility = state.facilities.find(f => f.id === facilityId);
      if (!facility || !facility.plantedCrop) return state;

      const { cropId, quantity } = facility.plantedCrop;

      const getsFragment = Math.random() < HARVEST_FRAGMENT_CHANCE;

      return {
        ...state,
        products: {
          ...state.products,
          [cropId]: (state.products[cropId] || 0) + quantity,
        },
        facilities: state.facilities.map(f =>
          f.id === facilityId ? { ...f, plantedCrop: null } : f
        ),
        fragments: {
          ...state.fragments,
          something: state.fragments.something + (getsFragment ? 1 : 0),
        }
      };
    }
    case 'SELL': {
      const { cropId, quantity, earnings } = action.payload;
      return {
        ...state,
        money: state.money + earnings,
        products: {
          ...state.products,
          [cropId]: (state.products[cropId] || 0) - quantity,
        },
      };
    }
    case 'RESEARCH': {
      const { cropId, statToUpgrade } = action.payload;
      const newCropData = { ...state.cropData };
      
      if (statToUpgrade && newCropData[cropId].stats[statToUpgrade] < 5) {
        newCropData[cropId] = {
            ...newCropData[cropId],
            stats: {
                ...newCropData[cropId].stats,
                [statToUpgrade]: newCropData[cropId].stats[statToUpgrade] + 1
            }
        };
      }

      return {
        ...state,
        products: {
          ...state.products,
          [cropId]: (state.products[cropId] || 0) - RESEARCH_COST,
        },
        cropData: newCropData,
      };
    }
    case 'EXCHANGE_FRAGMENT': {
        const { toFragment } = action.payload;
        if (state.fragments.something < 1) return state;
        return {
            ...state,
            fragments: {
                ...state.fragments,
                something: state.fragments.something - 1,
                [toFragment]: state.fragments[toFragment] + 1,
            },
        };
    }
    case 'ASSEMBLE_RUIN': {
        const { ruinType } = action.payload;
        const fragmentId = RUIN_DATA[ruinType].fragmentId as 'maya' | 'nuevaEspana';
        if (state.fragments[fragmentId] < FRAGMENTS_TO_RUIN_COST) return state;
        return {
            ...state,
            fragments: {
                ...state.fragments,
                [fragmentId]: state.fragments[fragmentId] - FRAGMENTS_TO_RUIN_COST,
            },
            ruins: {
                ...state.ruins,
                [ruinType]: state.ruins[ruinType] + 1,
            },
        };
    }
    case 'START_PROFIT_COLLECTION': {
        const totalRuins = Object.values(state.ruins).reduce((sum: number, count: number) => sum + count, 0);
        if (totalRuins === 0 || state.ruinProfitState.startTime !== null) return state;
        return {
            ...state,
            ruinProfitState: {
                startTime: Date.now(),
            }
        };
    }
    case 'CLAIM_PROFIT': {
        const { earnings } = action.payload;
        return {
            ...state,
            money: state.money + earnings,
            ruinProfitState: {
                startTime: null,
            }
        };
    }
    case 'BUY_TENANT': {
        const { tenant, cost } = action.payload;
        return {
            ...state,
            money: state.money - cost,
            tenants: [...state.tenants, tenant],
            tenantProfitState: {
                ...state.tenantProfitState,
                [tenant.id]: { startTime: null }
            }
        };
    }
    case 'BUY_COMPANY': {
        const { company, cost } = action.payload;
        return {
            ...state,
            money: state.money - cost,
            companies: [...state.companies, company],
        };
    }
    case 'ASSIGN_COMPANY_TO_TENANT': {
        const { companyId, tenantId } = action.payload;
        return {
            ...state,
            companies: state.companies.map(c => c.id === companyId ? { ...c, tenantId } : c)
        };
    }
    case 'REMOVE_COMPANY_FROM_TENANT': {
         const { companyId } = action.payload;
        return {
            ...state,
            companies: state.companies.map(c => c.id === companyId ? { ...c, tenantId: null } : c)
        };
    }
    case 'PRODUCE_PRODUCT': {
        const { companyId, productId, quantity } = action.payload;
        const product = state.productData[productId];
        const company = state.companies.find(c => c.id === companyId);
        if (!product || !company) return state;

        let canProduce = true;
        const updatedProducts = { ...state.products };
        Object.entries(product.recipe).forEach(([cropId, required]) => {
            if ((updatedProducts[cropId] || 0) < required * quantity) {
                canProduce = false;
            }
            updatedProducts[cropId] -= required * quantity;
        });

        if (!canProduce) return state;

        const newProductionRecord = Math.max(company.productionRecord, quantity);
        const updatedCompanies = state.companies.map(c => {
            if (c.id === companyId) {
                const updatedCompany = { ...c, productionRecord: newProductionRecord };
                return { ...updatedCompany, marketValue: calculateMarketValue(updatedCompany, state.companyData) };
            }
            return c;
        });

        return {
            ...state,
            products: updatedProducts,
            companyProducts: {
                ...state.companyProducts,
                [productId]: (state.companyProducts[productId] || 0) + quantity,
            },
            companies: updatedCompanies,
        };
    }
    case 'SELL_COMPANY_PRODUCT': {
        const { productId, quantity, earnings } = action.payload;
        return {
            ...state,
            money: state.money + earnings,
            companyProducts: {
                ...state.companyProducts,
                [productId]: (state.companyProducts[productId] || 0) - quantity,
            },
        };
    }
    case 'ASSIGN_CITIZENS': {
        const { targetId, targetType, amount } = action.payload;
        if (state.citizens < amount) return state;

        let updatedCompanies = [...state.companies];
        let updatedTenants = [...state.tenants];

        if (targetType === 'company') {
            updatedCompanies = state.companies.map(c => {
                if (c.id === targetId) {
                    const updatedCompany = { ...c, assignedCitizens: c.assignedCitizens + amount };
                    return { ...updatedCompany, marketValue: calculateMarketValue(updatedCompany, state.companyData) };
                }
                return c;
            });
        } else { // tenant
            updatedTenants = state.tenants.map(t => t.id === targetId ? { ...t, assignedCitizens: t.assignedCitizens + amount } : t);
        }

        return {
            ...state,
            citizens: state.citizens - amount,
            companies: updatedCompanies,
            tenants: updatedTenants,
        };
    }
    case 'WITHDRAW_CITIZENS': {
        const { targetId, targetType, amount } = action.payload;

        let updatedCompanies = [...state.companies];
        let updatedTenants = [...state.tenants];
        let citizensToReturn = 0;

        if (targetType === 'company') {
            updatedCompanies = state.companies.map(c => {
                if (c.id === targetId) {
                    citizensToReturn = Math.min(c.assignedCitizens, amount);
                    const updatedCompany = { ...c, assignedCitizens: c.assignedCitizens - citizensToReturn };
                    return { ...updatedCompany, marketValue: calculateMarketValue(updatedCompany, state.companyData) };
                }
                return c;
            });
        } else { // tenant
            updatedTenants = state.tenants.map(t => {
                if (t.id === targetId) {
                    citizensToReturn = Math.min(t.assignedCitizens, amount);
                    return { ...t, assignedCitizens: t.assignedCitizens - citizensToReturn };
                }
                return t;
            });
        }
        return {
            ...state,
            citizens: state.citizens + citizensToReturn,
            companies: updatedCompanies,
            tenants: updatedTenants,
        };
    }
    case 'START_TENANT_PROFIT_COLLECTION': {
        const { tenantId } = action.payload;
        return {
            ...state,
            tenantProfitState: {
                ...state.tenantProfitState,
                [tenantId]: { startTime: Date.now() },
            }
        };
    }
    case 'CLAIM_TENANT_PROFIT': {
        const { tenantId, earnings } = action.payload;
        return {
            ...state,
            money: state.money + earnings,
            tenantProfitState: {
                ...state.tenantProfitState,
                [tenantId]: { startTime: null },
            }
        };
    }
    case 'START_MINING': {
        if (state.mineState.startTime !== null) return state;
        return { ...state, mineState: { startTime: Date.now() } };
    }
    case 'COLLECT_MINERALS': {
        const { collected } = action.payload;
        const updatedMinerals = { ...state.minerals };
        for (const mineralId in collected) {
            updatedMinerals[mineralId] = (updatedMinerals[mineralId] || 0) + collected[mineralId];
        }
        return {
            ...state,
            minerals: updatedMinerals,
            mineState: { startTime: null },
        };
    }
    case 'SELL_MINERAL': {
        const { mineralId, quantity, earnings } = action.payload;
        return {
            ...state,
            money: state.money + earnings,
            minerals: {
                ...state.minerals,
                [mineralId]: (state.minerals[mineralId] || 0) - quantity,
            },
        };
    }
    case 'CRAFT_WEAPON': {
        const { weaponId } = action.payload;
        const weaponInfo = INITIAL_WEAPONS[weaponId];
        if (!weaponInfo) return state;

        const canCraft = Object.entries(weaponInfo.recipe).every(
            ([mineralId, required]) => (state.minerals[mineralId] || 0) >= required
        );

        if (!canCraft) return state;

        const updatedMinerals = { ...state.minerals };
        Object.entries(weaponInfo.recipe).forEach(
            ([mineralId, required]) => {
                updatedMinerals[mineralId] -= required;
            }
        );

        return {
            ...state,
            minerals: updatedMinerals,
            weapons: {
                ...state.weapons,
                [weaponId]: (state.weapons[weaponId] || 0) + 1,
            },
        };
    }
    case 'SELL_WEAPON': {
        const { weaponId, quantity, earnings } = action.payload;
        return {
            ...state,
            money: state.money + earnings,
            weapons: {
                ...state.weapons,
                [weaponId]: (state.weapons[weaponId] || 0) - quantity,
            },
        };
    }
    case 'CONQUER_COUNTRY': {
        const { countryId } = action.payload;
        const countryInfo = COUNTRY_DATA[countryId];
        if (!countryInfo || state.countries[countryId]) return state;

        const hasEnoughWeapons = Object.entries(countryInfo.conquestRequirements).every(
            ([weaponId, required]) => (state.weapons[weaponId] || 0) >= required
        );
        if (!hasEnoughWeapons) return state;

        const updatedWeapons = { ...state.weapons };
        Object.entries(countryInfo.conquestRequirements).forEach(
            ([weaponId, required]) => {
                updatedWeapons[weaponId] -= required;
            }
        );

        return {
            ...state,
            weapons: updatedWeapons,
            citizens: state.citizens + countryInfo.conquestCitizenReward,
            countries: {
                ...state.countries,
                [countryId]: {
                    militaryLevel: 1,
                    economicLevel: 1,
                    politicalLevel: 1,
                    bonds: 0,
                    productionState: { startTime: null },
                }
            }
        };
    }
    case 'START_COUNTRY_PRODUCTION': {
        const { countryId } = action.payload;
        const countryState = state.countries[countryId];
        if (!countryState || countryState.productionState.startTime !== null) return state;
        
        return {
            ...state,
            countries: {
                ...state.countries,
                [countryId]: {
                    ...countryState,
                    productionState: { startTime: Date.now() }
                }
            }
        };
    }
    case 'COLLECT_COUNTRY_PRODUCTION': {
        const { countryId, specialtyGoodId, goodsAmount, bondsAmount } = action.payload;
        const countryState = state.countries[countryId];
        if (!countryState) return state;

        return {
            ...state,
            specialtyGoods: {
                ...state.specialtyGoods,
                [specialtyGoodId]: (state.specialtyGoods[specialtyGoodId] || 0) + goodsAmount,
            },
            countries: {
                ...state.countries,
                [countryId]: {
                    ...countryState,
                    bonds: countryState.bonds + bondsAmount,
                    productionState: { startTime: null }
                }
            }
        };
    }
    case 'UPGRADE_COUNTRY_RANK': {
        const { countryId, rank } = action.payload;
        const countryState = state.countries[countryId];
        if (!countryState) return state;
        
        const currentLevel = countryState[rank];
        if (currentLevel >= 10) return state;

        const cost = RANK_UPGRADE_BASE_COST * (currentLevel + 1);
        if (countryState.bonds < cost) return state;

        return {
            ...state,
            countries: {
                ...state.countries,
                [countryId]: {
                    ...countryState,
                    [rank]: currentLevel + 1,
                    bonds: countryState.bonds - cost,
                }
            }
        };
    }
    case 'SELL_SPECIALTY_GOOD': {
        const { specialtyGoodId, quantity, earnings } = action.payload;
        return {
            ...state,
            money: state.money + earnings,
            specialtyGoods: {
                ...state.specialtyGoods,
                [specialtyGoodId]: (state.specialtyGoods[specialtyGoodId] || 0) - quantity,
            },
        };
    }
    case 'LOAD_GAME': {
        return action.payload.newState;
    }
    default:
      return state;
  }
}

type Tab = 'Farm' | 'Warehouse' | 'Market' | 'Lab' | 'Ruins' | 'Company' | 'Tenant' | 'Mine' | 'Smithy' | 'Country' | 'System';

const App: React.FC = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [activeTab, setActiveTab] = useState<Tab>('Farm');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleResearch = useCallback((cropId: string) => {
    let statToUpgrade: keyof GameState['cropData'][string]['stats'] | null = null;
    if (Math.random() < RESEARCH_SUCCESS_RATE) {
        const stats: (keyof GameState['cropData'][string]['stats'])[] = ['taste', 'durability', 'appearance'];
        statToUpgrade = stats[Math.floor(Math.random() * stats.length)];
    }
    dispatch({ type: 'RESEARCH', payload: { cropId, statToUpgrade } });
  }, []);
  
  const handleClaimRuinProfit = useCallback(() => {
    const totalRuins = Object.values(gameState.ruins).reduce((sum: number, count: number) => sum + count, 0);
    const earnings = totalRuins * BASE_PROFIT_PER_RUIN;
    dispatch({ type: 'CLAIM_PROFIT', payload: { earnings } });
  }, [gameState.ruins]);

  const handleClaimTenantProfit = useCallback((tenantId: string) => {
    const tenant = gameState.tenants.find(t => t.id === tenantId);
    if (!tenant) return;
    const companiesInTenant = gameState.companies.filter(c => c.tenantId === tenantId);
    // FIX: Add explicit type for the accumulator to prevent type inference issues.
    const totalMarketValue = companiesInTenant.reduce((sum: number, c) => sum + c.marketValue, 0);
    const earnings = (totalMarketValue * TENANT_PROFIT_MARKET_VALUE_MULTIPLIER) + (tenant.assignedCitizens * TENANT_PROFIT_CITIZEN_BONUS);
    dispatch({ type: 'CLAIM_TENANT_PROFIT', payload: { tenantId, earnings: Math.floor(earnings) } });
  }, [gameState.tenants, gameState.companies]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Farm':
        return <FarmView gameState={gameState} dispatch={dispatch} now={now} />;
      case 'Warehouse':
        return <WarehouseView gameState={gameState} dispatch={dispatch} />;
      case 'Market':
        return <MarketView gameState={gameState} dispatch={dispatch} />;
      case 'Lab':
        return <LabView gameState={gameState} onResearch={handleResearch} />;
      case 'Ruins':
        return <RuinsView gameState={gameState} dispatch={dispatch} now={now} onClaimProfit={handleClaimRuinProfit} />;
      case 'Company':
        return <CompanyView gameState={gameState} dispatch={dispatch} />;
      case 'Tenant':
        return <TenantView gameState={gameState} dispatch={dispatch} now={now} onClaimProfit={handleClaimTenantProfit} />;
      case 'Mine':
        return <MineView gameState={gameState} dispatch={dispatch} now={now} />;
      case 'Smithy':
        return <SmithyView gameState={gameState} dispatch={dispatch} />;
      case 'Country':
        return <CountryView gameState={gameState} dispatch={dispatch} now={now} />;
      case 'System':
        return <SystemView gameState={gameState} dispatch={dispatch} />;
      default:
        return null;
    }
  };
  
  const formattedMoney = useMemo(() => new Intl.NumberFormat('ja-JP').format(gameState.money), [gameState.money]);

  const tabs: { name: Tab, icon: React.ReactNode }[] = [
    { name: 'Farm', icon: <FarmIcon /> },
    { name: 'Warehouse', icon: <WarehouseIcon /> },
    { name: 'Market', icon: <MarketIcon /> },
    { name: 'Lab', icon: <LabIcon /> },
    { name: 'Ruins', icon: <RuinsIcon /> },
    { name: 'Company', icon: <CompanyIcon /> },
    { name: 'Tenant', icon: <TenantIcon /> },
    { name: 'Mine', icon: <MineIcon /> },
    { name: 'Smithy', icon: <SmithyIcon /> },
    { name: 'Country', icon: <CountryIcon /> },
    { name: 'System', icon: <SystemIcon /> },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col">
      <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 p-4 shadow-lg flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-green-400 tracking-wider">Gemini Farm</h1>
        <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-700 px-4 py-2 rounded-full text-lg font-semibold">
                <CitizenIcon />
                <span className="ml-2">{gameState.citizens}</span>
            </div>
            <div className="flex items-center bg-gray-700 px-4 py-2 rounded-full text-lg font-semibold">
                <MoneyIcon />
                <span className="ml-2">{formattedMoney} 円</span>
            </div>
        </div>
      </header>

      <div className="flex-grow container mx-auto p-2 sm:p-4">
        <div className="flex flex-col h-full">
            <nav className="flex justify-center mb-4 border-b border-gray-700 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`flex-shrink-0 flex items-center justify-center text-sm sm:text-base px-3 sm:px-4 py-3 -mb-px border-b-2 font-semibold transition-colors duration-200 ${
                            activeTab === tab.name
                            ? 'border-green-400 text-green-400'
                            : 'border-transparent text-gray-400 hover:text-green-300'
                        }`}
                    >
                        {tab.icon}
                        <span className="ml-2 hidden sm:inline">{tab.name}</span>
                    </button>
                ))}
            </nav>
            <main className="flex-grow overflow-y-auto">
                {renderContent()}
            </main>
        </div>
      </div>
    </div>
  );
};

export default App;
