import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ExtractedDocInfo, ExtractedItem, ComparisonResult, DocumentCheckResult, SocialMediaPostItem, DocumentAuditResult, SocialMediaTrivia, SupplierQuote, ScrapedVideoData, PpmpItem, ExtractedRfqData, DocumentType, ProcurementProjectData, ProcurementProjectItem, AuditFinding, PpmpProjectItem, CatalogComparisonResult, CatalogComparisonFinding, PpmpSummaryData, MarketItem, CatalogItem, CatalogAssistantResult, BrandAuditResult, PpmpAnalysisResult } from '../types';
import { marketData } from "../data/marketData";
import { marketCategories } from "../data/marketData";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const safeParseJsonResponse = <T>(responseText: string | undefined, functionName: string): T => {
    if (!responseText) {
        throw new Error(`AI analysis failed in ${functionName}. The response was empty or blocked.`);
    }
    try {
        let jsonString = responseText.trim();
        const markdownMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (markdownMatch && markdownMatch[1]) {
            jsonString = markdownMatch[1];
        }
        return JSON.parse(jsonString);
    } catch (e) {
        console.error(`Failed to parse JSON from AI response in ${functionName}:`, e, responseText);
        throw new Error(`AI returned a response for ${functionName}, but it was not valid JSON.`);
    }
};

export const auditForBrandSpecifications = async (file: File): Promise<BrandAuditResult> => {
    const model = 'gemini-2.5-flash';
    const base64Data = await fileToBase64(file);

    const prompt = `
        You are an expert AI auditor specializing in Philippine Government Procurement Law (R.A. 9184 and its successor, R.A. 12009). Your primary function is to detect brand names in procurement item descriptions, which could indicate "tailoring" of specifications—a practice that limits competition.

        **Legal Context:**
        Section 18 of the IRR of R.A. 9184 and similar provisions in R.A. 12009 state that "Specifications for the Procurement of Goods shall be based on relevant characteristics and/or performance requirements. Reference to brand names shall not be allowed." The goal is to promote fairness and open competition.

        **Your Task:**
        1.  Analyze the provided document image (likely a Purchase Request).
        2.  Extract every line item listed for procurement.
        3.  For each item, meticulously scan its description for any explicit brand names (e.g., "Epson", "Canon", "Toyota", "HP", "Davies", "Pilot", "3M", "Uratex"). Be intelligent about common nouns that are also brands (e.g., 'pilot' could be a job or a pen brand; context matters).
        4.  Create a finding for EACH item extracted.
        5.  **NEW:** For each item where a brand is identified, suggest a suitable, non-branded generic name or description. This should be a functional equivalent. For example, if the item is "Epson L121 Printer", the recommended generic name could be "Inkjet Printer with Ink Tank System".
        6.  Determine the 'status' for each finding:
            *   **'potential_issue'**: If a brand name is found.
            *   **'compliant'**: If no brand name is found.
        7.  For 'identifiedBrand', state the specific brand name found. If none, return the string 'None'.
        8.  For 'recommendedGenericName', provide your suggestion from step 5. If the item is compliant (no brand found), return the string 'N/A'.
        9.  Write an 'explanation' for each finding:
            *   For 'potential_issue', state: "The inclusion of the brand '[Identified Brand]' may violate procurement laws (R.A. 9184/R.A. 12009), which prohibit referencing brand names to avoid tailoring specifications and ensure fair competition. It is recommended to use generic technical and performance specifications instead."
            *   For 'compliant', state: "The item description appears to be generic and does not specify a brand name, adhering to procurement guidelines."
        10. Formulate an 'overallConclusion' and a 'summary' based on your findings.

        **CRITICAL: Output Schema**
        You MUST return a single, clean JSON object. Do not include any text, markdown formatting like \`\`\`json, or any text before or after the JSON object. Your entire response must be the JSON object itself.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            overallConclusion: { type: Type.STRING, description: "'Compliant' or 'Potential Issues Found'." },
            summary: { type: Type.STRING, description: "A brief summary of the audit, mentioning the number of potential issues." },
            findings: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        itemDescription: { type: Type.STRING, description: "The full original item description from the document." },
                        identifiedBrand: { type: Type.STRING, description: "The specific brand name found, or 'None' if compliant." },
                        status: { type: Type.STRING, description: "'compliant' or 'potential_issue'." },
                        explanation: { type: Type.STRING, description: "A detailed explanation of the finding with legal context." },
                        recommendedGenericName: { type: Type.STRING, description: "A generic, non-branded alternative name for the item. 'N/A' if compliant." }
                    },
                    required: ['itemDescription', 'identifiedBrand', 'status', 'explanation', 'recommendedGenericName']
                }
            }
        },
        required: ['overallConclusion', 'summary', 'findings']
    };

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { text: prompt },
                { inlineData: { mimeType: file.type, data: base64Data } }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    return safeParseJsonResponse<BrandAuditResult>(response.text, 'auditForBrandSpecifications');
};

export const generateImageForItem = async (itemName: string): Promise<string> => {
    const model = 'imagen-3.0-generate-002';
    const prompt = `A professional, clean, high-resolution product photograph of a "${itemName}" on a pure white background, suitable for an e-commerce catalog.`;

    const response = await ai.models.generateImages({
        model,
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } else {
        throw new Error("AI failed to generate an image.");
    }
};

export const findItemImageUrl = async (itemName: string): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
        You are an expert image search AI. Your single task is to find the best, high-quality, direct image URL for a given product name.

        **Product Name:** "${itemName}"

        **Rules:**
        1.  Use Google Search to find a professional, clean product photograph on a white or neutral background.
        2.  The URL you return MUST be a direct link to an image file (ending in .jpg, .jpeg, .png, .webp).
        3.  Do not return links to web pages, data URIs, or search result pages.
        4.  Return ONLY the URL as a plain text string. Do not add any other text, explanation, or formatting.
        5.  If you cannot find a suitable image, return this exact placeholder URL: "https://i.ibb.co/x7P39M6/placeholder-thumbnail.png"
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const text = response.text.trim();

    if (!text || (!text.startsWith('http') && !text.startsWith('https'))) {
        console.warn(`AI did not return a valid URL for "${itemName}". Falling back to placeholder.`);
        return "https://i.ibb.co/x7P39M6/placeholder-thumbnail.png";
    }

    return text;
};


export const generatePpmpExecutiveSummary = async (items: (PpmpProjectItem & { category: string})[]): Promise<PpmpSummaryData> => {
    const model = 'gemini-2.5-flash';
    const dataString = JSON.stringify(items.map(item => ({
        office: item.office,
        description: item.generalDescription,
        category: item.category,
        budget: item.estimatedBudget
    })));

    const prompt = `
        You are a senior procurement analyst AI reporting directly to the City Mayor of Bacolod. Your task is to analyze the consolidated Project Procurement Management Plan (PPMP) data provided and generate a high-level executive summary.

        **Provided Data:**
        A JSON array of all procurement projects for the year is provided below. Each object includes the end-user office, project description, an assigned procurement category, and the estimated budget.
        \`\`\`json
        ${dataString}
        \`\`\`

        **Your Tasks:**
        1.  **Calculate Total Budget:** Sum up the 'budget' for all projects.
        2.  **Identify Top 5 Spending Categories:** Group projects by 'category', sum their budgets, count the projects in each, and identify the top 5 categories by total budget.
        3.  **Identify Top 5 Key Projects:** Find the 5 individual projects with the highest 'budget'.
        4.  **Write Executive Summary:** Draft a concise, formal summary (2-3 paragraphs) that explains the overall procurement plan, its total value, and mentions the major areas of expenditure (the top categories).
        5.  **Provide Strategic Analysis:** In one paragraph, offer brief insights. Look for potential opportunities (e.g., bulk purchasing in high-spend categories) or risks (e.g., a large number of high-value projects indicating a busy year for the BAC).

        **Output Schema:**
        You MUST return a single, clean JSON object. Do not include any text or markdown formatting.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING, description: "A 2-3 paragraph executive summary of the procurement plan." },
            totalBudget: { type: Type.NUMBER, description: "The total consolidated budget of all projects." },
            topCategories: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING },
                        budget: { type: Type.NUMBER },
                        projectCount: { type: Type.NUMBER }
                    },
                    required: ['category', 'budget', 'projectCount']
                }
            },
            keyProjects: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        office: { type: Type.STRING },
                        budget: { type: Type.NUMBER }
                    },
                    required: ['description', 'office', 'budget']
                }
            },
            analysis: { type: Type.STRING, description: "A brief strategic analysis of the plan." }
        },
        required: ['summary', 'totalBudget', 'topCategories', 'keyProjects', 'analysis']
    };

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema,
        },
    });

    return safeParseJsonResponse<PpmpSummaryData>(response.text, 'generatePpmpExecutiveSummary');
};

export const getProcessStepExplanation = async (stepTitle: string, stepDetails: string): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are an expert on Philippine Government Procurement Law, specifically R.A. 12009. You provide clear, detailed, and legally-grounded explanations for specific steps in the procurement process. Your tone is professional and helpful. Use markdown formatting like **bold text** for emphasis and bullet points (* item) for lists.`;
    
    const prompt = `
        A user is asking for more information about a step in the procurement process for Bacolod City.
        
        **Step Title:** ${stepTitle}
        **Step Details:** ${stepDetails}

        Please provide a detailed explanation of this step. Include the following:
        1.  **Purpose:** What is the primary purpose of this step?
        2.  **Key Personnel:** Who are the main people or offices involved?
        3.  **Critical Documents:** What are the most important documents associated with this stage?
        4.  **Legal Basis/Timelines:** Mention any relevant timelines or regulations from R.A. 12009 if applicable.
    `;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { systemInstruction }
    });
    
    if (!response.text) {
        throw new Error("AI explanation failed. The response was empty or blocked.");
    }
    return response.text;
};

