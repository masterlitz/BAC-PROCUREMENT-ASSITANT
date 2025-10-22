

import { MarketItem } from '../../../types';
import { item_30001 } from './item_30001';
import { prItems } from './pr_items';

const item_30002: MarketItem = {
    id: 30002,
    name: "Premium Heavy Duty 1+1 Pocket Value Counter",
    description: "A premium, heavy-duty 1+1 pocket value and currency counter designed for high-volume cash handling environments like a City Treasurer's Office. Features advanced counterfeit detection and sorting capabilities.",
    category: "Office Equipment",
    uacsCode: "10705020-00",
    quantity: 10,
    unit: "unit",
    price: 200000.00,
    referenceLinks: [],
    itemCode: "OFE-VCTR-KN3V",
    technicalSpecifications: "# of Pockets: 1+1\nHopper Capacity: 600\nStacker Capacity: 200\nReject: 100\nNormal Count Speed: 1500 notes/min\nValue Count Speed: 1200 notes/min\nS/N Speed: 1200 notes/min\nDimensions: 312 x 340 x 340 mm\nWeight: 13kg\nFunctions: Multi-Currency Auto/Mix (20), S/N (OCR), Forex\nSensors: Dual CIS, UV, MG (18ch), IR, US (4ch)\nConnectivity: Serial Port, LAN, USB\nOS: Linux\nScreen: 4.3\" Touch Display (480x272)\nFeatures: Full Color Image processing, Heavy Duty, Check & Voucher Scan\nWarranty: 1 year with monthly service",
    imageUrl: "https://i.ebayimg.com/images/g/ALgAAOSw3WlJ9~z9/s-l1600.jpg"
};

const item_99031: MarketItem = {
    id: 99031,
    name: "Printer, A3+ Wifi All-in-One Ink Tank",
    description: "An A3+ capable all-in-one printer with WiFi, ink tank system, and ADF for high-volume office use. Features print, scan, copy, and fax.",
    category: "Office Equipment",
    uacsCode: "10705020-00",
    quantity: 10,
    unit: "unit",
    price: 70000.00,
    referenceLinks: [],
    itemCode: "OFE-PRN-A3AIO-01",
    technicalSpecifications: "Functions: Print, Scan, Copy, Fax with ADF\nMax Paper Size: A3+\nConnectivity: Ethernet, Wi-Fi, Wi-Fi Direct, USB 2.0\nCopy Resolution: 600x600 dpi\nScan Resolution: 1200x2400 dpi",
    imageUrl: "https://i.ibb.co/L8y6V9D/epson-l15150.png"
};

export const officeEquipment: MarketItem[] = [
    item_30001,
    item_30002,
    item_99031,
    ...prItems,
];
