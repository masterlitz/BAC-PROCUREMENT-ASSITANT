import { CatalogItem } from '../types';
import { prItems } from './items/otherSuppliesAndMaterials/pr_items';

export const otherSuppliesAndMaterials: CatalogItem[] = [
    {
        id: 70001,
        name: "4-Layer Lateral Filing Cabinet",
        description: "A durable, 4-layer lateral steel filing cabinet for office document storage. Features a lock mechanism and full-extension drawers.",
        category: "Other Supplies and Materials Expense",
        uacsCode: "50203990-00", // Other Supplies and Materials Expenses
        quantity: 50,
        unit: "unit",
        price: 15000.00,
        referenceLinks: [],
        itemCode: "FNT-CAB-LAT4",
        technicalSpecifications: "Layers: 4\nType: Lateral Filing Cabinet\nMaterial: Steel\nFeatures: Lockable, Full-extension drawers",
        imageUrl: "https://i.ibb.co/6rW5zFq/lateral-filing-cabinet.png"
    },
    {
        id: 70002,
        name: "Plaque 7x9 inches",
        description: "A 7x9 inch customizable plaque for awards and recognition ceremonies, typically made of glass, acrylic, or wood.",
        category: "Other Supplies and Materials Expense",
        uacsCode: "50203990-00",
        quantity: 100,
        unit: "pcs",
        price: 2200.00,
        referenceLinks: [],
        itemCode: "AWD-PLQ-7X9",
        technicalSpecifications: "Size: 7 x 9 inches\nMaterial: Glass or Acrylic\nCustomization: Engraving included",
        imageUrl: "https://i.ibb.co/gW0fC0h/award-plaque.png"
    },
    {
        id: 70003,
        name: "Token",
        description: "A custom token or medallion for awarding ceremonies and incentives, often presented in a display box.",
        category: "Other Supplies and Materials Expense",
        uacsCode: "50203990-00",
        quantity: 100,
        unit: "pcs",
        price: 2500.00,
        referenceLinks: [],
        itemCode: "AWD-TKN-01",
        technicalSpecifications: "Type: Award Token/Medallion\nMaterial: Metal or Crystal\nIncludes: Custom engraving and presentation box",
        imageUrl: "https://i.ibb.co/L9R6S8p/award-token.png"
    },
    { id: 70004, name: "Paint Mask", description: "Protective mask for painting tasks.", category: "Other Supplies and Materials Expense", uacsCode: "50203990-00", quantity: 100, unit: "pcs", price: 210.00, referenceLinks: [] },
    { id: 70005, name: "Construction Gloves", description: "Heavy-duty gloves for construction work.", category: "Other Supplies and Materials Expense", uacsCode: "50203990-00", quantity: 100, unit: "pairs", price: 89.00, referenceLinks: [] },
    { id: 70006, name: "Welding Mask", description: "Protective mask for welding.", category: "Other Supplies and Materials Expense", uacsCode: "50203990-00", quantity: 100, unit: "pc", price: 510.00, referenceLinks: [] },
    { id: 70007, name: "Construction Safety Vest", description: "High-visibility safety vest for construction sites.", category: "Other Supplies and Materials Expense", uacsCode: "50203990-00", quantity: 100, unit: "sets", price: 413.00, referenceLinks: [] },
    { id: 70008, name: "Safety Hard Hat", description: "Protective hard hat for construction and industrial work.", category: "Other Supplies and Materials Expense", uacsCode: "50203990-00", quantity: 100, unit: "pcs", price: 276.00, referenceLinks: [] },
    { id: 70009, name: "Safety Goggles", description: "Protective goggles for eye safety.", category: "Other Supplies and Materials Expense", uacsCode: "50203090-00", quantity: 100, unit: "pcs", price: 175.00, referenceLinks: [] },
    { id: 70010, name: "Safety Harness", description: "Full-body harness for fall protection.", category: "Other Supplies and Materials Expense", uacsCode: "50203990-00", quantity: 100, unit: "pcs", price: 1660.00, referenceLinks: [] },
    { id: 70011, name: "Safety Steel Toe Shoes", description: "Protective footwear with steel toe caps.", category: "Other Supplies and Materials Expense", uacsCode: "50203990-00", quantity: 100, unit: "pairs", price: 1810.00, referenceLinks: [] },
    ...prItems,
];