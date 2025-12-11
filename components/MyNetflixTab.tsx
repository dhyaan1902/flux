import React, { useState } from 'react';
import { MediaItem, ServerProvider, AnimePreference, AnimeLanguage, AnimeProvider, WatchProgress, AnimeItem, MediaType } from '../types';
import { ChevronRight, Bell, Settings, Wifi, Smartphone, Menu, Ghost, PlayCircle, Clock, X, Edit3, Key } from 'lucide-react';

interface MyNetflixTabProps {
  myList: MediaItem[];
  watchHistory: WatchProgress;
  onItemClick: (item: MediaItem) => void;
  onAnimeClick: (item: AnimeItem) => void;
  currentServer: ServerProvider;
  onServerChange: (server: ServerProvider) => void;
  animePreference: AnimePreference;
  onAnimePreferenceChange: (pref: AnimePreference) => void;
  animeLanguage: AnimeLanguage;
  onAnimeLanguageChange: (lang: AnimeLanguage) => void;
  animeSource: AnimeProvider;
  onAnimeSourceChange: (source: AnimeProvider) => void;
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
    onAnimeClick,
    currentServer, 
    onServerChange,
    animePreference,
    onAnimePreferenceChange,
    animeLanguage,
    onAnimeLanguageChange,
    animeSource,
    onAnimeSourceChange,
    onRemoveFromMyList,
    onRemoveFromHistory,
    userName,
    setUserName,
    apiKey,
    setApiKey
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [omdbKey, setOmdbKey] = useState(''); // Placeholder for OMDb key (visual mostly as per requirement, or valid if extended)

  // Convert history map to array and sort by last watched
  const continueWatching = Object.entries(watchHistory)
      .map(([id, data]) => ({ id, ...(data as any) }))
      .sort((a, b) => b.lastWatched - a.lastWatched);

