
import React, { useState } from 'react';
import { GameState, GameAction, Crop, Facility } from '../types';
import { INITIAL_CROPS, FACILITIES_FOR_SALE } from '../constants';

interface MarketViewProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const MarketView: React.FC<MarketViewProps> = ({ gameState, dispatch }) => {
  const [marketTab, setMarketTab] = useState<'seeds' | 'facilities'>('seeds');
  
  const handleBuySeed = (crop: Crop) => {
    const quantity = 10;
    const cost = crop.buyPrice * quantity;
    if (gameState.money >= cost) {
      dispatch({ type: 'BUY_SEEDS', payload: { cropId: crop.id, quantity, cost } });
    }
  };

  const handleBuyFacility = (facilityKey: string) => {
    const facilityInfo = FACILITIES_FOR_SALE[facilityKey];
    if (gameState.money >= facilityInfo.price) {
        const newFacility: Facility = {
            id: `fac-${Date.now()}-${Math.random()}`,
            name: facilityInfo.name,
            category: facilityInfo.category,
            capacity: facilityInfo.capacity,
            plantedCrop: null
        }
        dispatch({ type: 'BUY_FACILITY', payload: { facility: newFacility, cost: facilityInfo.price } });
    }
  };

  return (
    <div className="animate-fade-in">
        <div className="flex justify-center mb-4 border-b border-gray-700">
            <button onClick={() => setMarketTab('seeds')} className={`px-4 py-2 font-semibold ${marketTab === 'seeds' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}>種・稚魚</button>
            <button onClick={() => setMarketTab('facilities')} className={`px-4 py-2 font-semibold ${marketTab === 'facilities' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}>施設</button>
        </div>

        {marketTab === 'seeds' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(INITIAL_CROPS).map(crop => (
                    <div key={crop.id} className="bg-gray-800 rounded-lg shadow-md p-4 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold">{crop.name}</h3>
                            <p className="text-gray-400">{new Intl.NumberFormat('ja-JP').format(crop.buyPrice * 10)} 円 (10個)</p>
                        </div>
                        <button 
                            onClick={() => handleBuySeed(crop)}
                            disabled={gameState.money < crop.buyPrice * 10}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                        >
                            買う
                        </button>
                    </div>
                ))}
            </div>
        )}

        {marketTab === 'facilities' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(FACILITIES_FOR_SALE).map(key => {
                    const facility = FACILITIES_FOR_SALE[key];
                    return (
                        <div key={key} className="bg-gray-800 rounded-lg shadow-md p-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold">{facility.name}</h3>
                                <p className="text-gray-400">容量: {facility.capacity}</p>
                                <p className="text-gray-300">{new Intl.NumberFormat('ja-JP').format(facility.price)} 円</p>
                            </div>
                             <button
                                onClick={() => handleBuyFacility(key)}
                                disabled={gameState.money < facility.price}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                            >
                                買う
                            </button>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );
};

export default MarketView;
   