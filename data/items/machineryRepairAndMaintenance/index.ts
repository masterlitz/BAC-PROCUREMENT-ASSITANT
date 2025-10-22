import { MarketItem, VariantMarketItem } from '../../../types';
import { machineryRepairAndMaintenanceItems } from './machineryRepairAndMaintenanceItems';
import { prItems } from './pr_items';

export const machineryRepairAndMaintenance: (MarketItem | VariantMarketItem)[] = [
    ...machineryRepairAndMaintenanceItems,
    ...prItems,
];
