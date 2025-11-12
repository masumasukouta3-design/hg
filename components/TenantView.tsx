
import React, { useState } from 'react';
import { GameState, GameAction, Tenant, Company } from '../types';
import { TENANT_COST, TENANT_COMPANY_CAPACITY, TENANT_PROFIT_DURATION_MS, TENANT_PROFIT_MARKET_VALUE_MULTIPLIER, TENANT_PROFIT_CITIZEN_BONUS } from '../constants';
import { CitizenIcon } from './icons';

interface TenantViewProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  now: number;
  onClaimProfit: (tenantId: string) => void;
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
                        <label className="block text-gray-400">数 (配置可能: {maxAmount}人)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            className="w-full bg-gray-700 text-white p-2 rounded"
                            min="1"
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

const AssignCompanyModal: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    tenantId: string,
    unassignedCompanies: Company[],
    onAssign: (companyId: string, tenantId: string) => void,
}> = ({ isOpen, onClose, tenantId, unassignedCompanies, onAssign }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <h2 className="text-2xl font-bold text-green-400 mb-4">会社を入居させる</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {unassignedCompanies.length > 0 ? unassignedCompanies.map(c => (
                        <div key={c.id} className="p-3 rounded flex justify-between items-center bg-gray-700">
                            <p>{c.name}</p>
                            <button onClick={() => onAssign(c.id, tenantId)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">選択</button>
                        </div>
                    )) : <p className="text-center text-gray-500">入居可能な会社がありません。</p>}
                </div>
                 <button onClick={onClose} className="mt-6 w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">閉じる</button>
            </div>
        </div>
    );
}

const TenantCard: React.FC<{
    tenant: Tenant,
    gameState: GameState,
    dispatch: React.Dispatch<GameAction>,
    now: number,
    onClaimProfit: (tenantId: string) => void,
}> = ({ tenant, gameState, dispatch, now, onClaimProfit }) => {
    const companiesInTenant = gameState.companies.filter(c => c.tenantId === tenant.id);
    const totalMarketValue = companiesInTenant.reduce((sum, c) => sum + c.marketValue, 0);
    const profitState = gameState.tenantProfitState[tenant.id];

    const isProfitReady = profitState?.startTime !== null && now - profitState.startTime >= TENANT_PROFIT_DURATION_MS;
    const timeLeftMs = profitState?.startTime !== null ? (profitState.startTime + TENANT_PROFIT_DURATION_MS) - now : 0;
    
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [citizenModalOpen, setCitizenModalOpen] = useState(false);

    const formatTimeLeft = (ms: number) => {
        if (ms <= 0) return '利益獲得可能';
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `残り ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleAssignCompany = (companyId: string, tenantId: string) => {
        dispatch({ type: 'ASSIGN_COMPANY_TO_TENANT', payload: { companyId, tenantId }});
        setAssignModalOpen(false);
    }

    const handleCitizenManagement = (amount: number, type: 'assign' | 'withdraw') => {
        const actionType = type === 'assign' ? 'ASSIGN_CITIZENS' : 'WITHDRAW_CITIZENS';
        dispatch({ type: actionType, payload: { targetId: tenant.id, targetType: 'tenant', amount }});
    };
    
    const unassignedCompanies = gameState.companies.filter(c => c.tenantId === null);
    const earnings = (totalMarketValue * TENANT_PROFIT_MARKET_VALUE_MULTIPLIER) + (tenant.assignedCitizens * TENANT_PROFIT_CITIZEN_BONUS);

    return (
        <details className="bg-gray-800 rounded-lg shadow-md open:ring-2 open:ring-green-500">
            <summary className="text-xl font-bold p-4 cursor-pointer list-none flex justify-between items-center">
                {tenant.name}
                <span className="text-sm font-normal text-gray-400">会社: {companiesInTenant.length}/{TENANT_COMPANY_CAPACITY} | 国民: {tenant.assignedCitizens}人</span>
            </summary>
            <div className="p-4 border-t border-gray-700 space-y-4">
                {/* Profit Section */}
                <div className="bg-gray-700/50 p-3 rounded">
                    <p>入居中の会社の時価総額合計: {new Intl.NumberFormat('ja-JP').format(totalMarketValue)} 円</p>
                     <p>次回利益(目安): {new Intl.NumberFormat('ja-JP').format(Math.floor(earnings))} 円</p>
                    <div className="flex items-center justify-between mt-2">
                         {profitState?.startTime === null ? (
                            <button onClick={() => dispatch({type: 'START_TENANT_PROFIT_COLLECTION', payload: { tenantId: tenant.id }})} disabled={companiesInTenant.length === 0} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded">回収開始</button>
                         ) : isProfitReady ? (
                             <button onClick={() => onClaimProfit(tenant.id)} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded">利益獲得</button>
                         ) : (
                             <div>
                                 <p className="text-sm">{formatTimeLeft(timeLeftMs)}</p>
                                 <div className="w-32 bg-gray-600 rounded-full h-2 mt-1">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${100 - (timeLeftMs / TENANT_PROFIT_DURATION_MS) * 100}%` }}></div>
                                </div>
                             </div>
                         )}
                    </div>
                </div>

                {/* Citizen Management */}
                <div className="bg-gray-700/50 p-3 rounded flex justify-between items-center">
                    <div className="flex items-center">
                        <CitizenIcon />
                        <span className="ml-2">配置中の国民: {tenant.assignedCitizens} 人</span>
                    </div>
                    <button onClick={() => setCitizenModalOpen(true)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded text-sm">管理</button>
                </div>

                {/* Company List */}
                <div className="space-y-2">
                    <h4 className="font-semibold">入居中の会社</h4>
                    {companiesInTenant.map(c => (
                        <div key={c.id} className="flex justify-between items-center bg-gray-700/50 p-2 rounded">
                            <span>{c.name}</span>
                            <button onClick={() => dispatch({type: 'REMOVE_COMPANY_FROM_TENANT', payload: { companyId: c.id }})} className="text-red-500 hover:text-red-400 text-sm">退去</button>
                        </div>
                    ))}
                    {companiesInTenant.length < TENANT_COMPANY_CAPACITY && (
                        <button onClick={() => setAssignModalOpen(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">会社を入居させる</button>
                    )}
                </div>
                 <AssignCompanyModal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} tenantId={tenant.id} unassignedCompanies={unassignedCompanies} onAssign={handleAssignCompany} />
                 <CitizenModal 
                    isOpen={citizenModalOpen}
                    onClose={() => setCitizenModalOpen(false)}
                    maxAmount={gameState.citizens}
                    currentAmount={tenant.assignedCitizens}
                    targetName={tenant.name}
                    onConfirm={handleCitizenManagement}
                />
            </div>
        </details>
    )
}

