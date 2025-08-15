
import { SavedPpmp } from '../../types';

export const oboPpmp: SavedPpmp = {
  name: "Office of the Building Official",
  headerData: {
    ppmpNo: 'OBO-2026-001',
    fiscalYear: '2026',
    endUser: "Bacolod City - Office of the Building Official",
    status: 'indicative',
  },
  items: [
    {
      id: 36001,
      office: "Office of the Building Official",
      generalDescription: "General Office Operations",
      projectType: "Goods / Services",
      quantitySize: "1 lot",
      procurementMode: "Shopping",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "As needed",
      sourceOfFunds: "MOOE",
      estimatedBudget: 8000.00,
      supportingDocuments: "PR, Billings",
      remarks: "Consolidated all operational expenses from the placeholder PPMP.",
    },
  ],
  footerData: {
    preparedBy: { name: 'MICHAEL G. LIM', position: 'Administrative Officer V', date: 'N/A' },
    submittedBy: { name: 'ENGR. ISIDRO C. GENTIA', position: 'OIC, Building Official', date: 'N/A' },
  },
};
