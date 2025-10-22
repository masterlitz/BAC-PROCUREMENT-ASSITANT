
import { SavedPpmp } from '../../types';

export const ceoPublicWorksPpmp: SavedPpmp = {
  name: "CEO-Public Works Division",
  headerData: {
    ppmpNo: 'CEO-PWD-2026-001',
    fiscalYear: '2026',
    endUser: "City Engineer's Office - Public Works Division",
    status: 'final',
  },
  items: [
    // Page 1 - Office Supplies
    { id: 31001, office: "CEO-Public Works Division", papCode: "5-02-03-010", generalDescription: "Copying paper long (Hard copy)", quantity: 66, uom: "reams", procurementMode: "Shopping", estimatedBudget: 19470.00, schedule: { jan: 0, feb: 0, mar: 0, apr: 4867.50, may: 0, jun: 0, jul: 4867.50, aug: 0, sep: 0, oct: 9735.00, nov: 0, dec: 0 } },
    { id: 31002, office: "CEO-Public Works Division", papCode: "5-02-03-010", generalDescription: "Copying paper short (Hard copy)", quantity: 51, uom: "ream", procurementMode: "Shopping", estimatedBudget: 14535.00, schedule: { jan: 0, feb: 0, mar: 0, apr: 3633.75, may: 0, jun: 0, jul: 3633.75, aug: 0, sep: 0, oct: 7267.50, nov: 0, dec: 0 } },
    { id: 31003, office: "CEO-Public Works Division", papCode: "5-02-03-010", generalDescription: "A3", quantity: 10, uom: "ream", procurementMode: "Shopping", estimatedBudget: 4850.00, schedule: { jan: 0, feb: 0, mar: 0, apr: 1212.50, may: 0, jun: 0, jul: 1212.50, aug: 0, sep: 0, oct: 2425.00, nov: 0, dec: 0 } },
    { id: 31004, office: "CEO-Public Works Division", papCode: "5-02-03-010", generalDescription: "Folder long", quantity: 300, uom: "pcs", procurementMode: "Shopping", estimatedBudget: 2250.00, schedule: { jan: 0, feb: 0, mar: 0, apr: 562.50, may: 0, jun: 0, jul: 562.50, aug: 0, sep: 0, oct: 1125.00, nov: 0, dec: 0 } },
    { id: 31005, office: "CEO-Public Works Division", papCode: "5-02-03-010", generalDescription: "Sign pen Pilot black 0.3", quantity: 24, uom: "pcs", procurementMode: "Shopping", estimatedBudget: 2112.00, schedule: { jan: 0, feb: 0, mar: 0, apr: 1056.00, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 1056.00, nov: 0, dec: 0 } },
    { id: 31006, office: "CEO-Public Works Division", papCode: "5-02-03-010", generalDescription: "Sign pen Pilot black 0.5", quantity: 24, uom: "pcs", procurementMode: "Shopping", estimatedBudget: 2112.00, schedule: { jan: 0, feb: 0, mar: 0, apr: 1056.00, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 1056.00, nov: 0, dec: 0 } },
    { id: 31007, office: "CEO-Public Works Division", papCode: "5-02-03-010", generalDescription: "Computer printer Ink colored (Epson)T664", quantity: 30, uom: "bot", procurementMode: "Shopping", estimatedBudget: 11700.00, schedule: { jan: 0, feb: 0, mar: 0, apr: 2925.00, may: 0, jun: 0, jul: 2925.00, aug: 0, sep: 0, oct: 5850.00, nov: 0, dec: 0 } },
    { id: 31008, office: "CEO-Public Works Division", papCode: "5-02-03-010", generalDescription: "Computer Ink Black Epson #008 (assorted)", quantity: 20, uom: "bot", procurementMode: "Shopping", estimatedBudget: 22800.00, schedule: { jan: 0, feb: 0, mar: 0, apr: 5700.00, may: 0, jun: 0, jul: 5700.00, aug: 0, sep: 0, oct: 11400.00, nov: 0, dec: 0 } },
    // Page 2 - Other MOOE and Capital Outlay
    { id: 31009, office: "CEO-Public Works Division", papCode: "5-02-03-990", generalDescription: "Other Supplies & Materials Exp.", projectType: "Goods", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 1200000.00 },
    { id: 31010, office: "CEO-Public Works Division", papCode: "5-02-13-030", generalDescription: "Repair & Maint. - Infrastructure Assets", projectType: "Services", quantity: 1, uom: "lot", procurementMode: "Bidding", estimatedBudget: 0.00 },
    { id: 31011, office: "CEO-Public Works Division", papCode: "5-02-13-040", generalDescription: "Repair & Maint. - Bldg & Other Structures", projectType: "Services", quantity: 1, uom: "lot", procurementMode: "Bidding", estimatedBudget: 2400000.00 },
    { id: 31012, office: "CEO-Public Works Division", papCode: "5-02-13-050", generalDescription: "Repair & Maint. - Mach. & Equip.", projectType: "Services", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 60000.00 },
    { id: 31013, office: "CEO-Public Works Division", papCode: "5-02-99-990", generalDescription: "Other Maint. & Operating Expenses", projectType: "Services", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 8000.00 },
    { id: 31014, office: "CEO-Public Works Division", papCode: "5-02-01-010", generalDescription: "Travelling Expenses", projectType: "Services", quantity: 1, uom: "lot", procurementMode: "Direct", estimatedBudget: 64000.00 },
    { id: 31015, office: "CEO-Public Works Division", papCode: "5-02-02-010", generalDescription: "Training Expenses", projectType: "Services", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 120000.00 },
    { id: 31016, office: "CEO-Public Works Division", papCode: "1-07-04-010", generalDescription: "Buildings & Other Structure", projectType: "Infrastructure", quantity: 1, uom: "lot", procurementMode: "Bidding", estimatedBudget: 3000000.00 },
    { id: 31017, office: "CEO-Public Works Division", papCode: "1-07-05-990", generalDescription: "Other Machinery and Equipment", projectType: "Goods", quantity: 1, uom: "lot", procurementMode: "Bidding", estimatedBudget: 1000000.00 },
    { id: 31018, office: "CEO-Public Works Division", papCode: "1-07-03-990", generalDescription: "Other Infrastructure Assets", projectType: "Infrastructure", quantity: 1, uom: "lot", procurementMode: "Bidding", estimatedBudget: 1000000.00 },
  ],
  footerData: {
    preparedBy: { name: 'LOBEN RAFAEL D. CEBALLOS', position: 'OIC - City Engineer', date: 'N/A' },
    submittedBy: { name: 'MARIA IMELDA A. WILLIAMS', position: 'City Budget Officer', date: 'N/A' },
  },
};
