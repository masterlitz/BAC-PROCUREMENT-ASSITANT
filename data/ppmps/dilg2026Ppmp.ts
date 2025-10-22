
import { SavedPpmp } from '../../types';

export const dilg2026Ppmp: SavedPpmp = {
  name: "DILG (2026)",
  headerData: {
    ppmpNo: 'DILG-2026-001',
    fiscalYear: '2026',
    endUser: "Bacolod City - DILG Bacolod City",
    status: 'final',
  },
  items: [
    {
      id: 18001,
      office: "DILG (2026)",
      generalDescription: "Procurement of Various Supplies (Office, Fuel, Other Materials)",
      projectType: "Goods",
      quantity: 1,
      uom: "lot",
      procurementMode: "SVP / Shopping",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "As needed",
      sourceOfFunds: "GAA",
      estimatedBudget: 276000.00,
      supportingDocuments: "PR",
      remarks: "Consolidated all supplies expenses from the PPMP.",
    },
    {
      id: 18002,
      office: "DILG (2026)",
      generalDescription: "Operational Expenses (Travelling, Training, Utilities, Representation, R&M)",
      projectType: "Services",
      quantity: 1,
      uom: "lot",
      procurementMode: "SVP / Direct Contracting",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "As needed",
      sourceOfFunds: "GAA",
      estimatedBudget: 744000.00,
      supportingDocuments: "Contracts, Billings, Travel Orders",
      remarks: "Consolidated all services and operational expenses.",
    },
  ],
  footerData: {
    preparedBy: { name: 'RUSSEL R. CATIGAN', position: 'CAA II / AO Designate', date: 'N/A' },
    submittedBy: { name: 'CHRISTIAN M. NAGAYNAY, CESE', position: 'City Director', date: 'N/A' },
  },
};
