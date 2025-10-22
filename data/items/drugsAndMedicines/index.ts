import { MarketItem } from '../../../types';
import { dohPriceList } from './doh_price_list';
import { prItems } from './pr_items';

export const drugsAndMedicines: MarketItem[] = [
    ...dohPriceList,
    ...prItems
];
