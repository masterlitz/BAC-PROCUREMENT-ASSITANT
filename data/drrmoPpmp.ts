
import { SavedPpmp, PpmpProjectItem } from '../../types';

// Data extracted from the PPMP document for the DRRMO for FY 2026.
const drrmoPpmpItems: PpmpProjectItem[] = [
  // Training Expense Category - Total: 251,300.00
  { id: 37001, office: "Disaster Risk Reduction Management Office", generalDescription: "training shirt", quantity: 100, uom: "piece", procurementMode: "Shopping", estimatedBudget: 28000.00, projectType: "Goods", schedule: { jan: 2333.33, feb: 2333.33, mar: 2333.34, apr: 2333.33, may: 2333.33, jun: 2333.34, jul: 2333.33, aug: 2333.33, sep: 2333.34, oct: 2333.33, nov: 2333.33, dec: 2333.34 } },
  { id: 37002, office: "Disaster Risk Reduction Management Office", generalDescription: "Notebook 50 leaves", quantity: 50, uom: "piece", procurementMode: "Shopping", estimatedBudget: 1250.00, projectType: "Goods", schedule: { jan: 250, feb: 250, mar: 250, apr: 166.67, may: 166.67, jun: 166.66, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 } },
  { id: 37003, office: "Disaster Risk Reduction Management Office", generalDescription: "pencil", quantity: 25, uom: "box", procurementMode: "Shopping", estimatedBudget: 5500.00, projectType: "Goods", schedule: { jan: 1833.33, feb: 1833.33, mar: 1833.34, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 } },
  { id: 37004, office: "Disaster Risk Reduction Management Office", generalDescription: "Ball point pen (retractible, black)", quantity: 50, uom: "piece", procurementMode: "Shopping", estimatedBudget: 750.00, projectType: "Goods", schedule: { jan: 250, feb: 250, mar: 250, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 } },
  { id: 37005, office: "Disaster Risk Reduction Management Office", generalDescription: "Manila paper", quantity: 10, uom: "piece", procurementMode: "Shopping", estimatedBudget: 50.00, projectType: "Goods", schedule: { jan: 16.67, feb: 16.67, mar: 16.66, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 } },
  { id: 37006, office: "Disaster Risk Reduction Management Office", generalDescription: "ID Card Holder", quantity: 50, uom: "piece", procurementMode: "Shopping", estimatedBudget: 750.00, projectType: "Goods", schedule: { jan: 0, feb: 0, mar: 0, apr: 125, may: 125, jun: 125, jul: 125, aug: 125, sep: 125, oct: 0, nov: 0, dec: 0 } },
  { id: 37007, office: "Disaster Risk Reduction Management Office", generalDescription: "Special paper (10 leaves)", quantity: 50, uom: "pack", procurementMode: "Shopping", estimatedBudget: 2500.00, projectType: "Goods", schedule: { jan: 0, feb: 0, mar: 0, apr: 416.67, may: 416.67, jun: 416.66, jul: 416.67, aug: 416.67, sep: 416.66, oct: 0, nov: 0, dec: 0 } },
  { id: 37008, office: "Disaster Risk Reduction Management Office", generalDescription: "Photo paper (A4 20-40sheets)", quantity: 50, uom: "pack", procurementMode: "Shopping", estimatedBudget: 3250.00, projectType: "Goods", schedule: { jan: 0, feb: 0, mar: 0, apr: 541.67, may: 541.67, jun: 541.66, jul: 541.67, aug: 541.67, sep: 541.66, oct: 0, nov: 0, dec: 0 } },
  { id: 37009, office: "Disaster Risk Reduction Management Office", generalDescription: "Bond Paper (short)", quantity: 50, uom: "ream", procurementMode: "Shopping", estimatedBudget: 12000.00, projectType: "Goods", schedule: { jan: 0, feb: 0, mar: 0, apr: 2000, may: 2000, jun: 2000, jul: 2000, aug: 2000, sep: 2000, oct: 0, nov: 0, dec: 0 } },
  { id: 37010, office: "Disaster Risk Reduction Management Office", generalDescription: "Bond Paper (long)", quantity: 50, uom: "ream", procurementMode: "Shopping", estimatedBudget: 13250.00, projectType: "Goods", schedule: { jan: 0, feb: 0, mar: 0, apr: 2208.33, may: 2208.33, jun: 2208.34, jul: 2208.33, aug: 2208.33, sep: 2208.34, oct: 0, nov: 0, dec: 0 } },
  { id: 37011, office: "Disaster Risk Reduction Management Office", generalDescription: "Bond Paper (A4)", quantity: 50, uom: "ream", procurementMode: "Shopping", estimatedBudget: 12500.00, projectType: "Goods", schedule: { jan: 0, feb: 0, mar: 0, apr: 2083.33, may: 2083.33, jun: 2083.34, jul: 2083.33, aug: 2083.33, sep: 2083.34, oct: 0, nov: 0, dec: 0 } },
  { id: 37012, office: "Disaster Risk Reduction Management Office", generalDescription: "Snack (sanwich/Hamburger with bottled water)", quantity: 100, uom: "pack", procurementMode: "Shopping", estimatedBudget: 25000.00, projectType: "Goods", schedule: { jan: 2083.33, feb: 2083.33, mar: 2083.34, apr: 2083.33, may: 2083.33, jun: 2083.34, jul: 2083.33, aug: 2083.33, sep: 2083.34, oct: 2083.33, nov: 2083.33, dec: 2083.34 } },
  { id: 37013, office: "Disaster Risk Reduction Management Office", generalDescription: "Breakfast (rice, viand, drink and dessert)", quantity: 100, uom: "buffet/plate", procurementMode: "SVP", estimatedBudget: 40000.00, projectType: "Goods", schedule: { jan: 3333.33, feb: 3333.33, mar: 3333.34, apr: 3333.33, may: 3333.33, jun: 3333.34, jul: 3333.33, aug: 3333.33, sep: 3333.34, oct: 3333.33, nov: 3333.33, dec: 3333.34 } },
  { id: 37014, office: "Disaster Risk Reduction Management Office", generalDescription: "Lunch (rice, viand, drink and dessert)", quantity: 100, uom: "buffet/plate", procurementMode: "SVP", estimatedBudget: 40000.00, projectType: "Goods", schedule: { jan: 3333.33, feb: 3333.33, mar: 3333.34, apr: 3333.33, may: 3333.33, jun: 3333.34, jul: 3333.33, aug: 3333.33, sep: 3333.34, oct: 3333.33, nov: 3333.33, dec: 3333.34 } },
  { id: 37015, office: "Disaster Risk Reduction Management Office", generalDescription: "Dinner (rice, viand, drink and dessert)", quantity: 100, uom: "buffet/plate", procurementMode: "SVP", estimatedBudget: 40000.00, projectType: "Goods", schedule: { jan: 3333.33, feb: 3333.33, mar: 3333.34, apr: 3333.33, may: 3333.33, jun: 3333.34, jul: 3333.33, aug: 3333.33, sep: 3333.34, oct: 3333.33, nov: 3333.33, dec: 3333.34 } },
  { id: 37016, office: "Disaster Risk Reduction Management Office", generalDescription: "venue for 30-50PAX", quantity: 4, uom: "room", procurementMode: "SVP", estimatedBudget: 20000.00, projectType: "Goods", schedule: { jan: 1666.67, feb: 1666.67, mar: 1666.66, apr: 1666.67, may: 1666.67, jun: 1666.66, jul: 1666.67, aug: 1666.67, sep: 1666.66, oct: 1666.67, nov: 1666.67, dec: 1666.66 } },
  { id: 37017, office: "Disaster Risk Reduction Management Office", generalDescription: "room accomodation inclusive of breakfast and", quantity: 2, uom: "room", procurementMode: "Shopping", estimatedBudget: 4000.00, projectType: "Goods", schedule: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 666.67, aug: 666.67, sep: 666.66, oct: 666.67, nov: 666.67, dec: 666.66 } },
  { id: 37018, office: "Disaster Risk Reduction Management Office", generalDescription: "certificate Holder/ Frame", quantity: 10, uom: "piece", procurementMode: "Shopping", estimatedBudget: 1200.00, projectType: "Goods", schedule: { jan: 0, feb: 0, mar: 0, apr: 400, may: 400, jun: 400, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 } },
  { id: 37019, office: "Disaster Risk Reduction Management Office", generalDescription: "Sticker paper (paper, vinyl, etc.)", quantity: 10, uom: "pack", procurementMode: "Shopping", estimatedBudget: 1300.00, projectType: "Goods", schedule: { jan: 0, feb: 0, mar: 0, apr: 433.33, may: 433.33, jun: 433.34, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 } },
  
  // Office Equipment Category - Total: 240,000.00
  { id: 37020, office: "Disaster Risk Reduction Management Office", generalDescription: "Aircondition machine (inverter split type or window type)", quantity: 4, uom: "unit", procurementMode: "SVP", estimatedBudget: 240000.00, projectType: "Goods", schedule: { jan: 0, feb: 0, mar: 0, apr: 80000, may: 80000, jun: 80000, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 } },
];

export const drrmoPpmp: SavedPpmp = {
  name: "Disaster Risk Reduction Management Office",
  headerData: {
    ppmpNo: 'DRRMO-2026-001',
    fiscalYear: '2026',
    endUser: "Bacolod City - Disaster Risk Reduction and Management Office",
    status: 'final',
  },
  items: drrmoPpmpItems,
  footerData: {
    preparedBy: { name: 'DR. ANNA MARIA LAARNI M. PORNAN', position: 'LDRRMO IV / CDRRM Officer', date: 'N/A' },
    submittedBy: { name: 'MA. IMELDA A. WILLIAMS', position: 'City Budget Officer', date: 'N/A' },
  },
};
