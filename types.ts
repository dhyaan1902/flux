
export enum MediaType {
  MOVIE = 'MOVIE',
  TV_SHOW = 'TV_SHOW',
  UNKNOWN = 'UNKNOWN'
}

export type NavTab = 'home' | 'search' | 'new' | 'library' | 'my-netflix';

export type ServerProvider = 'vidsrc' | 'vidrock';

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
  runtime?: number;
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
    type: 'MOVIE' | 'TV_SHOW';
  }
}

export interface MyNetflixTabProps {
  myList: MediaItem[];
  watchHistory: WatchProgress; // New prop
  onItemClick: (item: MediaItem) => void;
  currentServer: ServerProvider;
  onServerChange: (server: ServerProvider) => void;
  onRemoveFromMyList: (item: MediaItem) => void;
  onRemoveFromHistory: (id: string) => void;
}

// --- DOWNLOAD TYPES ---

export interface DownloadLink {
  quality: string;    // e.g., "1080p", "720p"
  size: string;       // e.g., "1.79 GB"
  url: string;        // Download URL
  category: string;   // e.g., "Mp4 Downloads", "MKV Downloads"
}
