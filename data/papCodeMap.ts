
// data/papCodeMap.ts

/**
 * A centralized mapping of keywords found in procurement item descriptions
 * to their official Unified Account Code Structure (UACS) Object Codes.
 * This ensures consistent and accurate PAP code assignment in generated documents like the APP.
 * Source: COA Revised Chart of Accounts, GPPB guidelines.
 */
export const papCodeMap: Record<string, string> = {
    // MOOE - Supplies and Materials
    'office supplies': '50203010-00',
    'accountable forms': '50203020-00',
    'food supplies': '50203050-00',
    'drugs and medicines': '50203080-00',
    'medical, dental': '50203070-00',
    'laboratory supplies': '50203070-00',
    'fuel, oil and lubricants': '50203100-00',
    'agricultural and marine supplies': '50203110-00',
    'other supplies and materials': '50203990-00',
    'janitorial': '50203020-00',
    'cleaning supplies': '50203020-00',
    'construction materials': '50299020-00',
    
    // MOOE - Utility Expenses
    'water expense': '50204010-00',
    'electricity expense': '50204020-00',

    // MOOE - Communication Expenses
    'postage and courier': '50205010-00',
    'telephone expense': '50205020-00',
    'internet subscription': '50205030-00',

    // MOOE - Professional Services
    'legal services': '50211010-00',
    'auditing services': '50211020-00',
    'consultancy services': '50211030-00',

    // MOOE - General Services
    'security services': '50212030-00',

    // MOOE - Repairs and Maintenance
    'r&m - buildings': '50213040-00',
    'repair and maintenance - buildings': '50213040-00',
    'r&m - machinery': '50213050-00',
    'repair and maintenance - machinery': '50213050-00',
    'r&m - transportation': '50213060-00',
    'repair and maintenance - transportation': '50213060-00',

    // MOOE - Other MOOE
    'representation expense': '50299030-00',
    'rent expenses': '50299050-00',

    // Capital Outlay
    'motor vehicles': '10706010-00',
    'it equipment': '10705030-00',
    'office equipment': '10705020-00',
    'furniture and fixtures': '10707010-00',
};

/**
 * A more specific keyword map to handle ambiguous terms.
 * This is checked before the general `papCodeMap`.
 */
export const specificKeywordMap: Record<string, string> = {
    'toner': '50203090-00', // IT Supplies, not Office Equipment
    'ink': '50203090-00', // IT Supplies, not Office Equipment
    'computer paper': '50203010-00', // Specifically an office supply
    'janitorial supplies': '50203020-00',
    'electrical supplies': '50299020-00'
};
