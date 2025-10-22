import { MarketItem } from '../../../types';

export const prItems: MarketItem[] = [
    {
        id: 98001,
        name: "Projector with Screen",
        description: "A digital projector paired with a portable tripod screen, suitable for presentations and meetings in various office environments.",
        category: "Office Equipment",
        uacsCode: "10705020-00",
        quantity: 1,
        unit: "unit",
        price: 29300.00,
        referenceLinks: [],
        itemCode: "OFE-PROJ-SCR-01",
        technicalSpecifications: "Projector: DLP/LCD, min. 3000 Lumens, WXGA Resolution\nScreen: Tripod stand, approx. 70x70 inches, Matte White surface",
        imageUrl: "https://i.ibb.co/6y4K0wG/projector-with-screen.png"
    },
    {
        id: 98002,
        name: "Portable Sound System with Wireless Microphones",
        description: "A portable PA sound system with a built-in amplifier, speaker, and two wireless microphones. Ideal for public addresses, seminars, and events.",
        category: "Office Equipment",
        uacsCode: "10705020-00",
        quantity: 1,
        unit: "unit",
        price: 15676.00,
        referenceLinks: [],
        itemCode: "OFE-PASYS-PORT-01",
        technicalSpecifications: "Power: Rechargeable battery and AC power\nSpeaker Size: 8-12 inches\nInputs: USB, SD Card, Bluetooth\nMicrophones: 2 VHF/UHF wireless handheld microphones included",
        imageUrl: "https://i.ibb.co/hKzK2C2/portable-sound-system.png"
    },
    {
        id: 99013,
        name: "Steno Writer Package",
        description: "A complete package for stenography students and professionals, including a Steno Writer machine, CAT software, a laptop, and accessories.",
        category: "Office Equipment",
        uacsCode: "10705020-00", // Office Equipment
        quantity: 1,
        unit: "set",
        price: 500000.00,
        referenceLinks: [],
        itemCode: "OFE-STENO-PKG-01",
        technicalSpecifications: `Steno Writer: Active-matrix color TFT-LCD, at least 7 inches, 800x400 resolution, 180-degree tilt, Lithium-ion battery.
Software: Computer Aided Transcription (CAT) Student License.
Laptop: Intel Core i5, 8GB RAM, 1TB Hard Drive, Windows 11 Home.
Accessories: Tripod, Micro USB Cable, Charger, Cleaning Kit.
Includes: Realtime Theory Reference Books and 2-day Online Training.
Warranty: One (1) year on parts and services.`,
        imageUrl: "https://i.ibb.co/hK7JqJ8/steno-writer.png"
    }
];
