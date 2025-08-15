import { SavedPpmp } from '../../types';

export const paadPpmp: SavedPpmp = {
  name: "Public Affairs and Assistance Division",
  headerData: {
    ppmpNo: 'PAAD-2026-001',
    fiscalYear: '2026',
    endUser: "Bacolod City - Public Affairs and Assistance Division",
    status: 'final',
  },
  items: [
    {
      id: 33001,
      office: "Public Affairs and Assistance Division",
      generalDescription: "Office Supplies and Other Supplies",
      projectType: "Goods",
      quantitySize: "1 lot",
      procurementMode: "SVP",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Oct",
      deliveryImplementation: "Quarterly",
      sourceOfFunds: "MOOE",
      estimatedBudget: 72000.00, // 32k + 40k
      supportingDocuments: "PR",
      remarks: "Consolidated office and other supplies.",
    },
    {
      id: 33002,
      office: "Public Affairs and Assistance Division",
      generalDescription: "Other MOOE (Water, R&M, Travel, Training)",
      projectType: "Services",
      quantitySize: "1 lot",
      procurementMode: "SVP",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "As needed",
      sourceOfFunds: "MOOE",
      estimatedBudget: 211000.00, // 75k + 40k + 16k + 40k + 40k
      supportingDocuments: "Billings, Contracts, PRs",
      remarks: "Consolidated various operational expenses.",
    },
  ],
  footerData: {
    preparedBy: { name: 'FATIMA ARAGON', position: 'Community Affairs Officer I', date: 'N/A' },
    submittedBy: { name: 'ROLANDO M. VILLAMOR, JR.', position: 'Community Affairs Officer IV', date: 'N/A' },
  },
};