export const analyzeDocumentType = async (file: File): Promise<{ documentType: string; suggestedActions: string[] }> => {
    const model = 'gemini-2.5-flash';
    const base64Data = await fileToBase64(file);

    const prompt = `
        You are an expert AI assistant for a Bids and Awards Committee in the Philippines. You are integrated into a larger application that has several document processing features.
        Analyze the provided document image and perform two tasks:
        1.  **Identify Document Type:** Determine the specific type of procurement document this is (e.g., "Purchase Request", "Project Procurement Management Plan (PPMP)", "Purchase Order", "Request for Quotation", "Abstract of Bids", "BAC Resolution"). If it's not a recognizable procurement document, classify it as "Unknown".
        2.  **Suggest Relevant Actions:** Based on the document type, suggest a list of the most relevant actions a user can perform using the application's features. Choose from the following available actions only:
            *   "Extract Data": If the document contains structured data like items, amounts, or header info. (Good for PR, PO, RFQ).
            *   "Compliance Check": If the document is a Purchase Request, as it can be checked against a PPMP.
            *   "Quality Check": A general check for completeness and clarity. Applicable to most draft documents like PRs.
            *   "Generate RFQ Announcement": If the document is an RFQ, a social media post can be generated from it.
            *   "Generate Post-Award Announcement": If the document is a Purchase Order, a post-award announcement can be generated.

        **Output Format:**
        You MUST return a single, clean JSON object. Do not include any text or markdown formatting.
        - 'documentType': The identified document type as a string.
        - 'suggestedActions': An array of strings containing the suggested action keys from the list above.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            documentType: { type: Type.STRING, description: "The identified type of the procurement document." },
            suggestedActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of suggested action keys."
            }
        },
        required: ['documentType', 'suggestedActions']
    };

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { text: prompt },
                { inlineData: { mimeType: file.type, data: base64Data } }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    return safeParseJsonResponse<{ documentType: string; suggestedActions: string[] }>(response.text, 'analyzeDocumentType');
};


export const generatePurchasePurpose = async (items: { name: string, quantity: number }[]): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const itemsList = items.map(item => `- ${item.quantity} x ${item.name}`).join('\n');
    
    const prompt = `
        Based on the following list of items from a Purchase Request, generate a concise, one-sentence purpose statement suitable for an official government document. The purpose should be formal and summarize the intended use.

        Item List:
        ${itemsList}

        Example Output: "For office supplies and materials for the use of the City Mayor's Office."
        Example Output: "To procure various IT equipment for the upgrade of the city's network infrastructure."

        Generated Purpose:
    `;

    const response = await ai.models.generateContent({ model, contents: prompt });
    if (!response.text) {
        throw new Error("AI analysis failed. The response was empty or blocked.");
    }
    return response.text.trim();
};

export const getSignatoryInfo = async (role: string): Promise<{ name: string; designation: string }> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
        Search for the person who currently holds the official role of "${role}" for the Bacolod City Government in the Philippines.

        You must return a single, clean JSON object with two fields:
        1.  'name': The person's full name, correctly capitalized, including any titles like "HON." or "ATTY.".
        2.  'designation': The person's official title or designation.

        Example for "City Mayor":
        {
            "name": "HON. GREG G. GASATAYA",
            "designation": "City Mayor"
        }
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    return safeParseJsonResponse<{ name: string; designation: string }>(response.text, 'getSignatoryInfo');
};

export const analyzeProcurementRequest = async (userInput: string): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
        As an expert on Philippine Government Procurement Law, your task is to analyze a procurement request for Bacolod City (a First Class City) and recommend the most appropriate mode of procurement. Your analysis must be strictly based on the following rules from Republic Act 12009 and its IRR:

        **Key Procurement Modes and Conditions:**
        1.  **Competitive Bidding:** The default mode. Use this if no other specific condition applies. (Reference: RA 12009, Sec. 27)
        2.  **Small Value Procurement (SVP):** For simple requirements with an ABC not exceeding PhP 2,000,000 for Bacolod City. (Reference: RA 12009, Sec. 34)
        3.  **Direct Acquisition:** For readily available "off-the-shelf" goods and services with an ABC not exceeding PhP 200,000. (Reference: RA 12009, Sec. 32)
        4.  **Direct Contracting:** For goods of a proprietary nature sold by an exclusive dealer with no suitable substitute. (Reference: RA 12009, Sec. 31)
        5.  **Repeat Order:** For replenishing goods previously procured via competitive bidding, within 6 months of the original NTP, and not exceeding 25% of the original quantity. (Reference: RA 12009, Sec. 33)
        6.  **Direct Sales:** For purchasing non-CSE from a supplier that has previously delivered the same items satisfactorily to another government agency. (Reference: RA 12009, Sec. 36)
        7.  **Negotiated Procurement - Emergency Cases:** For imminent danger to life/property, state of calamity, or to restore vital public services. (Reference: RA 12009, Sec. 35.2)
        8.  **Competitive Dialogue:** For complex procurements where technical specifications are hard to define upfront. (Reference: RA 12009, Sec. 29)
        9.  **Unsolicited Offer with Bid Matching:** For projects involving a new concept or technology initiated by a private entity. (Reference: RA 12009, Sec. 30)

        **User's Procurement Request:**
        "${userInput}"

        **Your Task:**
        1.  Calculate the total Approved Budget for the Contract (ABC) from the user's request.
        2.  Analyze the items and context.
        3.  Based on the rules above, provide your recommendation in the following format:
            "Recommendation: [Procurement Mode]. Justification: [Your one-sentence justification based on the rules and the calculated ABC]."
    `;
    
    const response = await ai.models.generateContent({ model, contents: prompt });
    if (!response.text) {
        throw new Error("AI analysis failed. The response was empty or blocked.");
    }
    return response.text;
};

export const extractInfoFromDocument = async (file: File): Promise<ExtractedDocInfo> => {
    const model = 'gemini-2.5-flash';
    const base64Data = await fileToBase64(file);

    const prompt = `
        Analyze the provided document image, which is a government procurement form from the Philippines (e.g., Purchase Request). Extract key header details, a list of line items, and provide a procurement mode recommendation.

        **Your Tasks:**
        1.  **Extract Header Data:** Identify and extract values for these fields: "Description", "Purpose", "Source of Funds", "MOOE No.", "Responsibility Center", "Account Code", "Received Date", "PR Number", "ABC", "OBR Amount".
        2.  **Extract Line Items:** Meticulously scan the document for a table of items. For each item row, extract the following:
            - "description": The full item description.
            - "uom": The unit of measurement (e.g., 'pcs', 'box', 'unit').
            - "qty": The quantity requested.
            - "unitCost": The cost per unit.
            - "amount": The total amount for that line item (qty * unitCost).
            If no items table is found, return an empty array for "items".
        3.  **Apply Business Logic for ABC:** The "ABC" (Approved Budget for the Contract) must be the same as the total amount indicated in the Purchase Request (PR). This is usually the grand total of all line items.
        4.  **Apply Business Logic for Source of Funds:** Analyze the extracted "Account Code" to determine the "Source of Funds" based on Philippine government accounting standards (UACS):
            - If the Account Code starts with '1', the Source of Funds is "Continuing".
            - If the Account Code starts with '5', the Source of Funds is "Budgetary".
            - If the document explicitly mentions "Trust Fund", "20% Development Fund", "PAGCOR Fund", etc., use that specific text as the Source of Funds.
        5.  **Recommend Procurement Mode:** Based on the extracted ABC and the item descriptions, recommend the most appropriate mode of procurement according to the rules of R.A. 12009 for a First Class City like Bacolod. The primary thresholds are: Small Value Procurement (up to 2,000,000 PHP) and Direct Acquisition (for off-the-shelf goods up to 200,000 PHP). If no alternative mode applies, default to Competitive Bidding.
        
        **Output Format:**
        You must return a single, clean JSON object. Do not include any text or markdown formatting like \`\`\`json before or after the JSON object.
    `;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            "Description": { type: Type.STRING },
            "Purpose": { type: Type.STRING },
            "Source of Funds": { type: Type.STRING },
            "MOOE No.": { type: Type.STRING },
            "Responsibility Center": { type: Type.STRING },
            "Account Code": { type: Type.STRING },
            "Received Date": { type: Type.STRING },
            "PR Number": { type: Type.STRING },
            "ABC": { type: Type.STRING },
            "OBR Amount": { type: Type.STRING },
            "RecommendedMode": { type: Type.STRING },
            "Justification": { type: Type.STRING },
            "items": {
                type: Type.ARRAY,
                description: "A list of all items from the procurement document.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING, description: "The description of the item." },
                        uom: { type: Type.STRING, description: "Unit of Measurement, e.g., 'pcs'." },
                        qty: { type: Type.STRING, description: "Quantity of the item." },
                        unitCost: { type: Type.STRING, description: "Cost per unit." },
                        amount: { type: Type.STRING, description: "Total amount for the item." },
                    },
                    required: ['description', 'uom', 'qty', 'unitCost', 'amount']
                }
            }
        }
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { text: prompt },
                { inlineData: { mimeType: file.type, data: base64Data } }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });

    return safeParseJsonResponse<ExtractedDocInfo>(response.text, 'extractInfoFromDocument');
};

