

import React, { useState } from 'react';
import { GameState, GameAction, Company, Product } from '../types';
import { COMPANY_COST, INITIAL_COMPANIES } from '../constants';
import { CitizenIcon } from './icons';

interface CompanyViewProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const CitizenModal: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    maxAmount: number,
    currentAmount: number,
    targetName: string,
    onConfirm: (amount: number, type: 'assign' | 'withdraw') => void
}> = ({ isOpen, onClose, maxAmount, currentAmount, targetName, onConfirm }) => {
    const [amount, setAmount] = useState(1);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <h2 className="text-2xl font-bold text-green-400 mb-4">{targetName} - 国民管理</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400">数 (最大: {maxAmount}人)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Math.max(1, Math.min(maxAmount, parseInt(e.target.value, 10) || 1)))}
                            className="w-full bg-gray-700 text-white p-2 rounded"
                            min="1"
                            max={maxAmount}
                        />
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => onConfirm(amount, 'assign')} disabled={amount > maxAmount} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded">配置する</button>
                        <button onClick={() => onConfirm(amount, 'withdraw')} disabled={amount > currentAmount} className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded">引き払う</button>
                    </div>
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">閉じる</button>
            </div>
        </div>
    );
};


const CompanyCard: React.FC<{ company: Company, gameState: GameState, dispatch: React.Dispatch<GameAction> }> = ({ company, gameState, dispatch }) => {
    const companyInfo = gameState.companyData[company.typeId];
    const [modalOpen, setModalOpen] = useState(false);

    const handleProduce = (productId: string, all: boolean) => {
        const product = gameState.productData[productId];
        let maxCanMake = Infinity;
        Object.entries(product.recipe).forEach(([cropId, required]) => {
            const owned = gameState.products[cropId] || 0;
            // FIX: Explicitly cast `required` to a number to prevent type errors in division.
            maxCanMake = Math.min(maxCanMake, Math.floor(owned / Number(required)));
        });

        const quantity = all ? maxCanMake : 1;
        if (quantity > 0) {
            dispatch({ type: 'PRODUCE_PRODUCT', payload: { companyId: company.id, productId, quantity } });
        }
    };
    
    const handleCitizenManagement = (amount: number, type: 'assign' | 'withdraw') => {
        const actionType = type === 'assign' ? 'ASSIGN_CITIZENS' : 'WITHDRAW_CITIZENS';
        dispatch({ type: actionType, payload: { targetId: company.id, targetType: 'company', amount }});
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-md p-4 flex flex-col space-y-3">
            <h3 className="text-xl font-bold text-green-400">{company.name}</h3>
            <p>時価総額: {new Intl.NumberFormat('ja-JP').format(company.marketValue)} 円</p>
            <p>最大生産記録: {company.productionRecord} 個</p>
            <div className="flex items-center">
                <CitizenIcon /> <span className="ml-2">配置中の国民: {company.assignedCitizens} 人</span>
                <button onClick={() => setModalOpen(true)} className="ml-auto bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded text-sm">管理</button>
            </div>
             {company.tenantId ? <p className="text-sm text-blue-400">テナント入居中</p> : <p className="text-sm text-yellow-400">未入居</p>}

            <div className="border-t border-gray-700 pt-3 space-y-4">
                <h4 className="font-semibold">商品生産</h4>
                {companyInfo.products.map(productId => {
                    const product = gameState.productData[productId];
                    return (
                        <div key={productId} className="bg-gray-700/50 p-3 rounded">
                            <p className="font-bold">{product.name}</p>
                            <p className="text-sm text-gray-400">材料: {Object.entries(product.recipe).map(([cropId, q]) => `${gameState.cropData[cropId].name} x${q}`).join(', ')}</p>
                            <div className="flex space-x-2 mt-2">
                                <button onClick={() => handleProduce(productId, false)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">1つ作る</button>
                                <button onClick={() => handleProduce(productId, true)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm">全て作る</button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <CitizenModal 
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                maxAmount={gameState.citizens}
                currentAmount={company.assignedCitizens}
                targetName={company.name}
                onConfirm={handleCitizenManagement}
            />
        </div>
    );
};

const CompanyView: React.FC<CompanyViewProps> = ({ gameState, dispatch }) => {
  const [tab, setTab] = useState<'manage' | 'buy'>('manage');

  const handleBuyCompany = (typeId: string) => {
    if (gameState.money < COMPANY_COST) return;
    const companyInfo = INITIAL_COMPANIES[typeId];
    const existingCount = gameState.companies.filter(c => c.typeId === typeId).length;
    const newCompany: Company = {
        id: `comp-${Date.now()}-${Math.random()}`,
        typeId,
        name: `${companyInfo.name} #${existingCount + 1}`,
        marketValue: companyInfo.baseMarketValue,
        productionRecord: 0,
        assignedCitizens: 0,
        tenantId: null
    };
    dispatch({ type: 'BUY_COMPANY', payload: { company: newCompany, cost: COMPANY_COST } });
  };

  return (
    <div className="animate-fade-in">
        <div className="flex justify-center mb-4 border-b border-gray-700">
            <button onClick={() => setTab('manage')} className={`px-4 py-2 font-semibold ${tab === 'manage' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}>経営</button>
            <button onClick={() => setTab('buy')} className={`px-4 py-2 font-semibold ${tab === 'buy' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}>買収</button>
        </div>

        {tab === 'manage' && (
             <div>
                {gameState.companies.length === 0 ? (
                    <p className="text-center text-gray-500 mt-8">所有している会社はありません。</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {gameState.companies.map(c => <CompanyCard key={c.id} company={c} gameState={gameState} dispatch={dispatch} />)}
                    </div>
                )}
            </div>
        )}

        {tab === 'buy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(INITIAL_COMPANIES).map(companyInfo => (
                     <div key={companyInfo.id} className="bg-gray-800 rounded-lg shadow-md p-4 flex flex-col justify-between">
                         <div>
                            <h3 className="text-xl font-bold text-green-400">{companyInfo.name}</h3>
                            <p>基本時価総額: {new Intl.NumberFormat('ja-JP').format(companyInfo.baseMarketValue)} 円</p>
                            <p className="mt-2">生産可能商品:</p>
                            <ul className="list-disc list-inside text-gray-400">
                                {companyInfo.products.map(pid => <li key={pid}>{gameState.productData[pid].name}</li>)}
                            </ul>
                         </div>
                         <button
                            onClick={() => handleBuyCompany(companyInfo.id)}
                            disabled={gameState.money < COMPANY_COST}
                            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                        >
                            買収する ({new Intl.NumberFormat('ja-JP').format(COMPANY_COST)} 円)
                         </button>
                     </div>
                ))}
            </div>
        )}

    </div>
  );
};

export default CompanyView;