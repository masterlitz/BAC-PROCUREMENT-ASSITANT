import { CatalogItem, MarketItem } from '../types';
import { officeSupplies } from './officeSupplies';
import { itEquipment } from './itEquipment';
import { medicalSupplies } from './medicalSupplies';
import { commonUseItems } from './commonUseItems';
import { foodsAndGroceries } from './foodsAndGroceries';
import { janitorialSupplies } from './janitorialSupplies';
import { generalMerchandise } from './generalMerchandise';
import { constructionMaterials } from './constructionMaterials';
import { vehicleParts } from './vehicleParts';
import { motorVehicles } from './motorVehicles';
import { agriculturalSupplies } from './items/agriculturalSupplies';
import { others } from './others';
import { furnitureAndFixtures } from './furnitureAndFixtures';
import { fuelOilAndLubricants } from './fuelOilAndLubricants';
import { representationExpense } from './representationExpense';
import { waterExpense } from './waterExpense';
import { drugsAndMedicines } from './drugsAndMedicines';
import { otherSuppliesAndMaterials } from './otherSuppliesAndMaterials';
import { repairAndMaintenance } from './repairAndMaintenance';
import { machineryRepairAndMaintenance } from './machineryRepairAndMaintenance';
import { officeEquipment } from './officeEquipment';
import { repairAndMaintenanceBuildings } from './repairAndMaintenanceBuildings';
import { newlyAddedItems } from './items/newlyAdded';
import { accountableForms } from './items/accountableForms';
import { militaryAndPoliceSupplies } from './militaryAndPoliceSupplies';
import { printingAndPublication } from './printingAndPublication';
import { trainingExpenses } from './trainingExpenses';

const initialData: Record<string, CatalogItem[]> = {
  "ACCOUNTABLE FORMS": accountableForms,
  "Motor Vehicles": motorVehicles,
  "Representation Expense": representationExpense,
  "PS DBM Commonly used Supplies": commonUseItems,
  "Office Supplies": [...officeSupplies, ...newlyAddedItems.filter(item => item.category === "Office Supplies")],
  "IT Equipment and Peripherals": [...itEquipment, ...newlyAddedItems.filter(item => item.category === "IT Equipment and Peripherals")],
  "Office Equipment": [...officeEquipment, ...newlyAddedItems.filter(item => item.category === "Office Equipment")],
  "Medical, Dental and Laboratory Supplies": [...medicalSupplies, ...newlyAddedItems.filter(item => item.category === "Medical, Dental and Laboratory Supplies")],
  "Drugs and Medicine": drugsAndMedicines,
  "Foods and Groceries": foodsAndGroceries,
  "Janitorial and Cleaning Supplies": [...janitorialSupplies, ...newlyAddedItems.filter(item => item.category === "Janitorial and Cleaning Supplies")],
  "General Merchandise": [...generalMerchandise, ...newlyAddedItems.filter(item => item.category === "General Merchandise")],
  "Construction and Electrical Supplies": [...constructionMaterials, ...newlyAddedItems.filter(item => item.category === "Construction and Electrical Supplies")],
  "Automotive and Industrial Supplies": vehicleParts,
  "Repair & Maintenance - Transportation Equipment": [...repairAndMaintenance, ...newlyAddedItems.filter(item => item.category === "Repair & Maintenance - Transportation Equipment")],
  "Repair & Maintenance - Buildings & Other Structures": repairAndMaintenanceBuildings,
  "Repair & Maintenance - Machinery & Equipment": machineryRepairAndMaintenance,
  "Agricultural Supplies": [...agriculturalSupplies, ...newlyAddedItems.filter(item => item.category === "Agricultural Supplies")],
  "Furniture and Fixtures": [...furnitureAndFixtures, ...newlyAddedItems.filter(item => item.category === "Furniture and Fixtures")],
  "FUEL OIL AND LUBRICANTS": fuelOilAndLubricants,
  "Other Supplies and Materials Expense": [...otherSuppliesAndMaterials, ...newlyAddedItems.filter(item => item.category === "Other Supplies and Materials Expense")],
  "Military and Police Supplies Expense": militaryAndPoliceSupplies,
  "Water Expense": waterExpense,
  "Printing and Publication Expenses": printingAndPublication,
  "Training Expenses": trainingExpenses,
  "Others": others,
};

// --- Data Processing ---

/**
 * Flattens items with variants into individual MarketItem objects.
 * This makes all catalog items conform to a single, searchable interface.
 * @param data The initial catalog data with mixed CatalogItem types.
 * @returns A record of categories with arrays of only MarketItem types.
 */
const flattenVariantItems = (data: Record<string, CatalogItem[]>): Record<string, MarketItem[]> => {
    const flattenedData: Record<string, MarketItem[]> = {};
    for (const category in data) {
        flattenedData[category] = data[category].flatMap(item => {
            if ('variants' in item) { // It's a VariantMarketItem
                return item.variants.map((variant, index) => ({
                    id: item.id + (index + 1) / 100, // create a unique fractional ID
                    name: `${item.name} (${variant.description})`,
                    description: item.baseDescription,
                    category: item.category,
                    uacsCode: item.uacsCode,
                    quantity: variant.stockStatus.toLowerCase() === 'available' ? 1 : 0,
                    unit: variant.unit,
                    price: variant.price,
                    referenceLinks: [], 
                    itemCode: variant.itemCode,
                    technicalSpecifications: variant.technicalSpecifications || item.baseDescription,
                    imageUrl: item.imageUrl, // Pass down the parent image URL
                    isVariant: false, // Mark as a flattened MarketItem
                }));
            } else { // It's already a MarketItem
                return [item];
            }
        });
    }
    return flattenedData;
};

// Process the initial data to flatten variants.
const processedData = flattenVariantItems(initialData);

// Auto-generate item codes for any items that are missing one.
// This ensures every item in the catalog has a unique, predictable code.
Object.values(processedData).forEach(categoryItems => {
    categoryItems.forEach(item => {
        if (!item.itemCode) {
            item.itemCode = `CAT-${item.id}`;
        }
    });
});

export const marketData: Record<string, MarketItem[]> = processedData;

// Get categories and sort them alphabetically for display.
export const marketCategories = Object.keys(marketData).sort((a, b) => a.localeCompare(b));