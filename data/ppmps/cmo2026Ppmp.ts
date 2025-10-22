
import { SavedPpmp } from '../../types';

export const cmo2026Ppmp: SavedPpmp = {
  name: "CMO Consolidated (2026)",
  headerData: {
    ppmpNo: 'CMO-CONSOLIDATED-2026-PPMP',
    fiscalYear: '2026',
    endUser: "Bacolod City - City Mayor's Office (Consolidated)",
    status: 'final',
  },
  items: [
    {
      id: 44001,
      office: "CMO Consolidated (2026)",
      generalDescription: "MOOE (Operating Expenses)",
      projectType: "Goods / Services",
      quantity: 1,
      uom: "lot",
      procurementMode: "Competitive Bidding / SVP",
      preProcCon: "Yes",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "As needed",
      sourceOfFunds: "GAA",
      estimatedBudget: 45497993.60,
      supportingDocuments: "PR, Billings, Contracts",
      remarks: "Consolidated MOOE from various offices under CMO for FY 2026.",
    },
    {
      id: 44002,
      office: "CMO Consolidated (2026)",
      generalDescription: "Capital Outlay (Property, Plant & Equipment)",
      projectType: "Goods / Infrastructure",
      quantity: 1,
      uom: "lot",
      procurementMode: "Competitive Bidding",
      preProcCon: "Yes",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "As needed",
      sourceOfFunds: "Capital Outlay",
      estimatedBudget: 6400000.00,
      supportingDocuments: "PR, Tech Specs, Plans",
      remarks: "Consolidated PPE needs from various offices under CMO for FY 2026.",
    },
  ],
  footerData: {
    preparedBy: { name: 'KRISTINE GRACE M. OSORIO', position: 'Local Treasury Operations Assistant', date: 'N/A' },
    submittedBy: { name: 'ARLENE T. MEMORIA', position: 'Supervising Administrative Officer', date: 'N/A' },
  },
};
