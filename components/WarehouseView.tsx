

import React from 'react';
import { GameState, GameAction, Crop, Product } from '../types';
import { STAT_SELL_PRICE_MULTIPLIER } from '../constants';
import { StarIcon } from './icons';

interface WarehouseViewProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const calculateSellPrice = (crop: Crop): number => {
    const statBonus = (crop.stats.taste + crop.stats.durability + crop.stats.appearance) * STAT_SELL_PRICE_MULTIPLIER;
    return Math.floor(crop.baseSellPrice * (1 + statBonus));
};

const WarehouseView: React.FC<WarehouseViewProps> = ({ gameState, dispatch }) => {
  const { products, cropData, companyProducts, productData } = gameState;

  const handleSellCrop = (cropId: string, quantity: number) => {
    const crop = cropData[cropId];
    const sellPrice = calculateSellPrice(crop);
    const earnings = sellPrice * quantity;
    dispatch({ type: 'SELL', payload: { cropId, quantity, earnings } });
  };

  const handleSellProduct = (productId: string, quantity: number) => {
    const product = productData[productId];
    const earnings = product.sellPrice * quantity;
    dispatch({ type: 'SELL_COMPANY_PRODUCT', payload: { productId, quantity, earnings } });
  };
  
  const productIds = Object.keys(products).filter(id => products[id] > 0);
  const companyProductIds = Object.keys(companyProducts).filter(id => companyProducts[id] > 0);

  return (
    <div className="animate-fade-in space-y-8">
        <div>
            <h2 className="text-2xl font-bold text-green-400 mb-4">作物倉庫</h2>
            {productIds.length === 0 ? (
                <p className="text-center text-gray-500 mt-8">作物の倉庫は空です。</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productIds.map(cropId => {
                        const crop = cropData[cropId];
                        const quantity = products[cropId];
                        const currentPrice = calculateSellPrice(crop);
                        return (
                            <div key={cropId} className="bg-gray-800 rounded-lg shadow-md p-4 flex flex-col">
                                <h3 className="text-xl font-bold text-green-400">{crop.name}</h3>
                                <p className="text-gray-400">所持数: {quantity}</p>
                                <p className="text-gray-400">現在売値: {new Intl.NumberFormat('ja-JP').format(currentPrice)} 円</p>
                                <div className="text-yellow-400 flex items-center mt-2 text-sm">
                                    <div className="flex items-center mr-3" title="美味しさ"><StarIcon /> <span className="ml-1">{crop.stats.taste}</span></div>
                                    <div className="flex items-center mr-3" title="長持ちさ"><StarIcon /> <span className="ml-1">{crop.stats.durability}</span></div>
                                    <div className="flex items-center" title="見た目の良さ"><StarIcon /> <span className="ml-1">{crop.stats.appearance}</span></div>
                                </div>
                                <div className="mt-auto pt-4 flex space-x-2">
                                    <button
                                        onClick={() => handleSellCrop(cropId, 10)}
                                        disabled={quantity < 10}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        10個売る
                                    </button>
                                    <button
                                        onClick={() => handleSellCrop(cropId, quantity)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        全部売る
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
        
        <div>
            <h2 className="text-2xl font-bold text-blue-400 mb-4">商品倉庫</h2>
            {companyProductIds.length === 0 ? (
                <p className="text-center text-gray-500 mt-8">商品の倉庫は空です。</p>
            ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {companyProductIds.map(productId => {
                        const product = productData[productId];
                        const quantity = companyProducts[productId];
                        return (
                             <div key={productId} className="bg-gray-800 rounded-lg shadow-md p-4 flex flex-col">
                                <h3 className="text-xl font-bold text-blue-400">{product.name}</h3>
                                <p className="text-gray-400">所持数: {quantity}</p>
                                <p className="text-gray-400">売値: {new Intl.NumberFormat('ja-JP').format(product.sellPrice)} 円</p>
                                <div className="mt-auto pt-4 flex space-x-2">
                                    <button
                                        onClick={() => handleSellProduct(productId, 10)}
                                        disabled={quantity < 10}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        10個売る
                                    </button>
                                    <button
                                        onClick={() => handleSellProduct(productId, quantity)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        全部売る
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    </div>
  );
};

export default WarehouseView;
