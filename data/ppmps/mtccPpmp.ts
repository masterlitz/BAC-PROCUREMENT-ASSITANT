
import { SavedPpmp, PpmpProjectItem } from '../../types';

const mtccPpmpItems: PpmpProjectItem[] = [
    // Category Header
    {
        id: 48000,
        office: "Municipal Trial Court in Cities",
        generalDescription: "A. OFFICE SUPPLIES",
        quantity: 0,
        uom: "",
        procurementMode: "",
        estimatedBudget: 94392.00,
        projectType: "Category Header",
        papCode: "5 02 03 010"
    },
    // Items
    {
        id: 48001,
        office: "Municipal Trial Court in Cities",
        generalDescription: "Multipurpose Paper, Short Size",
        quantity: 120,
        uom: "reams",
        procurementMode: "Shopping",
        estimatedBudget: 19800.00,
        papCode: "5 02 03 010",
        schedule: { jan: 1650, feb: 1650, mar: 1650, apr: 1650, may: 1650, jun: 1650, jul: 1650, aug: 1650, sep: 1650, oct: 1650, nov: 1650, dec: 1650 }
    },
    {
        id: 48002,
        office: "Municipal Trial Court in Cities",
        generalDescription: "Multipurpose Paper, Legal Size",
        quantity: 120,
        uom: "reams",
        procurementMode: "Shopping",
        estimatedBudget: 22800.00,
        papCode: "5 02 03 010",
        schedule: { jan: 1900, feb: 1900, mar: 1900, apr: 1900, may: 1900, jun: 1900, jul: 1900, aug: 1900, sep: 1900, oct: 1900, nov: 1900, dec: 1900 }
    },
    {
        id: 48003,
        office: "Municipal Trial Court in Cities",
        generalDescription: "Ballpen, Black",
        quantity: 16,
        uom: "box",
        procurementMode: "Shopping",
        estimatedBudget: 960.00,
        papCode: "5 02 03 010",
        schedule: { jan: 80, feb: 80, mar: 80, apr: 80, may: 80, jun: 80, jul: 80, aug: 80, sep: 80, oct: 80, nov: 80, dec: 80 }
    },
    {
        id: 48004,
        office: "Municipal Trial Court in Cities",
        generalDescription: "Ballpen, Blue",
        quantity: 8,
        uom: "box",
        procurementMode: "Shopping",
        estimatedBudget: 480.00,
        papCode: "5 02 03 010",
        schedule: { jan: 40, feb: 40, mar: 40, apr: 40, may: 40, jun: 40, jul: 40, aug: 40, sep: 40, oct: 40, nov: 40, dec: 40 }
    },
    {
        id: 48005,
        office: "Municipal Trial Court in Cities",
        generalDescription: "Ballpen, Red",
        quantity: 8,
        uom: "box",
        procurementMode: "Shopping",
        estimatedBudget: 480.00,
        papCode: "5 02 03 010",
        schedule: { jan: 40, feb: 40, mar: 40, apr: 40, may: 40, jun: 40, jul: 40, aug: 40, sep: 40, oct: 40, nov: 40, dec: 40 }
    },
    {
        id: 48006,
        office: "Municipal Trial Court in Cities",
        generalDescription: "Epson L120/L121 Ink",
        quantity: 32,
        uom: "bottle",
        procurementMode: "Shopping",
        estimatedBudget: 10240.00,
        papCode: "5 02 03 010",
        schedule: { jan: 960, feb: 960, mar: 960, apr: 960, may: 960, jun: 320, jul: 960, aug: 960, sep: 960, oct: 960, nov: 960, dec: 320 }
    },
    {
        id: 48007,
        office: "Municipal Trial Court in Cities",
        generalDescription: "Brother DCP-T1710W Ink",
        quantity: 4,
        uom: "bottle",
        procurementMode: "Shopping",
        estimatedBudget: 1760.00,
        papCode: "5 02 03 010",
        schedule: { jan: 880, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 880, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
    },
    {
        id: 48008,
        office: "Municipal Trial Court in Cities",
        generalDescription: "Epson Ink M1100",
        quantity: 4,
        uom: "piece",
        procurementMode: "Shopping",
        estimatedBudget: 1392.00,
        papCode: "5 02 03 010",
        schedule: { jan: 696, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 696, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
    },
    {
        id: 48009,
        office: "Municipal Trial Court in Cities",
        generalDescription: "Brother Toner T3448",
        quantity: 4,
        uom: "piece",
        procurementMode: "Shopping",
        estimatedBudget: 20000.00,
        papCode: "5 02 03 010",
        schedule: { jan: 10000, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 10000, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
    },
    {
        id: 48010,
        office: "Municipal Trial Court in Cities",
        generalDescription: "Alcohol",
        quantity: 16,
        uom: "gallon",
        procurementMode: "Shopping",
        estimatedBudget: 8000.00,
        papCode: "5 02 03 010",
        schedule: { jan: 1000, feb: 1000, mar: 1000, apr: 1000, may: 0, jun: 0, jul: 1000, aug: 1000, sep: 1000, oct: 1000, nov: 0, dec: 0 }
    },
    {
        id: 48011,
        office: "Municipal Trial Court in Cities",
        generalDescription: "Zonrox",
        quantity: 16,
        uom: "bottle",
        procurementMode: "Shopping",
        estimatedBudget: 1280.00,
        papCode: "5 02 03 010",
        schedule: { jan: 160, feb: 160, mar: 160, apr: 160, may: 0, jun: 0, jul: 160, aug: 160, sep: 160, oct: 160, nov: 0, dec: 0 }
    },
    {
        id: 48012,
        office: "Municipal Trial Court in Cities",
        generalDescription: "Powder Detergent Soap",
        quantity: 16,
        uom: "pack",
        procurementMode: "Shopping",
        estimatedBudget: 1600.00,
        papCode: "5 02 03 010",
        schedule: { jan: 200, feb: 200, mar: 200, apr: 200, may: 0, jun: 0, jul: 200, aug: 200, sep: 200, oct: 200, nov: 0, dec: 0 }
    },
    {
        id: 48013,
        office: "Municipal Trial Court in Cities",
        generalDescription: "Colored Paper (Pink)",
        quantity: 16,
        uom: "reams",
        procurementMode: "Shopping",
        estimatedBudget: 5600.00,
        papCode: "5 02 03 010",
        schedule: { jan: 700, feb: 700, mar: 700, apr: 700, may: 0, jun: 0, jul: 700, aug: 700, sep: 700, oct: 700, nov: 0, dec: 0 }
    }
];

export const mtccPpmp: SavedPpmp = {
    name: "Municipal Trial Court in Cities",
    headerData: {
        ppmpNo: 'MTCC-2026-001',
        fiscalYear: '2026',
        endUser: "MTCC Bacolod City Branches 1 to 7 & Office of the Clerk of Court",
        status: 'final',
    },
    items: mtccPpmpItems,
    footerData: {
        preparedBy: { name: 'ANNIE LOU A. HILARIO', position: 'Clerk of Court IV', date: 'N/A' },
        submittedBy: { name: 'MARIA IMELDA A. WILLIAMS', position: 'CITY BUDGET OFFICER', date: 'N/A' },
    },
};
