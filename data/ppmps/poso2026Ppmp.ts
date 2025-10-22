
import { SavedPpmp, PpmpProjectItem } from '../../types';

const distributeQuarterlyBudget = (q1: number, q2: number, q3: number, q4: number) => {
    const distribute = (total: number) => {
        if (total === 0) return [0, 0, 0];
        const base = Math.floor((total / 3) * 100) / 100;
        const remainder = parseFloat((total - (base * 3)).toFixed(2));
        return [base, base, base + remainder];
    };
    const [jan, feb, mar] = distribute(q1);
    const [apr, may, jun] = distribute(q2);
    const [jul, aug, sep] = distribute(q3);
    const [oct, nov, dec] = distribute(q4);
    return { jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec };
};


const posoPpmpItems: PpmpProjectItem[] = [
    // --- Other Supplies and Materials Expenses ---
    {
        id: 33001, office: "Public Order and Safety Office", papCode: "5 02 01 010", generalDescription: "Other Supplies and Materials Expenses",
        quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 200000.00, projectType: "Category Header",
    },
    {
        id: 33002, office: "Public Order and Safety Office", papCode: "", generalDescription: "Less 20% Reserved",
        quantity: 0, uom: "", procurementMode: "", estimatedBudget: -40000.00, projectType: "Category Header",
    },
    {
        id: 33003, office: "Public Order and Safety Office", papCode: "", generalDescription: "TOTAL",
        quantity: 0, uom: "", procurementMode: "", estimatedBudget: 160000.00, projectType: "Category Header",
        schedule: distributeQuarterlyBudget(40000, 40000, 40000, 40000)
    },
    { id: 33004, office: "Public Order and Safety Office", papCode: "5 02 01 010", generalDescription: "Hand Held Radio", quantity: 15, uom: "pcs", procurementMode: "SVP", estimatedBudget: 50475.00, schedule: distributeQuarterlyBudget(12618.75, 12618.75, 12618.75, 12618.75) },
    { id: 33005, office: "Public Order and Safety Office", papCode: "5 02 01 010", generalDescription: "Handheld Security Scanner", quantity: 5, uom: "pcs", procurementMode: "SVP", estimatedBudget: 9519.05, schedule: distributeQuarterlyBudget(2379.76, 2379.76, 2379.76, 2379.77) },
    { id: 33006, office: "Public Order and Safety Office", papCode: "5 02 01 010", generalDescription: "Flashlight (ARFL-8901)", quantity: 20, uom: "pcs", procurementMode: "SVP", estimatedBudget: 5000.00, schedule: distributeQuarterlyBudget(1250, 1250, 1250, 1250) },
    { id: 33007, office: "Public Order and Safety Office", papCode: "5 02 01 010", generalDescription: "Security Whistle", quantity: 30, uom: "pcs", procurementMode: "SVP", estimatedBudget: 1950.00, schedule: distributeQuarterlyBudget(487.50, 487.50, 487.50, 487.50) },
    { id: 33008, office: "Public Order and Safety Office", papCode: "5 02 01 010", generalDescription: "Megaphone", quantity: 4, uom: "pcs", procurementMode: "SVP", estimatedBudget: 14000.00, schedule: distributeQuarterlyBudget(3500, 3500, 3500, 3500) },
    { id: 33009, office: "Public Order and Safety Office", papCode: "5 02 01 010", generalDescription: "Alcohol (Big)", quantity: 10, uom: "bots", procurementMode: "SVP", estimatedBudget: 1000.00, schedule: distributeQuarterlyBudget(250, 250, 250, 250) },
    { id: 33010, office: "Public Order and Safety Office", papCode: "5 02 01 010", generalDescription: "Toilet Tissue, 12 rolls/pack", quantity: 10, uom: "packs", procurementMode: "SVP", estimatedBudget: 1440.00, schedule: distributeQuarterlyBudget(360, 360, 360, 360) },
    { id: 33011, office: "Public Order and Safety Office", papCode: "5 02 01 010", generalDescription: "Toilet bowl cleaner", quantity: 10, uom: "bots", procurementMode: "SVP", estimatedBudget: 1130.00, schedule: distributeQuarterlyBudget(282.50, 282.50, 282.50, 282.50) },
    { id: 33012, office: "Public Order and Safety Office", papCode: "5 02 01 010", generalDescription: "Dishwashing Liquid", quantity: 10, uom: "bots", procurementMode: "SVP", estimatedBudget: 900.00, schedule: distributeQuarterlyBudget(225, 225, 225, 225) },
    { id: 33013, office: "Public Order and Safety Office", papCode: "5 02 01 010", generalDescription: "Powder Detergent (500ml)", quantity: 10, uom: "packs", procurementMode: "SVP", estimatedBudget: 600.00, schedule: distributeQuarterlyBudget(150, 150, 150, 150) },
    { id: 33014, office: "Public Order and Safety Office", papCode: "5 02 01 010", generalDescription: "Epson L3210 with CIS (printer)", quantity: 1, uom: "unit", procurementMode: "SVP", estimatedBudget: 13500.00, schedule: distributeQuarterlyBudget(3375, 3375, 3375, 3375) },
    { id: 33015, office: "Public Order and Safety Office", papCode: "5 02 01 010", generalDescription: "EPSON Ink Refill #664 [BK]", quantity: 10, uom: "bots", procurementMode: "SVP", estimatedBudget: 4500.00, schedule: distributeQuarterlyBudget(1125, 1125, 1125, 1125) },
    { id: 33016, office: "Public Order and Safety Office", papCode: "5 02 01 010", generalDescription: "EPSON Ink Refill #664 [C]", quantity: 8, uom: "bots", procurementMode: "SVP", estimatedBudget: 3600.00, schedule: distributeQuarterlyBudget(900, 900, 900, 900) },
    { id: 33017, office: "Public Order and Safety Office", papCode: "5 02 01 010", generalDescription: "EPSON Ink Refill #664 [M]", quantity: 8, uom: "bots", procurementMode: "SVP", estimatedBudget: 3600.00, schedule: distributeQuarterlyBudget(900, 900, 900, 900) },
    { id: 33018, office: "Public Order and Safety Office", papCode: "5 02 01 010", generalDescription: "EPSON Ink Refill #664 [Y]", quantity: 8, uom: "bots", procurementMode: "SVP", estimatedBudget: 3600.00, schedule: distributeQuarterlyBudget(900, 900, 900, 900) },

    // --- Office Supplies Expenses ---
    {
        id: 33019, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Office Supplies Expenses",
        quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 50000.00, projectType: "Category Header",
    },
    {
        id: 33020, office: "Public Order and Safety Office", papCode: "", generalDescription: "Less 20% Reserved",
        quantity: 0, uom: "", procurementMode: "", estimatedBudget: -10000.00, projectType: "Category Header",
    },
    {
        id: 33021, office: "Public Order and Safety Office", papCode: "", generalDescription: "TOTAL",
        quantity: 0, uom: "", procurementMode: "", estimatedBudget: 40000.00, projectType: "Category Header",
        schedule: distributeQuarterlyBudget(10000, 10000, 10000, 10000)
    },
    { id: 33022, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Ballpen, Black (12 pcs/box)", quantity: 10, uom: "boxes", procurementMode: "SVP", estimatedBudget: 1280.00, schedule: distributeQuarterlyBudget(320, 320, 320, 320) },
    { id: 33023, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Sign Pen (Black)", quantity: 2, uom: "boxes", procurementMode: "SVP", estimatedBudget: 600.00, schedule: distributeQuarterlyBudget(150, 150, 150, 150) },
    { id: 33024, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Pencil 12 pcs.", quantity: 6, uom: "boxes", procurementMode: "SVP", estimatedBudget: 720.00, schedule: distributeQuarterlyBudget(180, 180, 180, 180) },
    { id: 33025, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Folder Long (100's)", quantity: 1, uom: "pack", procurementMode: "SVP", estimatedBudget: 800.00, schedule: distributeQuarterlyBudget(200, 200, 200, 200) },
    { id: 33026, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Brown envelope long (100's)", quantity: 100, uom: "pcs", procurementMode: "SVP", estimatedBudget: 800.00, schedule: distributeQuarterlyBudget(200, 200, 200, 200) },
    { id: 33027, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Bond Paper Long (Hard Copy)", quantity: 30, uom: "reams", procurementMode: "SVP", estimatedBudget: 9000.00, schedule: distributeQuarterlyBudget(2250, 2250, 2250, 2250) },
    { id: 33028, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Bond Paper A4", quantity: 25, uom: "reams", procurementMode: "SVP", estimatedBudget: 7250.00, schedule: distributeQuarterlyBudget(1812.50, 1812.50, 1812.50, 1812.50) },
    { id: 33029, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Push pins", quantity: 7, uom: "box", procurementMode: "SVP", estimatedBudget: 140.00, schedule: distributeQuarterlyBudget(35, 35, 35, 35) },
    { id: 33030, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Record Book 500 pages", quantity: 40, uom: "pcs", procurementMode: "SVP", estimatedBudget: 8000.00, schedule: distributeQuarterlyBudget(2000, 2000, 2000, 2000) },
    { id: 33031, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Staple wire #35", quantity: 30, uom: "boxes", procurementMode: "SVP", estimatedBudget: 2400.00, schedule: distributeQuarterlyBudget(600, 600, 600, 600) },
    { id: 33032, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Stapler #35 heavy duty", quantity: 2, uom: "pcs", procurementMode: "SVP", estimatedBudget: 500.00, schedule: distributeQuarterlyBudget(125, 125, 125, 125) },
    { id: 33033, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Binder Clip (25 mm)12 pcs/box", quantity: 10, uom: "box", procurementMode: "SVP", estimatedBudget: 300.00, schedule: distributeQuarterlyBudget(75, 75, 75, 75) },
    { id: 33034, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Scotch Tape 2\"", quantity: 10, uom: "rolls", procurementMode: "SVP", estimatedBudget: 300.00, schedule: distributeQuarterlyBudget(75, 75, 75, 75) },
    { id: 33035, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Paper Clip 33mm", quantity: 7, uom: "box", procurementMode: "SVP", estimatedBudget: 210.00, schedule: distributeQuarterlyBudget(52.50, 52.50, 52.50, 52.50) },
    { id: 33036, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Pentel pen (BLACK)", quantity: 5, uom: "box", procurementMode: "SVP", estimatedBudget: 3300.00, schedule: distributeQuarterlyBudget(825, 825, 825, 825) },
    { id: 33037, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Whiteboard Pen (BLACK)", quantity: 10, uom: "boxes", procurementMode: "SVP", estimatedBudget: 5000.00, schedule: distributeQuarterlyBudget(1250, 1250, 1250, 1250) },
    { id: 33038, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Fastener", quantity: 10, uom: "boxes", procurementMode: "SVP", estimatedBudget: 460.00, schedule: distributeQuarterlyBudget(115, 115, 115, 115) },
    { id: 33039, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Fastener (8 1/2 Long)", quantity: 10, uom: "boxes", procurementMode: "SVP", estimatedBudget: 1300.00, schedule: distributeQuarterlyBudget(325, 325, 325, 325) },
    { id: 33040, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Expanding Folder (Long)", quantity: 50, uom: "pcs", procurementMode: "SVP", estimatedBudget: 1000.00, schedule: distributeQuarterlyBudget(250, 250, 250, 250) },
    { id: 33041, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Correction Tape", quantity: 20, uom: "pcs", procurementMode: "SVP", estimatedBudget: 700.00, schedule: distributeQuarterlyBudget(175, 175, 175, 175) },
    { id: 33042, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Pad Lock Medium", quantity: 6, uom: "pc", procurementMode: "SVP", estimatedBudget: 900.00, schedule: distributeQuarterlyBudget(225, 225, 225, 225) },
    { id: 33043, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Heavy Duty Cutter", quantity: 1, uom: "pc", procurementMode: "SVP", estimatedBudget: 150.00, schedule: distributeQuarterlyBudget(37.50, 37.50, 37.50, 37.50) },
    { id: 33044, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Sticky Notes, 3x3", quantity: 20, uom: "packs", procurementMode: "SVP", estimatedBudget: 1400.00, schedule: distributeQuarterlyBudget(350, 350, 350, 350) },
    { id: 33045, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Calculator", quantity: 1, uom: "pc", procurementMode: "SVP", estimatedBudget: 500.00, schedule: distributeQuarterlyBudget(125, 125, 125, 125) },
    { id: 33046, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Metal Ruler", quantity: 2, uom: "pcs", procurementMode: "SVP", estimatedBudget: 100.00, schedule: distributeQuarterlyBudget(25, 25, 25, 25) },
    { id: 33047, office: "Public Order and Safety Office", papCode: "5 02 03 010", generalDescription: "Highlighter", quantity: 20, uom: "pcs", procurementMode: "SVP", estimatedBudget: 800.00, schedule: distributeQuarterlyBudget(200, 200, 200, 200) },
    
    // --- Training Expense ---
    {
        id: 33048, office: "Public Order and Safety Office", papCode: "5 02 02 010", generalDescription: "Training Expense",
        quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 100000.00, projectType: "Category Header",
    },
    {
        id: 33049, office: "Public Order and Safety Office", papCode: "", generalDescription: "Less 20% Reserved",
        quantity: 0, uom: "", procurementMode: "", estimatedBudget: -20000.00, projectType: "Category Header",
    },
    {
        id: 33050, office: "Public Order and Safety Office", papCode: "", generalDescription: "TOTAL",
        quantity: 0, uom: "", procurementMode: "", estimatedBudget: 80000.00, projectType: "Category Header",
        schedule: distributeQuarterlyBudget(20000, 20000, 20000, 20000)
    },
    
    // --- Water Expenses ---
    {
        id: 33051, office: "Public Order and Safety Office", papCode: "5 02 04 010", generalDescription: "Water Expenses",
        quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 50000.00, projectType: "Category Header",
        schedule: distributeQuarterlyBudget(12500, 12500, 12500, 12500)
    },
    { id: 33052, office: "Public Order and Safety Office", papCode: "5 02 04 010", generalDescription: "Mineral Drinking Water 20L", quantity: 600, uom: "cby", procurementMode: "SVP", estimatedBudget: 30000.00, schedule: distributeQuarterlyBudget(7500, 7500, 7500, 7500) },

    // --- Other Maint. & Operating Expenses ---
    {
        id: 33053, office: "Public Order and Safety Office", papCode: "5 02 99 990", generalDescription: "Other Maint. & Operating Expenses",
        quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 10000.00, projectType: "Category Header",
    },
    {
        id: 33054, office: "Public Order and Safety Office", papCode: "", generalDescription: "Less 20% Reserved",
        quantity: 0, uom: "", procurementMode: "", estimatedBudget: -2000.00, projectType: "Category Header",
    },
    {
        id: 33055, office: "Public Order and Safety Office", papCode: "", generalDescription: "TOTAL",
        quantity: 0, uom: "", procurementMode: "", estimatedBudget: 8000.00, projectType: "Category Header",
        schedule: distributeQuarterlyBudget(2000, 2000, 2000, 2000)
    },
    { id: 33056, office: "Public Order and Safety Office", papCode: "5 02 99 990", generalDescription: "Garbage Black Bag (Big)", quantity: 10, uom: "packs", procurementMode: "SVP", estimatedBudget: 1100.00, schedule: distributeQuarterlyBudget(275, 275, 275, 275) },
    { id: 33057, office: "Public Order and Safety Office", papCode: "5 02 99 990", generalDescription: "Door Knob", quantity: 4, uom: "pcs", procurementMode: "SVP", estimatedBudget: 2400.00, schedule: distributeQuarterlyBudget(600, 600, 600, 600) },
    { id: 33058, office: "Public Order and Safety Office", papCode: "5 02 99 990", generalDescription: "Whiteboard 24x18", quantity: 1, uom: "pc", procurementMode: "SVP", estimatedBudget: 600.00, schedule: distributeQuarterlyBudget(150, 150, 150, 150) },
    { id: 33059, office: "Public Order and Safety Office", papCode: "5 02 99 990", generalDescription: "Aircon Window Type 2.5 HP", quantity: 1, uom: "pc", procurementMode: "SVP", estimatedBudget: 35000.00, schedule: distributeQuarterlyBudget(8750, 8750, 8750, 8750) },

    // --- Travelling Expense - Local ---
    {
        id: 33060, office: "Public Order and Safety Office", papCode: "5 02 01 010", generalDescription: "Travelling Expense - Local",
        quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 30000.00, projectType: "Category Header",
    },
    {
        id: 33061, office: "Public Order and Safety Office", papCode: "", generalDescription: "Less 20% Reserved",
        quantity: 0, uom: "", procurementMode: "", estimatedBudget: -6000.00, projectType: "Category Header",
    },
    {
        id: 33062, office: "Public Order and Safety Office", papCode: "", generalDescription: "TOTAL",
        quantity: 0, uom: "", procurementMode: "", estimatedBudget: 24000.00, projectType: "Category Header",
        schedule: distributeQuarterlyBudget(6000, 6000, 6000, 6000)
    },
];

export const poso2026Ppmp: SavedPpmp = {
  name: "Public Order and Safety Office",
  headerData: {
    ppmpNo: 'POSO-2026-001',
    fiscalYear: '2026',
    endUser: "Public Order and Safety Office",
    status: 'final',
  },
  items: posoPpmpItems,
  footerData: {
    preparedBy: { name: 'PATRICK B. HALILI', position: 'O.I.C. - POSO', date: 'N/A' },
    submittedBy: { name: 'ARLENE T. MEMORIA', position: 'Supervising Administrative Officer', date: 'N/A' },
  },
};
