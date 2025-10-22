
import { SavedPpmp, PpmpProjectItem } from '../../types';

const paadPpmpItems: PpmpProjectItem[] = [
    // Page 1
    // Office Supplies Expenses
    {
        id: 33001,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 010",
        generalDescription: "Office Supplies Expenses",
        quantity: 1,
        uom: "lot",
        procurementMode: "SVP",
        estimatedBudget: 32000.00,
        projectType: "Category Header"
    },
    {
        id: 33002,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 010",
        generalDescription: "Computer Ink Refill, black",
        quantity: 10,
        uom: "bottle",
        procurementMode: "Shopping",
        estimatedBudget: 4000.00,
        schedule: { jan: 1000, feb: 0, mar: 0, apr: 1000, may: 0, jun: 0, jul: 1000, aug: 0, sep: 0, oct: 1000, nov: 0, dec: 0 }
    },
    {
        id: 33003,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 010",
        generalDescription: "Computer Ink Refill, color",
        quantity: 10,
        uom: "bottle",
        procurementMode: "Shopping",
        estimatedBudget: 4000.00,
        schedule: { jan: 1000, feb: 0, mar: 0, apr: 1000, may: 0, jun: 0, jul: 1000, aug: 0, sep: 0, oct: 1000, nov: 0, dec: 0 }
    },
    {
        id: 33004,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 010",
        generalDescription: "Sign Pen 10s",
        quantity: 6,
        uom: "box",
        procurementMode: "Shopping",
        estimatedBudget: 6480.00,
        schedule: { jan: 1620, feb: 0, mar: 0, apr: 1620, may: 0, jun: 0, jul: 1620, aug: 0, sep: 0, oct: 1620, nov: 0, dec: 0 }
    },
    {
        id: 33005,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 010",
        generalDescription: "Bond Paper, long subs 20",
        quantity: 20,
        uom: "ream",
        procurementMode: "Shopping",
        estimatedBudget: 7000.00,
        schedule: { jan: 1750, feb: 0, mar: 0, apr: 1750, may: 0, jun: 0, jul: 1750, aug: 0, sep: 0, oct: 1750, nov: 0, dec: 0 }
    },
    {
        id: 33006,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 010",
        generalDescription: "Bond Paper, short subs 20",
        quantity: 20,
        uom: "ream",
        procurementMode: "Shopping",
        estimatedBudget: 6000.00,
        schedule: { jan: 1500, feb: 0, mar: 0, apr: 1500, may: 0, jun: 0, jul: 1500, aug: 0, sep: 0, oct: 1500, nov: 0, dec: 0 }
    },
    {
        id: 33007,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 010",
        generalDescription: "Photo Paper",
        quantity: 3,
        uom: "pack",
        procurementMode: "Shopping",
        estimatedBudget: 540.00,
        schedule: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 180, aug: 0, sep: 0, oct: 360, nov: 0, dec: 0 }
    },
    {
        id: 33008,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 010",
        generalDescription: "Sticker Paper",
        quantity: 3,
        uom: "pack",
        procurementMode: "Shopping",
        estimatedBudget: 240.00,
        schedule: { jan: 0, feb: 0, mar: 0, apr: 160, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 80, nov: 0, dec: 0 }
    },
    {
        id: 33009,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 010",
        generalDescription: "Calculator, desktop w/ Tax &",
        quantity: 1,
        uom: "pc",
        procurementMode: "Shopping",
        estimatedBudget: 1200.00,
        schedule: { jan: 1200, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
    },
    {
        id: 33010,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 010",
        generalDescription: "Pen organizer with drawer",
        quantity: 4,
        uom: "pc",
        procurementMode: "Shopping",
        estimatedBudget: 1480.00,
        schedule: { jan: 0, feb: 0, mar: 0, apr: 370, may: 0, jun: 0, jul: 370, aug: 0, sep: 0, oct: 740, nov: 0, dec: 0 }
    },
    {
        id: 33011,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 010",
        generalDescription: "Stapler",
        quantity: 2,
        uom: "pc",
        procurementMode: "Shopping",
        estimatedBudget: 1060.00,
        schedule: { jan: 0, feb: 0, mar: 0, apr: 530, may: 0, jun: 0, jul: 530, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
    },
    // Other Supplies Expenses
    {
        id: 33012,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 990",
        generalDescription: "Other Supplies Expenses",
        quantity: 1,
        uom: "lot",
        procurementMode: "SVP",
        estimatedBudget: 40000.00,
        projectType: "Category Header"
    },
    {
        id: 33013,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 990",
        generalDescription: "Uninterrupted Power Supply (UPS)",
        quantity: 1,
        uom: "unit",
        procurementMode: "Shopping",
        estimatedBudget: 3500.00,
        schedule: { jan: 3500, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
    },
    {
        id: 33014,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 990",
        generalDescription: "Automatic Voltage Regulator (AVR)",
        quantity: 2,
        uom: "unit",
        procurementMode: "Shopping",
        estimatedBudget: 7400.00,
        schedule: { jan: 3700, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 3700, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
    },
    {
        id: 33015,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 990",
        generalDescription: "Dishwashing Liquid 250ml",
        quantity: 60,
        uom: "bottle",
        procurementMode: "Shopping",
        estimatedBudget: 7200.00,
        schedule: { jan: 2400, feb: 0, mar: 0, apr: 3600, may: 0, jun: 0, jul: 1200, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
    },
    {
        id: 33016,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 990",
        generalDescription: "Tissue Paper 24s",
        quantity: 5,
        uom: "pack",
        procurementMode: "Shopping",
        estimatedBudget: 1800.00,
        schedule: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 1800, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
    },
    {
        id: 33017,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 990",
        generalDescription: "Black Bag",
        quantity: 10,
        uom: "pack",
        procurementMode: "Shopping",
        estimatedBudget: 4800.00,
        schedule: { jan: 0, feb: 0, mar: 0, apr: 2400, may: 0, jun: 0, jul: 2400, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
    },
    {
        id: 33018,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 990",
        generalDescription: "USB Mouse wireless",
        quantity: 3,
        uom: "pc",
        procurementMode: "Shopping",
        estimatedBudget: 1200.00,
        schedule: { jan: 0, feb: 0, mar: 0, apr: 1200, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
    },
    {
        id: 33019,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 990",
        generalDescription: "Alcohol 70% solution, 500ml",
        quantity: 50,
        uom: "bottle",
        procurementMode: "Shopping",
        estimatedBudget: 6000.00,
        schedule: { jan: 0, feb: 0, mar: 0, apr: 2400, may: 0, jun: 0, jul: 240, aug: 0, sep: 0, oct: 2520, nov: 0, dec: 840 }
    },
    {
        id: 33020,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 990",
        generalDescription: "Floor Mat heavy duty",
        quantity: 5,
        uom: "pc",
        procurementMode: "Shopping",
        estimatedBudget: 1250.00,
        schedule: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 1250, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
    },
    {
        id: 33021,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 990",
        generalDescription: "Extension Cord heavy duty",
        quantity: 2,
        uom: "pc",
        procurementMode: "Shopping",
        estimatedBudget: 1400.00,
        schedule: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 1400, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
    },
    {
        id: 33022,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 990",
        generalDescription: "Air Freshener gel type",
        quantity: 10,
        uom: "can",
        procurementMode: "Shopping",
        estimatedBudget: 3000.00,
        schedule: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 1500, aug: 0, sep: 0, oct: 1500, nov: 0, dec: 0 }
    },
    {
        id: 33023,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 990",
        generalDescription: "Disinfectant Liquid 1L",
        quantity: 5,
        uom: "bottle",
        procurementMode: "Shopping",
        estimatedBudget: 1250.00,
        schedule: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 1250, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
    },
    {
        id: 33024,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 990",
        generalDescription: "Hand Sanitizer Gel",
        quantity: 10,
        uom: "bottle",
        procurementMode: "Shopping",
        estimatedBudget: 900.00,
        schedule: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 450, aug: 0, sep: 0, oct: 450, nov: 0, dec: 0 }
    },
    {
        id: 33025,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 03 990",
        generalDescription: "Adapter plug heavy duty",
        quantity: 3,
        uom: "pc",
        procurementMode: "Shopping",
        estimatedBudget: 300.00,
        schedule: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 300, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
    },
    // Page 2
    {
        id: 33026,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 04 010",
        generalDescription: "Water Expenses",
        quantity: 50,
        uom: "container/bot.",
        procurementMode: "SVP",
        estimatedBudget: 75000.00,
        schedule: { jan: 18750, feb: 0, mar: 0, apr: 18750, may: 0, jun: 0, jul: 18750, aug: 0, sep: 0, oct: 18750, nov: 0, dec: 0 }
    },
    {
        id: 33027,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 13 050",
        generalDescription: "Rep. & Maint. Machineries & Equipment",
        quantity: 1,
        uom: "lot",
        procurementMode: "SVP",
        estimatedBudget: 40000.00,
        schedule: { jan: 10000, feb: 0, mar: 0, apr: 10000, may: 0, jun: 0, jul: 10000, aug: 0, sep: 0, oct: 10000, nov: 0, dec: 0 }
    },
    // Other MOOE
    {
        id: 33028,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 01 010",
        generalDescription: "Traveling Expenses-Local",
        quantity: 1,
        uom: "lot",
        procurementMode: "SVP",
        estimatedBudget: 16000.00,
        schedule: { jan: 4000, feb: 0, mar: 0, apr: 4000, may: 0, jun: 0, jul: 4000, aug: 0, sep: 0, oct: 4000, nov: 0, dec: 0 }
    },
    {
        id: 33029,
        office: "Public Affairs and Assistance Division",
        papCode: "5 02 02 010",
        generalDescription: "Training Expenses",
        quantity: 1,
        uom: "lot",
        procurementMode: "SVP",
        estimatedBudget: 40000.00,
        remarks: "As need arises"
    },
];

export const paadPpmp: SavedPpmp = {
    name: "Public Affairs and Assistance Division",
    headerData: {
        ppmpNo: 'PAAD-2026-PPMP',
        fiscalYear: '2026',
        endUser: "Public Affairs and Assistance Division",
        status: 'final',
    },
    items: paadPpmpItems,
    footerData: {
        preparedBy: { name: 'FATIMA ARAGON', position: 'Community Affairs Officer I', date: 'N/A' },
        submittedBy: { name: 'ROLANDO M. VILLAMOR, JR.', position: 'Community Affairs Officer IV', date: 'N/A' },
    },
};
