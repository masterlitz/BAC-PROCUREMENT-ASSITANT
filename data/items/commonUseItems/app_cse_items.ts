import { MarketItem } from '../../../types';

// Data extracted from APP-CSE 2024 FORM provided by user
// https://www.gppb.gov.ph/wp-content/uploads/2023/09/APP-CSE-2024-FORM.pdf
export const appCseItems: MarketItem[] = [
  // Page 1
  { id: 9201, name: "ALCOHOL, ETHYL, 70% SOLUTION, 1 LITER", unit: "BOTTLE", price: 104.43, itemCode: "10912150-AL-E01", category: "Common-Use Items", uacsCode: "50203070-00", quantity: 1, description: "Ethyl alcohol 70% solution, 1 liter bottle.", referenceLinks: [] },
  { id: 9202, name: "DISINFECTANT SPRAY, AEROSOL TYPE, 510G", unit: "CAN", price: 355.62, itemCode: "47131829-DS-A02", category: "Common-Use Items", uacsCode: "50203070-00", quantity: 1, description: "Aerosol disinfectant spray, 510g.", referenceLinks: [] },
  { id: 9203, name: "PENCIL, LEAD, WITH ERASER", unit: "PIECE", price: 4.88, itemCode: "14111502-PN-L01", category: "Common-Use Items", uacsCode: "50203010-00", quantity: 1, description: "Standard lead pencil with eraser.", referenceLinks: [] },
  { id: 9204, name: "PAPER, BOND, A4, 70GSM", unit: "REAM", price: 122.07, itemCode: "14111507-PP-B01", category: "Common-Use Items", uacsCode: "50203010-00", quantity: 1, description: "A4 size bond paper, 70gsm.", referenceLinks: [] },
  { id: 9205, name: "PAPER, BOND, LEGAL, 70GSM", unit: "REAM", price: 135.53, itemCode: "14111507-PP-B02", category: "Common-Use Items", uacsCode: "50203010-00", quantity: 1, description: "Legal size bond paper, 70gsm.", referenceLinks: [] },
  { id: 9206, name: "COMPUTER CONSUMABLES, INK (FOR EPSON L-SERIES)", unit: "BOTTLE", price: 295.62, itemCode: "43212103-EP-L01", category: "Common-Use Items", uacsCode: "50203090-00", quantity: 1, description: "Ink for Epson L-series printers.", referenceLinks: [] },
  { id: 9207, name: "TOILET BOWL AND URINAL CLEANER", unit: "BOTTLE", price: 42.22, itemCode: "47131829-TB-C01", category: "Common-Use Items", uacsCode: "50203020-00", quantity: 1, description: "Liquid cleaner for toilet bowls and urinals.", referenceLinks: [] },
  { id: 9208, name: "CLEANSER, SCOURING POWDER", unit: "CAN", price: 42.22, itemCode: "47131805-CL-P01", category: "Common-Use Items", uacsCode: "50203020-00", quantity: 1, description: "Abrasive scouring powder for cleaning.", referenceLinks: [] },
  { id: 9209, name: "DETERGENT, LAUNDRY", unit: "KILOGRAM", price: 124.67, itemCode: "47131811-DT-P01", category: "Common-Use Items", uacsCode: "50203020-00", quantity: 1, description: "Laundry detergent powder.", referenceLinks: [] },
  { id: 9210, name: "SOAP, LIQUID, HAND", unit: "GALLON", price: 467.53, itemCode: "53131608-HS-L01", category: "Common-Use Items", uacsCode: "50203020-00", quantity: 1, description: "Liquid hand soap in a gallon container.", referenceLinks: [] },
  { id: 9211, name: "TRASHBAG, GPP-SPECS, 940MM X 1016MM", unit: "PIECE", price: 10.92, itemCode: "47121703-TB-B01", category: "Common-Use Items", uacsCode: "50203020-00", quantity: 1, description: "Large GPP-compliant trash bag.", referenceLinks: [] },
  { id: 9212, name: "FLAG, PHILIPPINE", unit: "PIECE", price: 1690.67, itemCode: "60151610-FL-P01", category: "Common-Use Items", uacsCode: "50299990-99", quantity: 1, description: "Philippine flag, various sizes.", referenceLinks: [] },
  { id: 9213, name: "FIRE EXTINGUISHER, DRY CHEMICAL, 10LBS", unit: "UNIT", price: 1581.33, itemCode: "46191602-FE-D01", category: "Common-Use Items", uacsCode: "50299990-99", quantity: 1, description: "10lbs dry chemical fire extinguisher.", referenceLinks: [] },
  { id: 9214, name: "INK, for printer, (for Brother DCP-L2540DW)", unit: "CARTRIDGE", price: 1297.04, itemCode: "44103103-BR-L25", category: "Common-Use Items", uacsCode: "50203090-00", quantity: 1, description: "Toner cartridge for Brother DCP-L2540DW.", referenceLinks: [] },
  { id: 9215, name: "STICKER PAPER, MATTE", unit: "PACK", price: 0, itemCode: "80141505-TS-004", category: "Common-Use Items", uacsCode: "50203010-00", quantity: 1, description: "Matte sticker paper.", referenceLinks: [] },
  { id: 9216, name: "STORAGE BOX, FOR LEGAL SIZE", unit: "PIECE", price: 0, itemCode: "80141505-TS-037", category: "Common-Use Items", uacsCode: "50203010-00", quantity: 1, description: "Storage box for legal size documents.", referenceLinks: [] },
  { id: 9217, name: "TABLET COMPUTER", unit: "UNIT", price: 0, itemCode: "80141505-TS-098", category: "Common-Use Items", uacsCode: "10705030-00", quantity: 1, description: "Tablet computer.", referenceLinks: [] },
  { id: 9218, name: "UNINTERRUPTIBLE POWER SUPPLY, TOWER TYPE, 650VA", unit: "UNIT", price: 0, itemCode: "80141505-TS-010", category: "Common-Use Items", uacsCode: "10705030-00", quantity: 1, description: "650VA UPS, tower type.", referenceLinks: [] },
  { id: 9219, name: "VELLUM BOARD PAPER", unit: "PACK", price: 0, itemCode: "80141505-TS-019", category: "Common-Use Items", uacsCode: "50203010-00", quantity: 1, description: "Vellum board paper.", referenceLinks: [] },
  { id: 9220, name: "VIDEO CONFERENCING CAMERA", unit: "UNIT", price: 0, itemCode: "80141505-TS-099", category: "Common-Use Items", uacsCode: "10705030-00", quantity: 1, description: "Video conferencing camera.", referenceLinks: [] },
  { id: 9221, name: "WATER DISPENSER", unit: "UNIT", price: 0, itemCode: "80141505-TS-040", category: "Common-Use Items", uacsCode: "10705020-00", quantity: 1, description: "Water dispenser.", referenceLinks: [] },
  { id: 9222, name: "WATER FILTER/PURIFIER FOR FAUCET", unit: "PIECE", price: 0, itemCode: "80141505-TS-106", category: "Common-Use Items", uacsCode: "10705020-00", quantity: 1, description: "Water filter/purifier for faucet.", referenceLinks: [] },
  { id: 9223, name: "WHITEBOARD", unit: "PIECE", price: 0, itemCode: "80141505-TS-013", category: "Common-Use Items", uacsCode: "50215030-00", quantity: 1, description: "Whiteboard.", referenceLinks: [] },
  { id: 9224, name: "WIFI EXTENDER", unit: "UNIT", price: 0, itemCode: "80141505-TS-100", category: "Common-Use Items", uacsCode: "10705030-00", quantity: 1, description: "Wi-Fi extender.", referenceLinks: [] },
  { id: 9225, name: "WIRELESS MICROPHONE", unit: "UNIT", price: 0, itemCode: "80141505-TS-101", category: "Common-Use Items", uacsCode: "10705040-00", quantity: 1, description: "Wireless microphone.", referenceLinks: [] },
  { id: 9226, name: "WIRELESS PRESENTER", unit: "UNIT", price: 0, itemCode: "80141505-TS-102", category: "Common-Use Items", uacsCode: "10705030-00", quantity: 1, description: "Wireless presenter.", referenceLinks: [] },
];
