
import { SavedPpmp } from '../../types';

export const bccPpmp: SavedPpmp = {
  name: "Bacolod City College",
  headerData: {
    ppmpNo: 'BCC-2026-001',
    fiscalYear: '2026',
    endUser: "Bacolod City - Bacolod City College",
    status: 'indicative',
  },
  items: [
    {
      id: 52001,
      office: "Bacolod City College",
      generalDescription: "Office Supplies Expense",
      projectType: "Goods",
      quantitySize: "1 lot",
      procurementMode: "Negotiated",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "As needed",
      sourceOfFunds: "GAA",
      estimatedBudget: 800000.00,
      supportingDocuments: "PR",
      remarks: "For various office supplies."
    },
    {
      id: 52002,
      office: "Bacolod City College",
      generalDescription: "Other Supplies and Materials Expenses",
      projectType: "Goods",
      quantitySize: "1 lot",
      procurementMode: "Negotiated",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "As needed",
      sourceOfFunds: "GAA",
      estimatedBudget: 1600000.00,
      supportingDocuments: "PR",
      remarks: "For various janitorial, cleaning, and other operational materials."
    },
    {
      id: 52003,
      office: "Bacolod City College",
      generalDescription: "Training and Representation Expenses",
      projectType: "Services",
      quantitySize: "1 lot",
      procurementMode: "Negotiated",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "As needed",
      sourceOfFunds: "GAA",
      estimatedBudget: 320000.00, // 240000 + 80000
      supportingDocuments: "PR, Training Designs",
      remarks: "For meals and other training/representation needs."
    },
    {
      id: 52004,
      office: "Bacolod City College",
      generalDescription: "Fuel, Oil & Lubricants",
      projectType: "Goods",
      quantitySize: "1 lot",
      procurementMode: "Negotiated",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "As needed",
      sourceOfFunds: "GAA",
      estimatedBudget: 80000.00,
      supportingDocuments: "PR",
      remarks: "For gasoline, diesel, and lubricants."
    },
    {
      id: 52005,
      office: "Bacolod City College",
      generalDescription: "Medical and Drugs Expenses",
      projectType: "Goods",
      quantitySize: "1 lot",
      procurementMode: "Negotiated",
      preProcCon: "No",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "As needed",
      sourceOfFunds: "GAA",
      estimatedBudget: 160000.00, // 80000 + 80000
      supportingDocuments: "PR",
      remarks: "For drugs, medicines, and medical/dental supplies."
    },
    {
      id: 52006,
      office: "Bacolod City College",
      generalDescription: "Services (Security, Repair & Maintenance, etc.)",
      projectType: "Services",
      quantitySize: "1 lot",
      procurementMode: "Bidding / Negotiated",
      preProcCon: "Yes",
      procurementStart: "Jan",
      procurementEnd: "Dec",
      deliveryImplementation: "As needed",
      sourceOfFunds: "GAA",
      estimatedBudget: 7916000.00, // 5376000 + 800000 + 40000 + 900000 + 800000 (subscription)
      supportingDocuments: "Contracts, PR",
      remarks: "For security, subscriptions, and various repair & maintenance."
    }
  ],
  footerData: {
    preparedBy: { name: 'MARGIE G. TAGLE', position: 'Administrative Officer II', date: 'N/A' },
    submittedBy: { name: 'MA. JOHANNA ANN R. BAYONETA, Ph.D.', position: 'College Administrator', date: 'N/A' },
  },
};
