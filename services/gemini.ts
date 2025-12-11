
import { MediaItem, MediaType, HomeRow, Episode, Genre } from "../types";

// Dynamic API Key State
let currentTmdbApiKey = '6ff0134af92cbed738bb6ca01767c3d2';

export const setTmdbApiKey = (key: string) => {
    if (key && key.trim().length > 0) {
        currentTmdbApiKey = key;
    }
};

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
// Optimized Image Sizes to reduce memory/bandwidth
// Posters: w342 (approx 50KB) vs w500 (approx 150KB) - Cards are max 160px wide
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';
// Backdrops: w1280 (approx 300KB) vs original (approx 5MB+) - Sufficient for Full HD
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';
const CINEMETA_BASE = 'https://v3-cinemeta.strem.io';

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality",
  10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics"
};

interface RowConfig {
    title: string;
    endpoint: string;
    params?: Record<string, string>;
    mediaType?: MediaType;
    source?: 'tmdb' | 'cinemeta';
}

// Static configuration for the Main Feed with Aggregated Sources
const MAIN_FEED_CONFIGS: RowConfig[] = [
    { title: "Trending Movies", endpoint: "/trending/movie/week", mediaType: MediaType.MOVIE },
    { title: "Popular on Cinemeta (Movies)", endpoint: "/catalog/movie/top.json", source: 'cinemeta', mediaType: MediaType.MOVIE },
    { title: "Trending TV Shows", endpoint: "/trending/tv/week", mediaType: MediaType.TV_SHOW },
    { title: "Popular on Cinemeta (Series)", endpoint: "/catalog/series/top.json", source: 'cinemeta', mediaType: MediaType.TV_SHOW },
    { title: "Top Rated Movies", endpoint: "/movie/top_rated", mediaType: MediaType.MOVIE },
    { title: "Popular on Netflix", endpoint: "/tv/popular", mediaType: MediaType.TV_SHOW },
    { title: "Action Thrillers", endpoint: "/discover/movie", params: { with_genres: "28", sort_by: "popularity.desc" }, mediaType: MediaType.MOVIE },
    { title: "Sci-Fi & Fantasy TV", endpoint: "/discover/tv", params: { with_genres: "10765", sort_by: "popularity.desc" }, mediaType: MediaType.TV_SHOW },
    { title: "Comedy Hits", endpoint: "/discover/movie", params: { with_genres: "35", sort_by: "popularity.desc" }, mediaType: MediaType.MOVIE },
    { title: "Critically Acclaimed Dramas", endpoint: "/discover/movie", params: { with_genres: "18", 'vote_average.gte': '7' }, mediaType: MediaType.MOVIE },
    { title: "Animation for Everyone", endpoint: "/discover/movie", params: { with_genres: "16", sort_by: "popularity.desc" }, mediaType: MediaType.MOVIE },
    { title: "Crime TV Shows", endpoint: "/discover/tv", params: { with_genres: "80", sort_by: "popularity.desc" }, mediaType: MediaType.TV_SHOW },
    { title: "Horror Movies", endpoint: "/discover/movie", params: { with_genres: "27", sort_by: "popularity.desc" }, mediaType: MediaType.MOVIE },
    { title: "Romantic Getaways", endpoint: "/discover/movie", params: { with_genres: "10749", sort_by: "popularity.desc" }, mediaType: MediaType.MOVIE },
    { title: "Documentaries", endpoint: "/discover/movie", params: { with_genres: "99", sort_by: "popularity.desc" }, mediaType: MediaType.MOVIE },
    { title: "Kids' TV", endpoint: "/discover/tv", params: { with_genres: "10762", sort_by: "popularity.desc" }, mediaType: MediaType.TV_SHOW },
    { title: "Action & Adventure Series", endpoint: "/discover/tv", params: { with_genres: "10759", sort_by: "popularity.desc" }, mediaType: MediaType.TV_SHOW },
    { title: "Mystery Movies", endpoint: "/discover/movie", params: { with_genres: "9648", sort_by: "popularity.desc" }, mediaType: MediaType.MOVIE },
    { title: "War & Politics", endpoint: "/discover/tv", params: { with_genres: "10768", sort_by: "popularity.desc" }, mediaType: MediaType.TV_SHOW },
    { title: "Westerns", endpoint: "/discover/movie", params: { with_genres: "37", sort_by: "popularity.desc" }, mediaType: MediaType.MOVIE },
    { title: "Reality TV", endpoint: "/discover/tv", params: { with_genres: "10764", sort_by: "popularity.desc" }, mediaType: MediaType.TV_SHOW },
    { title: "Upcoming Movies", endpoint: "/movie/upcoming", params: { region: "US" }, mediaType: MediaType.MOVIE }
];

// --- Helpers ---

