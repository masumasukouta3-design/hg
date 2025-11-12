
import React, { useState } from 'react';
import { GameState, GameAction } from '../types';

// Helper functions for base64 and Uint8Array
function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
}


interface SystemViewProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const SystemView: React.FC<SystemViewProps> = ({ gameState, dispatch }) => {
    const [saveData, setSaveData] = useState('');
    const [loadData, setLoadData] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCompressed, setIsCompressed] = useState(false);
    const [notification, setNotification] = useState<{type: 'success'|'error', message: string} | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }

    const handleExport = () => {
        try {
            const jsonString = JSON.stringify(gameState);
            setSaveData(jsonString);
            setIsCompressed(false);
            showNotification('セーブデータを書き出しました。');
        } catch (error) {
            console.error("Save export failed:", error);
            showNotification('セーブデータの書き出しに失敗しました。', 'error');
        }
    };

    const handleCompress = async () => {
        if (!saveData || isCompressed) return;
        setIsLoading(true);
        try {
            const stream = new Blob([saveData], { type: 'text/plain' }).stream().pipeThrough(new CompressionStream('gzip'));
            const compressed = await new Response(stream).arrayBuffer();
            const compressedBase64 = uint8ArrayToBase64(new Uint8Array(compressed));
            setSaveData(compressedBase64);
            setIsCompressed(true);
            showNotification('文字列を省略しました。');
        } catch (error) {
            console.error("Save compression failed:", error);
            showNotification('文字列の省略に失敗しました。', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(saveData).then(() => {
            showNotification('クリップボードにコピーしました。');
        }, () => {
            showNotification('コピーに失敗しました。', 'error');
        });
    }

    const handleLoad = async () => {
        if (!loadData) return;
        setIsLoading(true);
        try {
            const uint8Array = base64ToUint8Array(loadData);
            const stream = new Blob([uint8Array]).stream().pipeThrough(new DecompressionStream('gzip'));
            const decompressed = await new Response(stream).blob();
            const text = await decompressed.text();
            const newState = JSON.parse(text);

            // Basic validation
            if (typeof newState.money !== 'number' || !Array.isArray(newState.facilities)) {
                throw new Error("Invalid save data format.");
            }
            
            dispatch({ type: 'LOAD_GAME', payload: { newState } });
            showNotification('ゲームをロードしました！');
            setLoadData('');
        } catch (error) {
            console.error("Load failed:", error);
            showNotification('セーブデータの読み込みに失敗しました。データが破損しているか、形式が正しくありません。', 'error');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="animate-fade-in space-y-8 max-w-4xl mx-auto">
             {notification && (
                <div className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'} z-50 transition-opacity duration-300`}>
                    {notification.message}
                </div>
            )}
            <div className="bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-green-400 mb-4">セーブ</h2>
                <div className="flex space-x-2 mb-4">
                    <button onClick={handleExport} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                        セーブを書き出し
                    </button>
                    <button onClick={handleCompress} disabled={!saveData || isCompressed || isLoading} className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                        {isLoading ? '処理中...' : '文字列を省略'}
                    </button>
                     <button onClick={handleCopy} disabled={!saveData || isLoading} className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                        コピー
                    </button>
                </div>
                {saveData && (
                    <textarea 
                        readOnly
                        value={saveData}
                        className="w-full h-32 bg-gray-900 text-gray-300 p-2 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="ここにセーブデータが出力されます"
                    />
                )}
            </div>
            <div className="bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-green-400 mb-4">ロード</h2>
                <textarea 
                    value={loadData}
                    onChange={(e) => setLoadData(e.target.value)}
                    className="w-full h-32 bg-gray-900 text-gray-300 p-2 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="省略したセーブデータをここに貼り付けてください"
                />
                <button onClick={handleLoad} disabled={!loadData || isLoading} className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                    {isLoading ? '読み込み中...' : '読み込み'}
                </button>
            </div>
        </div>
    );
}

export default SystemView;
