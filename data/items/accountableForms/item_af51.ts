
import { VariantMarketItem } from '../../../types';

export const item_af51: VariantMarketItem = {
    id: 100001,
    isVariant: true,
    name: "Accountable Form No. 51 (Official Receipt)",
    baseDescription: "Official Receipt (Accountable Form No. 51), used for acknowledging receipt of collections. Printed on high-quality carbonless paper, suitable for government transactions.",
    category: "ACCOUNTABLE FORMS",
    uacsCode: "50203020-00", // Accountable Forms, Books and Other B-Forms Expenses
    imageUrl: "https://i.ibb.co/6yqJgqJ/official-receipt.png",
    variants: [
        { itemCode: "ACF-51-CONT-BOX", description: "Continuous, Personalized", price: 9250.00, unit: "Box", stockStatus: "Available" },
        { itemCode: "ACF-51-STUB", description: "Personalized Stubs", price: 250.00, unit: "Stub", stockStatus: "Available" },
    ]
};
