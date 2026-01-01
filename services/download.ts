import { MediaType, DownloadLink } from '../types';
import { CapacitorHttp } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';

/**
 * Fetch download links from vidsrc.vip
 * Bypasses the slider challenge by sending POST request with slider=100
 */
export const fetchDownloadLinks = async (
    tmdbId: number,
    type: MediaType,
    season?: number,
    episode?: number
): Promise<DownloadLink[]> => {
    try {
        const isMovie = type === MediaType.MOVIE;
        const url = isMovie
            ? `https://dl.vidsrc.vip/movie/${tmdbId}`
            : `https://dl.vidsrc.vip/tv/${tmdbId}/${season}/${episode}`;

        // Prepare form data to bypass slider challenge
        const formData = isMovie
            ? `movieId=${tmdbId}&slider=100`
            : `tvId=${tmdbId}&season=${season}&episode=${episode}&slider=100`;

        let html: string = '';

        // Check if running on native platform or web
        if (Capacitor.isNativePlatform()) {
            console.log('[download.ts] Using native CapacitorHttp');
            // Make POST request using native CapacitorHttp to bypass CORS
            const response = await CapacitorHttp.post({
                url: url,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'https://vidsrc.vip/',
                    'Origin': 'https://vidsrc.vip'
                },
                data: formData,
            });

            console.log('[download.ts] Native response status:', response.status);
            html = response.data;
        } else {
            console.log('[download.ts] Using CORS proxy for browser testing');

            // Try multiple CORS proxies in order
            const proxies = [
                'https://api.allorigins.win/raw?url=',
                'https://corsproxy.io/?',
                'https://thingproxy.freeboard.io/fetch/',
            ];

            let lastError: Error | null = null;

            for (const corsProxy of proxies) {
                try {
                    const proxiedUrl = corsProxy + encodeURIComponent(url);
                    console.log('[download.ts] Trying proxy:', corsProxy);

                    const response = await fetch(proxiedUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: formData,
                    });

                    console.log('[download.ts] Proxy response status:', response.status);

                    if (response.ok) {
                        html = await response.text();
                        console.log('[download.ts] Successfully fetched via proxy:', corsProxy);
                        break;
                    } else {
                        throw new Error(`Proxy returned ${response.status}`);
                    }
                } catch (error) {
                    console.warn('[download.ts] Proxy failed:', corsProxy, error);
                    lastError = error instanceof Error ? error : new Error(String(error));
                }
            }

            if (!html) {
                throw new Error('All CORS proxies failed. Please test on Android device. Last error: ' + lastError?.message);
            }
        }

        console.log('[download.ts] Response data type:', typeof html);
        console.log('[download.ts] Response data length:', html?.length);

        // Check if we got the slider challenge page instead of download page
        if (html.includes('Slide to Continue')) {
            console.error('[download.ts] Got slider challenge page - POST request not forwarded properly');
            if (!Capacitor.isNativePlatform()) {
                throw new Error('Browser CORS proxies cannot forward POST requests. Please build and test on Android device where native HTTP works.');
            }
        }

        // Parse HTML response
        const links = parseDownloadLinks(html);

        console.log('[download.ts] Parsed links:', links);

        return links;
    } catch (error) {
        console.error('[download.ts] Error fetching download links:', error);
        if (error instanceof Error) {
            console.error('[download.ts] Error message:', error.message);
            console.error('[download.ts] Error stack:', error.stack);
        }
        throw new Error('Failed to fetch download links: ' + (error instanceof Error ? error.message : String(error)));
    }
};

/**
 * Parse HTML to extract download links
 * Looks for buttons with class "download-button" and extracts onclick attribute
 */
const parseDownloadLinks = (html: string): DownloadLink[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    console.log('[parseDownloadLinks] HTML snippet:', html.substring(0, 500));
    console.log('[parseDownloadLinks] Title tag:', doc.querySelector('title')?.textContent);

    const links: DownloadLink[] = [];
    const buttons = doc.querySelectorAll('.download-button');

    console.log('[parseDownloadLinks] Found buttons:', buttons.length);

    buttons.forEach((button, index) => {
        const text = button.textContent?.trim() || '';
        const onclick = button.getAttribute('onclick') || '';

        console.log(`[parseDownloadLinks] Button ${index}:`, { text: text.substring(0, 50), onclick: onclick.substring(0, 100) });

        // Extract URL from onclick="triggerDownload(this, 'URL')"
        const urlMatch = onclick.match(/triggerDownload\(this,\s*'([^']+)'/);
        if (!urlMatch) {
            console.log(`[parseDownloadLinks] Button ${index}: No URL match`);
            return;
        }

        const url = urlMatch[1];

        // Parse quality and size from text like "1080p (1.79 GB)"
        const qualityMatch = text.match(/(\d+p)/);
        const sizeMatch = text.match(/\(([^)]+)\)/);

        const quality = qualityMatch ? qualityMatch[1] : 'Unknown';
        const size = sizeMatch ? sizeMatch[1] : '';

        // Determine category from parent section
        const parentSection = button.closest('.download-links');
        const categoryHeader = parentSection?.previousElementSibling;
        const category = categoryHeader?.textContent?.trim() || 'Downloads';

        console.log(`[parseDownloadLinks] Button ${index} parsed:`, { quality, size, category, url: url.substring(0, 50) });

        links.push({
            quality,
            size,
            url,
            category,
        });
    });

    return links;
};

/**
 * Extract filename from download URL
 */
export const getFilenameFromUrl = (url: string): string => {
    try {
        const urlObj = new URL(url);
        const filenameParam = urlObj.searchParams.get('n');
        if (filenameParam) {
            return decodeURIComponent(filenameParam);
        }

        // Fallback to extracting from path
        const pathParts = urlObj.pathname.split('/');
        return pathParts[pathParts.length - 1] || 'download';
    } catch {
        return 'download';
    }
};
