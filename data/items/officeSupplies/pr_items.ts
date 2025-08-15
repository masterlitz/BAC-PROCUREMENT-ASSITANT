import { MarketItem, VariantMarketItem } from '../../../types';

export const prItems: (MarketItem | VariantMarketItem)[] = [
    {
        id: 10050,
        isVariant: true,
        name: "Municipal Accountable Forms",
        baseDescription: "Official pre-printed accountable forms used by the City Civil Registrar for recording vital events. Printed on high-quality security paper.",
        category: "Office Supplies",
        uacsCode: "50203020-00", // Accountable Forms Expense
        imageUrl: "https://i.ibb.co/K7wqz0g/accountable-forms.png",
        variants: [
            { itemCode: "ACF-FORM-102", description: "Form No. 102 - Certificate of Live Birth", price: 305.00, unit: "pad", stockStatus: "Available" },
            { itemCode: "ACF-FORM-97", description: "Form No. 97 - Certificate of Marriage", price: 305.00, unit: "pad", stockStatus: "Available" },
            { itemCode: "ACF-FORM-90", description: "Form No. 90 - Application for Marriage License", price: 245.00, unit: "pad", stockStatus: "Available" },
        ]
    },
    {
        id: 10051,
        name: "Acrylic Table Name Holder (A-Style)",
        description: "A freestanding, A-style (tent-style) acrylic name holder for desks, conference tables, and reception counters. Provides a professional way to display names and titles.",
        category: "Office Supplies",
        uacsCode: "50299990-99", // Other MOOE
        quantity: 150,
        unit: "piece",
        price: 520.00,
        referenceLinks: [],
        itemCode: "OS-ACR-NH-16X5",
        technicalSpecifications: "Style: A-Style / Tent Style\nMaterial: Clear Acrylic\nDimensions: 16 inches (Width) x 5 inches (Height)",
        imageUrl: "https://i.ibb.co/yQJ8YQd/acrylic-name-holder.png",
    },
    {
        id: 10052,
        name: "PVC ID Card (Pre-cut)",
        description: "Blank, pre-cut PVC cards for use with ID card printers. Standard CR80 credit card size, ideal for printing employee IDs, visitor passes, and membership cards.",
        category: "Office Supplies",
        uacsCode: "50203990-00", // Other Supplies
        quantity: 200,
        unit: "box",
        price: 1600.00,
        referenceLinks: [],
        itemCode: "OS-PVC-CR80",
        technicalSpecifications: "Material: PVC\nSize: CR80 (85.6mm x 54mm)\nThickness: 30 mil (standard)\nPackaging: 200 cards per box",
        imageUrl: "https://i.ibb.co/zQ6y8Qh/pvc-card.png",
    },
    {
        id: 10053,
        name: "Duplicator Master Roll CV B4",
        description: "A high-quality master roll for use in CV series digital duplicators. Creates the stencil for high-speed, low-cost printing.",
        category: "Office Supplies",
        uacsCode: "50203010-00",
        quantity: 100,
        unit: "roll",
        price: 3200.00,
        referenceLinks: [],
        itemCode: "OS-DUP-MR-CVB4",
        technicalSpecifications: "Size: B4\nCompatibility: Ricoh/Gestetner CV series duplicators\nYield: High-volume master creation",
        imageUrl: "https://i.ibb.co/Bq44pG2/duplicator-master.png"
    },
    {
        id: 10054,
        name: "Pencil, Graphite (Box of 12)",
        description: "A box containing 12 standard HB graphite pencils with erasers. Ideal for writing, sketching, and general office use.",
        category: "Office Supplies",
        uacsCode: "50203010-00",
        quantity: 200,
        unit: "box",
        price: 150.00,
        referenceLinks: [],
        itemCode: "OS-PCL-HB-12S",
        technicalSpecifications: "Grade: HB #2\nType: Wood-cased graphite pencil\nFeatures: Hexagonal barrel, latex-free eraser\nPackaging: 12 pencils per box",
        imageUrl: "https://i.ibb.co/y6Kz1qj/pencils.png"
    },
    {
        id: 82007,
        name: "Paper Shredder, Micro Cut",
        description: "A high-security micro-cut paper shredder capable of shredding paper, paper clips, and cards. Designed for continuous operation in an office environment.",
        category: "Office Supplies",
        uacsCode: "10705030-00",
        quantity: 15,
        unit: "unit",
        price: 19950.00,
        referenceLinks: [],
        itemCode: "OFE-SHRED-MC30L",
        technicalSpecifications: "Shred Type: Micro Cut\nShred Size: 2x12 mm\nSheet Capacity: 16 sheets per feed\nBin Capacity: 30 Liters\nSecurity Level: 5\nContinuous Operation: 60 minutes",
        imageUrl: "https://i.ibb.co/6r1zYJb/paper-shredder.png"
    }
];