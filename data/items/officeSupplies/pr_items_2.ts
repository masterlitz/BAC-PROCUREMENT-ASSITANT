import { MarketItem, VariantMarketItem } from '../../../types';

export const prItems2: (MarketItem | VariantMarketItem)[] = [
    {
        id: 10100,
        isVariant: true,
        name: "Special Paper (Hard)",
        baseDescription: "Heavyweight special paper (card stock) suitable for certificates, invitations, and official documents. 20 sheets per pack.",
        category: "Office Supplies",
        uacsCode: "50203010-00",
        variants: [
            { itemCode: "OS-SPCP-SHT", description: "White, 20's, Short", price: 500.00, unit: "pack", stockStatus: "Available" },
            { itemCode: "OS-SPCP-A4", description: "White, 20's, A4", price: 500.00, unit: "pack", stockStatus: "Available" }
        ]
    },
    { id: 10101, name: "Folder Long (100pcs/bundle)", description: "A bundle of 100 long-sized folders.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "bundle", price: 1600.00, referenceLinks: [] },
    {
        id: 10102,
        isVariant: true,
        name: "USB Flash Drive",
        baseDescription: "Portable USB flash drive for data storage and transfer.",
        category: "Office Supplies",
        uacsCode: "50203010-00",
        variants: [
            { itemCode: "OS-USB-32GB", description: "32GB", price: 550.00, unit: "pc", stockStatus: "Available" },
            { itemCode: "OS-USB-64GB", description: "64GB", price: 850.00, unit: "pc", stockStatus: "Available" }
        ]
    },
    { id: 10103, name: "Refill Ink Printer Set (CMYK)", description: "A complete set of refill ink bottles for printers, including Cyan, Magenta, Yellow, and Black.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "set", price: 2200.00, referenceLinks: [] },
    { id: 10104, name: "Crayon 24 Colors", description: "A box of 24 assorted color crayons.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "box", price: 90.00, referenceLinks: [] },
    {
        id: 10105,
        isVariant: true,
        name: "Illustration Board (White/Black)",
        baseDescription: "Illustration board with a white front and black reverse side.",
        category: "Office Supplies",
        uacsCode: "50203010-00",
        variants: [
            { itemCode: "OS-ILLBD-1/8", description: "1/8 size", price: 20.00, unit: "pc", stockStatus: "Available" },
            { itemCode: "OS-ILLBD-1/4", description: "1/4 size", price: 25.00, unit: "pc", stockStatus: "Available" },
            { itemCode: "OS-ILLBD-1/2", description: "1/2 size", price: 30.00, unit: "pc", stockStatus: "Available" }
        ]
    },
    { id: 10106, name: "Expanded Folder Long (Blue)", description: "Blue long expanded folder for organizing documents.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "pc", price: 160.00, referenceLinks: [] },
    {
        id: 10107,
        isVariant: true,
        name: "Clear Plastic Envelope (Good Quality)",
        baseDescription: "Durable clear plastic envelope with snap closure.",
        category: "Office Supplies",
        uacsCode: "50203010-00",
        variants: [
            { itemCode: "OS-ENVPL-SHT", description: "Short", price: 25.00, unit: "pc", stockStatus: "Available" },
            { itemCode: "OS-ENVPL-LNG", description: "Long", price: 30.00, unit: "pc", stockStatus: "Available" }
        ]
    },
    { id: 10108, name: "Marking Pen Permanent (Black, Box)", description: "A box of black permanent marking pens.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "box", price: 702.00, referenceLinks: [] },
    { id: 10109, name: "Whiteboard Eraser", description: "A standard eraser for whiteboards.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "pc", price: 120.00, referenceLinks: [] },
    { id: 10110, name: "White Board Pen Pack (R3,B3,Bk10)", description: "A pack of whiteboard pens containing 3 red, 3 blue, and 10 black.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "pc", price: 90.00, referenceLinks: [] },
    {
        id: 10111,
        isVariant: true,
        name: "Clear Book Folder (Blue, 20 Sheets)",
        baseDescription: "A blue clear book folder with 20 transparent sheets for presentations.",
        category: "Office Supplies",
        uacsCode: "50203010-00",
        variants: [
            { itemCode: "OS-CLRBF-LNG", description: "Long", price: 300.00, unit: "pack", stockStatus: "Available" },
            { itemCode: "OS-CLRBF-A4", description: "A4", price: 250.00, unit: "pack", stockStatus: "Available" }
        ]
    },
    { id: 10112, name: "Stapler w/ Remover #35, Heavy Duty", description: "Heavy duty stapler with built-in remover, uses #35 staples.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "pc", price: 1200.00, referenceLinks: [] },
    { id: 10113, name: "Ballpen Black (5's)", description: "A pack of 5 black ballpoint pens.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "box", price: 750.00, referenceLinks: [] },
    { id: 10114, name: "ID Cords", description: "Lanyards or cords for holding ID cards.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "pc", price: 30.00, referenceLinks: [] },
    { id: 10115, name: "Ruler 12 inches, Metal", description: "A 12-inch metal ruler for precise measurements.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "pc", price: 61.87, referenceLinks: [] },
    { id: 10116, name: "Record Book 500 Pages", description: "A hardbound record book with 500 pages.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "pc", price: 225.00, referenceLinks: [] },
    { id: 10117, name: "Packing Tape 2\"", description: "2-inch wide clear packing tape.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "roll", price: 80.00, referenceLinks: [] },
    { id: 10118, name: "Double Sided Tape", description: "Double-sided adhesive tape.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "roll", price: 50.00, referenceLinks: [] },
    { id: 10119, name: "Sign Pen Black (12's)", description: "A box of 12 black sign pens.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "box", price: 1200.00, referenceLinks: [] },
    { id: 10120, name: "White Letter Envelope (500's)", description: "A box of 500 white letter-sized envelopes.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "box", price: 400.00, referenceLinks: [] },
    { id: 10121, name: "Pencil, Good Quality (12pcs/box)", description: "A box of 12 good quality pencils.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "box", price: 120.00, referenceLinks: [] },
    { id: 10122, name: "Stamp Pad #4", description: "A number 4 sized stamp pad.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "pc", price: 65.00, referenceLinks: [] },
    { id: 10123, name: "Sando Plastic Bag 20x30\"", description: "A pack of 20x30 inch sando plastic bags.", category: "Office Supplies", uacsCode: "50203010-00", quantity: 100, unit: "pack", price: 275.00, referenceLinks: [] }
];