export const scopeMarket = async (itemName: string): Promise<{ description: string; category: string; uacsCode: string; quotes: SupplierQuote[] }> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
    You are an expert procurement research AI for the Philippine government. Your task is to find product information and pricing for a specified item for government procurement in Bacolod City for the year 2025.

    **Item to Research:** "${itemName}"

    **Your Mission:**
    1.  **Gather Core Information:**
        *   **Product Description:** A detailed description of the item.
        *   **Product Category:** The most appropriate procurement category (e.g., "Medical Supplies", "IT Equipment").
        *   **UACS Code:** The correct Unified Accounts Code Structure (UACS) Object Code for the item based on Philippine government standards. Provide the most likely code if an exact match isn't found.
    2.  **Find Three (3) Price Quotes:**
        *   Use Google Search to find three distinct price quotes from online retailers or e-commerce platforms (like Shopee, Lazada, Google Shopping) available in the Philippines.
        *   For each quote, you MUST provide the supplier's name, the price (as a PHP number), a direct link to the product page, and a direct URL for a high-quality product image. **The imageUrl MUST be a direct link to an image file (e.g., ending in .jpg, .jpeg, .png).** Do not use data URIs or links to web pages for the imageUrl field.

    **CRITICAL: Output Format and Rules**
    - **You MUST return ONLY a single, clean JSON object.** Do not include any explanations, conversational text, markdown formatting like \`\`\`json, or any text before or after the JSON object.
    - Your entire response must be the JSON object itself.
    - If you cannot find ANY information after an exhaustive search, return this specific JSON object:
      {
        "description": "No information could be found for this item after an exhaustive search.",
        "category": "Unknown",
        "uacsCode": "N/A",
        "quotes": []
      }
    - **The final JSON object must follow this structure EXACTLY:**
      {
        "description": "A detailed product description.",
        "category": "An appropriate category like Office Supplies.",
        "uacsCode": "A UACS code like 50203010-00.",
        "quotes": [
          { "supplier": "Example Supplier Inc.", "price": 150.00, "link": "https://example.com/product-link", "imageUrl": "https://example.com/image.jpg" },
          { "supplier": "Another Store", "price": 155.00, "link": "https://store.com/product-link", "imageUrl": "https://store.com/image.jpeg" },
          { "supplier": "Online Shop PH", "price": 148.00, "link": "https://onlineshop.ph/product", "imageUrl": "https://onlineshop.ph/image.png" }
        ]
      }
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const parsed = safeParseJsonResponse<any>(response.text, 'scopeMarket');

    if (parsed.description && parsed.category && parsed.uacsCode && Array.isArray(parsed.quotes)) {
         // Ensure quotes has 3 items, padding if necessary
         while (parsed.quotes.length < 3) {
            parsed.quotes.push({ supplier: 'N/A', price: 0, link: '', imageUrl: '' });
         }
         // Ensure all quotes have an imageUrl property, even if empty
         parsed.quotes = parsed.quotes.slice(0, 3).map((q: any) => ({
            supplier: q.supplier || 'N/A',
            price: q.price || 0,
            link: q.link || '',
            imageUrl: q.imageUrl || '',
         }));
         return parsed;
    }
    
    console.error("AI response did not contain valid JSON or was incomplete.", response.text);
    throw new Error("AI could not find relevant market data or returned an invalid response.");
};

export const extractItemsFromPdf = async (file: File): Promise<string[]> => {
    const model = 'gemini-2.5-flash';
    const base64Data = await fileToBase64(file);

    const prompt = `
        You are an AI assistant for procurement. Analyze the provided document (e.g., a Purchase Request, shopping list).
        Your task is to identify and extract all the individual items listed for procurement.
        Return ONLY a single, clean JSON array of strings, where each string is a complete item description.
        
        Example: ["10 boxes of A4 bond paper, 70gsm", "1 unit 1.5HP split-type aircon"].
        
        If no items can be clearly identified, return an empty array [].
        Do not include quantities unless they are part of the item's descriptive name (e.g., "Ballpen (12's)").
        Do not add any explanation or markdown.
    `;

    const responseSchema = {
        type: Type.ARRAY,
        items: { type: Type.STRING }
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { text: prompt },
                { inlineData: { mimeType: file.type, data: base64Data } }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });

    return safeParseJsonResponse<string[]>(response.text, 'extractItemsFromPdf');
};


export const getAiAssistantResponse = async (systemInstruction: string, question: string): Promise<string> => {
    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
        model,
        contents: question,
        config: {
            systemInstruction,
        }
    });
    
    if (!response.text) {
        throw new Error("AI assistant failed to respond. The response was empty or blocked.");
    }
    return response.text;
};

export const compareDocuments = async (ppmpFiles: File[], prFiles: File[]): Promise<ComparisonResult> => {
    const model = 'gemini-2.5-flash';

    const prompt = `
        You are a top-tier AI auditor for Philippine government procurement, possessing an expert, up-to-the-minute understanding of R.A. 12009, R.A. 9184, all relevant GPPB Resolutions, PhilGEPS guidelines, and COA Circulars. Your core function is to perform a forensic-level comparison between a Project Procurement Management Plan (PPMP) and a Purchase Request (PR). Your analysis must be 100% accurate, reflecting the exact data from the documents.

        **Core Auditing Directives:**
        1.  **Absolute Data Fidelity:** Your primary directive is precision. You must extract and compare data with zero errors. Double-check every character and number.
        2.  **PR-Centric Analysis:** Your audit begins with the Purchase Request (PR). For each and every item listed in the PR, you must locate its corresponding entry in the PPMP. Items in the PPMP not present in the PR are to be ignored for this analysis.
        3.  **Forensic Data Verification:** For each PR item, you must meticulously verify these five critical data points against the PPMP:
            *   **Item Number** (from PR)
            *   **Full Description**
            *   **Quantity (QTY)**
            *   **Unit of Measurement (UOM)**
            *   **Estimated Unit Cost** and **Total Allocated Budget (Amount)**
        4.  **Extract PR Number:** From the Purchase Request document(s), identify and extract the primary "PR Number". If multiple PRs are uploaded, use the number from the first one as the main identifier for the report.

        **Comparison Logic & Status Definition:**
        1.  **Defining a 'match' (Perfect Compliance):** An item is a 'match' ONLY if all of the following conditions are met without deviation:
            *   **Description:** The description in the PR is identical or serves the exact same purpose as an item in the PPMP.
            *   **Unit of Measurement (UOM):** The UOM must be an **exact match** (e.g., 'pcs' matches 'pcs', but 'box' is a mismatch for 'pcs').
            *   **Quantity (QTY):** The quantity in the PR is **less than or equal to** the quantity specified in the PPMP.
            *   **Cost:** The total cost for the item in the PR is **less than or equal to** the total allocated budget for that corresponding item in the PPMP.
        2.  **Defining a 'mismatch' (Non-Compliance):** An item is a 'mismatch' if ANY of the following are true:
            *   The PR item (by description) is not found in the PPMP.
            *   The **UOM** is different. This is a critical failure.
            *   The **Quantity** or **Total Cost** in the PR EXCEEDS the allocation in the PPMP.
        3.  **Overall Budget Check:** The total ABC of the PR must not exceed the total budget of the corresponding items in the PPMP. This is a primary check.
        4.  **Overall Conclusion:**
            *   **"Consistent"**: ONLY if every single item in the PR is a 'match'.
            *   **"Discrepancies Found"**: If even ONE 'mismatch' exists.

        **CRITICAL Output Schema & Instructions:**
        You MUST return a single, clean JSON object. No markdown, no explanations.

        -   'prNumber': The extracted Purchase Request number (e.g., "2025-07-0123"). This is critical. If not found, return an empty string.
        -   'conclusion': Either "Consistent" or "Discrepancies Found".
        -   'summary': A concise summary of the findings.
        -   'findings': An array of objects, one for each PR item.
          -   'category': **Mandatory Format:** "Item #[Item No. from PR]: [Item Name from PR]". This is essential for traceability.
          -   'status': "match" or "mismatch".
          -   'ppmpValue': A composite string of the **exact** data from the PPMP for the corresponding item. **Format:** "QTY: [qty], UOM: [uom], Unit Cost: [unit_cost], Total: [total_amount]". If not found, state "Not found in PPMP".
          -   'prValue': A composite string of the data from the PR. **Format:** "QTY: [qty], UOM: [uom], Unit Cost: [unit_cost], Total: [total_amount]".
          -   'notes': A detailed, precise explanation.
            -   **For 'mismatch':** State the exact reason (e.g., "Quantity in PR (55) exceeds PPMP allocation (50).", "UOM mismatch: PR has 'box', PPMP has 'piece'."). You MUST then restate the full, correct details from the PPMP for absolute clarity: "PPMP details: [Full Description], QTY: [qty], UOM: [uom], Unit Cost: [unit_cost], Total: [total_amount]".
            -   **For 'match':** A simple confirmation: "Item is consistent with the PPMP."
    `;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            prNumber: { type: Type.STRING, description: "The Purchase Request number extracted from the PR document." },
            conclusion: { type: Type.STRING },
            summary: { type: Type.STRING },
            findings: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING },
                        status: { type: Type.STRING },
                        ppmpValue: { type: Type.STRING },
                        prValue: { type: Type.STRING },
                        notes: { type: Type.STRING }
                    },
                    required: ['category', 'status', 'ppmpValue', 'prValue', 'notes']
                }
            }
        },
        required: ['prNumber', 'conclusion', 'summary', 'findings']
    };
    
    const ppmpPromises = ppmpFiles.map(file => fileToBase64(file));
    const prPromises = prFiles.map(file => fileToBase64(file));

    const [ppmpBase64Data, prBase64Data] = await Promise.all([
        Promise.all(ppmpPromises),
        Promise.all(prPromises)
    ]);

    const parts: any[] = [{ text: prompt }];

    parts.push({ text: "\n--- START: Project Procurement Management Plan (PPMP) Files ---" });
    ppmpBase64Data.forEach((data, index) => {
        parts.push({ inlineData: { mimeType: ppmpFiles[index].type, data: data } });
    });
    parts.push({ text: "--- END: Project Procurement Management Plan (PPMP) Files ---\n" });

    parts.push({ text: "--- START: Purchase Request (PR) Files ---" });
    prBase64Data.forEach((data, index) => {
        parts.push({ inlineData: { mimeType: prFiles[index].type, data: data } });
    });
    parts.push({ text: "--- END: Purchase Request (PR) Files ---" });

    const response = await ai.models.generateContent({
        model,
        contents: { parts: parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    return safeParseJsonResponse<ComparisonResult>(response.text, 'compareDocuments');
};

export const checkDocumentQuality = async (file: File): Promise<DocumentCheckResult> => {
    const model = 'gemini-2.5-flash';
    const base64Data = await fileToBase64(file);

    const prompt = `
        You are an expert AI pre-auditor for Philippine government procurement documents. You have been given a procurement document (likely a Purchase Request or PPMP).

        Your task is to perform a comprehensive quality check and return a structured JSON object with your findings.

        **Evaluation Criteria:**
        1.  **Completeness:** Check if all essential fields appear to be filled (e.g., PR No., dates, signatures, descriptions, quantities, costs). Note any obviously missing information.
        2.  **Consistency:** Verify internal consistency. Does the sum of item costs match the total ABC/budget? Are quantities and costs plausible?
        3.  **Clarity & Specificity:** Assess the clarity of item descriptions and the project's purpose. Are they specific enough to avoid ambiguity (e.g., "laptop" vs. "laptop with 16GB RAM, 512GB SSD")? Flag vague descriptions.
        4.  **Formatting & Language:** Briefly check for major formatting errors or numerous typos that could affect comprehension. This is a lower priority check.

        **Overall Status Logic:**
        - 'Approved': The document appears complete, consistent, and clear with no significant issues.
        - 'Needs Review': There are minor issues, like vague descriptions, minor calculation discrepancies, or missing non-critical information that requires human attention.
        - 'Critical Issues': There are major problems, such as missing signatures, a large mismatch between item costs and total budget, or completely absent essential sections.

        **Output Schema:**
        Return a single, clean JSON object matching the provided schema. Do not include any text or markdown formatting before or after the JSON.

        - 'overallStatus': "Approved", "Needs Review", "or "Critical Issues".
        - 'summary': A concise, one-paragraph summary of the overall document quality.
        - 'findings': An array of objects detailing specific checks.
          - 'category': The area checked (e.g., "Completeness", "Budget Consistency", "Item Specificity").
          - 'status': "pass" if okay, "warn" for minor issues, "fail" for critical issues.
          - 'message': A brief, one-sentence explanation of the finding.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            overallStatus: { type: Type.STRING },
            summary: { type: Type.STRING },
            findings: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING },
                        status: { type: Type.STRING },
                        message: { type: Type.STRING }
                    },
                    required: ['category', 'status', 'message']
                }
            }
        },
        required: ['overallStatus', 'summary', 'findings']
    };

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { text: prompt },
                { inlineData: { mimeType: file.type, data: base64Data } }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    return safeParseJsonResponse<DocumentCheckResult>(response.text, 'checkDocumentQuality');
};

