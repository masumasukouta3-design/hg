
import React, { useState } from 'react';
import { GameState, GameAction } from '../types';
import { MINING_DURATION_MS, MINERALS_PER_RUN, MINERAL_TYPES, INITIAL_MINERALS } from '../constants';

interface MineViewProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  now: number;
}

const CollectionModal: React.FC<{
  collected: Record<string, number>;
  onClose: () => void;
}> = ({ collected, onClose }) => {
  const sortedCollection = Object.entries(collected).sort(([, a], [, b]) => b - a);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 transform transition-all animate-jump-in">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">採掘成功！</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {sortedCollection.map(([mineralId, quantity], index) => (
            <div
              key={mineralId}
              className="p-3 rounded flex justify-between items-center bg-gray-700 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <p className="font-semibold">{INITIAL_MINERALS[mineralId].name}</p>
              <p className="text-lg font-bold text-yellow-300">x {quantity}</p>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          素晴らしい！
        </button>
      </div>
    </div>
  );
};

const MineView: React.FC<MineViewProps> = ({ gameState, dispatch, now }) => {
  const { mineState } = gameState;
  const [showCollection, setShowCollection] = useState<Record<string, number> | null>(null);

  const isMiningReady = mineState.startTime !== null && now - mineState.startTime >= MINING_DURATION_MS;
  const timeLeftMs = mineState.startTime !== null ? (mineState.startTime + MINING_DURATION_MS) - now : 0;

  const formatTimeLeft = (ms: number) => {
    if (ms <= 0) return '回収可能';
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `残り ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartMining = () => {
    dispatch({ type: 'START_MINING' });
  };

  const handleCollect = () => {
    const collected: Record<string, number> = {};
    for (let i = 0; i < MINERALS_PER_RUN; i++) {
        const mineralId = MINERAL_TYPES[Math.floor(Math.random() * MINERAL_TYPES.length)];
        collected[mineralId] = (collected[mineralId] || 0) + 1;
    }
    dispatch({ type: 'COLLECT_MINERALS', payload: { collected } });
    setShowCollection(collected);
  };

  return (
    <div className="animate-fade-in flex justify-center items-center h-full">
      <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center max-w-lg w-full">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6">鉱山</h2>
        {mineState.startTime === null ? (
          <>
            <p className="text-gray-400 mb-6">鉱山に入って貴重な鉱物を探しましょう。1時間かかります。</p>
            <button
              onClick={handleStartMining}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded text-lg transition-transform transform hover:scale-105"
            >
              鉱山に入る
            </button>
          </>
        ) : isMiningReady ? (
          <>
            <p className="text-gray-300 mb-6 text-xl">採掘が完了しました！</p>
            <button
              onClick={handleCollect}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded text-lg animate-pulse"
            >
              鉱物を回収する
            </button>
          </>
        ) : (
          <div>
            <p className="text-gray-300 mb-4">鉱物を採掘中です...</p>
            <p className="text-2xl font-semibold text-white mb-4">{formatTimeLeft(timeLeftMs)}</p>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${100 - (timeLeftMs / MINING_DURATION_MS) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      {showCollection && (
        <CollectionModal collected={showCollection} onClose={() => setShowCollection(null)} />
      )}
    </div>
  );
};

export default MineView;
