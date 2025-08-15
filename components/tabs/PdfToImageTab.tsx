import React, { useState, useRef } from 'react';
import Loader from '../Loader';

declare global {
    interface Window {
        pdfjsLib: any;
    }
}

const PdfToImageTab: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                setError('Please upload a valid PDF file.');
                setFile(null);
            } else {
                setFile(selectedFile);
                setError('');
                setImageUrls([]);
            }
        }
    };

    const handleConvert = async () => {
        if (!file) {
            setError('Please select a PDF file first.');
            return;
        }

        setLoading(true);
        setError('');
        setImageUrls([]);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
            const numPages = pdf.numPages;
            const urls: string[] = [];

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 }); // Increase scale for higher quality
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (context) {
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    await page.render(renderContext).promise;
                    urls.push(canvas.toDataURL('image/png'));
                }
            }
            setImageUrls(urls);
        } catch (err) {
            console.error('Error converting PDF:', err);
            setError('Failed to convert the PDF. The file might be corrupted or in an unsupported format.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleDownload = (url: string, index: number) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${file?.name.replace('.pdf', '') || 'page'}_${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mr-3 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m0-3l-3-3m0 0l-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
                </svg>
                AI PDF to Image Converter
            </h2>
            <p className="text-gray-600 mb-6">Convert each page of a PDF document into a high-quality PNG image. This tool processes files locally in your browser for security.</p>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 mb-6">
                <label htmlFor="pdf-upload" className="block text-sm font-medium text-gray-700 mb-2">Upload PDF Document</label>
                <input
                    ref={fileInputRef}
                    type="file"
                    id="pdf-upload"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    disabled={loading}
                />
                {file && <p className="text-sm text-gray-600 mt-2">Selected: <span className="font-semibold">{file.name}</span></p>}
            </div>
            
            <button
                onClick={handleConvert}
                className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg w-full disabled:bg-gray-400"
                disabled={loading || !file}
            >
                {loading ? 'Converting...' : 'Convert to Images'}
            </button>

            {loading && <Loader text="Converting PDF pages to images..." />}
            {error && <p className="text-center text-red-500 my-4">{error}</p>}
            
            {imageUrls.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Conversion Results ({imageUrls.length} pages)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {imageUrls.map((url, index) => (
                            <div key={index} className="border rounded-lg shadow-sm p-2 flex flex-col items-center">
                                <img src={url} alt={`Page ${index + 1}`} className="w-full h-auto rounded-md border" />
                                <p className="text-xs font-semibold text-gray-600 my-2">Page {index + 1}</p>
                                <button 
                                    onClick={() => handleDownload(url, index)}
                                    className="btn w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded-md"
                                >
                                    Download
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PdfToImageTab;