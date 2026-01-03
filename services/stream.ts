import { MediaType } from '../types';

export const getEmbedUrl = (
  server: string,
  tmdbId: string | number,
  imdbId: string | undefined,
  type: MediaType,
  season?: number,
  episode?: number,
) => {
  const isMovie = type === MediaType.MOVIE;
  // Prefer IMDb ID if available, otherwise fallback to TMDb ID
  const id = imdbId || tmdbId;

  switch (server) {
    case 'vidrock':
      // VidRock logic
      return isMovie
        ? `https://vidrock.net/movie/${id}?autoplay=true&theme=4470ad`
        : `https://vidrock.net/tv/${id}/${season}/${episode}?autoplay=true&theme=4470ad`;

    case 'vidsrc':
    default:
      // VidSrc logic
      return isMovie
        ? `https://vidking.net/embed/movie/${id}?color=4470ad&autoPlay=true`
        : `https://vidking.net/embed/tv/${id}/${season}/${episode}?color=4470ad&autoPlay=true&episodeSelector=true`;
  }
};
