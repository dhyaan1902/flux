
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

            <div className="flex flex-col items-center py-10">
                <div className="w-24 h-24 rounded-full bg-[#1a1a1a] flex items-center justify-center text-3xl font-bold text-gray-300 mb-4 border border-white/5 relative">
                    {userName.substring(0, 1).toUpperCase()}
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all">
                        <Edit3 className="w-4 h-4 text-black" />
                    </button>
                </div>

                {isEditingName ? (
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="bg-[#1a1a1a] text-white px-4 py-2 rounded-xl text-sm outline-none border border-white/10"
                            autoFocus
                        />
                        <button onClick={saveName} className="bg-white text-black px-4 py-2 rounded-md text-xs font-bold uppercase transition-all">Save</button>
                    </div>
                ) : (
                    <h2 className="text-xl font-bold text-white flex items-center gap-2" onClick={() => setIsEditingName(true)}>
                        {userName}
                    </h2>
                )}
            </div>

            {continueWatching.length > 0 && (
                <div className="py-6">
                    <h3 className="text-white text-[15px] font-semibold mb-4 px-6 tracking-tight">
                        Continue Watching
                    </h3>
                    <div className="flex overflow-x-auto gap-4 px-6 pb-4 scrollbar-hide snap-x snap-mandatory">
                        {continueWatching.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleContinue(item)}
                                className="flex-none w-[160px] snap-start cursor-pointer group relative"
                            >
                                <div className="aspect-[16/9] bg-[#0a0a0a] rounded-xl overflow-hidden mb-2 relative">
                                    <img
                                        src={item.posterUrl || `https://via.placeholder.com/200x300`}
                                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                                        alt={item.title}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 transition-colors group-active:bg-black/20">
                                        <PlayCircle className="w-10 h-10 text-white/20" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                                        <div className="h-full bg-white w-1/2 rounded-r-full opacity-60"></div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveFromHistory(item.id);
                                        }}
                                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white/80 active:bg-red-500/80 active:text-white transition-all"
                                        title="Remove from history"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <h4 className="text-[13px] font-semibold text-white/90 line-clamp-1 px-1">{item.title}</h4>
                                <p className="text-[11px] text-gray-500 font-medium px-1">
                                    {item.type === 'MOVIE' ? 'Movie' : `S${item.lastSeason} • E${item.lastEpisode}`}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="px-6 py-6">
                <h3 className="text-white text-[15px] font-semibold mb-4 flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-500" />
                    TMDB Configuration
                </h3>
                <div className="space-y-3">
                    <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5">
                        <label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider block mb-3">API Key (Private)</label>

                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder={isApiKeyLocked ? "••••••••••••••••" : "Paste your key here..."}
                                disabled={isApiKeyLocked}
                                className={`flex-1 text-[14px] px-4 py-3 rounded-xl border outline-none transition-all ${isApiKeyLocked
                                    ? 'bg-black text-gray-600 border-white/5'
                                    : 'bg-[#1a1a1a] text-white border-white/10 focus:border-white/20'
                                    }`}
                            />

                            {showKeyConfirm ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={confirmEdit}
                                        className="bg-white text-black px-5 py-3 rounded-xl text-xs font-bold transition-all"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="bg-[#1a1a1a] text-white px-5 py-3 rounded-xl text-xs font-bold border border-white/5 transition-all"
                                    >
                                        No
                                    </button>
                                </div>
                            ) : isApiKeyLocked ? (
                                <button
                                    onClick={handleEditKey}
                                    className="bg-[#1a1a1a] text-white px-5 py-3 rounded-xl text-xs font-bold border border-white/5 transition-all"
                                >
                                    Unlock
                                </button>
                            ) : (
                                <button
                                    onClick={saveKey}
                                    className="bg-white text-black px-5 py-3 rounded-md text-xs font-bold transition-all shadow-lg"
                                >
                                    Save
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4">
                <h3 className="text-white text-[15px] font-semibold mb-4 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-red-500" />
                    Playback Server
                </h3>
                <div className="bg-white/5 rounded-md p-1 border border-white/5">
                    <div className="flex gap-1">
                        <button
                            onClick={() => onServerChange('vidsrc')}
                            className={`flex-1 py-3 text-[13px] font-semibold rounded-md transition-all ${currentServer === 'vidsrc'
                                ? 'bg-white text-black'
                                : 'bg-transparent text-white/30'
                                }`}
                        >
                            Primary
                        </button>
                        <button
                            onClick={() => onServerChange('vidrock')}
                            className={`flex-1 py-3 text-[13px] font-semibold rounded-md transition-all ${currentServer === 'vidrock'
                                ? 'bg-white text-black'
                                : 'bg-transparent text-white/30'
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