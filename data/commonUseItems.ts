import { MarketItem } from '../types';
import { commonUseItems as allItems } from './items/commonUseItems';

export const commonUseItems: MarketItem[] = allItems.map(item => ({
    ...item,
    category: "PS DBM Commonly used Supplies"
}));
