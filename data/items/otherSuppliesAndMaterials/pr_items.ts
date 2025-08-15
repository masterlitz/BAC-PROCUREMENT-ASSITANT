import { MarketItem, VariantMarketItem } from '../../../types';

export const prItems: (MarketItem | VariantMarketItem)[] = [
    {
        id: 70012,
        isVariant: true,
        name: "Register Book (Logbook)",
        baseDescription: "A large, hardbound register book for the official recording of vital city records. Features high-quality paper and durable binding.",
        category: "Other Supplies and Materials Expense",
        uacsCode: "50203990-00",
        imageUrl: "https://i.ibb.co/N225tV6/register-book.png",
        variants: [
            { itemCode: "OSM-REG-BIRTH", description: "Register Book of Birth", price: 6625.00, unit: "book", stockStatus: "Available" },
            { itemCode: "OSM-REG-MARR", description: "Register Book of Marriage", price: 6625.00, unit: "book", stockStatus: "Available" },
            { itemCode: "OSM-REG-DEATH", description: "Register Book of Death", price: 6625.00, unit: "book", stockStatus: "Available" },
        ]
    },
    {
        id: 70013,
        name: "Uniform Kit (T-Shirt & Jogging Pants)",
        description: "A set of athletic uniforms consisting of a t-shirt and jogging pants, suitable for sports training and events.",
        category: "Other Supplies and Materials Expense",
        uacsCode: "50202010-00", // Training Expenses
        quantity: 100,
        unit: "set",
        price: 1000.00,
        referenceLinks: [],
        itemCode: "OSM-UNI-SPORT",
        technicalSpecifications: "Includes: 1 T-Shirt, 1 pair of Jogging Pants\nMaterial: Dri-fit or comfortable cotton blend\nCustomization: Available for printing of logos/text",
        imageUrl: "https://i.ibb.co/3sL9tPj/sports-uniform.png"
    },
    {
        id: 70014,
        name: "Volleyball (Official Size)",
        description: "A standard, official size and weight volleyball suitable for training and competitive play. Durable construction for indoor or outdoor use.",
        category: "Other Supplies and Materials Expense",
        uacsCode: "50202010-00",
        quantity: 100,
        unit: "piece",
        price: 1300.00,
        referenceLinks: [],
        itemCode: "OSM-EQP-VBALL",
        technicalSpecifications: "Size: Official Size 5\nMaterial: Synthetic Leather Cover\nConstruction: Machine-stitched or laminated",
        imageUrl: "https://i.ibb.co/8Yj0gYV/volleyball.png"
    },
    {
        id: 70015,
        name: "Sitting Volleyball Net",
        description: "A specialized volleyball net designed for sitting volleyball, with a lower height and standard width, compliant with paralympic standards.",
        category: "Other Supplies and Materials Expense",
        uacsCode: "50202010-00",
        quantity: 50,
        unit: "piece",
        price: 1200.00,
        referenceLinks: [],
        itemCode: "OSM-EQP-VNET-SIT",
        technicalSpecifications: "Type: Sitting Volleyball Net\nDimensions: Standard width, adjusted height for sitting play\nMaterial: Durable nylon or polyethylene netting",
        imageUrl: "https://i.ibb.co/rGD14S0/volleyball-net.png"
    }
];
