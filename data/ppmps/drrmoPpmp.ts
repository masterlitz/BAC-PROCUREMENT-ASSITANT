
import { SavedPpmp } from '../../types';

export const drrmoPpmp: SavedPpmp = {
  name: "Disaster Risk Reduction Management Office",
  headerData: {
    ppmpNo: 'DRRMO-2026-001',
    fiscalYear: '2026',
    endUser: "Bacolod City - Disaster Risk Reduction and Management Office",
    status: 'final',
  },
  items: [
    {
      id: 37001,
      office: "Disaster Risk Reduction Management Office",
      generalDescription: "Training Expense (Supplies, Meals, etc.)",
      projectType: "Goods / Services",
      quantitySize: "1 lot",
      procurementMode: "SVP / Shopping",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "Quarterly",
      sourceOfFunds: "General Fund",
      estimatedBudget: 251300.00,
      supportingDocuments: "PR",
      remarks: "For various training needs of the office.",
    },
    {
      id: 37002,
      office: "Disaster Risk Reduction Management Office",
      generalDescription: "Office Equipment (Capital Outlay)",
      projectType: "Goods",
      quantitySize: "4 units",
      procurementMode: "SVP",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Jan",
      deliveryImplementation: "1st Quarter",
      sourceOfFunds: "Capital Outlay",
      estimatedBudget: 240000.00,
      supportingDocuments: "PR, Tech Specs",
      remarks: "Procurement of Aircondition machines.",
    },
  ],
  footerData: {
    preparedBy: { name: 'DR. ANNA MARIA LAARNI M. PORNAN', position: 'LDRRMO IV / CDRRM Officer', date: 'N/A' },
    submittedBy: { name: 'MA. IMELDA A. WILLIAMS', position: 'City Budget Officer', date: 'N/A' },
  },
};