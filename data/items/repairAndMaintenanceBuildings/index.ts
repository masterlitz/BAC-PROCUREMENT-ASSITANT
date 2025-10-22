
import { MarketItem, VariantMarketItem } from '../../../types';

export const repairAndMaintenanceBuildingsItems: (MarketItem | VariantMarketItem)[] = [
    {
        id: 90001,
        name: "Hi-Rib Roofing Sheet (Pre-painted)",
        description: "Pre-painted Hi-Rib profile roofing sheet, 0.4mm thick, for general construction and renovation.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 100, unit: "sheet", price: 3782.00, referenceLinks: [],
        itemCode: "RMB-ROOF-HIRIB04", technicalSpecifications: "Profile: Hi-Rib\nThickness: 0.4mm\nDimensions: 1.10m x 8.5m\nFinish: Pre-painted"
    },
    {
        id: 90002,
        name: "G.I. Plain Sheet (Pre-painted)",
        description: "Pre-painted Galvanized Iron (G.I.) plain sheet for roofing, flashing, and other construction applications.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 100, unit: "sheet", price: 715.00, referenceLinks: [],
        itemCode: "RMB-ROOF-GIPLAIN04", technicalSpecifications: "Thickness: 0.4mm\nDimensions: 1.20m x 2.40m\nFinish: Pre-painted"
    },
    {
        id: 90003,
        name: "Tekscrew for Metal Roofing, 2-inch",
        description: "Self-drilling tekscrew with washer for fastening metal roofing sheets to purlins.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 1000, unit: "pc", price: 3.00,
        referenceLinks: [], itemCode: "RMB-FAST-TEK2IN", technicalSpecifications: "Length: 2 inches\nMaterial: Hardened Steel, Galvanized\nHead: Hexagonal"
    },
    {
        id: 90004,
        name: "Elastomeric Roof Cement",
        description: "A high-grade, water-based elastomeric sealant for sealing joints, cracks, and gaps on various roofing materials.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 100, unit: "quart", price: 650.00, referenceLinks: [],
        itemCode: "RMB-SEAL-ELASTO", technicalSpecifications: "Type: Elastomeric Sealant\nPackaging: 1 Quart Can"
    },
    {
        id: 90005,
        name: "Fiber Cement Board, 4.5mm",
        description: "A versatile and durable fiber cement board for ceiling, walling, and siding applications. Resistant to fire, moisture, and termites.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 100, unit: "pc", price: 642.00, referenceLinks: [],
        itemCode: "RMB-BOARD-FCB45", technicalSpecifications: "Thickness: 4.5mm\nDimensions: 1.20m x 2.40m (4'x8')"
    },
    {
        id: 90006,
        name: "Metal Furring",
        description: "Galvanized steel metal furring channel for ceiling and drywall framing systems.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 100, unit: "length", price: 120.00, referenceLinks: [],
        itemCode: "RMB-FRAME-FURRING", technicalSpecifications: "Type: Ceiling/Drywall Furring Channel\nMaterial: Galvanized Steel\nStandard Length: 5 meters"
    },
    {
        id: 90007,
        name: "Blind Rivets, 1/4\" x 1/2\"",
        description: "Aluminum blind rivets for fastening metal sheets, plastics, and other materials.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 100, unit: "box", price: 300.00, referenceLinks: [],
        itemCode: "RMB-FAST-RIVET", technicalSpecifications: "Size: 1/4\" x 1/2\"\nPackaging: 500 pcs per box\nMaterial: Aluminum"
    },
    {
        id: 90008,
        isVariant: true,
        name: "Panel Door, 50mm",
        baseDescription: "A standard panel door, 50mm thick, for interior use. Comes in various sizes.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        variants: [
            { itemCode: "RMB-DOOR-PNL-90", description: "0.90m x 2.10m", price: 8500.00, unit: "set", stockStatus: "Available" },
            { itemCode: "RMB-DOOR-PNL-100", description: "1.0m x 2.10m", price: 10000.00, unit: "set", stockStatus: "Available" }
        ]
    },
    {
        id: 90009,
        isVariant: true,
        name: "PVC Door with Jamb & Lockset",
        baseDescription: "A complete PVC door set including door slab, jamb, and lockset. Ideal for bathrooms and service areas due to its water resistance. Note: Standard door height of 2.10m is assumed.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        variants: [
            { itemCode: "RMB-DOOR-PVC-60", description: "0.60m x 2.10m", price: 2535.00, unit: "set", stockStatus: "Available" },
            { itemCode: "RMB-DOOR-PVC-80", description: "0.80m x 2.10m", price: 4875.00, unit: "set", stockStatus: "Available" }
        ]
    },
    {
        id: 90010,
        name: "Door Lockset, Lever Type HD",
        description: "A heavy-duty lever-type door lockset for entrance doors, providing security and ease of use.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 100, unit: "set", price: 1540.00, referenceLinks: [],
        itemCode: "RMB-LOCK-LEVERHD", technicalSpecifications: "Type: Lever Handle Lockset\nGrade: Heavy Duty (Residential/Light Commercial)\nFunction: Entrance (Keyed)"
    },
    {
        id: 90011,
        name: "Dead Bolt Lock, Heavy Duty",
        description: "A heavy-duty deadbolt lock for enhanced security on exterior doors.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 100, unit: "set", price: 850.00, referenceLinks: [],
        itemCode: "RMB-LOCK-DEADBOLTHD", technicalSpecifications: "Type: Single Cylinder Deadbolt\nGrade: Heavy Duty\nFeature: Hardened steel bolt"
    },
    {
        id: 90012,
        name: "Foot Bolt Lock, Heavy Duty",
        description: "A heavy-duty foot-operated bolt for securing the bottom of a door.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 100, unit: "set", price: 580.00, referenceLinks: [],
        itemCode: "RMB-LOCK-FOOTBOLTHD", technicalSpecifications: "Type: Foot Bolt\nMaterial: Solid Brass or Stainless Steel"
    },
    {
        id: 90013,
        isVariant: true,
        name: "Ceramic Tiles",
        baseDescription: "Vitrified ceramic tiles for flooring and wall applications. Available in various sizes and colors.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        variants: [
            { itemCode: "RMB-TILE-FLR60", description: "Floor Tile, 60cm x 60cm, Colored", price: 200.00, unit: "pc", stockStatus: "Available" },
            { itemCode: "RMB-TILE-WALL30", description: "Wall Tile, 30cm x 60cm, Colored", price: 120.00, unit: "pc", stockStatus: "Available" }
        ]
    },
    {
        id: 90014,
        name: "Tile Adhesive, Heavy Duty",
        description: "A high-performance, cement-based tile adhesive for fixing ceramic, porcelain, and natural stone tiles.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 100, unit: "bag", price: 650.00, referenceLinks: [],
        itemCode: "RMB-ADH-TILEHD", technicalSpecifications: "Type: Cementitious Tile Adhesive (C2TE)\nPackaging: 25kg bag"
    },
    {
        id: 90015,
        name: "Tile Grout",
        description: "A cement-based grout for filling joints between tiles. Water and mold resistant.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 100, unit: "pack", price: 90.00, referenceLinks: [],
        itemCode: "RMB-GROUT-2KG", technicalSpecifications: "Packaging: 2kg pack\nColor: White or as specified"
    },
    {
        id: 90016,
        name: "Tile Trim, PVC 8ft",
        description: "A PVC tile trim for finishing and protecting tile edges.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 100, unit: "length", price: 130.00, referenceLinks: [],
        itemCode: "RMB-TRIM-TILE8", technicalSpecifications: "Material: PVC\nLength: 8 feet (2.44m)"
    },
    {
        id: 90017,
        name: "Synthetic Granite Countertop",
        description: "A durable and non-porous synthetic granite countertop slab for kitchens and bathrooms.",
        category: "Furniture and Fixtures",
        uacsCode: "50215030-00",
        quantity: 10, unit: "pc", price: 7450.00, referenceLinks: [],
        itemCode: "FNF-CTOP-GRANITE", technicalSpecifications: "Material: Engineered Quartz / Solid Surface\nDimensions: 0.80m x 3.0m\nColor: White"
    },
    {
        id: 90018,
        name: "Water Closet Set",
        description: "A complete one-piece or two-piece water closet set, including the bowl, tank, seat cover, and flushing mechanism.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 20, unit: "set", price: 7500.00, referenceLinks: [],
        itemCode: "RMB-PLMB-WCSET", technicalSpecifications: "Type: S-trap or P-trap as required\nFlush System: Dual flush (e.g., 3/4.5L)\nInclusions: Tank fittings, seat & cover, wax gasket, mounting bolts"
    },
    {
        id: 90019,
        name: "Pedestal Lavatory Set",
        description: "A complete pedestal lavatory set including the basin and pedestal, with fittings and accessories.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 20, unit: "set", price: 3500.00, referenceLinks: [],
        itemCode: "RMB-PLMB-LAVPED", technicalSpecifications: "Type: Pedestal Sink\nMaterial: Vitreous China\nInclusions: Faucet, p-trap, angle valves, flexible hoses"
    },
    {
        id: 90020,
        name: "Stainless Steel Kitchen Sink Set",
        description: "A single-tub stainless steel kitchen sink, 8 inches deep, complete with fittings.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 20, unit: "set", price: 4550.00, referenceLinks: [],
        itemCode: "RMB-PLMB-SINKSS", technicalSpecifications: "Type: Single Tub, 8\" depth\nMaterial: Stainless Steel\nInclusions: Sink, faucet, strainer, p-trap"
    },
    {
        id: 90021,
        name: "Gooseneck Faucet, SS Heavy Duty",
        description: "A heavy-duty stainless steel gooseneck faucet for kitchen or lavatory sinks.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 20, unit: "pc", price: 1688.00, referenceLinks: [],
        itemCode: "RMB-PLMB-FCTGOOSE", technicalSpecifications: "Type: Gooseneck Deck Mount Faucet\nMaterial: Stainless Steel (SS304)"
    },
    {
        id: 90022,
        name: "Bidet Spray, SS Heavy Duty",
        description: "A heavy-duty stainless steel handheld bidet spray set, including hose and holder.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 20, unit: "pc", price: 1038.00, referenceLinks: [],
        itemCode: "RMB-PLMB-BIDETSS", technicalSpecifications: "Type: Handheld Bidet Sprayer\nMaterial: Stainless Steel (SS304)"
    },
    {
        id: 90023,
        name: "3-Way Angle Valve, SS",
        description: "A stainless steel 3-way angle valve for controlling water flow to two outlets from a single source.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 50, unit: "pc", price: 750.00, referenceLinks: [],
        itemCode: "RMB-PLMB-VALV3WAY", technicalSpecifications: "Material: Stainless Steel\nSize: 1/2\" x 1/2\" x 1/2\""
    },
    {
        id: 90024,
        name: "Telephone Shower Set with 2-Way Faucet",
        description: "A telephone-style handheld shower set complete with a 2-way biblock faucet for diverting water.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 20, unit: "set", price: 1600.00, referenceLinks: [],
        itemCode: "RMB-PLMB-SHWRTEL", technicalSpecifications: "Type: Handheld Shower Set\nIncludes: Hand shower, hose, holder, 2-way faucet"
    },
    {
        id: 90025,
        name: "Wall Faucet, SS",
        description: "A standard stainless steel wall-mounted faucet or bibb cock.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 20, unit: "set", price: 950.00, referenceLinks: [],
        itemCode: "RMB-PLMB-FCTWALL", technicalSpecifications: "Type: Wall Mount Faucet\nMaterial: Stainless Steel\nSize: 1/2\" inlet"
    },
    {
        id: 90026,
        name: "Floor Drain, 4-inch",
        description: "A 4-inch stainless steel floor drain with strainer for bathrooms and utility areas.",
        category: "Repair & Maintenance - Buildings & Other Structures",
        uacsCode: "50213040-00",
        quantity: 20, unit: "set", price: 420.00, referenceLinks: [],
        itemCode: "RMB-PLMB-DRAIN4", technicalSpecifications: "Size: 4\" x 4\"\nMaterial: Stainless Steel\nOutlet: Fits 3\" or 4\" pipe"
    },
];
