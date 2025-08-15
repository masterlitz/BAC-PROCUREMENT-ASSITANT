import { MarketItem } from '../../../types';
import { item_4 } from './item_4';
import { item_25 } from './item_25';
import { item_30 } from './item_30';
import { item_31 } from './item_31';
import { item_37 } from './item_37';
import { item_40 } from './item_40';
import { item_104 } from './item_104';
import { item_110 } from './item_110';
import { item_111 } from './item_111';
import { item_112 } from './item_112';
import { item_157 } from './item_157';
import { item_199 } from './item_199';
import { item_200 } from './item_200';
import { item_206 } from './item_206';
import { item_216 } from './item_216';
import { item_257 } from './item_257';
import { item_259 } from './item_259';
import { item_260 } from './item_260';
import { item_261 } from './item_261';
import { item_262 } from './item_262';
import { item_311 } from './item_311';
import { item_360 } from './item_360';
import { item_361 } from './item_361';
import { item_362 } from './item_362';
import { item_363 } from './item_363';
import { item_402 } from './item_402';
import { item_403 } from './item_403';
import { item_413 } from './item_413';
import { item_422 } from './item_422';
import { item_618 } from './item_618';
import { item_684 } from './item_684';
import { item_824 } from './item_824';
import { item_1111 } from './item_1111';
import { item_2447 } from './item_2447';
import { prItems } from './pr_items';

export const itEquipment: MarketItem[] = [
    item_4, item_25, item_30, item_31, item_37, item_40, item_104, item_110,
    item_111, item_112, item_157, item_199, item_200, item_206, item_216,
    item_257, item_259, item_260, item_261, item_262, item_311, item_360,
    item_361, item_362, item_363, item_402, item_403, item_413, item_422,
    item_618, item_684, item_824, item_1111, item_2447,
    ...(prItems || []),
];