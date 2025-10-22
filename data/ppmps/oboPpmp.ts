
import { SavedPpmp, PpmpProjectItem } from '../../types';

const oboPpmpItems: PpmpProjectItem[] = [
  { 
    id: 36001, 
    office: "Office of the Building Official", 
    papCode: "03 010",
    generalDescription: "Rule Pad (Yellow Paper)", 
    quantity: 40, 
    uom: "rule", 
    procurementMode: "Negotiated", 
    estimatedBudget: 1000.00,
    projectType: "Goods",
    schedule: { jan: 250, feb: 0, mar: 0, apr: 250, may: 0, jun: 0, jul: 250, aug: 0, sep: 0, oct: 250, nov: 0, dec: 0 } 
  },
  { 
    id: 36002, 
    office: "Office of the Building Official", 
    papCode: "090",
    generalDescription: "Motor Oil Helix Red", 
    quantity: 15.38, 
    uom: "lit", 
    procurementMode: "Negotiated", 
    estimatedBudget: 1000.00,
    projectType: "Goods",
    schedule: { jan: 0, feb: 0, mar: 0, apr: 250, may: 0, jun: 0, jul: 500, aug: 0, sep: 0, oct: 250, nov: 0, dec: 0 } 
  },
  { 
    id: 36003, 
    office: "Office of the Building Official", 
    papCode: "990",
    generalDescription: "Scissors, size 15 cm", 
    quantity: 25, 
    uom: "pair", 
    procurementMode: "Negotiated", 
    estimatedBudget: 1000.00,
    projectType: "Goods",
    schedule: { jan: 80, feb: 80, mar: 120, apr: 120, may: 40, jun: 120, jul: 80, aug: 40, sep: 80, oct: 80, nov: 80, dec: 80 } 
  },
  { 
    id: 36004, 
    office: "Office of the Building Official", 
    papCode: "04 010",
    generalDescription: "Water Expenses", 
    quantity: 20, 
    uom: "bots.", 
    procurementMode: "Negotiated", 
    estimatedBudget: 1000.00,
    projectType: "Goods",
    schedule: { jan: 0, feb: 0, mar: 500, apr: 0, may: 0, jun: 0, jul: 500, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 } 
  },
  { 
    id: 36005, 
    office: "Office of the Building Official", 
    papCode: "13 050",
    generalDescription: "REPAIR & MAINTENANCE - Machineries & Equipment", 
    quantity: 1, 
    uom: "lot", 
    procurementMode: "Negotiated", 
    estimatedBudget: 1000.00,
    projectType: "Services",
    remarks: "As need arises",
    schedule: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 } 
  },
  { 
    id: 36006, 
    office: "Office of the Building Official", 
    papCode: "13 060",
    generalDescription: "REPAIR & MAINTENANCE-Transportation Equipment", 
    quantity: 1, 
    uom: "lot", 
    procurementMode: "Negotiated", 
    estimatedBudget: 1000.00,
    projectType: "Services",
    remarks: "As need arises",
    schedule: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 } 
  },
  { 
    id: 36007, 
    office: "Office of the Building Official", 
    papCode: "16 030",
    generalDescription: "INSURANCE EXPENSES", 
    quantity: 1, 
    uom: "lot", 
    procurementMode: "Negotiated", 
    estimatedBudget: 1000.00,
    projectType: "Services",
    remarks: "As need arises",
    schedule: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 } 
  },
  { 
    id: 36008, 
    office: "Office of the Building Official", 
    papCode: "99 990",
    generalDescription: "OTHER MAINTENANCE & OPERATING EXPENSES", 
    quantity: 1, 
    uom: "lot", 
    procurementMode: "Negotiated", 
    estimatedBudget: 1000.00,
    projectType: "Services",
    remarks: "As need arises",
    schedule: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 } 
  },
];

export const oboPpmp: SavedPpmp = {
  name: "Office of the Building Official",
  headerData: {
    ppmpNo: 'OBO-2026-001',
    fiscalYear: '2026',
    endUser: "Bacolod City - Office of the Building Official",
    status: 'final',
  },
  items: oboPpmpItems,
  footerData: {
    preparedBy: { name: 'MICHAEL G. LIM', position: 'Administrative Officer V', date: 'N/A' },
    submittedBy: { name: 'ENGR. AMY G. TENTIA', position: 'OIC, Building Official', date: 'N/A' },
  },
};
