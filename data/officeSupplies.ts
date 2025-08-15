import { officeSupplies as items } from './items/officeSupplies';
import { CatalogItem } from '../types';

// This file is now refactored to use the modular item structure.
// The original monolithic array has been deprecated in favor of individual item files.
export const officeSupplies: CatalogItem[] = items;