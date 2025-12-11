
import { MediaType } from "../types";

export const getEmbedUrl = (server: string, tmdbId: string | number, imdbId: string | undefined, type: MediaType, season?: number, episode?: number) => {
    const isMovie = type === MediaType.MOVIE;
    // Prefer IMDb ID if available, otherwise fallback to TMDb ID
    const id = imdbId || tmdbId;

    switch (server) {
        case 'vidrock':
            // VidRock logic
            return isMovie
                ? `https://vidrock.net/movie/${id}`
                : `https://vidrock.net/tv/${id}/${season}/${episode}`;
        
        case 'vidsrc':
        default:
             // VidSrc logic
             return isMovie
                ? `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=false`
                : `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}?autoPlay=false`;
    }
};