export const auditDocument = async (file: File): Promise<DocumentAuditResult> => {
    const model = 'gemini-2.5-flash';
    const base64Data = await fileToBase64(file);

    const prompt = `
        You are an expert AI auditor and proofreader for Philippine government procurement documents, with deep, up-to-date knowledge of R.A. 12009, R.A. 9184, and standard government correspondence formats. You have been given a procurement document.

        Your task is to perform a comprehensive audit for quality, correctness, and professionalism. You must identify typographical errors, grammatical mistakes, and issues related to clarity, formatting, and completeness.

        **Key BAC Personnel for Auditing (Bacolod City, 2025):**
        Use this list to check for correct names, roles, and signatories.
        *   City Mayor: HON. ALFREDO ABELARDO B. BENITEZ
        *   BAC Chairperson: ATTY. HERMILO B. PA-OYON
        *   BAC Vice-Chairperson: ATTY. ALLYN LUV Z. DIGNADICE
        *   Head of BAC Secretariat: ATTY. OMAR FRANCIS P. DEMONTEVERDE

        **CRITICAL: Pinpoint Accuracy is Required**
        For every finding, you MUST provide a precise location to guide the user.

        **Evaluation Criteria & Finding Types (In order of priority):**
        1.  **Numerical Accuracy:** This is the highest priority. If the document contains a list of items with quantities, unit costs, and total amounts (like a Purchase Request), you MUST verify all calculations. Sum up the individual item totals and compare it to the grand total or Approved Budget for the Contract (ABC). If there is a discrepancy, create a 'Numerical' finding. The 'suggestion' should be the correct calculated total.
        2.  **Completeness:** Check for obviously missing essential information (e.g., empty signature blocks, missing dates, incorrect signatories based on the provided personnel list).
        3.  **Typographical:** Identify any misspelled words.
        4.  **Grammatical:** Find grammatical errors (e.g., incorrect punctuation, subject-verb agreement, tense).
        5.  **Clarity:** Flag sentences or phrases that are vague, ambiguous, or unprofessional.
        6.  **Formatting:** Note significant formatting inconsistencies (e.g., misaligned text, inconsistent fonts).

        **Overall Status Logic:**
        - 'Excellent': The document is well-written and free of significant errors.
        - 'Good': Minor errors found that don't impact understanding.
        - 'Needs Improvement': Multiple or critical errors found that affect clarity, professionalism, or completeness.

        **Output Schema:**
        You MUST return a single, clean JSON object. Do not include any text or markdown formatting.

        - 'overallStatus': "Excellent", "Good", or "Needs Improvement".
        - 'summary': A concise summary of the document's quality.
        - 'findings': An array of objects for each issue found.
          - 'type': "Typographical", "Grammatical", "Clarity", "Formatting", "Completeness", or "Numerical".
          - 'location': **(MANDATORY)** A precise hint to where the error is. Examples: "Item #3, Description", "Header section, PR Number field", "Signatories, Chairperson's name". If the error is not in a specific item, describe the location (e.g., "Second paragraph of justification").
          - 'original': The original text snippet with the error. Be specific.
          - 'suggestion': The suggested correction or improvement.
          - 'explanation': A brief, one-sentence explanation of why the change is recommended, referencing procurement best practices or rules where applicable.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            overallStatus: { type: Type.STRING },
            summary: { type: Type.STRING },
            findings: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING },
                        location: { type: Type.STRING, description: "A precise hint to where the error is located in the document." },
                        original: { type: Type.STRING },
                        suggestion: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                    },
                    required: ['type', 'location', 'original', 'suggestion', 'explanation']
                }
            }
        },
        required: ['overallStatus', 'summary', 'findings']
    };

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { text: prompt },
                { inlineData: { mimeType: file.type, data: base64Data } }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    return safeParseJsonResponse<DocumentAuditResult>(response.text, 'auditDocument');
};

export const extractPostDataFromDocuments = async (files: File[]): Promise<SocialMediaPostItem[]> => {
    const model = 'gemini-2.5-flash';

    const prompt = `
        You are an AI assistant for the Bacolod City government. Your task is to extract specific details ONLY from a Purchase Order (PO) document to generate a social media announcement.

        **Extraction Rules:**
        1.  **PRIORITIZE PURCHASE ORDER:** You must locate a document that is clearly identifiable as a "Purchase Order". If no Purchase Order is found among the provided files, you MUST return an empty JSON array \`[]\`.
        2.  **STRICT FIELD MAPPING:** For each Purchase Order found, extract the following information precisely as specified:
            *   'referenceNo': Map directly from the "P.O. No." field.
            *   'projectTitle': Map directly from the "Project Name" field.
            *   'supplier': Combine the "Supplier" name and "Address" fields into a single multi-line string. Use '\\n' for new lines. DO NOT include the TIN.
            *   'contractPrice': Map directly from the final "TOTAL" amount.
            *   'dateOfIssuance': Find the "Conforme" section, which is signed by the supplier's representative. Extract the "Date" from this specific section and format it into words, like "July 8, 2025".
        3.  **SET DEFAULT COMMUNIQUE & HASHTAGS:** For the following fields, you MUST use the exact text provided below:
            *   'communique': "In adherence to the transparency principle of the New Government Procurement Act (Republic Act No. 12009), the Bids and Awards Committee of the City of Bacolod notifies the public on the issuance of Purchase Order | Notice of Award for the following procurement projects."
            *   'hashtags': "#BacolodStrongerTogether #GoodGovernance #BacolodCity #SerbisyongMayPuso"
        4.  **HANDLE MULTIPLE POs:** If multiple distinct Purchase Orders are found, create a separate JSON object for each one.

        **Output Schema:**
        You MUST return a single, clean JSON array of objects. If no Purchase Order is found, return an empty array \`[]\`. Do not include any text, notes, or markdown formatting like \`\`\`json before or after the JSON.
    `;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                referenceNo: { type: Type.STRING },
                projectTitle: { type: Type.STRING },
                supplier: { type: Type.STRING },
                contractPrice: { type: Type.STRING },
                dateOfIssuance: { type: Type.STRING },
                communique: { type: Type.STRING },
                hashtags: { type: Type.STRING },
            },
            required: ['referenceNo', 'projectTitle', 'supplier', 'contractPrice', 'dateOfIssuance', 'communique', 'hashtags'],
        },
    };
    
    const filePromises = files.map(file => fileToBase64(file));
    const base64Data = await Promise.all(filePromises);

    const parts: any[] = [{ text: prompt }];

    base64Data.forEach((data, index) => {
        parts.push({ inlineData: { mimeType: files[index].type, data: data } });
    });

    const response = await ai.models.generateContent({
        model,
        contents: { parts: parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    return safeParseJsonResponse<SocialMediaPostItem[]>(response.text, 'extractPostDataFromDocuments');
};

export const analyzeDocumentForGenerator = async (file: File, docType: DocumentType): Promise<Partial<ProcurementProjectData>> => {
    const model = 'gemini-2.5-flash';
    const base64Data = await fileToBase64(file);

    const getPromptAndSchema = () => {
        let prompt;
        let schema: any;

        const basePrompt = "You are an AI assistant for a Bids and Awards Committee in the Philippines. Your task is to analyze the provided procurement document image and extract specific information needed to auto-populate other official forms. Return a single, clean JSON object. Do not include any text or markdown formatting like `json` before or after the JSON object.";
        
        switch (docType) {
            case 'rfq':
                prompt = `Analyze the provided "Request for Quotation" (RFQ) or "Purchase Request" (PR). Your primary goal is to extract all structured data to populate a complete procurement project record. Extract the project details and the item list based on the approved budget.`;
                schema = {
                    type: Type.OBJECT,
                    properties: {
                        prNo: { type: Type.STRING, description: "The Purchase Request number, e.g., 2025-04-0003" },
                        projectTitle: { type: Type.STRING, description: "The name or purpose of the project." },
                        endUser: { type: Type.STRING, description: "The implementing office or end-user." },
                        abc: { type: Type.NUMBER, description: "The total Approved Budget for the Contract, as a number." },
                        items: {
                            type: Type.ARRAY, items: {
                                type: Type.OBJECT, properties: {
                                    itemNo: { type: Type.NUMBER },
                                    description: { type: Type.STRING },
                                    qty: { type: Type.NUMBER },
                                    uom: { type: Type.STRING },
                                    unitCost: { type: Type.NUMBER },
                                    totalCost: { type: Type.NUMBER }
                                }, required: ['itemNo', 'description', 'qty', 'uom', 'unitCost', 'totalCost']
                            }
                        }
                    }
                };
                break;
            case 'abstract':
                 prompt = `Analyze the provided "Abstract of Bids". Extract the project details, the list of items, and all supplier bids. The 'bids' array for each supplier must have the same number of elements as the main 'items' array.`;
                 schema = {
                    type: Type.OBJECT,
                    properties: {
                        prNo: { type: Type.STRING },
                        projectTitle: { type: Type.STRING },
                        abc: { type: Type.NUMBER },
                        items: {
                             type: Type.ARRAY, items: {
                                type: Type.OBJECT, properties: {
                                    description: { type: Type.STRING },
                                    qty: { type: Type.NUMBER },
                                    uom: { type: Type.STRING },
                                }, required: ['description', 'qty', 'uom']
                            }
                        },
                        suppliers: {
                            type: Type.ARRAY, items: {
                                type: Type.OBJECT, properties: {
                                    name: { type: Type.STRING },
                                    totalBid: { type: Type.NUMBER },
                                    bids: {
                                        type: Type.ARRAY, items: {
                                            type: Type.OBJECT, properties: {
                                                unitPrice: { type: Type.NUMBER },
                                                totalPrice: { type: Type.NUMBER }
                                            }, required: ['unitPrice', 'totalPrice']
                                        }
                                    }
                                }, required: ['name', 'totalBid', 'bids']
                            }
                        }
                    }
                };
                break;
             case 'po':
                prompt = `Analyze the provided "Purchase Order" (PO). Extract all details related to the order.`;
                schema = {
                    type: Type.OBJECT,
                    properties: {
                        poNo: { type: Type.STRING },
                        poDate: { type: Type.STRING },
                        prNo: { type: Type.STRING },
                        projectTitle: { type: Type.STRING },
                        procurementMode: { type: Type.STRING },
                        supplier: { type: Type.OBJECT, properties: {
                            name: { type: Type.STRING },
                            address: { type: Type.STRING },
                            tin: { type: Type.STRING },
                        }},
                        deliveryTerm: { type: Type.STRING },
                        paymentTerm: { type: Type.STRING },
                        totalAmount: { type: Type.NUMBER },
                        items: {
                             type: Type.ARRAY, items: {
                                type: Type.OBJECT, properties: {
                                    itemNo: { type: Type.NUMBER },
                                    description: { type: Type.STRING },
                                    qty: { type: Type.NUMBER },
                                    uom: { type: Type.STRING },
                                    unitCost: { type: Type.NUMBER },
                                    amount: { type: Type.NUMBER }
                                }, required: ['itemNo', 'description', 'qty', 'uom', 'unitCost', 'amount']
                            }
                        },
                    }
                };
                break;
            default: // Default to resolution, but it's more complex
                prompt = `Analyze the provided "BAC Resolution". Extract key details.`;
                schema = {
                    type: Type.OBJECT,
                    properties: {
                        resolutionNo: { type: Type.STRING },
                        resolutionSeries: { type: Type.STRING },
                        prNo: { type: Type.STRING },
                        abc: { type: Type.NUMBER },
                        projectTitle: { type: Type.STRING },
                        procurementMode: { type: Type.STRING },
                        suppliers: {
                             type: Type.ARRAY, items: {
                                type: Type.OBJECT, properties: {
                                    name: { type: Type.STRING },
                                    totalBid: { type: Type.NUMBER }
                                }, required: ['name', 'totalBid']
                            }
                        }
                    }
                };
        }
        return { prompt: `${basePrompt}\n\n${prompt}`, schema };
    };

    const { prompt, schema } = getPromptAndSchema();

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { text: prompt },
                { inlineData: { mimeType: file.type, data: base64Data } }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    return safeParseJsonResponse<Partial<ProcurementProjectData>>(response.text, `analyzeDocumentForGenerator - ${docType}`);
};

export const generateSupplierQuote = async (items: ProcurementProjectItem[], supplierName: string): Promise<{unitPrice: number}[]> => {
    const model = 'gemini-2.5-flash';

    const prompt = `
        You are an AI acting as a procurement supplier named "${supplierName}". You are preparing a bid for a Philippine government agency.
        You have been provided with a list of items from a Purchase Request, including their descriptions and the Approved Budget for the Contract (ABC) per unit.

        **Your Task:**
        Generate a competitive but realistic price quote for each item. For each item, you must provide a 'unitPrice'.

        **Rules:**
        1.  **Be Competitive:** Your quoted \`unitPrice\` for each item MUST be lower than the provided \`unitCost\` (the ABC price). Aim for a realistic discount (e.g., 5-15% lower), but you can use your judgment.
        2.  **Match the Items:** Your output must be a JSON array with the exact same number of items as the input list. Each object in your array corresponds to an item in the input list, in the same order.
        3.  **JSON Output Only:** You MUST return a single, clean JSON array of objects. Do not include any text, explanations, or markdown formatting (like \`\`\`json\`) before or after the JSON.

        **Item List to Quote:**
        ${JSON.stringify(items.map(item => ({description: item.description, approvedUnitCost: item.unitCost})), null, 2)}

        **Output Schema:**
        Return a JSON array where each object contains a \`unitPrice\`.
        Example: \`[{"unitPrice": 420.50}, {"unitPrice": 9800.00}, ...]\`
    `;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                unitPrice: { type: Type.NUMBER },
            },
            required: ['unitPrice']
        }
    };

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    return safeParseJsonResponse<{unitPrice: number}[]>(response.text, 'generateSupplierQuote');
};


