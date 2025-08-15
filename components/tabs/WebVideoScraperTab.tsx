import React, { useState, useRef } from 'react';
import { scrapeAndSummarizeUrl } from '../../services/geminiService';
import { ScrapedVideoData } from '../../types';
import Loader from '../Loader';
import { orangeBacolodLogo } from '../../data/logo';

declare global {
    interface Window {
        html2canvas: any;
    }
}

type Theme = 'light' | 'dark';

const WebVideoScraperTab: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [scrapedData, setScrapedData] = useState<ScrapedVideoData | null>(null);
    const [theme, setTheme] = useState<Theme>('light');
    const [urlInput, setUrlInput] = useState('');
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    const getYouTubeEmbedUrl = (url: string): string => {
        if (!url) return '';
        let videoId = '';
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname.includes('youtube.com')) {
                videoId = urlObj.searchParams.get('v') || '';
            } else if (urlObj.hostname.includes('youtu.be')) {
                videoId = urlObj.pathname.slice(1);
            }
        } catch (e) {
            // Handle cases where URL is not valid, though this is unlikely for video URLs
            console.error("Invalid URL for embedding:", url, e);
            return url;
        }
        
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        }
        // For non-YouTube URLs, just return the URL and hope it works in an iframe.
        return url;
    };

    const handleGenerate = async () => {
        if (!urlInput.trim()) {
            setError('Please enter a valid URL.');
            return;
        }
        setLoading(true);
        setError('');
        setScrapedData(null);
        setIsVideoPlaying(false);
        try {
            const data = await scrapeAndSummarizeUrl(urlInput);
            setScrapedData(data);
        } catch (err) {
            console.error(err);
            setError('Failed to scrape and summarize the URL. The AI might be having issues, or the URL is not accessible.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        const canvasElement = canvasRef.current;
        if (!canvasElement || !window.html2canvas) return;

        // Hide video player before capture
        const player = canvasElement.querySelector('.video-player-iframe');
        if (player) (player as HTMLElement).style.display = 'none';
        
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        setTimeout(() => {
            window.html2canvas(canvasElement, {
                width: 1080,
                height: 1080,
                scale: 1,
                useCORS: true,
                backgroundColor: null,
            }).then((canvas: HTMLCanvasElement) => {
                const link = document.createElement('a');
                link.download = 'bacolod-web-scraper-post.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                 // Show video player again after capture
                if (player) (player as HTMLElement).style.display = 'block';
            });
        }, 100);
    };

    // Shared components from Social Media Trivia
    const commonWhiteStroke = { textShadow: '-1.5px -1.5px 0 #FFF, 1.5px -1.5px 0 #FFF, -1.5px 1.5px 0 #FFF, 1.5px 1.5px 0 #FFF' };
    const blueTextStyle = { color: '#1d4ed8', ...commonWhiteStroke };
    const orangeTextStyle = { color: '#f97316', ...commonWhiteStroke };
    const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
    const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
    
    // Background patterns
    const lightBgPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
    const darkBgPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

    const t = {
        light: { mainText: 'text-gray-800', secondaryText: 'text-gray-600', accent: 'text-orange-600', footerText: 'text-gray-600', border: 'border-gray-200', cardBg: 'bg-white/80', shadow: 'shadow-md', communiqueHashtag: 'text-orange-300' },
        dark: { mainText: 'text-gray-100', secondaryText: 'text-gray-300', accent: 'text-orange-400', footerText: 'text-gray-400', border: 'border-gray-700', cardBg: 'bg-gray-800/80', shadow: 'shadow-lg shadow-black/20', communiqueHashtag: 'text-orange-400' }
    }[theme];

    const facebookPageUrl = 'https://www.facebook.com/profile.php?id=61577834145424';
    const qrCodeUrl = theme === 'light' 
        ? `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(facebookPageUrl)}&bgcolor=ffffff&color=000000&qzone=1`
        : `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(facebookPageUrl)}&bgcolor=1f2937&color=ffffff&qzone=1`;

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 mr-3 text-orange-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 7.5v6l5.25-3-5.25-3z" />
                </svg>
                WEB Video Scraper
            </h2>
            <p className="text-gray-600 mb-6">Enter a URL to a news article or video page. The AI will summarize it, find a video, and create a social media post.</p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                    <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-1">
                        Enter URL to Scrape
                    </label>
                    <input
                        id="url-input"
                        type="url"
                        placeholder="https://example.com/news/article"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                        disabled={loading}
                    />
                </div>
                <button onClick={handleGenerate} className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg w-full disabled:bg-gray-400" disabled={loading}>
                    {loading ? 'AI is Scraping...' : 'Generate Post'}
                </button>
                <button onClick={handleDownload} className="btn bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg w-full disabled:bg-gray-400" disabled={!scrapedData}>
                    Download Image
                </button>
            </div>
            
            {loading && <Loader text="Scraping URL and generating content..." />}
            {error && <div className="text-center my-4 bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">{error}</div>}

            <div className="flex justify-end items-center mb-4">
                <span className="text-sm font-medium text-gray-700 mr-3">Theme:</span>
                <div className="flex rounded-lg p-1 bg-gray-200">
                    <button onClick={() => setTheme('light')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${theme === 'light' ? 'bg-white text-orange-600 shadow' : 'text-gray-600'}`}>Light</button>
                    <button onClick={() => setTheme('dark')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${theme === 'dark' ? 'bg-gray-800 text-white shadow' : 'text-gray-600'}`}>Dark</button>
                </div>
            </div>

            <div className="p-4 border-2 border-dashed border-orange-300 rounded-lg overflow-x-auto bg-gray-100 flex justify-center">
                <div 
                    ref={canvasRef} 
                    className={`w-[1080px] h-[1080px] font-['Inter'] flex flex-col p-16 transition-colors duration-300 ${theme === 'light' ? 'bg-orange-50' : 'bg-gray-900'}`} 
                    style={{backgroundImage: theme === 'light' ? lightBgPattern : darkBgPattern}}>
                    
                    <header className="flex-shrink-0 flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <img src={orangeBacolodLogo} alt="BAC Logo" className="h-28" />
                            <div>
                                <h1 className={`text-6xl font-black tracking-tighter ${t.mainText}`}>BACOLOD</h1>
                                <h2 className={`text-7xl font-extrabold ${t.accent}`}>NEWS & UPDATES</h2>
                            </div>
                        </div>
                        <div className={`text-right text-2xl font-semibold`}>
                            <p className={`${t.secondaryText}`}>Bids and Awards Committee</p>
                            <p className={`${t.secondaryText}`}>Bacolod City</p>
                            <p style={{ fontFamily: 'cursive, "Brush Script MT"' }} className="text-2xl font-bold mt-1">
                                <span style={blueTextStyle}>Stron</span><span style={orangeTextStyle}>g</span><span style={blueTextStyle}>er To</span><span style={orangeTextStyle}>g</span><span style={blueTextStyle}>ether</span>
                            </p>
                        </div>
                    </header>
                    
                    <main className="flex-grow flex flex-col justify-center items-center my-8 overflow-hidden">
                       {scrapedData ? (
                            <div className={`p-8 rounded-2xl w-full h-full flex flex-col justify-between ${t.cardBg} ${t.shadow}`} style={{ backdropFilter: 'blur(10px)' }}>
                                <h3 className={`text-5xl font-extrabold text-center leading-tight ${t.mainText}`}>{scrapedData.title}</h3>
                                
                                <div className="w-full aspect-video rounded-xl overflow-hidden my-6 relative shadow-lg">
                                    {!isVideoPlaying && scrapedData.videoUrl && (
                                        <div className="w-full h-full cursor-pointer group" onClick={() => setIsVideoPlaying(true)}>
                                            <img src={scrapedData.thumbnailUrl || 'https://i.ibb.co/x7P39M6/placeholder-thumbnail.png'} alt="Video Thumbnail" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://i.ibb.co/x7P39M6/placeholder-thumbnail.png'; }} />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity opacity-70 group-hover:opacity-100">
                                                <svg className="w-24 h-24 text-white/80 group-hover:text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                            </div>
                                        </div>
                                    )}
                                    {isVideoPlaying && (
                                        <div className="absolute inset-0 video-player-iframe">
                                            <iframe
                                                src={getYouTubeEmbedUrl(scrapedData.videoUrl)}
                                                title="Video Player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="w-full h-full"
                                            ></iframe>
                                            <button onClick={() => setIsVideoPlaying(false)} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 z-10 hover:bg-black">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    )}
                                    {!scrapedData.videoUrl && <img src={scrapedData.thumbnailUrl || 'https://i.ibb.co/x7P39M6/placeholder-thumbnail.png'} alt="Article Thumbnail" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://i.ibb.co/x7P39M6/placeholder-thumbnail.png'; }} />}
                                </div>
                                
                                <p className={`text-2xl leading-normal text-center ${t.secondaryText}`}>{scrapedData.summary}</p>
                            </div>
                       ) : (
                           <div className={`text-center h-full flex items-center justify-center ${t.secondaryText}`}>
                               <p className="text-2xl">Enter a URL and click "Generate Post" to see the magic!</p>
                           </div>
                       )}
                    </main>
                    
                    <footer className="flex-shrink-0 flex flex-col items-center justify-end text-center mt-auto pt-4 space-y-4">
                        {scrapedData && (
                            <div className="w-full p-2 rounded-lg bg-black/50">
                                <p className={`p-1 rounded-md text-xl font-semibold transition-colors duration-200 ${t.communiqueHashtag}`}>
                                    {scrapedData.hashtags}
                                </p>
                            </div>
                        )}
                        <div className={`w-full p-6 rounded-xl flex items-center ${theme === 'light' ? 'bg-white' : 'bg-gray-800'} ${t.shadow}`}>
                            <div className="w-2/3 pr-6">
                                <div className="grid grid-cols-3 gap-x-5 text-left">
                                    <div className="flex items-start space-x-3"><LocationIcon /><div><strong className={`font-semibold block text-sm ${t.mainText}`}>Address</strong><p className={`text-xs ${t.footerText}`}>3rd Flr, Masskara Hall, BCGC, Brgy. Villamonte, Bacolod City</p></div></div>
                                    <div className="flex items-start space-x-3"><PhoneIcon /><div><strong className={`font-semibold block text-sm ${t.mainText}`}>Mobile No.</strong><p className={`text-xs ${t.footerText}`}>09486268509</p></div></div>
                                    <div className="flex items-start space-x-3"><EmailIcon /><div><strong className={`font-semibold block text-sm ${t.mainText}`}>E-mail</strong><p className={`text-xs ${t.footerText}`}>bac@bacolodcity.gov.ph</p></div></div>
                                </div>
                            </div>
                            <div className={`w-1/3 pl-6 flex items-center space-x-4 border-l ${t.border}`}>
                                <a href={facebookPageUrl} target="_blank" rel="noopener noreferrer"><img src={qrCodeUrl} alt="Facebook Page QR Code" className="h-[90px] w-[90px] rounded-md flex-shrink-0" /></a>
                                <div className="text-left">
                                    <a href={facebookPageUrl} target="_blank" rel="noopener noreferrer">
                                        <p className={`font-black text-xl leading-tight ${t.mainText}`}>BACOLOD CITY</p>
                                        <p className={`font-semibold text-base leading-tight ${t.accent}`}>Bids and Awards Committee</p>
                                        <div className="flex items-center mt-1 space-x-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className={`${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}><path fill="currentColor" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-1 0-1.5.5-1.5 1.5V12h3l-.5 3h-2.5v6.8A10 10 0 0 0 22 12z"/></svg>
                                            <span className={`text-xs underline ${t.footerText}`}>Follow us on Facebook</span>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default WebVideoScraperTab;