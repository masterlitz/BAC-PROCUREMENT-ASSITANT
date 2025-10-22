
import React, { useMemo, forwardRef, useImperativeHandle } from 'react';
import { PpmpProjectItem, MarketItem } from '../../types';
import { isCseItem } from './utils';
import { appCseItems } from '../../data/items/commonUseItems/app_cse_items';

interface AppCseViewProps {
    consolidatedItems: PpmpProjectItem[];
}

interface ProcessedAppCseItem extends MarketItem {
    jan: number | '';
    feb: number | '';
    mar: number | '';
    apr: number | '';
    may: number | '';
    jun: number | '';
    jul: number | '';
    aug: number | '';
    sep: number | '';
    oct: number | '';
    nov: number | '';
    dec: number | '';
    totalQty: number;
    totalAmount: number;
}

const AppCseView = forwardRef<({ exportToPdf: () => void; exportToExcel: () => void; }), AppCseViewProps>(({ consolidatedItems }, ref) => {

    const processedData = useMemo((): ProcessedAppCseItem[] => {
        const cseItemsFromPpmps = consolidatedItems.filter(item => isCseItem(item.generalDescription));

        const mergedPpmps = new Map<string, { totalBudget: number; schedule: any }>();
        cseItemsFromPpmps.forEach(item => {
            const key = item.generalDescription.toLowerCase().trim();
            const existing = mergedPpmps.get(key) || { totalBudget: 0, schedule: {} };
            existing.totalBudget += item.estimatedBudget;
            if (item.schedule) {
                for (const month in item.schedule) {
                    existing.schedule[month] = (existing.schedule[month] || 0) + (item.schedule as any)[month];
                }
            }
            mergedPpmps.set(key, existing);
        });

        return appCseItems.map(masterItem => {
            const masterNameLower = masterItem.name.toLowerCase().trim();
            const ppmpsMatchEntry = Array.from(mergedPpmps.entries()).find(([key]) => key.includes(masterNameLower));
            
            const data = ppmpsMatchEntry ? ppmpsMatchEntry[1] : { totalBudget: 0, schedule: {} };

            const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;
            
            const monthlyQty: { [K in typeof monthKeys[number]]: number | '' } = {
                jan: '', feb: '', mar: '', apr: '', may: '', jun: '',
                jul: '', aug: '', sep: '', oct: '', nov: '', dec: ''
            };

            let totalQty = 0;

            if (data.totalBudget > 0 && masterItem.price > 0) {
                monthKeys.forEach(month => {
                    const monthBudget = data.schedule[month] || 0;
                    if (monthBudget > 0) {
                        const qty = Math.ceil(monthBudget / masterItem.price);
                        monthlyQty[month] = qty > 0 ? qty : '';
                        totalQty += qty;
                    }
                });
            }

            return {
                ...masterItem,
                ...monthlyQty,
                totalQty,
                totalAmount: totalQty * masterItem.price,
            };
        });
    }, [consolidatedItems]);

    useImperativeHandle(ref, () => ({
        exportToPdf: () => alert('APP-CSE PDF export is under development.'),
        exportToExcel: () => alert('APP-CSE Excel export is under development.'),
    }));

    return (
        <div className="h-full overflow-auto bg-gray-200 p-4 no-drag">
            <div className="bg-white p-4 mx-auto" style={{ width: '13in', fontFamily: "'Times New Roman', Times, serif", fontSize: '8pt' }}>
                <h3 className="text-center font-bold">ANNUAL PROCUREMENT PLAN - COMMON-USE SUPPLIES AND EQUIPMENT (APP-CSE) 2026 FORM</h3>
                
                <table className="w-full border-collapse border border-black mt-4 text-xs">
                    <thead>
                        <tr className="font-bold text-center">
                            <th rowSpan={2} className="p-1 border border-black w-[20%]">Item & Specifications</th>
                            <th rowSpan={2} className="p-1 border border-black w-[5%]">Unit of Measure</th>
                            <th colSpan={3} className="p-1 border border-black">Q1</th>
                            <th colSpan={3} className="p-1 border border-black">Q2</th>
                            <th colSpan={3} className="p-1 border border-black">Q3</th>
                            <th colSpan={3} className="p-1 border border-black">Q4</th>
                            <th rowSpan={2} className="p-1 border border-black w-[6%]">Total Quantity for the year</th>
                            <th rowSpan={2} className="p-1 border border-black w-[7%]">Price Catalogue</th>
                            <th rowSpan={2} className="p-1 border border-black w-[8%]">Total Amount for the year</th>
                        </tr>
                        <tr className="font-bold text-center">
                            {[...Array(12)].map((_, i) => <th key={i} className="p-1 border border-black w-[3%]">{new Date(0, i).toLocaleString('default', { month: 'short' })}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                         <tr><td colSpan={17} className="p-1 border border-black bg-gray-200 font-bold">PART I: AVAILABLE AT PS-DBM (MAIN WAREHOUSE AND DEPOTS)</td></tr>
                        {processedData.map(item => (
                            <tr key={item.id}>
                                <td className="p-1 border border-black">{item.itemCode} - {item.name}</td>
                                <td className="p-1 border border-black text-center">{item.unit}</td>
                                <td className="p-1 border border-black text-center">{item.jan}</td>
                                <td className="p-1 border border-black text-center">{item.feb}</td>
                                <td className="p-1 border border-black text-center">{item.mar}</td>
                                <td className="p-1 border border-black text-center">{item.apr}</td>
                                <td className="p-1 border border-black text-center">{item.may}</td>
                                <td className="p-1 border border-black text-center">{item.jun}</td>
                                <td className="p-1 border border-black text-center">{item.jul}</td>
                                <td className="p-1 border border-black text-center">{item.aug}</td>
                                <td className="p-1 border border-black text-center">{item.sep}</td>
                                <td className="p-1 border border-black text-center">{item.oct}</td>
                                <td className="p-1 border border-black text-center">{item.nov}</td>
                                <td className="p-1 border border-black text-center">{item.dec}</td>
                                <td className="p-1 border border-black text-center font-bold">{item.totalQty > 0 ? item.totalQty.toLocaleString() : '0'}</td>
                                <td className="p-1 border border-black text-right">₱{item.price > 0 ? item.price.toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'}</td>
                                <td className="p-1 border border-black text-right font-bold">₱{item.totalAmount > 0 ? item.totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'}</td>
                            </tr>
                        ))}
                         <tr className="font-bold bg-gray-100">
                            <td colSpan={16} className="p-1 border border-black text-right">PART I TOTAL:</td>
                            <td className="p-1 border border-black text-right">
                                ₱{processedData.reduce((sum, item) => sum + item.totalAmount, 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                            </td>
                         </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
});

export default AppCseView;