export const generateProcurementTrivia = async (topic?: string): Promise<SocialMediaTrivia> => {
    const model = 'gemini-2.5-flash';

    const topicInstruction = (topic && topic.trim() !== '')
        ? `about the following specific topic: "${topic}"`
        : `about a new feature, rule, or procurement method introduced in R.A. 12009`;

    const prompt = `
        You are an expert on Philippine Government Procurement Law. Your task is to generate a social media trivia post to educate the public. The post must be engaging, informative, and easy to understand.

        **Your Task:**
        1.  **Create Trivia:** Formulate a single, interesting trivia question ${topicInstruction}. The question should be intriguing.
        2.  **Provide Answer:** Give a clear and concise answer to the question.
        3.  **Write Explanation:** Author a brief explanation that elaborates on the answer. This explanation is crucial. If the topic is about R.A. 12009, you MUST include a comparison to the old law, R.A. 9184, to effectively highlight what has changed or improved. If it's a general topic, just provide a detailed, easy-to-understand explanation.
        4.  **Generate Hashtags:** Create a set of relevant and popular hashtags for discoverability on social media. You MUST include "#BacolodStrongerTogether".

        **Output Format:**
        You MUST return a single, clean JSON object that strictly adheres to the provided schema. Do not include any text or markdown formatting (like \`\`\`json) before or after the JSON object.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            triviaQuestion: { 
                type: Type.STRING, 
                description: 'The trivia question about R.A. 12009.' 
            },
            triviaAnswer: { 
                type: Type.STRING, 
                description: 'The answer to the trivia question.' 
            },
            explanation: { 
                type: Type.STRING, 
                description: 'An explanation of the answer, including a comparison to R.A. 9184.' 
            },
            hashtags: { 
                type: Type.STRING, 
                description: 'A string of hashtags, like "#ProcurementPH #RA12009 #BacolodStrongerTogether #GoodGovernance".' 
            }
        },
        required: ['triviaQuestion', 'triviaAnswer', 'explanation', 'hashtags']
    };

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    return safeParseJsonResponse<SocialMediaTrivia>(response.text, 'generateProcurementTrivia');
};

export const scrapeAndSummarizeUrl = async (url: string): Promise<ScrapedVideoData> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
        You are an AI assistant for the Bids and Awards Committee (BAC) of Bacolod City. Your specialty is analyzing video content from URLs and transforming it into engaging social media posts.

        **Video URL to Analyze:** ${url}

        **Your Primary Task:**
        Your goal is to deeply analyze the video content at the provided URL. Do not just scrape text from the webpage; focus on the video's message, key points, speakers, and visuals to generate your output.

        **Instructions:**
        1.  **Analyze the Video Content:** "Watch" the video to understand its core message. If it is a news report, summarize the event. If it is a speech, extract the key takeaways. If it is an instructional video relevant to governance, explain the process.
        2.  **Generate a Social Media Post Title:** Create a compelling title that accurately captures the essence of the video. This title should be suitable for a Facebook or social media post from the Bacolod BAC.
        3.  **Write a Summary/Caption:** Write a concise summary of the video's content. This summary will be used as the caption for the social media post. It must be informative, easy to understand for the general public, and maintain a professional tone appropriate for a government committee.
        4.  **Extract Thumbnail and Video URL:** Find the direct URL for the video itself and a high-quality thumbnail image. Prioritize \`og:image\` meta tags or the video's default thumbnail. If no specific image or video is found, return an empty string for those fields.
        5.  **Generate Relevant Hashtags:** Create hashtags that are specific to the video's content. You MUST also include standard Bacolod City and BAC hashtags: "#BacolodCity", "#BidsAndAwards", "#GoodGovernance", "#BacolodStrongerTogether", "#SerbisyongMayPuso".

        **CRITICAL: Output Format**
        - You MUST return ONLY a single, clean JSON object and nothing else.
        - Do not include any text, explanations, or markdown formatting like \`\`\`json before or after the JSON object.
        - The JSON object must strictly follow this structure:
          {
            "title": "Your Engaging Title Based on Video Content",
            "summary": "Your concise summary of the video here.",
            "thumbnailUrl": "https://example.com/thumbnail.jpg",
            "videoUrl": "https://www.youtube.com/watch?v=...",
            "hashtags": "#BacolodCity #BidsAndAwards #GoodGovernance #VideoSpecificHashtag"
          }
        - If you cannot access the URL or find the required information, you MUST still return a valid JSON object with empty strings for the fields you couldn't populate. Do not return an error or conversational text.
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    return safeParseJsonResponse<ScrapedVideoData>(response.text, 'scrapeAndSummarizeUrl');
};

export const extractPpmpData = async (files: File[]): Promise<PpmpItem[]> => {
    const model = 'gemini-2.5-flash';

    const prompt = `
        You are an AI data extractor specializing in Philippine government procurement documents. Your task is to analyze the provided image(s) of a Project Procurement Management Plan (PPMP) and extract all line items into a structured JSON format. The plan contains both category headers and item rows.

        **Extraction Rules:**
        1.  **Row-by-Row Analysis:** Process the document and identify each row. For each row, determine if it is a 'category' header or a procurement 'item'.
        2.  **JSON Object Creation:** Create one JSON object for each row identified.
        3.  **'isCategory' Flag:**
            - If the row is a category header (e.g., a bold row without monthly data), set \`isCategory: true\`.
            - If the row is a procurement item, set \`isCategory: false\`.
        4.  **Field Mapping (CRITICAL):**
            - For **Category Rows** (\`isCategory: true\`):
                - \`description\`: Extract the full category name.
                - \`amount\`: Extract the total amount for that category if it's on the same row.
                - All other fields should be empty or null.
            - For **Item Rows** (\`isCategory: false\`):
                - \`papCode\`: Extract from the 'PAP Code' column.
                - \`description\`: Extract the full item description from the 'Project/Activity/Program' column.
                - \`specificationDetails\`: Extract from the 'Specification Details' column.
                - \`earlyProcurementActivity\`: Extract from the 'Is this an Early Procurement Activity?' column (should be 'Yes' or 'No').
                - \`procurementMode\`: Extract from the 'Mode of Procurement' column.
                - \`quantity\`: Extract from the 'Qty' column.
                - \`unitCost\`: Extract from the 'Breakdown of Amounts' column.
                - \`amount\`: Extract from the 'Amount (PhP)/Estimated Budget' column.
                - \`jan\`, \`feb\`, ... \`dec\`: Extract the monthly quantity values from the 'Expected Implementation' schedule. If a month has a value (like a number), extract it. If it's empty, leave the field empty.
                - \`remarks\`: Extract any text from the 'Remarks' column. If empty, return an empty string.
        5.  **Data Cleaning:** Clean the extracted data. Remove currency symbols (like '₱' or 'Php') and grouping commas from all numeric fields. Ensure all extracted values are returned as strings.

        **Output Format:**
        You must return a single, clean JSON array. Each object in the array represents one row from the plan. Adhere strictly to the provided JSON schema.
    `;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                isCategory: { type: Type.BOOLEAN },
                description: { type: Type.STRING },
                amount: { type: Type.STRING },
                papCode: { type: Type.STRING },
                specificationDetails: { type: Type.STRING },
                earlyProcurementActivity: { type: Type.STRING },
                procurementMode: { type: Type.STRING },
                quantity: { type: Type.STRING },
                unitCost: { type: Type.STRING },
                jan: { type: Type.STRING },
                feb: { type: Type.STRING },
                mar: { type: Type.STRING },
                apr: { type: Type.STRING },
                may: { type: Type.STRING },
                jun: { type: Type.STRING },
                jul: { type: Type.STRING },
                aug: { type: Type.STRING },
                sep: { type: Type.STRING },
                oct: { type: Type.STRING },
                nov: { type: Type.STRING },
                dec: { type: Type.STRING },
                remarks: { type: Type.STRING }
            },
            required: ['isCategory', 'description']
        }
    };
    
    const filePromises = files.map(file => fileToBase64(file));
    const base64Data = await Promise.all(filePromises);

    const parts: any[] = [{ text: prompt }];

    base64Data.forEach((data, index) => {
        parts.push({ inlineData: { mimeType: files[index].type, data: data } });
    });

    const response = await ai.models.generateContent({
        model,
        contents: { parts: parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    return safeParseJsonResponse<PpmpItem[]>(response.text, 'extractPpmpData');
};

export const extractDetailedPpmpData = async (file: File): Promise<PpmpProjectItem[]> => {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
        You are an expert AI data extractor for Philippine government procurement. Your task is to analyze a Project Procurement Management Plan (PPMP) document and extract every line item into a structured JSON format.

        **Instructions:**
        1.  **Process the Document:** Scan the provided PPMP image.
        2.  **Identify Project Rows:** Identify every row that represents a distinct procurement project or item. Ignore category headers or summary rows.
        3.  **Extract Core Data for Each Row:** For each project row, meticulously extract the data corresponding to the following official PPMP columns. Be precise.
            - \`generalDescription\`: From "General Description and Objective of the Project to be Procured".
            - \`projectType\`: From "Type of the Project to be Procured". Should be one of "Goods", "Infrastructure", or "Consulting Services".
            - \`quantitySize\`: From "Quantity and Size of the Project to be Procured".
            - \`procurementMode\`: From "Recommended Mode of Procurement".
            - \`preProcCon\`: From "Pre-Procurement Conference, if applicable". Must be "Yes" or "No".
            - \`procurementStart\`: From "Start of Procurement Activity". E.g., "Jan", "1st Quarter".
            - \`procurementEnd\`: From "End of Procurement Activity". E.g., "Feb", "1st Quarter".
            - \`deliveryImplementation\`: From "Expected Delivery/Implementation Period".
            - \`sourceOfFunds\`: From "Source of Funds".
            - \`estimatedBudget\`: From "Estimated Budget / Authorized Budgetary Allocation (PhP)". This MUST be a number. Remove currency symbols and commas.
            - \`supportingDocuments\`: From "Attached Supporting Documents".
            - \`remarks\`: From "Remarks".
        4.  **Extract and Calculate Monthly Budget Schedule:**
            - Locate the monthly scheduling grid, which typically shows procurement **quantities** for each month (Jan to Dec).
            - Sum these monthly quantities to get a total quantity for the year.
            - If the total quantity is greater than zero, calculate the unit cost: \`unitCost = estimatedBudget / totalQuantity\`.
            - For each month, calculate the budget for that month: \`monthlyBudget = monthlyQuantity * unitCost\`. Round to two decimal places.
            - If the schedule grid is empty or not present for an item, distribute the \`estimatedBudget\` evenly across the months between \`procurementStart\` and \`procurementEnd\`. If these are quarters, distribute evenly among the months in those quarters. If they are just single months, put the full budget in the start month.
            - The sum of all monthly budgets in the \`schedule\` object MUST equal the total \`estimatedBudget\`.
            - Create a \`schedule\` object with numeric budget values for \`jan\`, \`feb\`, \`mar\`, \`apr\`, \`may\`, \`jun\`, \`jul\`, \`aug\`, \`sep\`, \`oct\`, \`nov\`, \`dec\`.

        **CRITICAL: Output Format**
        You MUST return a single, clean JSON array of objects. Each object represents one project row from the document. Do not include any text or markdown formatting.
    `;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                generalDescription: { type: Type.STRING },
                projectType: { type: Type.STRING },
                quantitySize: { type: Type.STRING },
                procurementMode: { type: Type.STRING },
                preProcCon: { type: Type.STRING, description: "Should be 'Yes' or 'No'" },
                procurementStart: { type: Type.STRING },
                procurementEnd: { type: Type.STRING },
                deliveryImplementation: { type: Type.STRING },
                sourceOfFunds: { type: Type.STRING },
                estimatedBudget: { type: Type.NUMBER },
                supportingDocuments: { type: Type.STRING },
                remarks: { type: Type.STRING },
                schedule: {
                    type: Type.OBJECT,
                    properties: {
                        jan: { type: Type.NUMBER }, feb: { type: Type.NUMBER }, mar: { type: Type.NUMBER },
                        apr: { type: Type.NUMBER }, may: { type: Type.NUMBER }, jun: { type: Type.NUMBER },
                        jul: { type: Type.NUMBER }, aug: { type: Type.NUMBER }, sep: { type: Type.NUMBER },
                        oct: { type: Type.NUMBER }, nov: { type: Type.NUMBER }, dec: { type: Type.NUMBER },
                    },
                    required: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
                }
            },
            required: ['generalDescription', 'estimatedBudget', 'schedule'],
        },
    };
    
    const base64Data = await fileToBase64(file);

    const parts: any[] = [
        { text: prompt },
        { text: `\n--- START Document: ${file.name} ---` },
        { inlineData: { mimeType: file.type, data: base64Data } },
        { text: `--- END Document: ${file.name} ---` }
    ];

    const response = await ai.models.generateContent({
        model,
        contents: { parts: parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    // Post-process to add file origin and unique ID
    const parsedData = safeParseJsonResponse<any[]>(response.text, 'extractDetailedPpmpData');
    return parsedData.map((item, index) => ({
        ...item,
        id: Date.now() + index,
        office: file.name.split('.')[0].replace(/_/g, ' ') || "Extracted",
    }));
};


export const extractRfqData = async (file: File): Promise<ExtractedRfqData> => {
    const model = 'gemini-2.5-flash';
    const base64Data = await fileToBase64(file);

    const prompt = `
        You are an AI assistant for the Bacolod City Bids and Awards Committee. Your task is to extract specific details from a "Request for Quotation" (RFQ) document to generate a social media announcement for potential suppliers.

        **Extraction Rules:**
        1.  **Strict Field Mapping:** You must extract the following information precisely:
            *   'prNo': Map from the "Purchase Request No." field.
            *   'projectTitle': Map from the "Name of Project" field.
            *   'endUser': Map from the "Implementing Office/End User" field.
            *   'abc': Map from the "Approved Budget for the Contract" field. Include currency if present (e.g., "P45,000.00").
            *   'contactInfo': Extract the contact details from the bottom section, including Tel. Nos and email. Format it as a single string, e.g., "Tel. Nos. (034) 706-8270 / (63) 0948-6268509 or e-mail at bac@bacolodcity.gov.ph".
        2.  **Item Table Extraction:** Meticulously extract all items from the table under the "APPROVED BUDGET" section. The table has columns for 'Item No.', 'Item Description', 'QTY', and 'UOM'. Create a JSON object for each item row.
        3.  **Default Hashtags:** For the 'hashtags' field, you MUST use this exact text: "#BacolodProcurement #BACBacolod #RFQ #SerbisyongMayPuso #BacolodStrongerTogether"
        4.  **Handle Missing Data:** If a field cannot be found, return an empty string for that field. Do not make up data.

        **Output Schema:**
        You MUST return a single, clean JSON object. Do not include any text, notes, or markdown formatting like \`\`\`json before or after the JSON object.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            prNo: { type: Type.STRING },
            projectTitle: { type: Type.STRING },
            endUser: { type: Type.STRING },
            abc: { type: Type.STRING },
            contactInfo: { type: Type.STRING },
            hashtags: { type: Type.STRING },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        itemNo: { type: Type.STRING },
                        description: { type: Type.STRING },
                        qty: { type: Type.STRING },
                        uom: { type: Type.STRING },
                    },
                    required: ['itemNo', 'description', 'qty', 'uom'],
                },
            },
        },
        required: ['prNo', 'projectTitle', 'endUser', 'abc', 'items', 'contactInfo', 'hashtags'],
    };

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { text: prompt },
                { inlineData: { mimeType: file.type, data: base64Data } }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    return safeParseJsonResponse<ExtractedRfqData>(response.text, 'extractRfqData');
};

export const generatePpmpItems = async (description: string): Promise<PpmpItem[]> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
        You are an expert AI assistant for a Bids and Awards Committee in the Philippines, specializing in creating Project Procurement Management Plans (PPMP).
        Analyze the user's high-level project description and generate a structured list of items that would be required.

        **Instructions:**
        1.  **Categorize Items:** Group the generated items under logical category headers (e.g., "Office Furniture", "IT Equipment", "Office Supplies").
        2.  **Item Details:** For each item, provide a clear description, a reasonable estimated quantity, and the most appropriate unit of measurement (UOM).
        3.  **Format Correctly:** The output must be a clean JSON array. The first object for a new category should be a category header.

        **User's Project Description:**
        "${description}"

        **Output Schema:**
        You MUST return a single, clean JSON array of objects.
        - For a category header, set \`isCategory: true\` and provide the category name in the \`description\`.
        - For a regular item, set \`isCategory: false\` and provide the \`description\`, \`quantity\`, and \`uom\`.
    `;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                isCategory: { type: Type.BOOLEAN },
                description: { type: Type.STRING },
                quantity: { type: Type.STRING, description: "Estimated quantity, as a string." },
                uom: { type: Type.STRING, description: "Unit of Measurement, e.g., 'unit', 'pc', 'box'." },
            },
            required: ['isCategory', 'description']
        }
    };

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });
    
    return safeParseJsonResponse<PpmpItem[]>(response.text, 'generatePpmpItems');
};

