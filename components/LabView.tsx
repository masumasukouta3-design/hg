
import React from 'react';
// FIX: Import Crop type to be used for type annotation.
import { GameState, Crop } from '../types';
import { RESEARCH_COST } from '../constants';
import { StarIcon } from './icons';

interface LabViewProps {
  gameState: GameState;
  onResearch: (cropId: string) => void;
}

const LabView: React.FC<LabViewProps> = ({ gameState, onResearch }) => {
  const { products, cropData } = gameState;

  return (
    <div className="animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* FIX: Explicitly type `crop` as Crop to avoid it being inferred as `unknown`. */}
            {Object.values(cropData).map((crop: Crop) => {
                const canResearch = (products[crop.id] || 0) >= RESEARCH_COST;
                return (
                    <div key={crop.id} className="bg-gray-800 rounded-lg shadow-md p-4 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-green-400">{crop.name}</h3>
                            <p className="text-gray-400">所持数: {products[crop.id] || 0}</p>
                            <div className="mt-2 space-y-1 text-yellow-400">
                                <div className="flex items-center" title="美味しさ"><StarIcon/> <span className="ml-2 text-gray-300">美味しさ: {crop.stats.taste} / 5</span></div>
                                <div className="flex items-center" title="長持ちさ"><StarIcon/> <span className="ml-2 text-gray-300">長持ちさ: {crop.stats.durability} / 5</span></div>
                                <div className="flex items-center" title="見た目の良さ"><StarIcon/> <span className="ml-2 text-gray-300">見た目の良さ: {crop.stats.appearance} / 5</span></div>
                            </div>
                        </div>
                        <button
                            onClick={() => onResearch(crop.id)}
                            disabled={!canResearch}
                            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                        >
                            研究する (コスト: {crop.name} x{RESEARCH_COST})
                        </button>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default LabView;
