
import { CatalogItem } from '../../../types';
import { officeSuppliesCatalog } from './catalog_office_supplies';
import { prItems } from './pr_items';
import { prItems2 } from './pr_items_2';
import { item_10055 } from './item_10055';
import { item_10056 } from './item_10056';
import { item_10057 } from './item_10057';
import { item_10060_glue } from './item_10060_glue';
import { item_10061_puncher } from './item_10061_puncher';
import { item_10062_gelpen_violet } from './item_10062_gelpen_violet';
import { item_10063_highlighters } from './item_10063_highlighters';
import { item_10064_maskingtape } from './item_10064_maskingtape';
import { item_10124_toner } from './item_10124_toner';
import { prItems3 } from './pr_items_3';


export const officeSupplies: CatalogItem[] = [
    ...(officeSuppliesCatalog || []),
    ...(prItems || []),
    ...(prItems2 || []),
    ...(prItems3 || []),
    item_10055,
    item_10056,
    item_10057,
    item_10060_glue,
    item_10061_puncher,
    item_10062_gelpen_violet,
    item_10063_highlighters,
    item_10064_maskingtape,
    item_10124_toner,
];