// --- START: New logic for Catalog vs. PR Comparison ---

// Internal interface for the first AI extraction step.
interface ExtractedPrForCatalogComparison {
    prNumber: string;
    items: {
        description: string;
        unitCost: number;
    }[];
}

// A new, focused AI function to only extract data from the PR.
const extractPrForCatalogComparison = async (prFile: File): Promise<ExtractedPrForCatalogComparison> => {
    const model = 'gemini-2.5-flash';
    const base64Data = await fileToBase64(prFile);

    const prompt = `
        Analyze the provided Purchase Request (PR) document image. Your task is to extract only two pieces of information:
        1. The Purchase Request Number (PR Number).
        2. A list of all line items, including their full description and their unit cost.

        **CRITICAL INSTRUCTIONS:**
        - For 'unitCost', you MUST extract a numeric value. Remove any currency symbols (like '₱' or 'Php') and commas. If a cost is not found, use 0.
        - Your entire response MUST be a single, clean JSON object. Do not add any text, explanations, or markdown formatting like \`\`\`json.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            prNumber: { type: Type.STRING, description: "The Purchase Request number, e.g., '2025-07-0123'." },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        unitCost: { type: Type.NUMBER }
                    },
                    required: ['description', 'unitCost']
                }
            }
        },
        required: ['prNumber', 'items']
    };

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { text: prompt },
                { inlineData: { mimeType: prFile.type, data: base64Data } }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    return safeParseJsonResponse<ExtractedPrForCatalogComparison>(response.text, 'extractPrForCatalogComparison');
};


export const comparePrToCatalog = async (prFile: File): Promise<CatalogComparisonResult> => {
    const model = 'gemini-2.5-flash';

    // Step 1: Extract structured data from the Purchase Request PDF/image.
    const extractedPrData = await extractPrForCatalogComparison(prFile);
    
    // Step 2: Prepare the catalog data and the extracted PR data for the AI.
    const allCatalogItems = Object.values(marketData).flat().flatMap(item => {
        if ('variants' in item) { // It's a VariantMarketItem
            return item.variants.map(variant => ({
                name: `${item.name} (${variant.description})`,
                description: item.baseDescription,
                unitCost: variant.price
            }));
        } else { // It's a MarketItem
            return [{
                name: item.name,
                description: item.description,
                unitCost: item.price
            }];
        }
    });

    const prompt = `
        You are a meticulous procurement auditor AI. Your task is to compare items from a Purchase Request (PR) against a master Procurement Catalog.

        **Provided Data:**
        1.  **PR Items:** A JSON object of items extracted from a PR, including their description and unit cost.
            \`\`\`json
            ${JSON.stringify(extractedPrData.items)}
            \`\`\`
        2.  **Catalog Items:** A JSON array of all available items in the master catalog, including their name, description, and official unit cost.
            \`\`\`json
            ${JSON.stringify(allCatalogItems)}
            \`\`\`

        **Your Auditing Tasks:**
        1.  **Iterate Through PR Items:** For each item listed in the PR, perform the following steps.
        2.  **Find the Best Match:** Search the **Catalog Items** to find the single best matching product for the current PR item. A good match is based on the item name and description. If no reasonable match is found, state "Not found".
        3.  **Calculate Price Variance:** If a match is found, calculate the percentage variance using the formula: \`((PR Unit Cost - Catalog Unit Cost) / Catalog Unit Cost) * 100\`.
        4.  **Determine Status:**
            *   'Match': If the variance is between -15% and +15% (inclusive).
            *   'Overpriced': If the variance is greater than 15%.
            *   'Underpriced': If the variance is less than -15%.
            *   'Not found': If no match was found in the catalog.
        5.  **Generate a Summary:** Write a brief, one-paragraph summary of the overall findings. Mention the number of overpriced items, if any.
        6.  **Format the Output:** Return a single, clean JSON object. Do not include any text or markdown.

        **CRITICAL: Output Schema and Rules:**
        - You MUST return ONLY a single, clean JSON object.
        - The 'findings' array must contain an object for EVERY item in the original PR list.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            prNumber: { type: Type.STRING, description: "The PR number from the initial extraction." },
            summary: { type: Type.STRING, description: "A concise summary of the comparison findings." },
            findings: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        prItemDescription: { type: Type.STRING, description: "The original item description from the PR." },
                        prUnitCost: { type: Type.NUMBER },
                        catalogItemName: { type: Type.STRING, description: "The name of the best-matched catalog item, or 'Not found'." },
                        catalogUnitCost: { type: Type.NUMBER, description: "The unit cost of the matched item, or 0 if not found." },
                        variancePercentage: { type: Type.NUMBER, description: "The calculated price variance percentage." },
                        status: { type: Type.STRING, description: "'Match', 'Overpriced', 'Underpriced', or 'Not found'." }
                    },
                    required: ['prItemDescription', 'prUnitCost', 'catalogItemName', 'catalogUnitCost', 'variancePercentage', 'status']
                }
            }
        },
        required: ['prNumber', 'summary', 'findings']
    };

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });
    
    const result = safeParseJsonResponse<any>(response.text, 'comparePrToCatalog');
    // The AI might not have access to the original prNumber, so we inject it here for consistency.
    result.prNumber = extractedPrData.prNumber;
    return result as CatalogComparisonResult;
};

export const processDocumentForCatalogAssistant = async (docFile: File): Promise<CatalogAssistantResult> => {
    const model = 'gemini-2.5-flash';
    const base64Data = await fileToBase64(docFile);

    const allCatalogItems = Object.values(marketData).flat().flatMap(item => {
        if ('variants' in item) {
            return item.variants.map(variant => ({
                name: `${item.name} (${variant.description})`,
                uacsCode: item.uacsCode,
                unitCost: variant.price
            }));
        } else {
            return [{
                name: item.name,
                uacsCode: item.uacsCode,
                unitCost: item.price
            }];
        }
    });

    const categoriesList = marketCategories.join(', ');

    const prompt = `
        You are an expert procurement auditor AI for the Philippine government. Your task is to perform a comprehensive analysis of a procurement document, acting as a powerful quality control and cataloging assistant. You must process the document, clean the data, compare it against a master catalog, conduct quality checks, and provide a detailed, structured report.

        **Provided Data:**
        1.  **Procurement Document:** An image of a document (e.g., a Purchase Request).
        2.  **Master Catalog:** A JSON array of all available catalog items is provided below.
            \`\`\`json
            ${JSON.stringify(allCatalogItems)}
            \`\`\`
        3.  **Valid Categories List:** \`${categoriesList}\`

        **Your Multi-Step Task:**
        1.  **Extract & Consolidate:** Scan the document and extract all line items and their unit costs. Meticulously identify and merge any duplicate or very similar items. Create a clean, unique list of items to analyze. For each unique item, count how many times it appeared in the original document ('duplicateCount').
        2.  **Analyze & Quality Control (For each unique item):**
            a.  **Compare to Catalog:** Find the single best match in the Master Catalog based on the item's name and description.
            b.  **Price Analysis:**
                *   Calculate variance: \`((Document Cost - Catalog Cost) / Catalog Cost) * 100\`. If Catalog Cost is zero, variance is 0.
                *   Determine 'status': 'HIGH_VARIANCE' if absolute variance > 15%, otherwise 'MATCH'. If no match, 'NOT_FOUND'.
                *   Assess 'priceFeasibility': Based on the variance, determine if the price status is 'GOOD' (within 15% variance) or 'NEEDS_IMPROVEMENT' (high variance). Provide brief notes like "Price is reasonable and competitive." or "Price is 25% higher than catalog; requires review."
            c.  **Data Quality Checks:**
                *   'suggestedCategory': From the **Valid Categories List**, suggest the most appropriate category for the item.
                *   'descriptionQuality': Assess the item description's clarity and specificity. Status should be 'GOOD' or 'NEEDS_IMPROVEMENT'. Notes should be concise, e.g., "Description is clear and specific." or "Vague description. Recommend adding brand and model."
                *   'uomQuality': Check if the Unit of Measurement (UOM) seems correct for the item (e.g., 'ream' for paper, 'unit' for a printer). Status is 'GOOD' or 'NEEDS_IMPROVEMENT'. Notes should be concise, e.g., "UOM is appropriate." or "UOM 'lot' is vague for this item; suggest 'unit' or 'set'."
                *   'uacsCodeSuggestion': Based on the best catalog match, provide the UACS code as a suggestion. If no match, state "N/A".
            d.  **Consolidation Notes:** In the main 'notes' field, if an item was consolidated from duplicates (duplicateCount > 1), start the note with this information. E.g., "Consolidated from 2 entries in the source document. Item is compliant."
            e.  **Find Image URL:** Search online for a clean, high-resolution product photograph of the item on a white or neutral background. You MUST provide a direct, publicly accessible URL to the image file itself (ending in .jpg, .png, .jpeg). If a suitable image cannot be found, return an empty string.
        3.  **Generate Final Report:**
            *   'executiveSummary': A formal paragraph summarizing the **pricing and matching analysis**. Mention total items checked, number of matches, and number with high variance.
            *   'qualityControlSummary': A new formal paragraph summarizing the **overall data quality** of the document. Mention findings on descriptions, UOMs, and general data clarity.
            *   'actionableRecommendations': A bulleted list ('* ' prefix) of concrete recommendations covering both price discrepancies and data quality issues (e.g., "* Review 3 items with high price variance.", "* Improve descriptions for 5 items noted as vague.").
            *   'items': The array of analyzed items, containing all the fields you've generated.

        **CRITICAL: Output Schema**
        You MUST return a single, clean JSON object. Do not include any text or markdown formatting. The structure must be exactly as follows.
    `;
    
    const qualityCheckSchema = {
        type: Type.OBJECT,
        properties: {
            status: { type: Type.STRING, description: "'GOOD' or 'NEEDS_IMPROVEMENT'." },
            notes: { type: Type.STRING }
        },
        required: ['status', 'notes']
    };

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            executiveSummary: { type: Type.STRING },
            qualityControlSummary: { type: Type.STRING },
            actionableRecommendations: { type: Type.STRING },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        originalDescription: { type: Type.STRING },
                        originalUnitCost: { type: Type.NUMBER },
                        catalogItemName: { type: Type.STRING },
                        catalogUnitCost: { type: Type.NUMBER },
                        variancePercentage: { type: Type.NUMBER },
                        status: { type: Type.STRING },
                        notes: { type: Type.STRING },
                        suggestedCategory: { type: Type.STRING },
                        descriptionQuality: qualityCheckSchema,
                        uomQuality: qualityCheckSchema,
                        priceFeasibility: qualityCheckSchema,
                        uacsCodeSuggestion: { type: Type.STRING },
                        duplicateCount: { type: Type.NUMBER, description: "Number of times this item appeared in the source document." },
                        imageUrl: { type: Type.STRING, description: "Direct URL to a high-quality product image." }
                    },
                    required: [
                        'originalDescription', 'originalUnitCost', 'catalogItemName', 
                        'catalogUnitCost', 'variancePercentage', 'status', 'notes',
                        'suggestedCategory', 'descriptionQuality', 'uomQuality', 
                        'priceFeasibility', 'uacsCodeSuggestion', 'duplicateCount', 'imageUrl'
                    ]
                }
            }
        },
        required: ['executiveSummary', 'qualityControlSummary', 'actionableRecommendations', 'items']
    };

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { text: prompt },
                { inlineData: { mimeType: docFile.type, data: base64Data } }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema,
            tools: [{ googleSearch: {} }],
        },
    });

    return safeParseJsonResponse<CatalogAssistantResult>(response.text, 'processDocumentForCatalogAssistant');
};

