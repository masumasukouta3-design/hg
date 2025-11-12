
import React from 'react';
import { GameState, GameAction } from '../types';
import { INITIAL_WEAPONS, INITIAL_MINERALS } from '../constants';

interface SmithyViewProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const SmithyView: React.FC<SmithyViewProps> = ({ gameState, dispatch }) => {
  const { minerals } = gameState;

  const handleCraft = (weaponId: string) => {
    dispatch({ type: 'CRAFT_WEAPON', payload: { weaponId } });
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">鍛冶屋</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(INITIAL_WEAPONS).map(weapon => {
          const canCraft = Object.entries(weapon.recipe).every(
            ([mineralId, required]) => (minerals[mineralId] || 0) >= required
          );

          return (
            <div key={weapon.id} className="bg-gray-800 rounded-lg shadow-md p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-red-400">{weapon.name}</h3>
                <p className="text-gray-400 mt-2">売値: {new Intl.NumberFormat('ja-JP').format(weapon.sellPrice)} 円</p>
                <div className="my-4 border-t border-gray-700 pt-4">
                  <h4 className="font-semibold text-lg mb-2">必要な材料:</h4>
                  <ul className="space-y-1">
                    {Object.entries(weapon.recipe).map(([mineralId, required]) => {
                      const owned = minerals[mineralId] || 0;
                      const hasEnough = owned >= required;
                      return (
                        <li key={mineralId} className={`flex justify-between ${hasEnough ? 'text-gray-300' : 'text-red-500'}`}>
                          <span>{INITIAL_MINERALS[mineralId].name}</span>
                          <span>{owned} / {required}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
              <button
                onClick={() => handleCraft(weapon.id)}
                disabled={!canCraft}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded transition-colors duration-200 text-lg"
              >
                作成する
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SmithyView;
