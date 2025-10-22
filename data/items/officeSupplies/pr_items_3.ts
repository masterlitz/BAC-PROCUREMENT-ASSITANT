
import { MarketItem, VariantMarketItem } from '../../../types';

export const prItems3: (MarketItem | VariantMarketItem)[] = [
    { id: 99014, name: "Ink, Printer (003, 664, 62010)", description: "Assorted printer inks for various models.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 8, unit: "bots", price: 370.00, referenceLinks: [] },
    { id: 99015, name: "Paper/film KIP Roll (770)", description: "Specialty paper roll for KIP wide format printers.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 6, unit: "rolls", price: 4000.00, referenceLinks: [] },
    {
        id: 99016,
        isVariant: true,
        name: "Technical Pen",
        baseDescription: "Precision technical pen for drafting and drawing.",
        category: "Office Supplies",
        uacsCode: "50203010-00",
        variants: [
            { itemCode: "OS-PEN-TECH-01", description: "0.1mm tip", price: 1700.00, unit: "pc", stockStatus: "Available" },
            { itemCode: "OS-PEN-TECH-02", description: "0.2mm tip", price: 1500.00, unit: "pc", stockStatus: "Available" },
            { itemCode: "OS-PEN-TECH-03", description: "0.3mm tip", price: 1300.00, unit: "pc", stockStatus: "Available" },
            { itemCode: "OS-PEN-TECH-04", description: "0.4mm tip", price: 1500.00, unit: "pc", stockStatus: "Available" },
            { itemCode: "OS-PEN-TECH-06", description: "0.6mm tip", price: 1500.00, unit: "pc", stockStatus: "Available" },
        ]
    },
    { id: 99017, name: "Technical Pen Ink", description: "Ink refill for technical pens.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 10, unit: "bots", price: 430.00, referenceLinks: [] },
    { id: 99018, name: "Toner, wide printer (TN770)", description: "Toner for wide format printers, TN770 model.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 2, unit: "tubes", price: 9000.00, referenceLinks: [] },
    { id: 99019, name: "Tracing Paper #1995, 42\" width", description: "42-inch wide tracing paper roll for drafting.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 2, unit: "rolls", price: 8000.00, referenceLinks: [] },
    { id: 99020, name: "Mylar Film, 42\" width", description: "42-inch wide Mylar film roll for drafting and archival purposes.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 2, unit: "rolls", price: 7250.00, referenceLinks: [] },
    { id: 99021, name: "Pentel Pen", description: "General purpose felt-tip Pentel pen.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 20, unit: "pcs", price: 55.00, referenceLinks: [] },
    {
        id: 99022,
        isVariant: true,
        name: "Highlighter",
        baseDescription: "Highlighter pen for marking documents.",
        category: "Office Supplies",
        uacsCode: "50203010-00",
        variants: [
            { itemCode: "OS-HL-GREEN", description: "Green", price: 58.33, unit: "pc", stockStatus: "Available" },
            { itemCode: "OS-HL-YELLOW", description: "Yellow", price: 58.33, unit: "pc", stockStatus: "Available" },
            { itemCode: "OS-HL-RED", description: "Red", price: 58.33, unit: "pc", stockStatus: "Available" },
        ]
    },
    { id: 99023, name: "Organizer (2 level)", description: "A 2-level desk organizer for documents and supplies.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 5, unit: "pcs", price: 2200.00, referenceLinks: [] }
];