const fetchTmdb = async (endpoint: string, params: Record<string, string> = {}) => {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', currentTmdbApiKey);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TMDb Error: ${res.status}`);
    return res.json();
};

const fetchCinemeta = async (endpoint: string) => {
    const res = await fetch(`${CINEMETA_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`Cinemeta Error: ${res.status}`);
    return res.json();
};

const getImageUrl = (path?: string, type: 'poster' | 'backdrop' | 'still' = 'poster') => {
    if (!path) return undefined;
    if (type === 'backdrop') return `${TMDB_BACKDROP_BASE}${path}`;
    if (type === 'still') return `https://image.tmdb.org/t/p/w300${path}`;
    return `${TMDB_IMAGE_BASE}${path}`;
};

const transformTmdbItem = (item: any, mediaType?: MediaType): MediaItem => {
    let type = MediaType.UNKNOWN;
    if (mediaType) {
        type = mediaType;
    } else if (item.media_type === 'movie') {
        type = MediaType.MOVIE;
    } else if (item.media_type === 'tv') {
        type = MediaType.TV_SHOW;
    } else {
        type = item.title ? MediaType.MOVIE : MediaType.TV_SHOW;
    }

    const title = item.title || item.name || item.original_title || 'Unknown Title';
    const releaseDate = item.release_date || item.first_air_date || '';
    const year = releaseDate ? releaseDate.split('-')[0] : '';
    
    let genres: string[] = [];
    if (item.genres) {
        genres = item.genres.map((g: any) => g.name);
    } else if (item.genre_ids) {
        genres = item.genre_ids.map((id: number) => GENRE_MAP[id] || 'Unknown').filter((g: string) => g !== 'Unknown');
    }

    return {
        id: String(item.id),
        tmdbId: item.id,
        imdbId: item.external_ids?.imdb_id || undefined, 
        title,
        year,
        type,
        overview: item.overview || '',
        rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : undefined,
        posterUrl: getImageUrl(item.poster_path, 'poster'),
        backdropUrl: getImageUrl(item.backdrop_path, 'backdrop'),
        genres,
        cast: [], 
        totalSeasons: item.number_of_seasons,
        director: undefined 
    };
};

const transformCinemetaItem = (item: any): MediaItem => {
    const type = item.type === 'movie' ? MediaType.MOVIE : MediaType.TV_SHOW;
    // ReleaseInfo often format "2009" or "2010-2015"
    const year = item.releaseInfo ? item.releaseInfo.substring(0, 4) : '';
    
    return {
        id: item.imdb_id || item.id, // Prefer imdb_id if explicit, else id (usually tt...)
        tmdbId: 0, // No TMDB ID
        imdbId: item.imdb_id || item.id,
        title: item.name,
        year: year,
        type: type,
        overview: item.description || '',
        rating: item.imdbRating ? parseFloat(item.imdbRating) : undefined,
        posterUrl: item.poster,
        backdropUrl: item.background || item.poster, // Fallback to poster if background missing
        genres: item.genres || [],
        cast: item.cast || [],
        director: item.director ? item.director[0] : undefined,
        totalSeasons: undefined
    };
};

// --- Exports ---

export const fetchGenres = async (): Promise<Genre[]> => {
    try {
        const data = await fetchTmdb('/genre/movie/list');
        return data.genres || [];
    } catch (e) {
        return [];
    }
};

export const fetchHomeDataBatch = async (
    offset: number = 0, 
    limit: number = 3,
    genreId?: number, 
    genreName?: string,
    seenIds: Set<string> = new Set(),
    typeFilter?: MediaType | null
): Promise<{ rows: HomeRow[], hasMore: boolean }> => {
    try {
        let configs: RowConfig[] = [];

        if (genreId && genreName) {
            // GENRE BASED CONFIGS
            // We construct these dynamically based on the requested Type Filter or default to mixed
            const baseConfigs: RowConfig[] = [];

            if (!typeFilter || typeFilter === MediaType.MOVIE) {
                baseConfigs.push(
                    { title: `Popular ${genreName} Movies`, endpoint: '/discover/movie', params: { with_genres: String(genreId), sort_by: 'popularity.desc' }, mediaType: MediaType.MOVIE },
                    { title: `Top Rated ${genreName} Movies`, endpoint: '/discover/movie', params: { with_genres: String(genreId), sort_by: 'vote_average.desc', 'vote_count.gte': '200' }, mediaType: MediaType.MOVIE },
                    { title: `Classic ${genreName} Movies`, endpoint: '/discover/movie', params: { with_genres: String(genreId), sort_by: 'release_date.asc', 'vote_count.gte': '100' }, mediaType: MediaType.MOVIE },
                    { title: `New ${genreName} Releases`, endpoint: '/discover/movie', params: { with_genres: String(genreId), sort_by: 'release_date.desc', 'vote_count.gte': '50' }, mediaType: MediaType.MOVIE }
                );
            }
            
            if (!typeFilter || typeFilter === MediaType.TV_SHOW) {
                 baseConfigs.push(
                    { title: `Trending ${genreName} Shows`, endpoint: '/discover/tv', params: { with_genres: String(genreId), sort_by: 'popularity.desc' }, mediaType: MediaType.TV_SHOW },
                    { title: `Critically Acclaimed ${genreName} Series`, endpoint: '/discover/tv', params: { with_genres: String(genreId), sort_by: 'vote_average.desc', 'vote_count.gte': '200' }, mediaType: MediaType.TV_SHOW }
                 );
            }
            configs = baseConfigs;

        } else {
            // MAIN FEED
            if (typeFilter) {
                // Filter main feed by media type
                configs = MAIN_FEED_CONFIGS.filter(c => c.mediaType === typeFilter);
            } else {
                configs = MAIN_FEED_CONFIGS;
            }
        }

        const batchConfigs = configs.slice(offset, offset + limit);
        const hasMore = (offset + limit) < configs.length;

        if (batchConfigs.length === 0) {
            return { rows: [], hasMore: false };
        }

        const promises = batchConfigs.map(async (config) => {
            try {
                let items: MediaItem[] = [];
                
                if (config.source === 'cinemeta') {
                    const data = await fetchCinemeta(config.endpoint);
                    if (data.metas && Array.isArray(data.metas)) {
                        items = data.metas.map(transformCinemetaItem);
                    }
                } else {
                    const data = await fetchTmdb(config.endpoint, config.params);
                    items = data.results.map((i: any) => transformTmdbItem(i, config.mediaType));
                }
                
                return {
                    title: config.title,
                    items
                };
            } catch (e) {
                console.error(`Error fetching row ${config.title}:`, e);
                return null;
            }
        });

        const results = await Promise.all(promises);
        const validRows: HomeRow[] = [];

        // Sequentially process rows to apply deduplication state
        for (const res of results) {
            if (!res) continue;

            const uniqueItems: MediaItem[] = [];
            
            for (const item of res.items) {
                // Basic validation
                if (!item.posterUrl) continue;
                
                // Check if already displayed
                if (seenIds.has(item.id)) continue;

                uniqueItems.push(item);
            }

            // Only show rows that have enough unique items
            if (uniqueItems.length >= 4) {
                // Mark these items as seen now that we've committed to showing the row
                uniqueItems.forEach(i => seenIds.add(i.id));
                
                validRows.push({
                    title: res.title,
                    items: uniqueItems
                });
            }
        }

        return { rows: validRows, hasMore };

    } catch (e) {
        console.error("Home Data Batch Error:", e);
        return { rows: [], hasMore: false };
    }
};

export const getRecommendations = async (id: string, type: MediaType): Promise<MediaItem[]> => {
    try {
        const endpointType = type === MediaType.MOVIE ? 'movie' : 'tv';
        // Check for TMDB ID validity (simple numeric check)
        if (isNaN(Number(id))) return [];

        const data = await fetchTmdb(`/${endpointType}/${id}/recommendations`);
        return data.results.map((i: any) => transformTmdbItem(i, type));
    } catch (e) {
        console.error("Recommendations Error:", e);
        return [];
    }
};

export const getTopSearches = async (): Promise<MediaItem[]> => {
    try {
        const data = await fetchTmdb('/trending/all/day');
        return data.results.slice(0, 10).map((i: any) => transformTmdbItem(i));
    } catch (e) {
        return [];
    }
};

export const searchMediaCatalog = async (query: string): Promise<MediaItem[]> => {
    if (!query.trim()) return [];
    try {
        // 1. Fetch from TMDB
        const tmdbPromise = (async () => {
             // Check for year
             const yearMatch = query.trim().match(/^\d{4}$/);
             if (yearMatch) {
                 const year = yearMatch[0];
                 const [movies, tv] = await Promise.all([
                     fetchTmdb('/discover/movie', { primary_release_year: year, sort_by: 'popularity.desc' }),
                     fetchTmdb('/discover/tv', { first_air_date_year: year, sort_by: 'popularity.desc' })
                 ]);
                 const m = movies.results.map((i: any) => transformTmdbItem(i, MediaType.MOVIE));
                 const t = tv.results.map((i: any) => transformTmdbItem(i, MediaType.TV_SHOW));
                 return [...m, ...t];
             }
             
             const data = await fetchTmdb('/search/multi', { query });
             if (data.results[0]?.media_type === 'person') {
                 const personId = data.results[0].id;
                 const credits = await fetchTmdb(`/person/${personId}/combined_credits`);
                 return (credits.cast || [])
                     .filter((i: any) => i.media_type === 'movie' || i.media_type === 'tv')
                     .map((i: any) => transformTmdbItem(i));
             }
             return data.results
                 .filter((i: any) => i.media_type === 'movie' || i.media_type === 'tv')
                 .map((i: any) => transformTmdbItem(i));
        })();

        // 2. Fetch from Cinemeta
        const cinemetaPromise = (async () => {
            try {
                const [movies, series] = await Promise.all([
                    fetchCinemeta(`/catalog/movie/top/search=${encodeURIComponent(query)}.json`),
                    fetchCinemeta(`/catalog/series/top/search=${encodeURIComponent(query)}.json`)
                ]);
                const m = (movies.metas || []).map(transformCinemetaItem);
                const s = (series.metas || []).map(transformCinemetaItem);
                return [...m, ...s];
            } catch (e) {
                console.warn("Cinemeta Search Error", e);
                return [];
            }
        })();

        const [tmdbResults, cinemetaResults] = await Promise.all([tmdbPromise, cinemetaPromise]);

        // 3. Aggregate & Deduplicate
        // Priority: TMDB (usually better metadata structure for this app)
        const combined: MediaItem[] = [...tmdbResults];
        const seenKeys = new Set<string>();

        tmdbResults.forEach(item => {
            // Key: title_year (normalized)
            const key = `${item.title.trim().toLowerCase()}_${item.year}`;
            seenKeys.add(key);
        });

        cinemetaResults.forEach(item => {
            const key = `${item.title.trim().toLowerCase()}_${item.year}`;
            // If strictly not seen, add it.
            if (!seenKeys.has(key)) {
                combined.push(item);
                seenKeys.add(key); // prevent duplicates within cinemeta itself if any
            }
        });

        return combined;

    } catch (e) {
        console.error("Search Error:", e);
        return [];
    }
};

export const getMediaDetails = async (id: string, typeHint: MediaType = MediaType.MOVIE): Promise<MediaItem | null> => {
    try {
        let tmdbId = id;
        let finalType = typeHint;
        let isImdbId = id.startsWith('tt');

        // If it's a TMDB ID (numeric string), fetch directly from TMDB
        // If it's an IMDB ID, try to find it on TMDB first
        if (isImdbId) {
            const find = await fetchTmdb(`/find/${id}`, { external_source: 'imdb_id' });
            if (find.movie_results.length > 0) {
                tmdbId = find.movie_results[0].id;
                finalType = MediaType.MOVIE;
                isImdbId = false; // Successfully mapped to TMDB ID
            } else if (find.tv_results.length > 0) {
                tmdbId = find.tv_results[0].id;
                finalType = MediaType.TV_SHOW;
                isImdbId = false;
            } else {
                // Not found on TMDB, try Cinemeta Fallback
                console.log("TMDB lookup failed for IMDB ID, trying Cinemeta...", id);
                const metaType = typeHint === MediaType.MOVIE ? 'movie' : 'series';
                try {
                    const meta = await fetchCinemeta(`/meta/${metaType}/${id}.json`);
                    if (meta && meta.meta) {
                        return transformCinemetaItem(meta.meta);
                    }
                } catch(e) {
                    // Try the other type if first failed? No, assume hint is mostly correct or user is unlucky
                }
                return null;
            }
        }

        // Fetch standard TMDB details
        const endpointType = finalType === MediaType.MOVIE ? 'movie' : 'tv';
        const details = await fetchTmdb(`/${endpointType}/${tmdbId}`, {
            append_to_response: 'credits,external_ids,similar'
        });

        const item = transformTmdbItem(details, finalType);
        
        if (details.credits) {
            item.cast = details.credits.cast.slice(0, 10).map((c: any) => c.name);
            const director = details.credits.crew.find((c: any) => c.job === 'Director');
            if (director) item.director = director.name;
        }

        if (details.genres) {
            item.genres = details.genres.map((g: any) => g.name);
        }

        return item;
    } catch (e) {
        console.error("Details Error:", e);
        return null;
    }
};

export const getSeasonEpisodes = async (tmdbId: string | number, season: number): Promise<Episode[]> => {
    if (tmdbId === 0 || tmdbId === '0') {
        return [];
    }

    try {
        const data = await fetchTmdb(`/tv/${tmdbId}/season/${season}`);
        
        if (!data.episodes) return [];

        return data.episodes.map((ep: any) => ({
            id: String(ep.id),
            title: ep.name,
            episodeNumber: ep.episode_number,
            seasonNumber: ep.season_number,
            releaseDate: ep.air_date,
            rating: ep.vote_average,
            imageUrl: getImageUrl(ep.still_path, 'still'),
            overview: ep.overview,
            imdbId: undefined 
        }));
    } catch (e) {
        console.error("Episodes Error:", e);
        return [];
    }
};

