import React, { useEffect, useRef, useState } from 'react';
import { X, Settings, Play, Pause, Maximize, Volume2, VolumeX, Loader2, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { AnimeEpisode, AnimeSource, AnimeProvider, AnimePlayerProps } from '../types';
import { getProviderStream } from '../services/anime';

declare global {
    interface Window {
        Hls: any;
    }
}

export const AnimePlayer: React.FC<AnimePlayerProps> = ({ 
    episode, 
    animeTitle, 
    imdbId, 
    anilistId, 
    mode, 
    language,
    sourceProvider,
    onSourceProviderChange,
    onClose,
    onProgress
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [loading, setLoading] = useState(true);
    const [buffering, setBuffering] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [sources, setSources] = useState<AnimeSource[]>([]);
    const [currentQuality, setCurrentQuality] = useState<string>('default');
    
    // Sync local provider state with global prop
    const [provider, setProvider] = useState<AnimeProvider>(sourceProvider);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const hlsRef = useRef<any>(null);

    // Record progress on mount/play
    useEffect(() => {
        onProgress();
    }, []);

    // Update global state when local provider changes
    const handleProviderChange = (newProvider: AnimeProvider) => {
        setProvider(newProvider);
        onSourceProviderChange(newProvider);
    };

    // --- MODE: VIDSRC (Iframe) ---
    if (mode === 'vidsrc') {
        let embedId = '';
        if (anilistId) {
            embedId = `ani${anilistId}`;
        } else if (imdbId) {
             embedId = `imdb${imdbId}`;
        }

        // language is 'sub' or 'dub'
        const src = embedId 
            ? `https://vidsrc.cc/v2/embed/anime/${embedId}/${episode.number}/${language}`
            : null;

        return (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300">
                <div className="absolute top-0 right-0 p-6 pt-safe pr-safe z-50">
                    <button 
                        onClick={onClose}
                        className="bg-black/40 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20 transition-all border border-white/10 shadow-lg active:scale-90"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 w-full h-full bg-black">
                     {src ? (
                        <iframe
                            src={src}
                            className="w-full h-full border-0"
                            allowFullScreen
                            allow="autoplay; encrypted-media; picture-in-picture"
                            sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-presentation"
                            title={`Playing ${animeTitle}`}
                        />
                     ) : (
                         <div className="flex flex-col items-center justify-center h-full text-center p-4">
                             <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
                             <p className="text-white font-bold text-lg mb-2">Unavailable on VidSrc</p>
                             <p className="text-gray-400 text-sm">Unable to resolve AniList ID or IMDb ID.</p>
                             <button onClick={onClose} className="mt-6 px-6 py-2 bg-white text-black font-bold rounded">Go Back</button>
                         </div>
                     )}
                </div>
            </div>
        );
    }

    // --- MODE: CONSUMET (Native HLS Player) ---

    // Watchdog for stuck buffering
    useEffect(() => {
        let watchdog: ReturnType<typeof setTimeout>;
        if (buffering) {
            watchdog = setTimeout(() => {
                if (buffering && videoRef.current) {
                    console.warn("Buffering stalled, attempting manual jump...");
                    // Try to nudge the video forward to skip bad segment
                    if (videoRef.current.readyState >= 2) {
                        videoRef.current.currentTime += 0.5;
                    }
                }
            }, 8000); // 8 seconds stuck check
        }
        return () => clearTimeout(watchdog);
    }, [buffering]);

    const fetchSrc = async () => {
        setLoading(true);
        setError(false);
        setErrorMessage('');
        setSources([]);
        
        try {
            const data = await getProviderStream(episode.id, provider, animeTitle, episode.number);
            
            if (data.length > 0) {
                setSources(data);
                // Prefer 'default', 'auto', or '1080p'
                const def = data.find(s => s.quality === 'default') || 
                            data.find(s => s.quality === 'auto') || 
                            data.find(s => s.quality === '1080p') ||
                            data[0];
                if (def) {
                    loadSource(def.url);
                    setCurrentQuality(def.quality || 'default');
                }
            } else {
                setError(true);
                setErrorMessage('No streams found for this provider.');
            }
        } catch (e) {
            console.error("Player Error:", e);
            setError(true);
            setErrorMessage('Failed to load stream.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch Sources when Episode OR Provider changes
    useEffect(() => {
        fetchSrc();
        return () => { 
            if (hlsRef.current) hlsRef.current.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [episode.id, provider, animeTitle, episode.number]);

    const loadSource = (url: string) => {
        const video = videoRef.current;
        if (!video) return;

        // Cleanup previous instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                maxBufferLength: 30, // 30 seconds buffer
                maxMaxBufferLength: 60,
                manifestLoadingTimeOut: 15000,
                manifestLoadingMaxRetry: 3,
                levelLoadingTimeOut: 15000,
                fragLoadingTimeOut: 20000,
                enableWorker: true
            });
            
            hlsRef.current = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            
            hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                safePlay(video);
            });

            // ROBUST ERROR HANDLING
            hls.on(window.Hls.Events.ERROR, function (event: any, data: any) {
                if (data.fatal) {
                    switch (data.type) {
                        case window.Hls.ErrorTypes.NETWORK_ERROR:
                            console.warn("fatal network error encountered, try to recover");
                            hls.startLoad();
                            break;
                        case window.Hls.ErrorTypes.MEDIA_ERROR:
                            console.warn("fatal media error encountered, try to recover");
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error("cannot recover, destroying HLS");
                            hls.destroy();
                            setError(true);
                            setErrorMessage('Playback failed. Try a different server/quality.');
                            break;
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = url;
            video.addEventListener('loadedmetadata', () => {
                safePlay(video);
            });
            video.addEventListener('error', () => {
                setError(true);
                setErrorMessage('Native playback failed.');
            });
        }
    };

    const safePlay = (video: HTMLVideoElement) => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    setIsPlaying(true);
                    setBuffering(false); // Clear buffering explicitly on success
                })
                .catch(e => {
                    console.warn("Autoplay interrupted/prevented:", e);
                    setIsPlaying(false);
                });
        }
    };

    const handleQualityChange = (source: AnimeSource) => {
        setCurrentQuality(source.quality);
        setSettingsOpen(false);
        const currentTime = videoRef.current?.currentTime || 0;
        const wasPlaying = isPlaying;
        
        loadSource(source.url);
        
        if (videoRef.current) {
            const restoreTime = () => {
                if(videoRef.current) {
                    videoRef.current.currentTime = currentTime;
                    if(wasPlaying) safePlay(videoRef.current);
                    videoRef.current.removeEventListener('loadedmetadata', restoreTime);
                }
            };
            videoRef.current.addEventListener('loadedmetadata', restoreTime);
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                safePlay(videoRef.current);
            }
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => console.log(e));
        } else {
            document.exitFullscreen().catch(e => console.log(e));
        }
    };

    // Native Buffer handling
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onWaiting = () => setBuffering(true);
        const onPlaying = () => setBuffering(false);
        const onPause = () => setIsPlaying(false);
        const onEmptied = () => setBuffering(true);

        video.addEventListener('waiting', onWaiting);
        video.addEventListener('playing', onPlaying);
        video.addEventListener('pause', onPause);
        video.addEventListener('emptied', onEmptied);
        
        return () => {
            video.removeEventListener('waiting', onWaiting);
            video.removeEventListener('playing', onPlaying);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('emptied', onEmptied);
        };
    }, []);

    // Auto-hide controls
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        const resetTimer = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setShowControls(false), 3000);
        };
        
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('touchstart', resetTimer);
        window.addEventListener('click', resetTimer);
        
        resetTimer();
        
        return () => {
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('touchstart', resetTimer);
            window.removeEventListener('click', resetTimer);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
            <video 
                ref={videoRef}
                className="w-full h-full object-contain bg-black"
                playsInline
                onClick={togglePlay}
                onEnded={() => {
                    setIsPlaying(false);
                    onProgress(); // Confirm watched
                }}
            />

            {/* Overlay: Loading / Error / Buffering */}
            {(loading || error || buffering) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none z-10 backdrop-blur-[2px]">
                    <div className="flex flex-col items-center gap-4 pointer-events-auto p-6 rounded-xl">
                        {loading || buffering ? (
                            <>
                                <Loader2 className="w-12 h-12 text-red-600 animate-spin drop-shadow-lg" />
                                <div className="flex flex-col items-center">
                                    <span className="text-white text-sm font-bold drop-shadow-md">
                                        {loading ? (provider === 'zoro' || provider === 'animepahe' ? `Searching ${provider}...` : 'Connecting...') : 'Buffering...'}
                                    </span>
                                    {buffering && !loading && (
                                        <span className="text-[10px] text-gray-300 mt-1">Check internet connection</span>
                                    )}
                                </div>
                            </>
                        ) : error ? (
                            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-white/10 flex flex-col items-center text-center">
                                <AlertTriangle className="w-8 h-8 text-yellow-500 mb-2" />
                                <span className="text-white text-sm font-bold mb-1">Stream Error</span>
                                <span className="text-xs text-gray-400 mb-4 max-w-[200px]">{errorMessage}</span>
                                <button 
                                    onClick={fetchSrc}
                                    className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-colors shadow-lg active:scale-95"
                                >
                                    <RefreshCw className="w-4 h-4" /> Retry
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Close Button */}
            <div className={`absolute top-0 right-0 p-6 pt-safe pr-safe z-50 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <button 
                    onClick={onClose}
                    className="bg-black/40 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20 transition-all border border-white/10 shadow-lg"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Bottom Controls */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pb-safe pt-12 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="text-white hover:text-red-500 transition-colors">
                            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                        </button>
                        
                        <button onClick={toggleMute} className="text-white hover:text-gray-300">
                            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                        </button>

                        <div className="text-white text-sm font-medium drop-shadow-md">
                            <span className="text-gray-400 mr-2 text-xs uppercase tracking-wider">Ep {episode.number}</span>
                            {episode.title || `Episode ${episode.number}`}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative">
                        {/* Settings */}
                        <div className="relative">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setSettingsOpen(!settingsOpen); }} 
                                className={`text-white hover:text-gray-300 transition-colors ${settingsOpen ? 'text-red-500' : ''}`}
                            >
                                <Settings className="w-6 h-6" />
                            </button>
                            
                            {settingsOpen && (
                                <div className="absolute bottom-full right-0 mb-4 bg-[#1a1a1a]/95 backdrop-blur-md rounded-lg shadow-2xl border border-white/10 w-56 overflow-hidden z-20 animate-in slide-in-from-bottom-5 duration-200">
                                    {/* Provider Section */}
                                    <div className="px-3 py-2 border-b border-white/10">
                                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Provider</div>
                                        <div className="flex flex-col gap-1">
                                            {(['animepahe', 'gogoanime', 'zoro'] as AnimeProvider[]).map((p) => (
                                                <button 
                                                    key={p}
                                                    onClick={() => handleProviderChange(p)}
                                                    className={`flex items-center justify-between text-xs px-3 py-2 rounded font-medium transition-colors ${provider === p ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                                >
                                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                                    {provider === p && <Check className="w-3 h-3 text-green-500" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quality Section */}
                                    <div className="px-3 py-2">
                                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Quality</div>
                                        {sources.length === 0 ? (
                                             <div className="text-xs text-gray-500 italic px-2">No streams</div>
                                        ) : (
                                            <div className="max-h-40 overflow-y-auto scrollbar-hide">
                                                {sources.map((src, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleQualityChange(src)}
                                                        className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-white/10 flex items-center justify-between transition-colors ${currentQuality === src.quality ? 'text-red-500 font-bold bg-white/5' : 'text-gray-300'}`}
                                                    >
                                                        {src.quality}
                                                        {currentQuality === src.quality && <Check className="w-3 h-3" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={toggleFullscreen} className="text-white hover:text-gray-300">
                            <Maximize className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};