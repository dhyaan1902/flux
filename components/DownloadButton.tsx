
import React, { useState, useRef, useEffect } from 'react';
import { Download, Loader2, AlertCircle, X, ChevronRight } from 'lucide-react';
import { MediaType, DownloadLink } from '../types';
import { fetchDownloadLinks } from '../services/download';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

interface DownloadButtonProps {
    tmdbId: number;
    type: MediaType;
    title: string;
    season?: number;
    episode?: number;
    variant?: 'icon-label' | 'large-button';
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
    tmdbId,
    type,
    title,
    season,
    episode,
    variant = 'icon-label'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [links, setLinks] = useState<DownloadLink[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleButtonClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (links.length === 0 && !loading) {
            setLoading(true);
            setError(null);
            try {
                const downloadLinks = await fetchDownloadLinks(tmdbId, type, season, episode);
                if (downloadLinks.length === 0) {
                    setError(!Capacitor.isNativePlatform() ? '⚠️ Browser testing not supported for POST download links. Use Android.' : 'No download links found');
                } else {
                    setLinks(downloadLinks);
                }
                setIsOpen(true);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load links');
                setIsOpen(true);
            } finally {
                setLoading(false);
            }
        } else {
            setIsOpen(true);
        }
    };

    const handleDownload = async (link: DownloadLink) => {
        if (Capacitor.isNativePlatform()) {
            await Browser.open({ url: link.url });
        } else {
            const a = document.createElement('a');
            a.href = link.url;
            a.target = '_blank';
            a.download = '';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        setIsOpen(false);
    };

    // Group links by category
    const groupedLinks = links.reduce((acc, link) => {
        if (!acc[link.category]) acc[link.category] = [];
        acc[link.category].push(link);
        return acc;
    }, {} as Record<string, DownloadLink[]>);

    return (
        <>
            {variant === 'icon-label' ? (
                <button
                    className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
                    onClick={handleButtonClick}
                >
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 active:bg-white/10 transition-colors">
                        {loading ? (
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : error ? (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : (
                            <Download className="w-5 h-5 text-white" />
                        )}
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">Download</span>
                </button>
            ) : (
                <button
                    onClick={handleButtonClick}
                    className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl border border-white/5 active:scale-95 transition-transform"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                        <Download className="w-5 h-5 text-white" />
                    )}
                </button>
            )}

            {/* Bottom Sheet Menu */}
            {isOpen && (
                <div className="fixed inset-0 z-[200] animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

                    <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-3xl border-t border-white/10 p-6 animate-in slide-in-from-bottom duration-500 pb-safe">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h4 className="text-white font-black text-xl tracking-tight">Download Options</h4>
                                <p className="text-gray-500 text-xs mt-0.5">{title}</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {error ? (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-4">
                                <p className="text-red-500 text-sm font-medium">{error}</p>
                            </div>
                        ) : (
                            <div className="space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar pb-4">
                                {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
                                    <div key={category}>
                                        <h5 className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-3 px-1">{category}</h5>
                                        <div className="grid grid-cols-1 gap-2.5">
                                            {categoryLinks.map((link, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleDownload(link)}
                                                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 active:bg-white/10 rounded-2xl border border-white/5 transition-all text-left group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center group-active:scale-90 transition-transform">
                                                            <Download className="w-5 h-5 text-red-500" />
                                                        </div>
                                                        <div>
                                                            <div className="text-white text-sm font-bold">{link.quality}</div>
                                                            {link.size && <div className="text-gray-500 text-[11px] font-medium">{link.size}</div>}
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-gray-700" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {links.length === 0 && !loading && !error && (
                                    <p className="text-center text-gray-600 py-10 font-bold">No sources available</p>
                                )}
                            </div>
                        )}

                        <p className="text-center text-gray-600 text-[9px] font-bold tracking-tight mt-4 uppercase">
                            FLUX Download Manager • {type === MediaType.MOVIE ? 'Movie' : 'TV Series'}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};
