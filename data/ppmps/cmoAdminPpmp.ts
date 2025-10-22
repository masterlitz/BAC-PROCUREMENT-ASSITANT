
import { SavedPpmp, PpmpProjectItem } from '../../types';

const asNeededSchedule = (budget: number) => {
    if (budget === 0) {
        return { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 };
    }
    const monthly = budget / 12;
    return {
        jan: monthly, feb: monthly, mar: monthly, apr: monthly, may: monthly, jun: monthly,
        jul: monthly, aug: monthly, sep: monthly, oct: monthly, nov: monthly, dec: monthly
    };
};

const cmoAdminPpmpItems: PpmpProjectItem[] = [
    { id: 95001, office: "City Mayor's Office (Admin)", papCode: "502-01-010", generalDescription: "TRAVELLING EXPENSES-LOCAL", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 214700.00, schedule: asNeededSchedule(214700.00) },
    { id: 95002, office: "City Mayor's Office (Admin)", papCode: "502-01-020", generalDescription: "TRAVELLING EXPENSES-FOREIGN", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 4000.00, schedule: asNeededSchedule(4000.00) },
    { id: 95003, office: "City Mayor's Office (Admin)", papCode: "502-02-010", generalDescription: "TRAINING EXPENSES", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 342000.00, schedule: asNeededSchedule(342000.00) },
    { id: 95004, office: "City Mayor's Office (Admin)", papCode: "502-02-020", generalDescription: "SCHOLARSHIP EXPENSES", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 2000000.00, schedule: asNeededSchedule(2000000.00) },
    { id: 95005, office: "City Mayor's Office (Admin)", papCode: "502-03-050", generalDescription: "FOOD SUPPLIES EXPENSES", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 250000.00, schedule: asNeededSchedule(250000.00) },
    { id: 95006, office: "City Mayor's Office (Admin)", papCode: "502-03-060", generalDescription: "WELFARE GOODS EXPENSES", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 400000.00, schedule: asNeededSchedule(400000.00) },
    { id: 95007, office: "City Mayor's Office (Admin)", papCode: "502-03-070", generalDescription: "DRUGS AND MEDICINES EXPENSES", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 19000.00, schedule: asNeededSchedule(19000.00) },
    { id: 95008, office: "City Mayor's Office (Admin)", papCode: "502-03-080", generalDescription: "MEDICAL, DENTAL & LABORATORY EXPENSE", quantity: 1, uom: "lot", procurementMode: "Competitive Bidding", estimatedBudget: 8820520.00, schedule: asNeededSchedule(8820520.00) },
    { id: 95009, office: "City Mayor's Office (Admin)", papCode: "502-03-090", generalDescription: "FUEL, OIL LUBRICANTS EXPENSES", quantity: 1, uom: "lot", procurementMode: "Competitive Bidding", estimatedBudget: 5160000.00, schedule: asNeededSchedule(5160000.00) },
    { id: 95010, office: "City Mayor's Office (Admin)", papCode: "502-07-010", generalDescription: "SURVEY EXPENSES", quantity: 1, uom: "lot", procurementMode: "N/A", estimatedBudget: 0.00, schedule: asNeededSchedule(0.00) },
    { id: 95011, office: "City Mayor's Office (Admin)", papCode: "502-08-010", generalDescription: "DEMOLITION AND RELOCATION EXPENSES", quantity: 1, uom: "lot", procurementMode: "Competitive Bidding", estimatedBudget: 2990961.00, schedule: asNeededSchedule(2990961.00) },
    { id: 95012, office: "City Mayor's Office (Admin)", papCode: "502-10-010", generalDescription: "CONFIDENTIAL EXPENSES", quantity: 1, uom: "lot", procurementMode: "Competitive Bidding", estimatedBudget: 5000000.00, schedule: asNeededSchedule(5000000.00) },
    { id: 95013, office: "City Mayor's Office (Admin)", papCode: "502-10-030", generalDescription: "EXTRAORDINARY AND MISCELLANEOUS EXPENSES", quantity: 1, uom: "lot", procurementMode: "Competitive Bidding", estimatedBudget: 70681000.00, schedule: asNeededSchedule(70681000.00) },
    { id: 95014, office: "City Mayor's Office (Admin)", papCode: "502-11-030", generalDescription: "CONSULTANCY SERVICES", quantity: 1, uom: "lot", procurementMode: "N/A", estimatedBudget: 0.00, schedule: asNeededSchedule(0.00) },
    { id: 95015, office: "City Mayor's Office (Admin)", papCode: "502-11-990", generalDescription: "OTHER PROFESSIONAL SERVICES", quantity: 1, uom: "lot", procurementMode: "Competitive Bidding", estimatedBudget: 190080000.00, schedule: asNeededSchedule(190080000.00) },
    { id: 95016, office: "City Mayor's Office (Admin)", papCode: "502-12-010", generalDescription: "ENVIRONMENTAL SANITARY SERVICES", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 4000.00, schedule: asNeededSchedule(4000.00) },
    { id: 95017, office: "City Mayor's Office (Admin)", papCode: "502-12-990", generalDescription: "OTHER GENERAL SERVICES", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 200000.00, schedule: asNeededSchedule(200000.00) },
    { id: 95018, office: "City Mayor's Office (Admin)", papCode: "502-13-020", generalDescription: "REPAIR & MAINTENANCE-LAND IMPROVEMENT", quantity: 1, uom: "lot", procurementMode: "Competitive Bidding", estimatedBudget: 3348000.00, schedule: asNeededSchedule(3348000.00) },
    { id: 95019, office: "City Mayor's Office (Admin)", papCode: "502-13-030", generalDescription: "REPAIR & MAINTENANCE - INFRA ASSETS", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 520000.00, schedule: asNeededSchedule(520000.00) },
    { id: 95020, office: "City Mayor's Office (Admin)", papCode: "502-13-040", generalDescription: "REPAIR & MAINTENANCE - BLDG & OTHER STRUCT.", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 40000.00, schedule: asNeededSchedule(40000.00) },
    { id: 95021, office: "City Mayor's Office (Admin)", papCode: "502-13-050", generalDescription: "REPAIR & MAINTENCE - MACHINERY & EQUIPMENT", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 200000.00, schedule: asNeededSchedule(200000.00) },
    { id: 95022, office: "City Mayor's Office (Admin)", papCode: "502-13-990", generalDescription: "REPAIR & MAINTENANCE - OTHER PPE", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 2000000.00, schedule: asNeededSchedule(2000000.00) },
    { id: 95023, office: "City Mayor's Office (Admin)", papCode: "502-13-100", generalDescription: "RESTORATION & MAINTENANCEC HERITAGE ASSESTS", quantity: 1, uom: "lot", procurementMode: "Competitive Bidding", estimatedBudget: 3125000.00, schedule: asNeededSchedule(3125000.00) },
    { id: 95024, office: "City Mayor's Office (Admin)", papCode: "502-14-010", generalDescription: "SUBSIDY - NGA", quantity: 1, uom: "lot", procurementMode: "N/A", estimatedBudget: 0.00, schedule: asNeededSchedule(0.00) },
    { id: 95025, office: "City Mayor's Office (Admin)", papCode: "502-14-990", generalDescription: "SUBSIDY - OTHERS", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 100000.00, schedule: asNeededSchedule(100000.00) },
    { id: 95026, office: "City Mayor's Office (Admin)", papCode: "502-16-020", generalDescription: "FIDELITY BOND PREMIUM", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 20000.00, schedule: asNeededSchedule(20000.00) },
    { id: 95027, office: "City Mayor's Office (Admin)", papCode: "502-99-010", generalDescription: "ADVERTISING EXPENSES", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 1960000.00, schedule: asNeededSchedule(1960000.00) },
    { id: 95028, office: "City Mayor's Office (Admin)", papCode: "502-99-020", generalDescription: "PRINTING & PUBLICATION EXPENSE", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 40000.00, schedule: asNeededSchedule(40000.00) },
    { id: 95029, office: "City Mayor's Office (Admin)", papCode: "502-99-030", generalDescription: "REPRESENTATION EXPENSES", quantity: 1, uom: "lot", procurementMode: "SVP", estimatedBudget: 1320000.00, schedule: asNeededSchedule(1320000.00) },
    { id: 95030, office: "City Mayor's Office (Admin)", papCode: "502-99-040", generalDescription: "TRANSPORATION & DELIVERY EXPENSES", quantity: 1, uom: "lot", procurementMode: "Competitive Bidding", estimatedBudget: 149834000.00, schedule: asNeededSchedule(149834000.00) },
    { id: 95031, office: "City Mayor's Office (Admin)", papCode: "502-99-050", generalDescription: "RENT/LEASE EXPENSES", quantity: 1, uom: "lot", procurementMode: "N/A", estimatedBudget: 0.00, schedule: asNeededSchedule(0.00) },
    { id: 95032, office: "City Mayor's Office (Admin)", papCode: "502-99-080", generalDescription: "DONATIONS", quantity: 1, uom: "lot", procurementMode: "N/A", estimatedBudget: 0.00, schedule: asNeededSchedule(0.00) },
];

export const cmoAdminPpmp: SavedPpmp = {
  name: "City Mayor's Office (Admin)",
  headerData: {
    ppmpNo: 'CMO-ADMIN-2025-001',
    fiscalYear: '2025',
    endUser: "Bacolod City - City Mayor's Office (Admin)",
    status: 'final',
  },
  items: cmoAdminPpmpItems,
  footerData: {
    preparedBy: { name: 'ATTY. JOSE MARTY D. GO', position: 'Secretary to the Mayor', date: 'N/A' },
    submittedBy: { name: 'AIRENE T. ARAOJO', position: 'Supervising Administrative Officer', date: 'N/A' },
  },
};
