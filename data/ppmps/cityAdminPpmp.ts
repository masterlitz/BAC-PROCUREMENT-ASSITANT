import { SavedPpmp } from '../../types';

export const cityAdminPpmp: SavedPpmp = {
  name: "City Administrator's Office",
  headerData: {
    ppmpNo: 'CAO-2026-001',
    fiscalYear: '2026',
    endUser: "Bacolod City - City Administrator's Office",
    status: 'indicative',
  },
  items: [
    {
      id: 1001,
      office: "City Administrator's Office",
      generalDescription: "Procurement of General Office Supplies",
      projectType: "Goods",
      quantitySize: "1 lot",
      procurementMode: "SVP / Shopping",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "Throughout CY 2026",
      sourceOfFunds: "MOOE",
      estimatedBudget: 466362.75,
      supportingDocuments: "Purchase Requests",
      remarks: "Based on PPMP document for general office supplies across two pages."
    },
    {
      id: 1002,
      office: "City Administrator's Office",
      generalDescription: "Procurement of Other Supplies & Materials (Janitorial, etc.)",
      projectType: "Goods",
      quantitySize: "1 lot",
      procurementMode: "SVP / Shopping",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "Throughout CY 2026",
      sourceOfFunds: "MOOE",
      estimatedBudget: 479985.75,
      supportingDocuments: "Purchase Requests",
      remarks: "Based on PPMP document for other supplies and materials."
    },
    {
      id: 1003,
      office: "City Administrator's Office",
      generalDescription: "Procurement of Various Services (Utilities, Maintenance, etc.)",
      projectType: "Services",
      quantitySize: "1 lot",
      procurementMode: "Competitive Bidding",
      preProcCon: "Yes",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "Throughout CY 2026",
      sourceOfFunds: "MOOE",
      estimatedBudget: 922000.00,
      supportingDocuments: "Contracts, Billing Statements",
      remarks: "Based on PPMP document for various services."
    }
  ],
  footerData: {
    preparedBy: { name: 'ATTY. ALLYN LUV Z. DIGNANDICE', position: 'Assistant City Administrator', date: 'N/A' },
    submittedBy: { name: 'ATTY. MARK STEVEN S. MAYO', position: 'City Administrator', date: 'N/A' },
  },
};
