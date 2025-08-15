import React, { useState } from 'react';
import { findItemImageUrl } from '../../services/geminiService';
import Loader from '../Loader';

const SpecificationGeneratorTab: React.FC = () => {
    const [itemName, setItemName] = useState('0.5 RETRACTABLE QUICK DRY GEL PEN (BLACK)');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [generatedJson, setGeneratedJson] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const [recommendedImageUrl, setRecommendedImageUrl] = useState('');
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState('');

    const handleGeneratePrompt = async () => {
        if (!itemName.trim()) {
            setGeneratedPrompt('');
            setGeneratedJson('');
            setRecommendedImageUrl('');
            setImageError('');
            return;
        }

        const metaPrompt = `You are a meticulous procurement data specialist AI. Your task is to find detailed information for a specific item and format it EXACTLY as a clean JSON object.

Item to Research: "${itemName}"

**Instructions:**
1.  **description:** Write a concise, one-paragraph description suitable for a procurement catalog. It should highlight the item's key features and intended use.
2.  **technicalSpecifications:** List the key technical specifications as a multi-line string. Use "\\n" for new lines. Include details like size, material, color, capacity, compatibility, etc.
3.  **imageUrl:** Find a high-quality, direct link to a product image. The URL MUST end in .jpg, .jpeg, .png, or .webp. Do not use data URIs or links to web pages. If a suitable image cannot be found, use a placeholder URL: "https://i.ibb.co/x7P39M6/placeholder-thumbnail.png".

**CRITICAL: Output Format**
- You MUST return ONLY a single, clean JSON object.
- Do not include any explanations, conversational text, markdown formatting like \`\`\`json, or any text before or after the JSON object.
- The final JSON object must follow this structure EXACTLY:
{
  "description": "A concise and informative product description.",
  "technicalSpecifications": "Specification 1\\nSpecification 2\\nSpecification 3",
  "imageUrl": "https://example.com/image.jpg"
}`;

        const exampleJson = {
            "description": "A box of 12 black retractable gel pens with quick-drying ink to prevent smudging. Features a comfortable rubber grip for extended use, making it ideal for fast-paced office environments.",
            "technicalSpecifications": "Point Size: 0.5mm\nInk Color: Black\nType: Retractable Gel Pen\nFeature: Quick Dry Ink\nPackaging: 12 pens per box",
            "imageUrl": "https://i.ibb.co/z5pBZCv/gel-pen-black.png"
        };

        setGeneratedPrompt(metaPrompt.trim());
        setGeneratedJson(JSON.stringify(exampleJson, null, 2));

        setImageLoading(true);
        setRecommendedImageUrl('');
        setImageError('');
        try {
            const imageUrl = await findItemImageUrl(itemName);
            setRecommendedImageUrl(imageUrl);
        } catch (err) {
            console.error("Failed to find item image:", err);
            setImageError('Could not fetch a recommended image. Please try again.');
            setRecommendedImageUrl('https://i.ibb.co/x7P39M6/placeholder-thumbnail.png'); // Show placeholder on error
        } finally {
            setImageLoading(false);
        }
    };
    
    const handleCopyToClipboard = () => {
        if (!generatedPrompt) return;
        navigator.clipboard.writeText(generatedPrompt).then(() => {
            setCopySuccess('Prompt copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            console.error('Could not copy text: ', err);
            setCopySuccess('Failed to copy.');
             setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mr-3 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.528L16.5 21.75l-.398-1.222a2.997 2.997 0 00-2.122-2.122L12.75 18l1.222-.398a2.997 2.997 0 002.122-2.122L16.5 14.25l.398 1.222a2.997 2.997 0 002.122 2.122L20.25 18l-1.222.398a2.997 2.997 0 00-2.122 2.122z" /></svg>
                AI Prompt Generator for Item Specifications
            </h2>
            <p className="text-gray-600 mb-6">
                Enter a product name to generate a detailed, structured prompt. You can then use this prompt with an advanced AI 
                (like the one in the Market Scoping tool) to get consistent, well-formatted item details for your catalog.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 mb-6">
                <label htmlFor="item-name-input" className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input
                    type="text"
                    id="item-name-input"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., 0.5 RETRACTABLE QUICK DRY GEL PEN (BLACK)"
                />
            </div>

            <button
                onClick={handleGeneratePrompt}
                className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg w-full"
            >
                Generate Prompt & Recommend Image
            </button>

            {generatedPrompt && (
                <div className="mt-8 space-y-6">
                     <div>
                        <h3 className="text-xl font-bold text-gray-800">AI Recommended Image</h3>
                        <p className="text-sm text-gray-500 mb-2">The AI has searched for a suitable image for your item. You can use this URL in your catalog data.</p>
                        {imageLoading && <Loader text="Searching for a high-quality image..." />}
                        {imageError && <p className="text-red-500 text-sm">{imageError}</p>}
                        {recommendedImageUrl && !imageLoading && (
                            <div className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg border">
                                <img src={recommendedImageUrl} alt={itemName} className="w-32 h-32 object-contain bg-white rounded-md border" />
                                <div className="flex-grow">
                                    <label className="text-xs font-semibold text-gray-600">Image URL:</label>
                                    <textarea
                                        readOnly
                                        value={recommendedImageUrl}
                                        rows={4}
                                        className="w-full p-2 font-mono text-xs bg-white border border-gray-300 rounded-md mt-1"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-xl font-bold text-gray-800">Generated Prompt</h3>
                             <button onClick={handleCopyToClipboard} className="text-sm font-semibold text-blue-600 hover:underline disabled:text-gray-400" disabled={!generatedPrompt}>
                                 {copySuccess || 'Copy Prompt'}
                             </button>
                        </div>
                        <textarea
                            readOnly
                            value={generatedPrompt}
                            rows={15}
                            className="w-full p-3 font-mono text-xs bg-gray-100 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Expected JSON Output Structure</h3>
                         <pre className="w-full p-4 font-mono text-xs bg-gray-800 text-green-400 border border-gray-600 rounded-md overflow-x-auto">
                            <code>
                                {generatedJson}
                            </code>
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpecificationGeneratorTab;