import { MarketItem } from '../../../types';
import { item_182 } from './item_182';
import { item_221 } from './item_221';
import { additionalItems } from './new_items';

export const foodsAndGroceries: MarketItem[] = [
    item_182,
    item_221,
    ...(additionalItems || []),
];