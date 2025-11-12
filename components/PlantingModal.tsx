
import React from 'react';
import { Facility, Crop } from '../types';

interface PlantingModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: Facility;
  seedsInStock: Record<string, number>;
  compatibleSeeds: Crop[];
  onConfirmPlant: (facilityId: string, cropId: string) => void;
}

const PlantingModal: React.FC<PlantingModalProps> = ({ isOpen, onClose, facility, seedsInStock, compatibleSeeds, onConfirmPlant }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-400">何を植えますか？</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <p className="text-gray-400 mb-4">{facility.name}には{facility.capacity}個必要です。</p>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {compatibleSeeds.map(seed => {
                const hasEnough = (seedsInStock[seed.id] || 0) >= facility.capacity;
                return (
                    <div key={seed.id} className={`p-3 rounded flex justify-between items-center ${hasEnough ? 'bg-gray-700' : 'bg-gray-900 opacity-50'}`}>
                        <div>
                            <p className="font-semibold">{seed.name}</p>
                            <p className="text-sm text-gray-400">所持数: {seedsInStock[seed.id] || 0}</p>
                        </div>
                        <button
                            onClick={() => onConfirmPlant(facility.id, seed.id)}
                            disabled={!hasEnough}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-1 px-3 rounded text-sm transition-colors duration-200"
                        >
                            植える
                        </button>
                    </div>
                );
            })}
             {compatibleSeeds.length === 0 && (
                <p className="text-center text-gray-500 p-4">植えられるものがありません。</p>
            )}
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
            キャンセル
        </button>
      </div>
    </div>
  );
};

export default PlantingModal;
   