import { VariantMarketItem, MarketItem } from '../../../types';

export const officeSuppliesCatalog: (VariantMarketItem | MarketItem)[] = [
    {
        id: 10001,
        isVariant: true,
        name: "Bond Paper",
        baseDescription: "High-quality multi-purpose paper for printing and copying, available in various sizes and weights.",
        category: "Office Supplies",
        uacsCode: "50203010-00",
        imageUrl: "https://i.ibb.co/L6SPd98/advance-copy-paper.png",
        variants: [
            { itemCode: "50203010-00-1", description: "Legal Size, 70gsm", price: 305, unit: "Ream", stockStatus: "Available" },
            { itemCode: "50203010-00-2", description: "Letter, 70gsm", price: 280, unit: "Ream", stockStatus: "Available" },
            { itemCode: "50203010-00-3", description: "A4, 70gsm", price: 290, unit: "Ream", stockStatus: "Available" },
            { itemCode: "50203010-00-4", description: "Legal, 80gsm", price: 325, unit: "Ream", stockStatus: "Available" },
            { itemCode: "50203010-00-5", description: "Letter, 80gsm", price: 305, unit: "Ream", stockStatus: "Available" },
            { itemCode: "50203010-00-6", description: "A4, 80gsm", price: 315, unit: "Ream", stockStatus: "Available" },
        ]
    },
    {
        id: 10002,
        isVariant: true,
        name: "Ballpoint Pen",
        baseDescription: "Smooth-writing ballpoint pens for everyday office use, available in multiple colors. Sold by the box of 12.",
        category: "Office Supplies",
        uacsCode: "50203010-00",
        imageUrl: "https://i.ibb.co/XF6cmz9/ballpen-black.png",
        variants: [
            { itemCode: "50203010-00-7", description: "0.7mm, Red, Box of 12", price: 120, unit: "Box", stockStatus: "Available" },
            { itemCode: "50203010-00-8", description: "0.7mm, Black, Box of 12", price: 120, unit: "Box", stockStatus: "Available" },
            { itemCode: "50203010-00-9", description: "0.7mm, Blue, Box of 12", price: 120, unit: "Box", stockStatus: "Available" },
        ]
    },
    {
        id: 10003,
        isVariant: true,
        name: "Gel Pen",
        baseDescription: "Quick-drying gel pens for smooth, smudge-free writing, available in various colors. Sold by the box of 12.",
        category: "Office Supplies",
        uacsCode: "50203010-00",
        imageUrl: "https://i.ibb.co/z5pBZCv/gel-pen-black.png",
        variants: [
            { itemCode: "50203010-00-10", description: "0.5mm, Black, Box of 12", price: 330, unit: "Box", stockStatus: "Available" },
            { itemCode: "50203010-00-11", description: "0.5mm, Red, Box of 12", price: 330, unit: "Box", stockStatus: "Available" },
            { itemCode: "50203010-00-12", description: "0.5mm, Green, Box of 12", price: 330, unit: "Box", stockStatus: "Available" },
            { itemCode: "50203010-00-13", description: "0.5mm, Blue, Box of 12", price: 330, unit: "Box", stockStatus: "Available" },
        ]
    },
    {
        id: 10004, isVariant: false, name: "Sign Pen (Black) 0.5mm", description: "Sign pen with a 0.5mm tip for clear and bold signatures.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 120, unit: "Piece", quantity: 100, itemCode: "50203010-00-14", referenceLinks: []
    },
    {
        id: 10005, isVariant: false, name: "White Board Marker 2.5mm Box of 12 (Black, Blue, Red)", description: "Assorted whiteboard markers for presentations and notes.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 360, unit: "Box", quantity: 100, itemCode: "50203010-00-15", referenceLinks: []
    },
    {
        id: 10006, isVariant: false, name: "Document Tray 3-Tier, Plastic/Metal", description: "A 3-tiered tray for organizing office documents.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 380, unit: "Piece", quantity: 100, itemCode: "50203010-00-16", referenceLinks: []
    },
    {
        id: 10007, isVariant: false, name: "3-ring binder, PVC view cover, legal", description: "A legal-sized 3-ring binder with a clear PVC view cover.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 210, unit: "Piece", quantity: 100, itemCode: "50203010-00-17", referenceLinks: []
    },
    {
        id: 10008, isVariant: false, name: "Vellum Board 8.5X11 200GSM (100 SHEETS/REAM)", description: "A ream of 100 sheets of 200GSM vellum board.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 400, unit: "Ream", quantity: 100, itemCode: "50203010-00-18", referenceLinks: []
    },
    {
        id: 10009, isVariant: false, name: "A3 Paper Substance 20, 70GSM", description: "A ream of A3 paper, 70GSM.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 675, unit: "Ream", quantity: 100, itemCode: "50203010-00-19", referenceLinks: []
    },
    {
        id: 10010, isVariant: true, name: "Sticky Notes", baseDescription: "Adhesive notes for reminders and messages.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-20", description: "100's, 3x5", price: 145, unit: "Pack", stockStatus: "Available" },
            { itemCode: "50203010-00-21", description: "100's, 2x3", price: 86, unit: "Pack", stockStatus: "Available" },
            { itemCode: "50203010-00-22", description: "100's, 3x4", price: 132, unit: "Pack", stockStatus: "Available" },
            { itemCode: "50203010-00-23", description: "100's Flags, 11x43mm", price: 360, unit: "Pack", stockStatus: "Available" },
        ]
    },
    {
        id: 10011, isVariant: false, name: "Accountable Forms", description: "Official accountable forms for government transactions.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 500, unit: "Roll", quantity: 100, itemCode: "50203010-00-24", referenceLinks: []
    },
    {
        id: 10012, isVariant: true, name: "Acrylic Brochure Holder", baseDescription: "Clear acrylic holders for displaying brochures and flyers.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-25", description: "4.5 x 10\"", price: 480, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-26", description: "4 x 7\"", price: 360, unit: "Piece", stockStatus: "Available" },
        ]
    },
    {
        id: 10013, isVariant: true, name: "Adding Machine & Supplies", baseDescription: "Desktop adding machine for calculations and its paper roll.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-27", description: "Adding Machine, 12 Digits", price: 3370, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-28", description: "Paper Roll 57mm x 70m", price: 105, unit: "Roll", stockStatus: "Available" },
        ]
    },
    {
        id: 10014, isVariant: false, name: "All Purpose Glue Stick, 6 grams", description: "General purpose glue stick for paper and crafts.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 35, unit: "Piece", quantity: 100, itemCode: "50203010-00-29", referenceLinks: []
    },
    {
        id: 10015, isVariant: false, name: "Archfile folder, Legal, 3\"/ Binder", description: "Folder for archiving documents.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 205, unit: "Piece", quantity: 100, itemCode: "50203010-00-30", referenceLinks: []
    },
    {
        id: 10016, isVariant: false, name: "Art Paper, 8.5 x 11, 10s", description: "Paper for art and craft projects.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 30, unit: "Pack", quantity: 100, itemCode: "50203010-00-31", referenceLinks: []
    },
    {
        id: 10017, isVariant: true, name: "Baronial Envelope, 10s", baseDescription: "Envelopes for formal correspondence.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-32", description: "Size #6 (4 3/4 x 6 1/2\")", price: 54, unit: "Pack", stockStatus: "Available" },
            { itemCode: "50203010-00-33", description: "Size #8 (6 x 8\")", price: 76, unit: "Pack", stockStatus: "Available" },
            { itemCode: "50203010-00-34", description: "Size #4 (3 5/8 x 5 1/8\")", price: 35, unit: "Pack", stockStatus: "Available" },
        ]
    },
    {
        id: 10018, isVariant: true, name: "Binder Clip, Black, Box of 12s", baseDescription: "Metal clips for binding paper.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-35", description: "3/4\"", price: 20, unit: "Box", stockStatus: "Available" },
            { itemCode: "50203010-00-36", description: "1 5/8\"", price: 67, unit: "Box", stockStatus: "Available" },
            { itemCode: "50203010-00-37", description: "2\"", price: 95, unit: "Box", stockStatus: "Available" },
        ]
    },
    {
        id: 10019, isVariant: true, name: "Whiteboard, Aluminum Frame", baseDescription: "Whiteboards for presentations and notes.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-38", description: "3 x 5 feet", price: 2900, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-39", description: "2 x 3 feet", price: 1350, unit: "Piece", stockStatus: "Available" },
        ]
    },
    {
        id: 10020, isVariant: true, name: "Brown Envelope/Bag, 100s", baseDescription: "Standard brown kraft envelopes/bags.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-40", description: "Envelope, Legal", price: 490, unit: "Pack", stockStatus: "Available" },
            { itemCode: "50203010-00-41", description: "Envelope, Letter", price: 390, unit: "Pack", stockStatus: "Available" },
            { itemCode: "50203010-00-42", description: "Bag, Size #5", price: 120, unit: "Pack", stockStatus: "Available" },
        ]
    },
    {
        id: 10021, isVariant: false, name: "Expanding Envelope With Garter", description: "Expanding envelope with garter closure.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 30, unit: "Piece", quantity: 100, itemCode: "50203010-00-43", referenceLinks: []
    },
    {
        id: 10022, isVariant: false, name: "Calling Card Paper, A4, 250GSM, 50 sheets/pack", description: "Paper for printing calling cards.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 190, unit: "Pack", quantity: 100, itemCode: "50203010-00-44", referenceLinks: []
    },
    {
        id: 10023, isVariant: false, name: "Card Case, B5, 250mm x 176mm, 100s", description: "Case for storing cards.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 40, unit: "Box", quantity: 100, itemCode: "50203010-00-45", referenceLinks: []
    },
    {
        id: 10024, isVariant: false, name: "Certificate Jacket, A4", description: "Jacket for holding certificates.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 55, unit: "Piece", quantity: 100, itemCode: "50203010-00-46", referenceLinks: []
    },
    {
        id: 10025, isVariant: false, name: "Chipboard, 8.5 x 11\", 1.5mm thick, 100s", description: "Thick chipboard for various uses.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 930, unit: "Pack", quantity: 100, itemCode: "50203010-00-47", referenceLinks: []
    },
    {
        id: 10026, isVariant: true, name: "Clearbook, 40 Leaves", baseDescription: "Clearbook for document presentation.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-48", description: "Long", price: 162, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-49", description: "Short", price: 155, unit: "Piece", stockStatus: "Available" },
        ]
    },
    {
        id: 10027, isVariant: true, name: "Clear Folder", baseDescription: "Simple clear folder.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-50", description: "Long", price: 32, unit: "pcs", stockStatus: "Available" },
            { itemCode: "50203010-00-51", description: "Short", price: 28, unit: "pcs", stockStatus: "Available" },
        ]
    },
    {
        id: 10028, isVariant: true, name: "Clear Sheet Protector, 10s", baseDescription: "Protective sheets for documents.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-52", description: "Long", price: 35, unit: "Pack", stockStatus: "Available" },
            { itemCode: "50203010-00-53", description: "Short", price: 33, unit: "Pack", stockStatus: "Available" },
        ]
    },
    {
        id: 10029, isVariant: true, name: "Clip Board", baseDescription: "Clipboard for holding papers.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-54", description: "Long", price: 105, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-55", description: "A4", price: 100, unit: "Piece", stockStatus: "Available" },
        ]
    },
    {
        id: 10030, isVariant: true, name: "Columnar Book/Pad", baseDescription: "Columnar books and pads for accounting.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-56", description: "Book 14 Columns, 50 leaves", price: 60, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-57", description: "Book 12 Columns", price: 60, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-58", description: "Book 10 Columns", price: 60, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-59", description: "Book 3 Columns", price: 60, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-60", description: "Book 4 Columns", price: 60, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-61", description: "Book 5 Columns", price: 60, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-62", description: "Pad 24 Columns", price: 95, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-63", description: "Pad 14 Columns", price: 95, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-64", description: "Pad 18 Columns", price: 95, unit: "Piece", stockStatus: "Available" },
        ]
    },
    {
        id: 10031, isVariant: true, name: "Continuous Paper, Carbonless 3 Ply", baseDescription: "Continuous paper for dot matrix printers.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-65", description: "5-1/2\" x 9-1/2\"", price: 2050, unit: "Box", stockStatus: "Available" },
            { itemCode: "50203010-00-66", description: "11 x 14-7/8\"", price: 2350, unit: "Box", stockStatus: "Available" },
        ]
    },
    {
        id: 10032, isVariant: false, name: "Construction Paper, Assorted Color, 9 x 12\", 20s", description: "Assorted color construction paper.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 40, unit: "Pack", quantity: 100, itemCode: "50203010-00-67", referenceLinks: []
    },
    {
        id: 10033, isVariant: true, name: "Corkboard", baseDescription: "Corkboards for pinning notes and announcements.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-68", description: "2 x 3 feet, wooden frame", price: 760, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-69", description: "3 x 5 feet, aluminum frame", price: 3210, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-70", description: "2 x 4 feet, aluminum frame", price: 1650, unit: "Piece", stockStatus: "Available" },
        ]
    },
    {
        id: 10034, isVariant: false, name: "Paper Fastener, Medium Sized, 7cm", description: "Metal fasteners for documents.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 60, unit: "Pack", quantity: 100, itemCode: "50203010-00-71", referenceLinks: []
    },
    {
        id: 10035, isVariant: true, name: "Correction Tool", baseDescription: "Correction fluid pen and tape for fixing errors.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-72", description: "Pen, Liquid, 7mL", price: 105, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-73", description: "Tape, 5mmx12m", price: 54, unit: "Piece", stockStatus: "Available" },
        ]
    },
    {
        id: 10036, isVariant: true, name: "Adhesive Tape", baseDescription: "Various types of adhesive tapes for office use.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-74", description: "Duct Tape, 2\", 10 Meters", price: 110, unit: "pcs", stockStatus: "Available" },
            { itemCode: "50203010-00-75", description: "Stationary Tape, 1\", 25 yards", price: 25, unit: "Roll", stockStatus: "Available" },
            { itemCode: "50203010-00-76", description: "Scotch Tape, 12mm x 30m", price: 30, unit: "Roll", stockStatus: "Available" },
            { itemCode: "50203010-00-77", description: "Packing Tape, 48mm x 100m", price: 98, unit: "Roll", stockStatus: "Available" },
        ]
    },
    {
        id: 10037, isVariant: false, name: "Calculator, 12 Digits, Solar Battery", description: "Desktop calculator with solar power.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 600, unit: "Piece", quantity: 100, itemCode: "50203010-00-78", referenceLinks: []
    },
    {
        id: 10038, isVariant: false, name: "Super Glue, 3 grams", description: "Strong adhesive super glue.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 86, unit: "Piece", quantity: 100, itemCode: "50203010-00-79", referenceLinks: []
    },
    {
        id: 10039, isVariant: false, name: "Embosser, Handheld", description: "Handheld embosser for official seals.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 4150, unit: "Piece", quantity: 100, itemCode: "50203010-00-80", referenceLinks: []
    },
    {
        id: 10040, isVariant: true, name: "Expanded Folder", baseDescription: "Expanding folder for organizing documents.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-81", description: "Letter", price: 16, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-82", description: "Long", price: 17, unit: "Piece", stockStatus: "Available" },
        ]
    },
    {
        id: 10041, isVariant: false, name: "Expanding File Case, PVC, 12 pockets, Legal, with Handle", description: "Expanding file case with handle.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 450, unit: "Piece", quantity: 100, itemCode: "50203010-00-83", referenceLinks: []
    },
    {
        id: 10042, isVariant: false, name: "Eyelets, Tarpaulin, 10mm, 500s", description: "Tarpaulin eyelets.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 405, unit: "Pack", quantity: 100, itemCode: "50203010-00-84", referenceLinks: []
    },
    {
        id: 10043, isVariant: false, name: "Fax Paper, 216 x 30mm", description: "Thermal paper for fax machines.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 120, unit: "Roll", quantity: 100, itemCode: "50203010-00-85", referenceLinks: []
    },
    {
        id: 10044, isVariant: true, name: "Gun Tacker & Staples", baseDescription: "Heavy duty gun tacker and staples.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-86", description: "Gun Tacker", price: 1065, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-87", description: "Gun Tacker Staple", price: 260, unit: "Pack", stockStatus: "Available" },
        ]
    },
    {
        id: 10045, isVariant: false, name: "Scissors, 7 to 8\", Value Scissors", description: "General purpose office scissors.",
        category: "Office Supplies", uacsCode: "50203010-00", price: 110, unit: "Piece", quantity: 100, itemCode: "50203010-00-88", referenceLinks: []
    },
    {
        id: 10046, isVariant: true, name: "Stapler", baseDescription: "Office staplers for binding documents.",
        category: "Office Supplies", uacsCode: "50203010-00",
        variants: [
            { itemCode: "50203010-00-89", description: "Medium", price: 160, unit: "Piece", stockStatus: "Available" },
            { itemCode: "50203010-00-90", description: "Large, Heavy Duty, Book Binding", price: 2350, unit: "Piece", stockStatus: "Available" },
        ]
    }
];
