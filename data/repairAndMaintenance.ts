import { MarketItem } from '../types';
import { prItems } from './items/repairAndMaintenance/pr_items';

export const repairAndMaintenance: MarketItem[] = [
    { 
        id: 11001, 
        name: "Primary Clutch Assembly", 
        description: "A complete primary clutch assembly for automatic transmission vehicles, typically scooters and ATVs. This component engages with the crankshaft to transfer engine power smoothly to the transmission, ensuring efficient acceleration.", 
        category: "Repair & Maintenance - Transportation Equipment", 
        uacsCode: "50213040-00", 
        quantity: 50, 
        unit: "SET", 
        price: 5800.00, 
        referenceLinks: [],
        itemCode: "RMT-PCA-001",
        technicalSpecifications: "Type: Primary Clutch Assembly (CVT)\nComponents: Clutch bell, clutch shoes, springs\nMaterial: High-strength aluminum alloy and friction material\nCompatibility: Please specify vehicle model (e.g., Yamaha NMAX, Honda Click)",
        imageUrl: "https://i.ibb.co/hKzK2C2/primary-clutch-assy.png"
    },
    { 
        id: 11002, 
        name: "Secondary Clutch Assembly", 
        description: "The secondary (driven) clutch assembly for CVT systems. It works with the primary clutch and drive belt to manage gear ratios, providing seamless torque transfer and smooth vehicle operation.", 
        category: "Repair & Maintenance - Transportation Equipment", 
        uacsCode: "50213040-00", 
        quantity: 50, 
        unit: "SET", 
        price: 3800.00, 
        referenceLinks: [],
        itemCode: "RMT-SCA-001",
        technicalSpecifications: "Type: Secondary/Driven Clutch Assembly (CVT)\nComponents: Torque drive, clutch lining/shoes, center spring\nMaterial: Steel and high-friction lining\nCompatibility: Please specify vehicle model",
        imageUrl: "https://i.ibb.co/6P0D63t/secondary-clutch-assy.png"
    },
    { 
        id: 11003, 
        name: "Valve Cover Gasket", 
        description: "A high-quality engine valve cover gasket designed to provide a reliable seal between the valve cover and the cylinder head, preventing oil leaks and protecting engine components.", 
        category: "Repair & Maintenance - Transportation Equipment", 
        uacsCode: "50213040-00", 
        quantity: 200, 
        unit: "PIECE", 
        price: 1100.00, 
        referenceLinks: [],
        itemCode: "RMT-VCG-001",
        technicalSpecifications: "Type: Valve Cover Gasket\nMaterial: Molded Rubber or Silicone\nTemperature Range: High resistance to heat and oil\nCompatibility: Vehicle-specific; please provide engine model (e.g., Toyota 2E, Mitsubishi 4D56)",
        imageUrl: "https://i.ibb.co/fH1V70d/valve-cover-gasket.png"
    },
    { 
        id: 11004, 
        name: "Woodruff Key (Half Moon)", 
        description: "A semi-circular Woodruff key, also known as a half-moon key, used to lock gears, pulleys, or flywheels to a rotating shaft. Essential for preventing slippage on components like crankshafts.", 
        category: "Repair & Maintenance - Transportation Equipment", 
        uacsCode: "50213040-00", 
        quantity: 500, 
        unit: "PIECE", 
        price: 880.00, 
        referenceLinks: [],
        itemCode: "RMT-WKEY-001",
        technicalSpecifications: "Type: Woodruff Key / Half-Moon Key\nMaterial: Hardened Steel\nApplication: Crankshafts, transmission shafts\nSize: Must be specified based on application requirements",
        imageUrl: "https://i.ibb.co/6y1n3vF/woodruff-key.png"
    },
    { 
        id: 11005, 
        name: "RTV Silicone Gasket Maker", 
        description: "A room-temperature-vulcanizing (RTV) silicone gasket maker used to form flexible, leak-proof seals on engine components. Replaces conventional cork, paper, and rubber gaskets.", 
        category: "Repair & Maintenance - Transportation Equipment", 
        uacsCode: "50213040-00", 
        quantity: 100, 
        unit: "TUBE", 
        price: 450.00, 
        referenceLinks: [],
        itemCode: "RMT-GSK-M01",
        technicalSpecifications: "Type: RTV Silicone Sealant\nVolume: 85g tube\nColor: Black (Oil-Resistant) or Red (High-Temp)\nTemperature Range: -65°F to 500°F (-54°C to 260°C)\nApplication: Valve covers, oil pans, timing covers",
        imageUrl: "https://i.ibb.co/7jZ6p7v/gasket-maker.png"
    },
    { 
        id: 11006, 
        name: "Isuzu Manlift Truck (SGK990) Cross Joint", 
        description: "A universal joint (U-joint, cross joint) is a critical component of the vehicle's driveshaft. It allows the driveshaft to transmit power at an angle as the suspension moves up and down. This specific cross joint is designed for Isuzu trucks like the SGK990 model, ensuring reliable torque transfer and smooth operation of the driveline.", 
        category: "Repair & Maintenance - Transportation Equipment", 
        uacsCode: "50213040-00", 
        quantity: 100, 
        unit: "PIECE", 
        price: 2350.00, 
        referenceLinks: [],
        itemCode: "RMT-CJT-001",
        technicalSpecifications: "Type: Cross Joint / Universal Joint\nApplication: Driveshaft / Propeller Shaft\nFeatures: Includes grease fitting (zerk), circlips/snap rings\nMaterial: High-strength forged steel with precision-ground bearing caps\nCompatibility: Isuzu Manlift Truck (SGK990) and similar commercial vehicles. Dimensions must be verified.",
        imageUrl: "https://i.ibb.co/L9d8b02/cross-joint.png"
    },
    ...(prItems || [])
];