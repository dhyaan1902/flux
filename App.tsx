
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavTab, MediaItem, HomeRow, ServerProvider, AnimePreference, AnimeLanguage, AnimeProvider, WatchProgress, AnimeItem, MediaType, Genre } from './types';
import { fetchHomeDataBatch, fetchGenres, setTmdbApiKey } from './services/gemini';
import { BottomNav } from './components/BottomNav';
import { TopBar } from './components/TopBar';
import { Hero } from './components/Hero';
import { Row } from './components/Row';
import { SearchTab } from './components/SearchTab';
import { MediaDetailModal } from './components/MediaDetailModal';
import { VideoPlayer } from './components/VideoPlayer';
import { MyNetflixTab } from './components/MyNetflixTab';
import { AnimeTab } from './components/AnimeTab';
import { AnimeDetailModal } from './components/AnimeDetailModal';
import { CastModal } from './components/CastModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  
  // Infinite Scroll State
  const [homeRows, setHomeRows] = useState<HomeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  // Cast Modal State
  const [isCastOpen, setIsCastOpen] = useState(false);

  // Deduplication Ref
  const seenIds = useRef<Set<string>>(new Set());

  const [heroItem, setHeroItem] = useState<MediaItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [selectedAnimeItem, setSelectedAnimeItem] = useState<AnimeItem | null>(null);

  // Observer for Infinite Scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const bottomRef = useCallback((node: HTMLDivElement) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting && hasMore) {
              loadMoreRows();
          }
      });
      
      if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);
  
  // --- FILTER STATE ---
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaType | null>(null);
  
  // --- STATE PERSISTENCE ---

  const [myList, setMyList] = useState<MediaItem[]>(() => {
      try {
          const saved = localStorage.getItem('myList');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          return [];
      }
  });

  const [watchHistory, setWatchHistory] = useState<WatchProgress>(() => {
      try {
          const saved = localStorage.getItem('watchHistory');
          return saved ? JSON.parse(saved) : {};
      } catch (e) {
          return {};
      }
  });

  const [server, setServer] = useState<ServerProvider>(() => {
      try {
          // Fallback safely if previous value was a now-deleted provider
          const saved = localStorage.getItem('serverProvider') as string;
          if (saved === 'vidsrc' || saved === 'vidrock') return saved;
          return 'vidsrc';
      } catch {
          return 'vidsrc';
      }
  });

  // User Preferences
  const [userName, setUserName] = useState<string>(() => {
      try { return localStorage.getItem('userName') || 'John Smith'; } catch { return 'John Smith'; }
  });

  const [tmdbApiKey, setTmdbApiKeyState] = useState<string>(() => {
      try { return localStorage.getItem('tmdbApiKey') || ''; } catch { return ''; }
  });
  
  const [animePreference, setAnimePreference] = useState<AnimePreference>(() => {
      try {
          return (localStorage.getItem('animePreference') as AnimePreference) || 'consumet';
      } catch {
          return 'consumet';
      }
  });

  const [animeLanguage, setAnimeLanguage] = useState<AnimeLanguage>(() => {
      try {
          return (localStorage.getItem('animeLanguage') as AnimeLanguage) || 'sub';
      } catch {
          return 'sub';
      }
  });

  const [animeSource, setAnimeSource] = useState<AnimeProvider>(() => {
      try {
          return (localStorage.getItem('animeSource') as AnimeProvider) || 'animepahe';
      } catch {
          return 'animepahe';
      }
  });

  // --- EFFECT SAVERS ---

  useEffect(() => {
      localStorage.setItem('myList', JSON.stringify(myList));
  }, [myList]);

  useEffect(() => {
      localStorage.setItem('watchHistory', JSON.stringify(watchHistory));
  }, [watchHistory]);

  useEffect(() => {
      localStorage.setItem('serverProvider', server);
  }, [server]);
  
  useEffect(() => {
      localStorage.setItem('animePreference', animePreference);
  }, [animePreference]);

  useEffect(() => {
      localStorage.setItem('animeLanguage', animeLanguage);
  }, [animeLanguage]);

  useEffect(() => {
      localStorage.setItem('animeSource', animeSource);
  }, [animeSource]);

  useEffect(() => {
      localStorage.setItem('userName', userName);
  }, [userName]);

  useEffect(() => {
      localStorage.setItem('tmdbApiKey', tmdbApiKey);
      setTmdbApiKey(tmdbApiKey); // Update the service singleton
  }, [tmdbApiKey]);

  // --- PLAYER STATE ---
  const [playerState, setPlayerState] = useState<{
      isOpen: boolean;
      item: MediaItem | null;
      season: number;
      episode: number;
  }>({ isOpen: false, item: null, season: 1, episode: 1 });

  // --- BACK BUTTON LOGIC ---
  const stateRef = useRef({
      activeTab,
      playerOpen: playerState.isOpen,
      hasItem: !!selectedItem,
      hasAnime: !!selectedAnimeItem,
      isCastOpen: isCastOpen
  });

  useEffect(() => {
      stateRef.current = {
          activeTab,
          playerOpen: playerState.isOpen,
          hasItem: !!selectedItem,
          hasAnime: !!selectedAnimeItem,
          isCastOpen: isCastOpen
      };
  }, [activeTab, playerState.isOpen, selectedItem, selectedAnimeItem, isCastOpen]);

  useEffect(() => {
      // Trap history on mount
      window.history.pushState(null, '', window.location.href);

      const handlePopState = (e: PopStateEvent) => {
          const { activeTab, playerOpen, hasItem, hasAnime, isCastOpen } = stateRef.current;
          
          let handled = false;

          // Priority: Player > Modals > Navigation
          if (playerOpen) {
              setPlayerState(prev => ({ ...prev, isOpen: false }));
              if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
              handled = true;
          } else if (isCastOpen) {
              setIsCastOpen(false);
              handled = true;
          } else if (hasAnime) {
              setSelectedAnimeItem(null);
              handled = true;
          } else if (hasItem) {
              setSelectedItem(null);
              handled = true;
          } else if (activeTab !== 'home') {
              setActiveTab('home');
              handled = true;
          }

          if (handled) {
              // Re-arm the trap so the next back press is also caught
              window.history.pushState(null, '', window.location.href);
          }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- DATA LOADING ---

  // Load Genres on Mount and Select Random
  useEffect(() => {
      fetchGenres().then(data => {
          setGenres(data);
          // Randomly select a genre on initial app load
          if (data.length > 0) {
              const randomIndex = Math.floor(Math.random() * data.length);
              setSelectedGenreId(data[randomIndex].id);
          }
      });
  }, []);

  // Initial Load (when Genre, Type or Tab changes)
  useEffect(() => {
    if (activeTab !== 'home') return;

    let isMounted = true;

    const init = async () => {
      setLoading(true);
      setHomeRows([]);
      setOffset(0);
      setHasMore(true);
      seenIds.current.clear(); // Clear dedup set on refresh

      const genreName = selectedGenreId ? genres.find(g => g.id === selectedGenreId)?.name : undefined;
      // Reduced batch size to 2 to improve memory and initial load
      const { rows, hasMore: more } = await fetchHomeDataBatch(0, 2, selectedGenreId || undefined, genreName, seenIds.current, mediaTypeFilter);
      
      if (isMounted) {
        setHomeRows(rows);
        setOffset(2);
        setHasMore(more);
        
        if (rows.length > 0) {
            // Hero selection logic: prefer first row, random item
            const firstRowItems = rows[0].items;
            if (firstRowItems.length > 0) {
                const randomItemIndex = Math.floor(Math.random() * Math.min(5, firstRowItems.length));
                setHeroItem(firstRowItems[randomItemIndex]);
            }
        } else {
            setHeroItem(null);
        }
        setLoading(false);
      }
    };
    init();
    
    return () => { isMounted = false; };
  }, [selectedGenreId, genres, activeTab, mediaTypeFilter]);

  // Infinite Scroll Loader
  const loadMoreRows = async () => {
      if (loadingMore || !hasMore) return;
      setLoadingMore(true);

      const genreName = selectedGenreId ? genres.find(g => g.id === selectedGenreId)?.name : undefined;
      // Load 2 rows at a time
      const { rows, hasMore: more } = await fetchHomeDataBatch(offset, 2, selectedGenreId || undefined, genreName, seenIds.current, mediaTypeFilter);

      setHomeRows(prev => [...prev, ...rows]);
      setOffset(prev => prev + 2);
      setHasMore(more);
      setLoadingMore(false);
  };

  // --- HANDLERS ---

  const toggleMyList = (item: MediaItem) => {
      setMyList(prev => {
          const exists = prev.find(i => i.id === item.id);
          if (exists) {
              return prev.filter(i => i.id !== item.id);
          }
          return [...prev, item];
      });
  };

  const removeFromMyList = (item: MediaItem) => {
      setMyList(prev => prev.filter(i => i.id !== item.id));
  };

  const removeFromHistory = (id: string) => {
      setWatchHistory(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
      });
  };

  const isInMyList = (id: string) => {
      return myList.some(i => i.id === id);
  };

  const updateWatchHistory = (
    id: string, 
    type: 'MOVIE' | 'TV_SHOW' | 'ANIME', 
    title: string, 
    posterUrl: string | undefined,
    season: number = 1, 
    episode: number = 1
  ) => {
      setWatchHistory(prev => {
          const record = prev[id] || { 
              watchedEpisodes: [], 
              title, 
              posterUrl, 
              type 
          };

          const epKey = type === 'MOVIE' ? 'MOVIE' : `S${season}E${episode}`;
          const newWatched = new Set(record.watchedEpisodes);
          newWatched.add(epKey);

          return {
              ...prev,
              [id]: {
                  ...record,
                  lastWatched: Date.now(),
                  lastSeason: season,
                  lastEpisode: episode,
                  watchedEpisodes: Array.from(newWatched),
                  title,
                  posterUrl,
                  type
              }
          };
      });
  };

  const handlePlay = (season: number = 1, episode: number = 1) => {
    const itemToPlay = selectedItem || heroItem;
    
    if (itemToPlay) {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
            docEl.requestFullscreen().catch(err => console.log(err));
        } else if ((docEl as any).webkitRequestFullscreen) {
            (docEl as any).webkitRequestFullscreen();
        }

        setPlayerState({
            isOpen: true,
            item: itemToPlay,
            season,
            episode
        });
        
        setSelectedItem(null);
    }
  };

  const closePlayer = () => {
      setPlayerState(prev => ({ ...prev, isOpen: false }));
      if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(err => console.log(err));
      } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
      }
  };

  const handleOpenAnimeFromHistory = (item: AnimeItem) => {
      setSelectedAnimeItem(item);
      setActiveTab('anime'); 
  };

  return (
    <div className="bg-[#000000] min-h-screen text-white font-sans overflow-x-hidden">
      
      {activeTab === 'home' && (
        <>
           <TopBar 
                genres={genres} 
                selectedGenreId={selectedGenreId} 
                onSelectGenre={setSelectedGenreId}
                mediaType={mediaTypeFilter}
                onSelectMediaType={setMediaTypeFilter}
                onCastClick={() => setIsCastOpen(true)}
                userName={userName}
           />
           <div className="pb-24">
             {loading && homeRows.length === 0 ? (
               <div className="flex items-center justify-center h-screen">
                  <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
               </div>
             ) : (
                <>
                   {heroItem && (
                     <Hero 
                       item={heroItem} 
                       onPlay={() => handlePlay(1, 1)} 
                       onInfo={() => setSelectedItem(heroItem)}
                       isInMyList={isInMyList(heroItem.id)}
                       onToggleMyList={() => toggleMyList(heroItem)}
                     />
                   )}
                   <div className="mt-4 md:-mt-32 relative z-10 space-y-2 min-h-screen">
                       {homeRows.map((row, i) => (
                           <Row 
                             key={`${row.title}-${i}`} 
                             title={row.title} 
                             items={row.items} 
                             onItemClick={setSelectedItem} 
                           />
                       ))}
                       
                       {/* Loading Skeleton / Sentinel */}
                       <div ref={bottomRef} className="h-24 w-full flex items-center justify-center">
                           {loadingMore && <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />}
                       </div>

                       {homeRows.length === 0 && !loading && (
                           <div className="text-center py-20 text-gray-500">
                               No content found for this category.
                           </div>
                       )}
                   </div>
                </>
             )}
           </div>
        </>
      )}

      {activeTab === 'search' && (
         <SearchTab onItemClick={setSelectedItem} />
      )}

      {activeTab === 'anime' && (
         <AnimeTab 
            animePreference={animePreference}
            animeLanguage={animeLanguage}
            animeSource={animeSource}
            onAnimeSourceChange={setAnimeSource}
            watchHistory={watchHistory}
            onUpdateHistory={(id, ep, title, img) => updateWatchHistory(id, 'ANIME', title, img, 1, ep)}
         />
      )}

      {activeTab === 'my-netflix' && (
          <MyNetflixTab 
            myList={myList}
            watchHistory={watchHistory} 
            onItemClick={setSelectedItem}
            onAnimeClick={handleOpenAnimeFromHistory} 
            currentServer={server}
            onServerChange={setServer}
            animePreference={animePreference}
            onAnimePreferenceChange={setAnimePreference}
            animeLanguage={animeLanguage}
            onAnimeLanguageChange={setAnimeLanguage}
            animeSource={animeSource}
            onAnimeSourceChange={setAnimeSource}
            onRemoveFromMyList={removeFromMyList}
            onRemoveFromHistory={removeFromHistory}
            userName={userName}
            setUserName={setUserName}
            apiKey={tmdbApiKey}
            setApiKey={setTmdbApiKeyState}
          />
      )}

      {(activeTab === 'new' || activeTab === 'downloads') && (
         <div className="flex flex-col items-center justify-center h-screen pb-20">
             <div className="text-gray-500 font-bold text-xl">Coming Soon</div>
         </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} userName={userName} />

      {/* MEDIA MODAL (Movies/TV) */}
      {selectedItem && (
        <MediaDetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onPlay={handlePlay}
          isInMyList={isInMyList(selectedItem.id)}
          onToggleMyList={() => toggleMyList(selectedItem)}
          watchHistory={watchHistory}
        />
      )}

      {/* ANIME MODAL */}
      {selectedAnimeItem && activeTab !== 'anime' && (
         <AnimeDetailModal 
            anime={selectedAnimeItem}
            onClose={() => setSelectedAnimeItem(null)}
            onPlay={() => {}} 
            watchHistory={watchHistory}
         />
      )}

      {/* CAST MODAL */}
      {isCastOpen && (
          <CastModal onClose={() => setIsCastOpen(false)} />
      )}

      {/* VIDEO PLAYER (Movies/TV) */}
      {playerState.isOpen && playerState.item && (
        <VideoPlayer 
          item={playerState.item}
          season={playerState.season}
          episode={playerState.episode}
          server={server}
          onClose={closePlayer}
          onProgress={() => updateWatchHistory(
              playerState.item!.id, 
              playerState.item!.type === MediaType.MOVIE ? 'MOVIE' : 'TV_SHOW',
              playerState.item!.title,
              playerState.item!.posterUrl,
              playerState.season,
              playerState.episode
          )}
        />
      )}

    </div>
  );
};

export default App;

