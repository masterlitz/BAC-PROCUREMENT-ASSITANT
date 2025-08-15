
import { SavedPpmp } from '../../types';

export const bfpPpmp: SavedPpmp = {
  name: "Bureau of Fire Protection",
  headerData: {
    ppmpNo: 'BFP-2026-001',
    fiscalYear: '2026',
    endUser: "Bacolod City - Bureau of Fire Protection",
    status: 'final',
  },
  items: [
    {
      id: 35001,
      office: "Bureau of Fire Protection",
      generalDescription: "Office Supplies and Other Supplies",
      projectType: "Goods",
      quantitySize: "1 lot",
      procurementMode: "SVP / Shopping",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "Quarterly",
      sourceOfFunds: "MOOE",
      estimatedBudget: 400000.00,
      supportingDocuments: "PR",
      remarks: "Consolidated from PPMP.",
    },
    {
      id: 35002,
      office: "Bureau of Fire Protection",
      generalDescription: "Operational Expenses (Travelling, Telephone, R&M)",
      projectType: "Services",
      quantitySize: "1 lot",
      procurementMode: "SVP / Direct Contracting",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "As needed",
      sourceOfFunds: "MOOE",
      estimatedBudget: 304000.00,
      supportingDocuments: "Travel Orders, Billings, Contracts",
      remarks: "Consolidated from PPMP.",
    },
  ],
  footerData: {
    preparedBy: { name: 'FSUPT JENNY MAE C. MASIP', position: 'City Fire Marshal', date: 'N/A' },
    submittedBy: { name: 'MARIA IMELDA A. WILLIAMS', position: 'City Budget Officer', date: 'N/A' },
  },
};
