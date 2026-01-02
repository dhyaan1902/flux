
import React, { useState } from 'react';
import { MediaItem, ServerProvider, WatchProgress, MediaType } from '../types';
import { Settings, Wifi, Menu, PlayCircle, Clock, X, Edit3, Key } from 'lucide-react';

interface MyNetflixTabProps {
    myList: MediaItem[];
    watchHistory: WatchProgress;
    onItemClick: (item: MediaItem) => void;
    currentServer: ServerProvider;
    onServerChange: (server: ServerProvider) => void;
    onRemoveFromMyList: (item: MediaItem) => void;
    onRemoveFromHistory: (id: string) => void;
    userName: string;
    setUserName: (name: string) => void;
    apiKey: string;
    setApiKey: (key: string) => void;
}

export const MyNetflixTab: React.FC<MyNetflixTabProps> = ({
    myList,
    watchHistory,
    onItemClick,
    currentServer,
    onServerChange,
    onRemoveFromMyList,
    onRemoveFromHistory,
    userName,
    setUserName,
    apiKey,
    setApiKey
}) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(userName);
    const [isApiKeyLocked, setIsApiKeyLocked] = useState(!!apiKey);
    const [isEditingKey, setIsEditingKey] = useState(false);
    const [showKeyConfirm, setShowKeyConfirm] = useState(false);

    const handleEditKey = () => {
        if (isApiKeyLocked) {
            setShowKeyConfirm(true);
        } else {
            setIsApiKeyLocked(false);
            setIsEditingKey(true);
        }
    };

    const confirmEdit = () => {
        setShowKeyConfirm(false);
        setIsApiKeyLocked(false);
        setIsEditingKey(true);
    };

    const cancelEdit = () => {
        setShowKeyConfirm(false);
        setIsEditingKey(false);
        setIsApiKeyLocked(!!apiKey);
    };

    const saveKey = () => {
        setIsEditingKey(false);
        setIsApiKeyLocked(true);
    };

    const continueWatching = Object.entries(watchHistory)
        .map(([id, data]) => ({ id, ...(data as any) }))
        .sort((a, b) => b.lastWatched - a.lastWatched);

    const handleContinue = (item: any) => {
        onItemClick({
            id: item.id,
            tmdbId: Number(item.id),
            title: item.title,
            type: item.type === 'MOVIE' ? MediaType.MOVIE : MediaType.TV_SHOW,
            posterUrl: item.posterUrl,
            year: '',
            overview: '',
            genres: [],
            cast: []
        } as MediaItem);
    };

    const saveName = () => {
        if (tempName.trim()) {
            setUserName(tempName);
        }
        setIsEditingName(false);
    };

    return (
        <div className="min-h-screen bg-black pb-24">
            <div className="pt-safe px-6 pb-4 sticky top-0 bg-black z-20 flex justify-between items-center">
                <h1 className="text-2xl font-black text-white">Profile</h1>
            </div>

            <div className="flex flex-col items-center py-8">
                <div className="w-24 h-24 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl font-black text-white mb-3 shadow-2xl border-4 border-white/10 relative">
                    {userName.substring(0, 1).toUpperCase()}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Edit3 className="w-4 h-4 text-black" />
                    </div>
                </div>

                {isEditingName ? (
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="bg-[#1a1a1a] text-white px-3 py-2 rounded-lg text-sm outline-none border border-white/10 focus:border-red-600"
                            autoFocus
                        />
                        <button onClick={saveName} className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tight">Save</button>
                    </div>
                ) : (
                    <h2 className="text-xl font-black text-white flex items-center gap-2 mt-1" onClick={() => setIsEditingName(true)}>
                        {userName}
                    </h2>
                )}
            </div>

            {continueWatching.length > 0 && (
                <div className="py-6">
                    <h3 className="text-white font-black text-[13px] uppercase tracking-widest mb-4 px-6 opacity-60">
                        Continue Watching
                    </h3>
                    <div className="flex overflow-x-auto gap-3 px-6 pb-4 scrollbar-hide snap-x snap-mandatory">
                        {continueWatching.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleContinue(item)}
                                className="flex-none w-[160px] snap-start cursor-pointer group relative"
                            >
                                <div className="aspect-[16/9] bg-[#0a0a0a] rounded-xl overflow-hidden mb-2 relative border border-white/10">
                                    <img
                                        src={item.posterUrl || `https://via.placeholder.com/200x300`}
                                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                                        alt={item.title}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <PlayCircle className="w-10 h-10 text-white/90 drop-shadow-lg" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
                                        <div className="h-full bg-red-600 w-1/2 rounded-r-full"></div>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); onRemoveFromHistory(item.id); }}
                                    className="absolute top-1 right-1 z-10 bg-black/80 text-white p-1.5 rounded-full border border-white/10 active:scale-90 transition-all"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>

                                <h4 className="text-[12px] font-black text-white/90 line-clamp-1 px-1">{item.title}</h4>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter px-1">
                                    {item.type === 'MOVIE' ? 'Movie' : `S${item.lastSeason} • E${item.lastEpisode}`}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="px-6 py-6">
                <h3 className="text-white font-black text-[13px] uppercase tracking-widest mb-4 opacity-60 flex items-center gap-2">
                    <Key className="w-4 h-4 text-yellow-500" />
                    TMDB Configuration
                </h3>
                <div className="space-y-3">
                    <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/10">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-2">API Key (Private)</label>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder={isApiKeyLocked ? "••••••••••••••••" : "Paste your key here..."}
                                disabled={isApiKeyLocked}
                                className={`flex-1 text-[13px] px-4 py-3 rounded-lg border outline-none transition-all ${isApiKeyLocked
                                    ? 'bg-black text-gray-600 border-white/5'
                                    : 'bg-[#1a1a1a] text-white border-white/10 focus:border-red-600'
                                    }`}
                            />

                            {showKeyConfirm ? (
                                <div className="flex gap-2 animate-in fade-in slide-in-from-right-2">
                                    <button
                                        onClick={confirmEdit}
                                        className="bg-red-600 text-white px-4 py-3 rounded-lg text-xs font-black uppercase tracking-tight"
                                    >
                                        Edit?
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="bg-[#1a1a1a] text-white px-4 py-3 rounded-lg text-xs font-black uppercase tracking-tight border border-white/10"
                                    >
                                        No
                                    </button>
                                </div>
                            ) : isApiKeyLocked ? (
                                <button
                                    onClick={handleEditKey}
                                    className="bg-[#1a1a1a] hover:bg-[#222] text-white px-5 py-3 rounded-lg text-xs font-black uppercase tracking-tight border border-white/10 transition-colors"
                                >
                                    Unlock
                                </button>
                            ) : (
                                <button
                                    onClick={saveKey}
                                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg text-xs font-black uppercase tracking-tight transition-colors shadow-lg shadow-red-600/20"
                                >
                                    Save
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4">
                <h3 className="text-white font-black text-[13px] uppercase tracking-widest mb-4 opacity-60 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-red-500" />
                    Playback Server
                </h3>
                <div className="bg-[#0a0a0a] rounded-xl p-2 border border-white/10">
                    <div className="flex gap-2">
                        <button
                            onClick={() => onServerChange('vidsrc')}
                            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${currentServer === 'vidsrc'
                                ? 'bg-white text-black shadow-lg'
                                : 'bg-[#1a1a1a] text-gray-500'
                                }`}
                        >
                            Primary
                        </button>
                        <button
                            onClick={() => onServerChange('vidrock')}
                            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${currentServer === 'vidrock'
                                ? 'bg-white text-black shadow-lg'
                                : 'bg-[#1a1a1a] text-gray-500'
                                }`}
                        >
                            Mirror
                        </button>
                    </div>
                </div>
            </div>


        </div>
    );
};