  const handleContinue = (item: any) => {
      if (item.type === 'ANIME') {
          // Reconstruct partial AnimeItem for navigation
          onAnimeClick({
              id: item.id,
              title: { romaji: item.title, english: item.title, native: item.title },
              coverImage: item.posterUrl,
              bannerImage: item.posterUrl,
              genres: [],
              description: '',
              averageScore: 0
          } as AnimeItem);
      } else {
          // Reconstruct partial MediaItem for navigation
          onItemClick({
              id: item.id,
              tmdbId: Number(item.id), // Assuming ID is tmdbId
              title: item.title,
              type: item.type === 'MOVIE' ? MediaType.MOVIE : MediaType.TV_SHOW,
              posterUrl: item.posterUrl,
              year: '',
              overview: '',
              genres: [],
              cast: []
          } as MediaItem);
      }
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
           <div className="flex items-center gap-4">
               <button className="text-white"><Menu className="w-6 h-6" /></button>
           </div>
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

        {/* CONTINUE WATCHING ROW */}
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
                                {/* Progress Bar (Simulated) */}
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

        {/* API SETTINGS */}
        <div className="px-4 py-6 border-b border-gray-800/50">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Key className="w-4 h-4 text-yellow-500" />
                API Configuration
            </h3>
            <div className="space-y-3">
                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-white/5">
                    <label className="text-xs text-gray-400 block mb-1">TMDB API Key (Custom)</label>
                    <input 
                        type="text" 
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your TMDB Key..."
                        className="w-full bg-black/50 text-white text-sm px-3 py-2 rounded border border-gray-700 focus:border-red-600 outline-none"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Leave empty to use default shared key.</p>
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-white/5">
                    <label className="text-xs text-gray-400 block mb-1">OMDb API Key (Optional)</label>
                    <input 
                        type="text" 
                        value={omdbKey}
                        onChange={(e) => setOmdbKey(e.target.value)}
                        placeholder="Enter your OMDb Key..."
                        className="w-full bg-black/50 text-white text-sm px-3 py-2 rounded border border-gray-700 focus:border-red-600 outline-none"
                    />
                </div>
            </div>
        </div>

        <div className="px-4 py-6 border-b border-gray-800/50">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-red-500" />
                Playback Server
            </h3>
            <div className="bg-[#1a1a1a] rounded-lg p-2 flex flex-col gap-2">
                <div className="flex gap-2">
                    <button
                        onClick={() => onServerChange('vidsrc')}
                        className={`flex-1 py-3 text-sm font-bold rounded transition-all ${
                            currentServer === 'vidsrc' 
                            ? 'bg-red-600 text-white shadow-md' 
                            : 'bg-[#262626] text-gray-400 hover:text-white'
                        }`}
                    >
                        VidSrc (Default)
                    </button>
                    <button
                        onClick={() => onServerChange('vidrock')}
                        className={`flex-1 py-3 text-sm font-bold rounded transition-all ${
                            currentServer === 'vidrock' 
                            ? 'bg-red-600 text-white shadow-md' 
                            : 'bg-[#262626] text-gray-400 hover:text-white'
                        }`}
                    >
                        VidRock (Backup)
                    </button>
                </div>
            </div>
        </div>
        
        <div className="px-4 py-6 border-b border-gray-800/50">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Ghost className="w-4 h-4 text-indigo-500" />
                Anime Settings
            </h3>
            
            <div className="mb-4">
                <span className="text-xs text-gray-400 font-medium mb-2 block ml-1">Provider Mode</span>
                <div className="bg-[#1a1a1a] rounded-lg p-1.5 flex gap-1">
                    <button
                        onClick={() => onAnimePreferenceChange('consumet')}
                        className={`flex-1 py-2 text-xs md:text-sm font-medium rounded transition-all ${
                            animePreference === 'consumet' 
                            ? 'bg-[#333] text-white shadow-sm ring-1 ring-white/10' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Consumet
                    </button>
                    <button
                        onClick={() => onAnimePreferenceChange('vidsrc')}
                        className={`flex-1 py-2 text-xs md:text-sm font-medium rounded transition-all ${
                            animePreference === 'vidsrc' 
                            ? 'bg-[#333] text-white shadow-sm ring-1 ring-white/10' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        VidSrc
                    </button>
                </div>
            </div>

            {animePreference === 'consumet' && (
                <div className="mb-4 animate-in fade-in duration-300">
                    <span className="text-xs text-gray-400 font-medium mb-2 block ml-1">Consumet Source</span>
                    <div className="bg-[#1a1a1a] rounded-lg p-1.5 flex gap-1">
                         {(['animepahe', 'gogoanime', 'zoro'] as AnimeProvider[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => onAnimeSourceChange(p)}
                                className={`flex-1 py-2 text-xs md:text-sm font-medium rounded transition-all capitalize ${
                                    animeSource === p 
                                    ? 'bg-[#333] text-white shadow-sm ring-1 ring-white/10' 
                                    : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {p}
                            </button>
                         ))}
                    </div>
                </div>
            )}
        </div>

       <div className="px-4 pt-8">
           <h3 className="text-lg font-bold text-white mb-4">TV Shows & Movies You Liked</h3>
           
           {myList.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-10 opacity-50 border-2 border-dashed border-[#333] rounded-lg">
                   <p className="text-gray-400 text-sm mb-2">You haven't liked any content yet.</p>
                   <p className="text-xs text-gray-600 text-center px-8">Tap the 'My List' button on any movie or show to add it to your personal collection.</p>
               </div>
           ) : (
               <div className="grid grid-cols-3 gap-3">
                   {myList.map(item => (
                       <div 
                           key={item.id}
                           onClick={() => onItemClick(item)} 
                           className="relative aspect-[2/3] bg-[#222] rounded overflow-hidden cursor-pointer active:scale-95 transition-transform group"
                       >
                           <img 
                               src={item.posterUrl || `https://via.placeholder.com/200x300`}
                               className="w-full h-full object-cover"
                               alt={item.title}
                           />
                           <div className="absolute top-1 left-1 bg-red-600 text-[8px] font-bold px-1 rounded-sm text-white">N</div>

                           <button 
                                onClick={(e) => { e.stopPropagation(); onRemoveFromMyList(item); }}
                                className="absolute top-1 right-1 z-10 bg-black/60 hover:bg-red-600 text-white p-1 rounded-full transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
                           >
                                <X className="w-3 h-3" />
                           </button>
                       </div>
                   ))}
               </div>
           )}
       </div>
    </div>
  );
};