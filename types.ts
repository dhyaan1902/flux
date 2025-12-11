

export enum MediaType {
  MOVIE = 'MOVIE',
  TV_SHOW = 'TV_SHOW',
  UNKNOWN = 'UNKNOWN'
}

export type NavTab = 'home' | 'search' | 'new' | 'downloads' | 'my-netflix' | 'anime';

export type ServerProvider = 'vidsrc' | 'vidrock';

export type AnimeProvider = 'gogoanime' | 'zoro' | 'animepahe';

export type AnimePreference = 'consumet' | 'vidsrc';

export type AnimeLanguage = 'sub' | 'dub';

export interface Genre {
  id: number;
  name: string;
}

export interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  seasonNumber: number;
  releaseDate: string;
  rating: number;
  imageUrl?: string;
  overview?: string;
  imdbId?: string; 
}

export interface MediaItem {
  id: string; // Primary Key (TMDb ID as string)
  tmdbId: number;
  imdbId?: string; // Optional, populated via details
  title: string;
  year: string;
  type: MediaType;
  overview: string;
  director?: string;
  rating?: number;
  genres: string[];
  cast: string[];
  posterUrl?: string;
  backdropUrl?: string;
  totalSeasons?: number;
}

export interface SearchState {
  query: string;
  results: MediaItem[];
  loading: boolean;
  error: string | null;
}

export interface HomeRow {
  title: string;
  items: MediaItem[];
}

// --- WATCH HISTORY ---

export interface WatchProgress {
  [mediaId: string]: {
    lastWatched: number; // Timestamp
    lastSeason?: number;
    lastEpisode?: number;
    watchedEpisodes: string[]; // Array of "S{s}E{e}" strings or "MOVIE"
    title: string; // Saved for quick display in "Continue Watching"
    posterUrl?: string;
    type: 'MOVIE' | 'TV_SHOW' | 'ANIME';
  }
}

// --- ANIME TYPES ---

export interface AnimeItem {
  id: string; // AniList ID
  imdbId?: string; // Extracted from External Links
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  coverImage: string;
  bannerImage: string;
  description: string;
  genres: string[];
  averageScore: number;
  seasonYear?: number;
  episodes?: number;
  status?: string;
}

export interface AnimeEpisode {
  id: string; // Consumet Episode ID
  number: number;
  title?: string;
  image?: string;
  description?: string;
}

export interface AnimeSource {
  url: string;
  isM3U8: boolean;
  quality: string;
}

export interface AnimePlayerProps {
    episode: AnimeEpisode;
    animeTitle: string;
    imdbId?: string;
    anilistId?: string;
    mode: AnimePreference;
    language: AnimeLanguage;
    sourceProvider: AnimeProvider;
    onSourceProviderChange: (provider: AnimeProvider) => void;
    onClose: () => void;
    onProgress: () => void; // New prop to mark watched
}

export interface MyNetflixTabProps {
  myList: MediaItem[];
  watchHistory: WatchProgress; // New prop
  onItemClick: (item: MediaItem) => void;
  onAnimeClick: (item: AnimeItem) => void; // Handle continue watching anime
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
}

export interface AnimeTabProps {
    animePreference: AnimePreference;
    animeLanguage: AnimeLanguage;
    animeSource: AnimeProvider;
    onAnimeSourceChange: (source: AnimeProvider) => void;
    watchHistory: WatchProgress; // Pass down for status checks
    onUpdateHistory: (id: string, ep: number, title: string, img: string) => void;
}
