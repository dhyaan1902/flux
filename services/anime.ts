
import { AnimeItem, AnimeEpisode, AnimeSource, AnimeProvider } from "../types";

const ANILIST_API_URL = 'https://graphql.anilist.co';

// List of Consumet mirrors to try.
// We include multiple deployments to maximize uptime.
const CONSUMET_PROXIES = [
    'https://consumet-api-clone.vercel.app',
    'https://consumet-jade.vercel.app',
    'https://consumet-api-2.vercel.app',
    'https://consumet-api-1.vercel.app',
    'https://c.delusionz.xyz',
    'https://consumet-api-f9b.vercel.app',
    'https://api.consumet.org',
    'https://consumet-api-production-e9e6.up.railway.app'
];

// Helper to shuffle array for load balancing
const shuffle = (array: string[]) => {
    return array.sort(() => Math.random() - 0.5);
};

// Helper to cycle through proxies with validation and delay
const fetchConsumet = async (endpoint: string, validate?: (data: any) => boolean): Promise<any> => {
    let lastError;
    // Shuffle proxies each time to avoid hammering one failing instance
    const proxies = shuffle([...CONSUMET_PROXIES]);

    for (const baseUrl of proxies) {
        try {
            // endpoint should start with /
            const url = `${baseUrl}${endpoint}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error(`Status ${res.status}`);
            
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                throw new Error("Invalid JSON response");
            }
            
            // If a validation function is provided, check the data
            if (validate && !validate(data)) {
                throw new Error("Data validation failed (empty response)");
            }
            
            return data;
        } catch (e) {
            console.warn(`Proxy failed (${baseUrl}):`, e);
            lastError = e;
            // Slight delay before next retry to avoid browser network congestion
            await new Promise(r => setTimeout(r, 200));
        }
    }
    throw lastError || new Error("All Consumet proxies failed");
};

// --- ANILIST (Catalog) ---

const ANILIST_QUERY = `
query ($page: Int, $perPage: Int, $sort: [MediaSort], $search: String) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: $sort, search: $search) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
      }
      bannerImage
      description
      averageScore
      genres
      seasonYear
      episodes
      status
      externalLinks {
        site
        url
      }
    }
  }
}
`;

const fetchAniList = async (variables: any): Promise<AnimeItem[]> => {
    try {
        const response = await fetch(ANILIST_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: ANILIST_QUERY,
                variables
            })
        });
        
        const data = await response.json();
        if (!data.data || !data.data.Page || !data.data.Page.media) return [];

        return data.data.Page.media.map((m: any) => {
            // Extract IMDb ID from external links
            const imdbLink = m.externalLinks?.find((l: any) => l.site === 'IMDb');
            const imdbId = imdbLink ? imdbLink.url.split('/').pop() : undefined;

            return {
                id: String(m.id),
                imdbId: imdbId,
                title: m.title,
                coverImage: m.coverImage.extraLarge || m.coverImage.large,
                bannerImage: m.bannerImage,
                description: m.description,
                genres: m.genres,
                averageScore: m.averageScore,
                seasonYear: m.seasonYear,
                episodes: m.episodes,
                status: m.status
            };
        });
    } catch (e) {
        console.error("AniList Fetch Error:", e);
        return [];
    }
};

export const getTrendingAnime = async (): Promise<AnimeItem[]> => {
    return fetchAniList({ page: 1, perPage: 20, sort: 'TRENDING_DESC' });
};

export const getPopularAnime = async (): Promise<AnimeItem[]> => {
    return fetchAniList({ page: 1, perPage: 20, sort: 'POPULARITY_DESC' });
};

export const searchAnime = async (query: string): Promise<AnimeItem[]> => {
    return fetchAniList({ page: 1, perPage: 20, search: query, sort: 'POPULARITY_DESC' });
};

// --- CONSUMET (Streaming) ---

export const getAnimeEpisodes = async (anilistId: string, titleFallback?: string): Promise<AnimeEpisode[]> => {
    try {
        // Consumet maps AniList IDs directly in its /info endpoint for 'meta/anilist'
        const data = await fetchConsumet(
            `/meta/anilist/info/${anilistId}`, 
            (d) => d.episodes && Array.isArray(d.episodes) && d.episodes.length > 0
        );
        
        return data.episodes.map((ep: any) => ({
            id: ep.id,
            number: ep.number,
            title: ep.title,
            image: ep.image,
            description: ep.description
        }));
    } catch (e) {
        // Fallback: Gogoanime Direct Search
        if (titleFallback) {
            try {
                console.warn(`Meta fetch failed for ID ${anilistId}, trying Gogoanime fallback for "${titleFallback}"...`);
                // 1. Search for the anime title on Gogoanime
                const search = await fetchConsumet(
                    `/anime/gogoanime/${encodeURIComponent(titleFallback)}`,
                    (d) => d.results && d.results.length > 0
                );
                
                const match = search.results[0]; // Naive first match
                if (match) {
                    // 2. Get Info for the Gogoanime ID
                    const info = await fetchConsumet(
                        `/anime/gogoanime/info/${match.id}`,
                        (d) => d.episodes && d.episodes.length > 0
                    );
                    
                    // 3. Map episodes
                    return info.episodes.map((ep: any) => ({
                        id: ep.id,
                        number: ep.number,
                        title: ep.title || `Episode ${ep.number}`,
                        image: null, // Gogo usually doesn't provide ep thumbs in this endpoint
                        description: null
                    }));
                }
            } catch (fallbackErr) {
                console.error("Fallback Gogo Search Failed:", fallbackErr);
            }
        }

        console.error("Consumet Episode Fetch Error:", e);
        return [];
    }
};

const getAnimeSources = async (episodeId: string): Promise<AnimeSource[]> => {
    try {
        const data = await fetchConsumet(
            `/meta/anilist/watch/${episodeId}?server=gogocdn`, // Request gogocdn for stability
            (d) => d.sources && Array.isArray(d.sources) && d.sources.length > 0
        );
        
        // Normalize sources
        return data.sources.map((s: any) => ({
            url: s.url,
            isM3U8: s.isM3U8,
            quality: s.quality
        }));
    } catch (e) {
        console.error("Consumet Source Fetch Error:", e);
        return [];
    }
};

// Complex logic to support switching providers
export const getProviderStream = async (
    defaultEpisodeId: string, 
    provider: AnimeProvider, 
    animeTitle: string, 
    episodeNumber: number
): Promise<AnimeSource[]> => {
    
    // 1. GogoAnime (Legacy)
    if (provider === 'gogoanime') {
        return getAnimeSources(defaultEpisodeId);
    }

    // 2. Zoro (HiAnime)
    if (provider === 'zoro') {
        try {
            // Step A: Search for the anime on Zoro
            const searchData = await fetchConsumet(
                `/anime/zoro/${encodeURIComponent(animeTitle)}`,
                (d) => d.results && d.results.length > 0
            );
            const bestMatch = searchData.results[0]; // Naive first match
            if (!bestMatch) throw new Error("Anime not found on Zoro");

            // Step B: Get Info to find episode ID
            const infoData = await fetchConsumet(
                `/anime/zoro/info/${bestMatch.id}`,
                (d) => d.episodes && d.episodes.length > 0
            );
            
            // Step C: Find the matching episode number
            const targetEp = infoData.episodes.find((e: any) => e.number === episodeNumber);
            if (!targetEp) throw new Error(`Episode ${episodeNumber} not found on Zoro`);

            // Step D: Get Sources
            const streamData = await fetchConsumet(
                `/anime/zoro/watch?episodeId=${targetEp.id}`,
                (d) => d.sources && d.sources.length > 0
            );

            return streamData.sources.map((s: any) => ({
                url: s.url,
                isM3U8: s.isM3U8,
                quality: s.quality
            }));

        } catch (e) {
            console.error("Zoro Fetch Error:", e);
            return [];
        }
    }

    // 3. AnimePahe (Preferred/Best)
    if (provider === 'animepahe') {
        try {
            // Step A: Search on AnimePahe
            const searchData = await fetchConsumet(
                `/anime/animepahe/${encodeURIComponent(animeTitle)}`,
                (d) => d.results && d.results.length > 0
            );
            const bestMatch = searchData.results[0];
            if (!bestMatch) throw new Error("Anime not found on AnimePahe");

            // Step B: Get Info
            const infoData = await fetchConsumet(
                `/anime/animepahe/info/${bestMatch.id}`,
                (d) => d.episodes && d.episodes.length > 0
            );

            // Step C: Find Episode
            const targetEp = infoData.episodes.find((e: any) => e.number === episodeNumber);
            if (!targetEp) throw new Error(`Episode ${episodeNumber} not found on AnimePahe`);

            // Step D: Get Sources
            const streamData = await fetchConsumet(
                `/anime/animepahe/watch/${targetEp.id}`,
                (d) => d.sources && d.sources.length > 0
            );

            return streamData.sources.map((s: any) => ({
                url: s.url,
                isM3U8: s.isM3U8,
                quality: s.quality || 'default'
            }));

        } catch (e) {
            console.error("AnimePahe Fetch Error:", e);
            return [];
        }
    }

    // Fallback: Default Gogoanime but with fallback handling if ID is from fallback search
    try {
         // If we are here, we might be using a non-standard ID from a fallback
         // Try standard getAnimeSources
         return await getAnimeSources(defaultEpisodeId);
    } catch(e) {
        return [];
    }
};
