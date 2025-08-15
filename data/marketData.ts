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
import { agriculturalSupplies } from './agriculturalSupplies';
import { others } from './others';
import { furnitureAndFixtures } from './furnitureAndFixtures';
import { fuelOilAndLubricants } from './fuelOilAndLubricants';
import { representationExpense } from './representationExpense';
import { waterExpense } from './waterExpense';
import { drugsAndMedicines } from './drugsAndMedicines';
import { otherSuppliesAndMaterials } from './otherSuppliesAndMaterials';
import { repairAndMaintenance } from './repairAndMaintenance';
import { machineryRepairAndMaintenance } from './machineryRepairAndMaintenance';

const initialData: Record<string, CatalogItem[]> = {
  "PS DBM Commonly used Supplies": commonUseItems,
  "Office Supplies": officeSupplies,
  "IT Equipment and Peripherals": itEquipment,
  "Medical, Dental and Laboratory Supplies": medicalSupplies,
  "Drugs and Medicine": drugsAndMedicines,
  "Foods and Groceries": foodsAndGroceries,
  "Janitorial and Cleaning Supplies": janitorialSupplies,
  "General Merchandise": generalMerchandise,
  "Construction and Electrical Supplies": constructionMaterials,
  "Automotive and Industrial Supplies": vehicleParts,
  "Repair & Maintenance - Transportation Equipment": repairAndMaintenance,
  "Repair & Maintenance - Machinery & Equipment": machineryRepairAndMaintenance,
  "Agricultural Supplies": agriculturalSupplies,
  "Furniture and Fixtures": furnitureAndFixtures,
  "FUEL OIL AND LUBRICANTS": fuelOilAndLubricants,
  "Other Supplies and Materials Expense": otherSuppliesAndMaterials,
  "Representation Expense": representationExpense,
  "Water Expense": waterExpense,
  "Others": others,
};

// Auto-generate item codes for any items that are missing one.
// This ensures every item in the catalog has a unique, predictable code.
Object.values(initialData).forEach(categoryItems => {
    categoryItems.forEach(item => {
        // This check correctly narrows `item` to `MarketItem` because
        // `isVariant` is either `false` or `undefined` for MarketItem, both of which are falsy.
        if (!('variants' in item)) {
            // This is a MarketItem
            if (!item.itemCode) {
                item.itemCode = `CAT-${item.id}`;
            }
        } else {
            // This is a VariantMarketItem.
            // Variants inside VariantMarketItem already have a required itemCode.
            // No action needed for the parent item itself.
        }
    });
});

export const marketData: Record<string, CatalogItem[]> = initialData;

// Sort all categories alphabetically
export const marketCategories = Object.keys(marketData).sort();
