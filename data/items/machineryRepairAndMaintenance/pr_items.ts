import { MarketItem } from '../../../types';

export const prItems: MarketItem[] = [
    {
        id: 99001,
        name: "Plastic Shredder",
        description: "A machine for shredding plastic bottles and similar waste into smaller pieces for recycling, as part of a livelihood project.",
        category: "Repair & Maintenance - Machinery & Equipment",
        uacsCode: "10705990-00", // Other Machinery and Equipment
        quantity: 1,
        unit: "SET",
        price: 145450.00,
        referenceLinks: [],
        itemCode: "MCHEQP-SHRED-01",
        technicalSpecifications: `CAPACITY: 980 bottles / hour
MATERIALS: Stainless steel shredding blades, cover, and hopper
FEATURES: Electric motor overload protection, 3 HP induction motor (Single Phase), Forward and reverse switch, 2 stainless steel fine and coarse sieves
DIMENSIONS: 82 cm L x 60 cm W x 120 cm H
WEIGHT: 105 kgs
POWER: 2.24 kW
VOLTAGE: 220 V
SPEED: 1,749 RPM`,
        imageUrl: "https://i.ibb.co/6r1zYJb/paper-shredder.png"
    },
    {
        id: 99002,
        name: "Compression Oven w/ Assorted Steel Molders",
        description: "A compression oven with assorted steel molders for processing plastic waste into new products as part of a livelihood project.",
        category: "Repair & Maintenance - Machinery & Equipment",
        uacsCode: "10705990-00", // Other Machinery and Equipment
        quantity: 2,
        unit: "SET",
        price: 134400.00,
        referenceLinks: [],
        itemCode: "MCHEQP-OVEN-01",
        technicalSpecifications: `MATERIALS: Galvanized Body and Stand
FEATURES: (2) Tubular Heaters, Galvanized steel body/oven and stand, Plaster-Insulated, Double-Walled Oven
INSIDE DIMENSIONS: 45 cm L x 35 cm W x 55 cm H
OVERALL DIMENSIONS: 80 cm L x 80 cm W x 180 cm H
WEIGHT: 180 kg
POWER: 3 KW
INCLUSIONS: With eight (8) assorted design/size of steel molders`,
        imageUrl: "https://i.ibb.co/m0f643k/electric-oven.png"
    },
    {
        id: 99003,
        name: "Rotovator Blade (for YANMAR Tractor)",
        description: "Replacement rotovator blades for a YANMAR Tractor model VM351A. Set includes 54 pieces of LAC blades.",
        category: "Repair & Maintenance - Machinery & Equipment",
        uacsCode: "50213050-00", // R&M - Machinery & Equipment
        quantity: 1,
        unit: "set",
        price: 16000.00,
        referenceLinks: [],
        itemCode: "MCHEQP-ROTOBLADE-01",
        technicalSpecifications: `Tractor Compatibility: YANMAR Tractor VM351A
Blade Type: LAC Blades
Quantity: 54 pieces per set`,
        imageUrl: "https://i.ibb.co/2gLg5C8/chainsaw-blade.png"
    }
];
