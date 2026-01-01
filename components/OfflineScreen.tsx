
import React from 'react';
import { WifiOff, RefreshCcw } from 'lucide-react';

interface OfflineScreenProps {
    onRetry: () => void;
}

export const OfflineScreen: React.FC<OfflineScreenProps> = ({ onRetry }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full" />
                <div className="relative w-24 h-24 bg-[#1a1a1a] rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl">
                    <WifiOff className="w-12 h-12 text-red-600" />
                </div>
            </div>

            <h1 className="text-3xl font-black text-white mb-3 tracking-tight">You're Offline</h1>
            <p className="text-gray-400 text-sm max-w-[260px] leading-relaxed mb-10">
                It looks like you're not connected to the internet. Please check your connection and try again.
            </p>

            <button
                onClick={onRetry}
                className="flex items-center gap-3 bg-white text-black px-10 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-xl shadow-white/5"
            >
                <RefreshCcw className="w-4 h-4" />
                RETRY CONNECTION
            </button>

            <div className="mt-12 text-[10px] text-gray-600 font-bold tracking-widest uppercase opacity-50">
                Flux Streaming Service
            </div>
        </div>
    );
};
