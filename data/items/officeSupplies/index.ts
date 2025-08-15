import { CatalogItem } from '../../../types';
import { officeSuppliesCatalog } from './catalog_office_supplies';
import { prItems } from './pr_items';

export const officeSupplies: CatalogItem[] = [
    ...(officeSuppliesCatalog || []),
    ...(prItems || [])
];