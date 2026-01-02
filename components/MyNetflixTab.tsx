
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
            <div className="pt-safe px-4 pb-4 sticky top-0 bg-black/95 z-20 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">My Netflix</h1>
            </div>

            <div className="flex flex-col items-center py-6 border-b border-gray-800/50">
                <div className="w-20 h-20 rounded bg-blue-600 flex items-center justify-center text-2xl font-bold text-white mb-2 shadow-xl border-2 border-white/10 relative group">
                    {userName.substring(0, 2).toUpperCase()}
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <Settings className="w-3 h-3 text-black" />
                    </div>
                </div>

                {isEditingName ? (
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="bg-[#333] text-white px-2 py-1 rounded text-sm outline-none border border-gray-600"
                            autoFocus
                        />
                        <button onClick={saveName} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">Save</button>
                    </div>
                ) : (
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-1" onClick={() => setIsEditingName(true)}>
                        {userName}
                        <Edit3 className="w-4 h-4 text-gray-500 cursor-pointer" />
                    </h2>
                )}
            </div>

            {continueWatching.length > 0 && (
                <div className="py-6 border-b border-gray-800/50">
                    <h3 className="text-white font-bold mb-3 px-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-white" />
                        Continue Watching
                    </h3>
                    <div className="flex overflow-x-auto gap-3 px-4 pb-4 scrollbar-hide snap-x snap-mandatory">
                        {continueWatching.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleContinue(item)}
                                className="flex-none w-[140px] snap-start cursor-pointer group relative"
                            >
                                <div className="aspect-[16/9] bg-[#222] rounded overflow-hidden mb-2 relative border border-white/10">
                                    <img
                                        src={item.posterUrl || `https://via.placeholder.com/200x300`}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        alt={item.title}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <PlayCircle className="w-8 h-8 text-white/80 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                                        <div className="h-full bg-red-600 w-1/2"></div>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); onRemoveFromHistory(item.id); }}
                                    className="absolute top-1 right-1 z-10 bg-black/60 hover:bg-red-600 text-white p-1 rounded-full transition-colors backdrop-blur-sm"
                                >
                                    <X className="w-3 h-3" />
                                </button>

                                <h4 className="text-xs font-bold text-gray-200 line-clamp-1">{item.title}</h4>
                                <p className="text-[10px] text-gray-500">
                                    {item.type === 'MOVIE' ? 'Movie' : `S${item.lastSeason} : E${item.lastEpisode}`}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="px-4 py-6 border-b border-gray-800/50">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Key className="w-4 h-4 text-yellow-500" />
                    API Configuration
                </h3>
                <div className="space-y-3">
                    <div className="bg-[#1a1a1a] p-3 rounded-md border border-white/5">
                        <label className="text-xs text-gray-400 block mb-1">TMDB API Key (Private)</label>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder={isApiKeyLocked ? "••••••••••••••••" : "Enter your TMDB Key..."}
                                disabled={isApiKeyLocked}
                                className={`flex-1 text-sm px-3 py-2 rounded border outline-none transition-colors ${isApiKeyLocked
                                    ? 'bg-[#262626] text-gray-500 border-transparent cursor-not-allowed'
                                    : 'bg-black/50 text-white border-gray-700 focus:border-red-600'
                                    }`}
                            />

                            {showKeyConfirm ? (
                                <div className="flex gap-2 animate-in fade-in slide-in-from-right-4">
                                    <button
                                        onClick={confirmEdit}
                                        className="bg-red-600 text-white px-3 py-2 rounded text-xs font-bold whitespace-nowrap"
                                    >
                                        Sure?
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="bg-[#333] text-white px-3 py-2 rounded text-xs font-bold"
                                    >
                                        No
                                    </button>
                                </div>
                            ) : isApiKeyLocked ? (
                                <button
                                    onClick={handleEditKey}
                                    className="bg-[#333] hover:bg-[#444] text-white px-4 py-2 rounded text-xs font-bold transition-colors"
                                >
                                    Edit
                                </button>
                            ) : (
                                <button
                                    onClick={saveKey}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-xs font-bold transition-colors"
                                >
                                    Add
                                </button>
                            )}
                        </div>

                        <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                            {isApiKeyLocked ? (
                                <><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Key is saved and secure.</>
                            ) : (
                                "Your key is stored locally on your device only."
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-4 py-6 border-b border-gray-800/50">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-red-500" />
                    Playback Server
                </h3>
                <div className="bg-[#1a1a1a] rounded-md p-2 flex flex-col gap-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => onServerChange('vidsrc')}
                            className={`flex-1 py-3 text-sm font-bold rounded transition-all ${currentServer === 'vidsrc'
                                ? 'bg-red-600 text-white shadow-md'
                                : 'bg-[#262626] text-gray-400 hover:text-white'
                                }`}
                        >
                            Server 1
                        </button>
                        <button
                            onClick={() => onServerChange('vidrock')}
                            className={`flex-1 py-3 text-sm font-bold rounded transition-all ${currentServer === 'vidrock'
                                ? 'bg-red-600 text-white shadow-md'
                                : 'bg-[#262626] text-gray-400 hover:text-white'
                                }`}
                        >
                            Server 2
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-500 px-1">
                        📺 Embed player - reliable across all devices
                    </p>
                </div>
            </div>


        </div>
    );
};