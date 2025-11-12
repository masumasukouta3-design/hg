
import React, { useState } from 'react';
import { GameState, GameAction, Facility, Crop } from '../types';
// FIX: Import INITIAL_CROPS to get crop data.
import { GROW_TIME_MS, CROP_CATEGORY_MAP, INITIAL_CROPS } from '../constants';
import PlantingModal from './PlantingModal';

interface FarmViewProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  now: number;
}

const FacilityCard: React.FC<{ facility: Facility, now: number, onHarvest: () => void, onPlantClick: () => void }> = ({ facility, now, onHarvest, onPlantClick }) => {
    const { plantedCrop } = facility;
    const isReady = plantedCrop && (now - plantedCrop.plantedAt >= GROW_TIME_MS);
    const progress = plantedCrop ? Math.min(100, ((now - plantedCrop.plantedAt) / GROW_TIME_MS) * 100) : 0;

    const getTimeLeft = () => {
        if (!plantedCrop) return '';
        const timeLeftMs = (plantedCrop.plantedAt + GROW_TIME_MS) - now;
        if (timeLeftMs <= 0) return '収穫可能';
        const minutes = Math.floor(timeLeftMs / 60000);
        const seconds = Math.floor((timeLeftMs % 60000) / 1000);
        return `残り ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-md p-4 flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-bold text-green-400">{facility.name}</h3>
                <p className="text-gray-400">容量: {facility.capacity}</p>
            </div>
            <div className="mt-4 flex-grow flex flex-col justify-center items-center">
                {plantedCrop ? (
                    <div className="w-full text-center">
                        <p className="text-lg">{INITIAL_CROPS[plantedCrop.cropId].name}を育成中...</p>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 my-2">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-sm text-gray-400">{getTimeLeft()}</p>
                    </div>
                ) : (
                    <p className="text-gray-500">空き</p>
                )}
            </div>
            <div className="mt-4">
                {plantedCrop ? (
                    <button
                        onClick={onHarvest}
                        disabled={!isReady}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                    >
                        収穫
                    </button>
                ) : (
                    <button
                        onClick={onPlantClick}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                    >
                        植える
                    </button>
                )}
            </div>
        </div>
    );
};


const FarmView: React.FC<FarmViewProps> = ({ gameState, dispatch, now }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

    const handlePlantClick = (facility: Facility) => {
        setSelectedFacility(facility);
        setIsModalOpen(true);
    };

    const handleHarvest = (facilityId: string) => {
        dispatch({ type: 'HARVEST', payload: { facilityId } });
    };
    
    const handleConfirmPlant = (facilityId: string, cropId: string) => {
        dispatch({ type: 'PLANT', payload: { facilityId, cropId } });
        setIsModalOpen(false);
        setSelectedFacility(null);
    }
    
    // FIX: Explicitly type `crop` as Crop to avoid it being inferred as `unknown`.
    const compatibleSeeds = Object.values(gameState.cropData).filter((crop: Crop) =>
        selectedFacility && CROP_CATEGORY_MAP[crop.type] === selectedFacility.category
    );

    return (
        <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {gameState.facilities.map(facility => (
                    <FacilityCard 
                        key={facility.id} 
                        facility={facility}
                        now={now}
                        onHarvest={() => handleHarvest(facility.id)}
                        onPlantClick={() => handlePlantClick(facility)}
                    />
                ))}
            </div>
            {selectedFacility && (
                 <PlantingModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    facility={selectedFacility}
                    seedsInStock={gameState.seeds}
                    compatibleSeeds={compatibleSeeds}
                    onConfirmPlant={handleConfirmPlant}
                />
            )}
        </div>
    );
};

export default FarmView;
