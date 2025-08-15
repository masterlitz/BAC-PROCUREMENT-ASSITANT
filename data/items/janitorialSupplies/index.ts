import { MarketItem } from '../../../types';
import { item_58 } from './item_58';
import { newJanitorialSupplies } from './new_items';
import { prItems } from './pr_items';

export const janitorialSupplies: MarketItem[] = [
    item_58,
    ...newJanitorialSupplies,
    ...prItems,
];
