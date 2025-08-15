
import { SavedPpmp } from '../../types';

export const assessorPpmp: SavedPpmp = {
  name: "City Assessor's Office",
  headerData: {
    ppmpNo: 'ASSESSOR-2026-001',
    fiscalYear: '2026',
    endUser: "Bacolod City - City Assessor's Office",
    status: 'indicative',
  },
  items: [
    {
      id: 42001,
      office: "City Assessor's Office",
      generalDescription: "Office and Other Supplies Expense",
      projectType: "Goods",
      quantitySize: "1 lot",
      procurementMode: "SVP / Shopping",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "As needed",
      sourceOfFunds: "MOOE",
      estimatedBudget: 320000.00, // 160k + 160k
      supportingDocuments: "PR",
      remarks: "Consolidated all office and other supplies from the PPMP.",
    },
    {
      id: 42002,
      office: "City Assessor's Office",
      generalDescription: "Other MOOE (Water, Fuel, R&M, Internet, Postage, etc.)",
      projectType: "Services / Goods",
      quantitySize: "1 lot",
      procurementMode: "SVP / Direct Contracting",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "As needed",
      sourceOfFunds: "MOOE",
      estimatedBudget: 367600.00, // 16k+30k+4k+160k+80k+20k+57.6k
      supportingDocuments: "PR, Billings, Contracts",
      remarks: "Consolidated all other operational expenses.",
    },
    {
      id: 42003,
      office: "City Assessor's Office",
      generalDescription: "Capital Outlay (Other Structures, Equipment)",
      projectType: "Infrastructure / Goods",
      quantitySize: "1 lot",
      procurementMode: "Competitive Bidding",
      preProcCon: "Yes",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "CY 2026",
      sourceOfFunds: "Capital Outlay",
      estimatedBudget: 1650000.00,
      supportingDocuments: "PR, Plans, Tech Specs",
      remarks: "For various structures and equipment.",
    },
  ],
  footerData: {
    preparedBy: { name: 'MA. RON-RON B. PESCADOR', position: 'Local Assessment Operations Officer IV', date: 'N/A' },
    submittedBy: { name: 'ATTY. MAPHILINDO T. POLVORA', position: 'City Assessor', date: 'N/A' },
  },
};
