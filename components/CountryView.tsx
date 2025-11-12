
import React from 'react';
import { GameState, GameAction, CountryId } from '../types';
import { 
    ALL_COUNTRIES, COUNTRY_DATA, INITIAL_WEAPONS, INITIAL_SPECIALTY_GOODS, RANK_UPGRADE_BASE_COST, 
    COUNTRY_PRODUCTION_DURATION_MS, BASE_GOODS_PER_PRODUCTION, BASE_BONDS_PER_PRODUCTION 
} from '../constants';

interface CountryViewProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  now: number;
}

const CountryCard: React.FC<{
    countryId: CountryId,
    isLocked: boolean,
    gameState: GameState,
    dispatch: React.Dispatch<GameAction>,
    now: number
}> = ({ countryId, isLocked, gameState, dispatch, now }) => {
    const countryInfo = COUNTRY_DATA[countryId];
    const countryState = gameState.countries[countryId];

    if (isLocked) {
        return (
            <div className="bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg p-6 text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <h3 className="text-2xl font-bold">{countryInfo.name}</h3>
                <p className="mt-2">未到達</p>
            </div>
        );
    }
    
    const handleConquer = () => {
        dispatch({ type: 'CONQUER_COUNTRY', payload: { countryId } });
    }

    if (!countryState) { // Not conquered, but unlocked
        const canConquer = Object.entries(countryInfo.conquestRequirements).every(
            ([weaponId, required]) => (gameState.weapons[weaponId] || 0) >= required
        );
        return (
            <div className="bg-gray-800 rounded-lg shadow-md p-6">
                 <h3 className="text-2xl font-bold text-yellow-400">{countryInfo.name}</h3>
                 <p className="mt-2 mb-4 text-gray-400">征服して、新たな国民と特産品を手に入れましょう。</p>
                 <div className="my-4 border-t border-gray-700 pt-4">
                  <h4 className="font-semibold text-lg mb-2">征服条件:</h4>
                  <ul className="space-y-1">
                    {Object.entries(countryInfo.conquestRequirements).map(([weaponId, required]) => {
                      const owned = gameState.weapons[weaponId] || 0;
                      return (
                        <li key={weaponId} className={`flex justify-between ${owned >= required ? 'text-gray-300' : 'text-red-500'}`}>
                          <span>{INITIAL_WEAPONS[weaponId].name}</span>
                          <span>{owned} / {required}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <button onClick={handleConquer} disabled={!canConquer} className="w-full mt-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded text-lg">
                    征服する
                </button>
            </div>
        );
    }

    // Conquered
    const { militaryLevel, economicLevel, politicalLevel, bonds, productionState } = countryState;
    const totalLevels = militaryLevel + economicLevel + politicalLevel;
    const goodsAmount = BASE_GOODS_PER_PRODUCTION + Math.floor((totalLevels-3) / 5);
    const bondsAmount = BASE_BONDS_PER_PRODUCTION + (totalLevels - 3) * 2;

    const ranks: {key: 'militaryLevel' | 'economicLevel' | 'politicalLevel', name: string}[] = [
        { key: 'militaryLevel', name: '軍事力' },
        { key: 'economicLevel', name: '経済力' },
        { key: 'politicalLevel', name: '政治力' },
    ];
    
    const handleUpgrade = (rank: 'militaryLevel' | 'economicLevel' | 'politicalLevel') => {
        dispatch({ type: 'UPGRADE_COUNTRY_RANK', payload: { countryId, rank } });
    };

    const isProfitReady = productionState.startTime !== null && now - productionState.startTime >= COUNTRY_PRODUCTION_DURATION_MS;
    const timeLeftMs = productionState.startTime !== null ? (productionState.startTime + COUNTRY_PRODUCTION_DURATION_MS) - now : 0;
    
    const formatTimeLeft = (ms: number) => {
        if (ms <= 0) return '回収可能';
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `残り ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleStartProduction = () => {
        dispatch({ type: 'START_COUNTRY_PRODUCTION', payload: { countryId } });
    }
    
    const handleCollect = () => {
        dispatch({ type: 'COLLECT_COUNTRY_PRODUCTION', payload: { countryId, specialtyGoodId: countryInfo.specialtyGoodId, goodsAmount, bondsAmount }});
    }

    return (
         <details className="bg-gray-800 rounded-lg shadow-md open:ring-2 open:ring-green-500">
            <summary className="text-xl font-bold p-4 cursor-pointer list-none flex justify-between items-center">
                <span>{countryInfo.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </summary>
            <div className="p-4 border-t border-gray-700 space-y-4">
                {/* Production Section */}
                <div className="bg-gray-700/50 p-3 rounded">
                    <h4 className="font-semibold text-lg mb-2">特産品生産</h4>
                    <p className="text-sm text-gray-400">生産品: {INITIAL_SPECIALTY_GOODS[countryInfo.specialtyGoodId].name} x{goodsAmount}, 国債 x{bondsAmount}</p>
                    <div className="mt-3">
                         {productionState.startTime === null ? (
                            <button onClick={handleStartProduction} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">生産開始</button>
                         ) : isProfitReady ? (
                             <button onClick={handleCollect} className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded animate-pulse">回収</button>
                         ) : (
                             <div>
                                 <p className="text-sm text-center mb-1">{formatTimeLeft(timeLeftMs)}</p>
                                 <div className="w-full bg-gray-600 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${100 - (timeLeftMs / COUNTRY_PRODUCTION_DURATION_MS) * 100}%` }}></div>
                                </div>
                             </div>
                         )}
                    </div>
                </div>

                {/* Ranks Section */}
                <div className="bg-gray-700/50 p-3 rounded">
                    <h4 className="font-semibold text-lg mb-2 flex justify-between">国力 <span className="font-normal text-sm text-gray-400">国債: {bonds}</span></h4>
                    <div className="space-y-3">
                        {ranks.map(rank => {
                            const level = countryState[rank.key];
                            const cost = RANK_UPGRADE_BASE_COST * (level + 1);
                            const canUpgrade = bonds >= cost && level < 10;
                            return (
                                <div key={rank.key} className="flex items-center justify-between">
                                    <div>
                                        <p>{rank.name}</p>
                                        <p className="text-sm text-gray-400">Lv. {level} / 10</p>
                                    </div>
                                    <button onClick={() => handleUpgrade(rank.key)} disabled={!canUpgrade} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-1 px-3 rounded text-sm">
                                        {level < 10 ? `強化 (${cost})` : 'MAX'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </details>
    );
};


const CountryView: React.FC<CountryViewProps> = ({ gameState, dispatch, now }) => {
    let prereqConquered = true;

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">世界征服</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ALL_COUNTRIES.map(countryId => {
                    const isLocked = !prereqConquered;
                    const isConquered = !!gameState.countries[countryId];
                    prereqConquered = isConquered;
                    
                    return <CountryCard key={countryId} countryId={countryId} isLocked={isLocked} gameState={gameState} dispatch={dispatch} now={now} />;
                })}
            </div>
        </div>
    );
};

export default CountryView;
