
import { SavedPpmp } from '../../types';

export const bjmpPpmp: SavedPpmp = {
  name: "Bureau of Jail Management and Penology",
  headerData: {
    ppmpNo: 'BJMP-2026-001',
    fiscalYear: '2026',
    endUser: "Bacolod City - Bureau of Jail Management and Penology (MBDJ-MD/MBDJ-MD Annex/MBDJ-FD)",
    status: 'final',
  },
  items: [
    {
      id: 50001,
      office: "Bureau of Jail Management and Penology",
      generalDescription: "Office Supplies and Other Supplies",
      projectType: "Goods",
      quantitySize: "1 lot",
      procurementMode: "Shopping",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "Quarterly",
      sourceOfFunds: "GAA",
      estimatedBudget: 1712000.00,
      supportingDocuments: "PR",
      remarks: "Consolidated all supplies from the PPMP.",
    },
    {
      id: 50002,
      office: "Bureau of Jail Management and Penology",
      generalDescription: "Operational Expenses (Travel, Training, Utilities, R&M)",
      projectType: "Services",
      quantitySize: "1 lot",
      procurementMode: "SVP / Direct Contracting",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "As needed",
      sourceOfFunds: "GAA",
      estimatedBudget: 10452000.00, // Sum of Travel, Training, Internet, R&M, Other M&O
      supportingDocuments: "Contracts, Billings, Travel Orders",
      remarks: "Consolidated all MOOE from the PPMP.",
    },
  ],
  footerData: {
    preparedBy: { name: 'JO1 Almera Rose L. Picando', position: 'Unit Supply Accountable Officer', date: 'N/A' },
    submittedBy: { name: 'JSUPT NORBERTO G MICIANO JR', position: 'District Jail Warden', date: 'N/A' },
  },
};