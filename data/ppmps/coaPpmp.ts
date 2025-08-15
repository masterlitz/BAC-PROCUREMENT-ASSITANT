
import { SavedPpmp } from '../../types';

export const coaPpmp: SavedPpmp = {
  name: "Commission on Audit",
  headerData: {
    ppmpNo: 'COA-R16-01-2026',
    fiscalYear: '2026',
    endUser: "Bacolod City - Commission on Audit",
    status: 'final',
  },
  items: [
    {
      id: 47001,
      office: "Commission on Audit",
      generalDescription: "Office Supplies and Other Supplies",
      projectType: "Goods",
      quantitySize: "1 lot",
      procurementMode: "SVP / Shopping",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "As needed",
      sourceOfFunds: "GAA",
      estimatedBudget: 319980.00,
      supportingDocuments: "PR",
      remarks: "Consolidated office and other supplies expenses.",
    },
    {
      id: 47002,
      office: "Commission on Audit",
      generalDescription: "Operational Expenses (Fuel, R&M)",
      projectType: "Services / Goods",
      quantitySize: "1 lot",
      procurementMode: "SVP",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "As needed",
      sourceOfFunds: "GAA",
      estimatedBudget: 143900.00,
      supportingDocuments: "PR, Contracts",
      remarks: "Consolidated fuel and repair expenses.",
    },
  ],
  footerData: {
    preparedBy: { name: 'DANICA V. SUN', position: 'Administrative Assistant III', date: 'N/A' },
    submittedBy: { name: 'JANE LOUIE C. CAPATAR', position: 'State Auditor IV', date: 'N/A' },
  },
};