const TenantView: React.FC<TenantViewProps> = ({ gameState, dispatch, now, onClaimProfit }) => {
    const [tab, setTab] = useState<'manage' | 'buy'>('manage');

    const handleBuyTenant = () => {
        if (gameState.money < TENANT_COST) return;
        const newTenant: Tenant = {
            id: `ten-${Date.now()}`,
            name: `テナント #${gameState.tenants.length + 1}`,
            assignedCitizens: 0
        };
        dispatch({ type: 'BUY_TENANT', payload: { tenant: newTenant, cost: TENANT_COST }});
    }

  return (
    <div className="animate-fade-in">
        <div className="flex justify-center mb-4 border-b border-gray-700">
            <button onClick={() => setTab('manage')} className={`px-4 py-2 font-semibold ${tab === 'manage' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}>管理</button>
            <button onClick={() => setTab('buy')} className={`px-4 py-2 font-semibold ${tab === 'buy' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}>購入</button>
        </div>
        
        {tab === 'manage' && (
            <div className="space-y-4">
                 {gameState.tenants.length === 0 ? (
                    <p className="text-center text-gray-500 mt-8">所有しているテナントはありません。</p>
                ) : (
                    gameState.tenants.map(t => <TenantCard key={t.id} tenant={t} gameState={gameState} dispatch={dispatch} now={now} onClaimProfit={onClaimProfit} />)
                )}
            </div>
        )}

        {tab === 'buy' && (
             <div className="bg-gray-800 rounded-lg shadow-md p-6 max-w-sm mx-auto text-center">
                 <h3 className="text-2xl font-bold text-green-400">新しいテナント</h3>
                 <p className="my-4">テナントを建設して、会社を入居させましょう。入居している会社の時価総額に応じて利益を得ることができます。</p>
                 <p className="text-lg font-semibold">{new Intl.NumberFormat('ja-JP').format(TENANT_COST)} 円</p>
                 <button 
                    onClick={handleBuyTenant}
                    disabled={gameState.money < TENANT_COST}
                    className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded"
                >
                    建設する
                 </button>
             </div>
        )}
    </div>
  );
};

export default TenantView;
