
import { commonUseItems } from '../../data/items/commonUseItems';

const cseItemNames = new Set(commonUseItems.map(item => item.name.toLowerCase().trim()));

// Add common variations or keywords to improve matching
const cseKeywords = [
    'ballpen', 'bond paper', 'paper, multicopy', 'ink cartridge', 'stapler', 'staple wire',
    'binder clip', 'folder', 'envelope', 'alcohol', 'battery', 'trash bag', 'desktop computer',
    'printer, 3-in-1', 'mouse, optical', 'flash drive', 'external hard drive', 'toilet tissue',
    'hand soap', 'detergent powder', 'coffee', 'sugar', 'sign pen', 'marker', 'fastener',
    'correction tape', 'glue', 'scotch tape', 'masking tape', 'packing tape'
];

cseKeywords.forEach(keyword => cseItemNames.add(keyword));

/**
 * Checks if a given item description corresponds to a Common-Use Supply & Equipment (CSE).
 * The logic first checks for an exact match against a pre-compiled list of PS-DBM items,
 * then checks for common keywords to classify general office supplies as CSE.
 * @param description The general description of the procurement item.
 * @returns {boolean} True if the item is considered a CSE, false otherwise.
 */
export const isCseItem = (description: string): boolean => {
    const lowerDesc = description.toLowerCase().trim();
    
    // Direct match check first for high accuracy
    if (cseItemNames.has(lowerDesc)) {
        return true;
    }

    // Broader keyword check for variations
    for (const keyword of cseKeywords) {
        if (lowerDesc.includes(keyword)) {
            return true;
        }
    }
    
    return false;
};
