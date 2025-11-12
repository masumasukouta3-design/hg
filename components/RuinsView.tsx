

import React from 'react';
import { GameState, GameAction, RuinType } from '../types';
import { RUIN_DATA, FRAGMENTS_TO_RUIN_COST, RUIN_PROFIT_DURATION_MS, BASE_PROFIT_PER_RUIN } from '../constants';

interface RuinsViewProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  now: number;
  onClaimProfit: () => void;
}

const RuinsView: React.FC<RuinsViewProps> = ({ gameState, dispatch, now, onClaimProfit }) => {
    const { fragments, ruins, ruinProfitState } = gameState;

    // FIX: Explicitly type reduce params as Object.values may return unknown[]
    const totalRuins = Object.values(ruins).reduce((sum: number, count: number) => sum + count, 0);

    const isProfitReady = ruinProfitState.startTime !== null && now - Number(ruinProfitState.startTime) >= RUIN_PROFIT_DURATION_MS;
    // FIX: Cast startTime to Number to ensure it's not a string for arithmetic operations.
    const timeLeftMs = ruinProfitState.startTime !== null ? (Number(ruinProfitState.startTime) + RUIN_PROFIT_DURATION_MS) - now : 0;
    
    const formatTimeLeft = (ms: number) => {
        if (ms <= 0) return '利益獲得可能';
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `残り ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleExchange = (toFragment: 'maya' | 'nuevaEspana') => {
        dispatch({ type: 'EXCHANGE_FRAGMENT', payload: { toFragment } });
    };

    const handleAssemble = (ruinType: RuinType) => {
        dispatch({ type: 'ASSEMBLE_RUIN', payload: { ruinType }});
    }
    
    const handleStartProfitCollection = () => {
        dispatch({ type: 'START_PROFIT_COLLECTION' });
    }

    return (
    <div className="animate-fade-in space-y-8">
      {/* Profit Collection Section */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-green-400 mb-4">遺跡からの利益</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <p>所持している遺跡の合計: {totalRuins}個</p>
                <p>獲得可能な利益: {new Intl.NumberFormat('ja-JP').format(totalRuins * BASE_PROFIT_PER_RUIN)} 円</p>
            </div>
            {ruinProfitState.startTime === null ? (
                 <button
                    onClick={handleStartProfitCollection}
                    disabled={totalRuins === 0}
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded transition-colors duration-200"
                >
                    利益回収を開始
                </button>
            ) : isProfitReady ? (
                <button
                    onClick={onClaimProfit}
                    className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded transition-colors duration-200"
                >
                    利益獲得
                </button>
            ) : (
                <div className="text-center">
                    <p className="text-lg font-semibold">{formatTimeLeft(timeLeftMs)}</p>
                    <div className="w-48 bg-gray-700 rounded-full h-2.5 mt-2">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${100 - (timeLeftMs / RUIN_PROFIT_DURATION_MS) * 100}%` }}></div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Fragment Exchange Section */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-green-400 mb-4">破片交換</h2>
        <div className="flex flex-col md:flex-row items-center justify-between bg-gray-700 p-4 rounded-lg">
            <p className="text-lg">なにかの破片: <span className="font-bold text-xl">{fragments.something}</span> 個</p>
            <div className="flex space-x-2 mt-4 md:mt-0">
                <button onClick={() => handleExchange('maya')} disabled={fragments.something < 1} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
                    → {RUIN_DATA.Maya.fragmentName}
                </button>
                <button onClick={() => handleExchange('nuevaEspana')} disabled={fragments.something < 1} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
                    → {RUIN_DATA.NuevaEspana.fragmentName}
                </button>
            </div>
        </div>
      </div>
      
      {/* Ruin Assembly Section */}
      <div>
        <h2 className="text-2xl font-bold text-green-400 mb-4">遺跡復元</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(Object.keys(RUIN_DATA) as RuinType[]).map(ruinType => {
            const data = RUIN_DATA[ruinType];
            const fragmentCount = fragments[data.fragmentId as 'maya' | 'nuevaEspana'];
            const canAssemble = fragmentCount >= FRAGMENTS_TO_RUIN_COST;

            return (
              <div key={ruinType} className="bg-gray-800 rounded-lg shadow-md p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-teal-300">{data.name}</h3>
                  <p className="mt-2">所持数: {ruins[ruinType]}</p>
                  <p className="mt-2">{data.fragmentName}: {fragmentCount} / {FRAGMENTS_TO_RUIN_COST}</p>
                   <div className="w-full bg-gray-700 rounded-full h-2.5 my-2">
                        <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (fragmentCount / FRAGMENTS_TO_RUIN_COST) * 100)}%` }}></div>
                    </div>
                </div>
                <button
                  onClick={() => handleAssemble(ruinType)}
                  disabled={!canAssemble}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                >
                  復元する
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default RuinsView;