export const analyzePpmpForImprovements = async (items: PpmpItem[]): Promise<PpmpAnalysisResult> => {
    const model = 'gemini-2.5-flash';
    
    const simplifiedItems = items.filter(i => !i.isCategory).map(item => ({
        description: item.description,
        papCode: item.papCode,
        procurementMode: item.procurementMode,
        amount: item.amount,
        schedule: [item.jan, item.feb, item.mar, item.apr, item.may, item.jun, item.jul, item.aug, item.sep, item.oct, item.nov, item.dec].some(val => val && parseFloat(val) > 0)
    }));

    const prompt = `
        You are an expert AI auditor specializing in Philippine Government Procurement Law (RA 9184, RA 12009, and GPPB Resolutions). Your task is to analyze the provided extracted PPMP data and provide a high-level executive summary and actionable recommendations for improvement.

        **Legal Context & Rules:**
        1.  **Completeness:** Essential fields like PAP Code, quantity, and cost must be present for each item.
        2.  **Specificity:** Item descriptions should be specific, not generic (e.g., "IT Equipment" is vague).
        3.  **Mode vs. Budget:** The procurement mode should be appropriate for the item's budget. For example, using "Shopping" for an item costing millions is a mismatch. High-value items usually require "Competitive Bidding".
        4.  **Scheduling:** High-budget items should have a clear implementation schedule. An item with a large budget but no monthly schedule is a red flag.
        5.  **PAP Codes:** PAP codes are crucial for budget alignment and should be present.

        **Provided Data:**
        A JSON array of extracted PPMP items is provided below. 'schedule' is true if any monthly value was found.
        \`\`\`json
        ${JSON.stringify(simplifiedItems, null, 2)}
        \`\`\`

        **Your Tasks:**
        1.  **Write an Executive Summary:** In 2-3 sentences, provide a high-level overview of the procurement plan based on the items. Mention the general scope and types of items.
        2.  **Analyze for Key Findings:** Meticulously review each item against the rules above. Create a list of findings. For each finding:
            *   **findingType:** Classify the issue as 'Missing Data', 'Compliance Mismatch', 'Vague Description', 'Scheduling Gap', or 'General Suggestion'.
            *   **itemDescription:** State the full original description of the item the finding applies to.
            *   **details:** Explain the specific problem found (e.g., "The item is missing a PAP Code.", "The procurement mode 'Shopping' is inappropriate for a budget of PHP 1,600,000.00.").
            *   **recommendation:** Provide a clear, actionable recommendation (e.g., "Assign a valid PAP Code for this item.", "Recommend changing the procurement mode to 'Competitive Bidding' due to the high budget.").
        3.  **Determine Overall Assessment:** Based on the severity and number of findings, give an overall assessment: 'Good', 'Needs Review', or 'Has Issues'.
        
        **CRITICAL: Output Schema**
        You MUST return a single, clean JSON object. Do not include any text, markdown formatting, or any text before or after the JSON object.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            overallAssessment: { type: Type.STRING, description: "'Good', 'Needs Review', or 'Has Issues'" },
            executiveSummary: { type: Type.STRING, description: "A brief, high-level summary of the PPMP." },
            keyFindings: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        findingType: { type: Type.STRING, description: "'Missing Data', 'Compliance Mismatch', etc." },
                        itemDescription: { type: Type.STRING, description: "The item the finding refers to." },
                        details: { type: Type.STRING, description: "Specific details of the issue." },
                        recommendation: { type: Type.STRING, description: "A suggested fix." }
                    },
                    required: ['findingType', 'itemDescription', 'details', 'recommendation']
                }
            }
        },
        required: ['overallAssessment', 'executiveSummary', 'keyFindings']
    };

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema,
        },
    });
    
    return safeParseJsonResponse<PpmpAnalysisResult>(response.text, 'analyzePpmpForImprovements');
};
