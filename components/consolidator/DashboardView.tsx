
import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { PpmpProjectItem } from '../../types';
import { generatePpmpExecutiveSummary } from '../../services/geminiService';
import Loader from '../Loader';
import { ConsolidatorKPI, categorizeItem } from './types';

// Augment the jsPDF instance type with the autoTable method from the plugin
declare global {
    interface Window {
        jspdf: { 
            jsPDF: new (options?: any) => any;
            plugin: any;
        };
    }
}
interface jsPDFWithAutoTable extends InstanceType<typeof window.jspdf.jsPDF> {
  autoTable: (options: any) => jsPDFWithAutoTable;
}


interface DashboardViewProps {
    consolidatedItems: PpmpProjectItem[];
}

const PieChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
    const colors = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#ea580c', '#c2410c'];
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return <div className="flex items-center justify-center h-full text-gray-500">No data to display.</div>;

    let cumulativePercent = 0;
    const slices = data.map((d, i) => {
        const percent = d.value / total;
        const [startX, startY] = [Math.cos(2 * Math.PI * cumulativePercent), Math.sin(2 * Math.PI * cumulativePercent)];
        cumulativePercent += percent;
        const [endX, endY] = [Math.cos(2 * Math.PI * cumulativePercent), Math.sin(2 * Math.PI * cumulativePercent)];
        const largeArcFlag = percent > 0.5 ? 1 : 0;
        const pathData = `M ${startX * 40 + 50} ${startY * 40 + 50} A 40 40 0 ${largeArcFlag} 1 ${endX * 40 + 50} ${endY * 40 + 50} L 50 50`;
        return { ...d, pathData, color: colors[i % colors.length] };
    });

    return (
        <div className="flex items-center gap-4">
            <svg viewBox="0 0 100 100" className="w-32 h-32 flex-shrink-0">
                {slices.map(slice => <path key={slice.name} d={slice.pathData} fill={slice.color}><title>{`${slice.name}: ₱${slice.value.toLocaleString()}`}</title></path>)}
            </svg>
            <div className="text-xs space-y-1">
                {slices.map(slice => (
                    <div key={slice.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: slice.color }}></div>
                        <span className="font-semibold text-gray-700 truncate">{slice.name}</span>
                        <span className="ml-auto text-gray-500 font-mono">₱{(slice.value / 1_000_000).toFixed(2)}M</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const DashboardView = forwardRef<({ exportToPdf: () => void; }), DashboardViewProps>(({ consolidatedItems }, ref) => {
    const [summaryData, setSummaryData] = useState<any>(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState('');

    useEffect(() => {
        setSummaryData(null);
    }, [consolidatedItems]);

    const handleGenerateSummary = async () => {
        if (consolidatedItems.length === 0) {
            setSummaryData(null);
            return;
        }
        setLoadingSummary(true);
        setSummaryError('');
        try {
            const categorized = consolidatedItems.map(item => ({...item, category: categorizeItem(item.generalDescription)}));
            const summary = await generatePpmpExecutiveSummary(categorized);
            setSummaryData(summary);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Failed to generate summary:", error);
            setSummaryError(`Failed to generate summary. The AI returned an error: "${errorMessage}". This may be due to rate limits. Please try again in a minute.`);
        } finally {
            setLoadingSummary(false);
        }
    };

    useImperativeHandle(ref, () => ({
        exportToPdf: () => {
            if (!summaryData) {
                alert("Please generate the AI summary before exporting.");
                return;
            }
             const jspdfModule = window.jspdf;
            if (!jspdfModule || !jspdfModule.jsPDF) {
                alert("PDF export library not loaded. Please check your connection and try again.");
                return;
            }

            const doc = new jspdfModule.jsPDF() as jsPDFWithAutoTable;
            if (typeof doc.autoTable !== 'function') {
                alert("PDF autoTable plugin is not loaded. Please try again.");
                return;
            }
            
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text("PPMP Consolidator Dashboard Report", 105, 20, { align: 'center' });
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 200, 28, { align: 'right' });
            
            let startY = 40;

            const kpiBody = [[
                `Total Budget:\n${`₱${(summaryData.totalBudget || 0).toLocaleString()}`}`,
                `Total Projects:\n${consolidatedItems.length.toLocaleString()}`,
                `Avg. Budget/Project:\n${`₱${consolidatedItems.length > 0 ? (summaryData.totalBudget / consolidatedItems.length).toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}`}`,
                `Unique Offices:\n${[...new Set(consolidatedItems.map(item => item.office))].length}`
            ]];
            doc.autoTable({
                startY: startY,
                theme: 'grid',
                body: kpiBody,
                bodyStyles: { fontStyle: 'bold', fontSize: 10, halign: 'center', cellPadding: 8 }
            });
            startY = (doc as any).lastAutoTable.finalY + 15;
            
            doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text("Executive Summary (AI Generated)", 14, startY);
            startY += 7;
            doc.setFontSize(10); doc.setFont('helvetica', 'normal');
            const summaryLines = doc.splitTextToSize(summaryData.summary, 180);
            doc.text(summaryLines, 14, startY);
            startY += summaryLines.length * 3.5 + 10;

            doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text("Strategic Analysis", 14, startY);
            startY += 7;
            doc.setFontSize(10); doc.setFont('helvetica', 'italic');
            const analysisLines = doc.splitTextToSize(summaryData.analysis, 180);
            doc.text(analysisLines, 14, startY);
            startY += analysisLines.length * 3.5 + 15;

            doc.autoTable({
                startY: startY, head: [['Top 5 Spending Categories', 'Budget', '# of Projects']],
                body: summaryData.topCategories.map((cat: any) => [cat.category, `₱${cat.budget.toLocaleString()}`, cat.projectCount]),
                theme: 'striped', headStyles: { fillColor: '#f97316' },
            });
            startY = (doc as any).lastAutoTable.finalY + 15;

            doc.autoTable({
                startY: startY, head: [['Top 5 Key Projects', 'Office', 'Budget']],
                body: summaryData.keyProjects.map((proj: any) => [proj.description, proj.office, `₱${proj.budget.toLocaleString()}`]),
                theme: 'striped', headStyles: { fillColor: '#16a34a' },
            });

            doc.save("PPMP_Dashboard_Report.pdf");
        }
    }));
    
    const clientSideTotalBudget = useMemo(() => consolidatedItems.reduce((sum, item) => sum + item.estimatedBudget, 0), [consolidatedItems]);

    const procurementModeData = useMemo(() => {
        const modeMap: { [key: string]: number } = {};
        consolidatedItems.forEach(item => {
            const mode = item.procurementMode || 'Unspecified';
            modeMap[mode] = (modeMap[mode] || 0) + item.estimatedBudget;
        });
        return Object.entries(modeMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [consolidatedItems]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">PPMP Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ConsolidatorKPI title="Total Budget" value={`₱${(summaryData?.totalBudget || clientSideTotalBudget).toLocaleString()}`} />
                <ConsolidatorKPI title="Total Projects" value={consolidatedItems.length.toLocaleString()} />
                <ConsolidatorKPI title="Avg. Budget per Project" value={`₱${consolidatedItems.length > 0 ? ((summaryData?.totalBudget || clientSideTotalBudget) / consolidatedItems.length).toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}`} />
                <ConsolidatorKPI title="Unique Offices" value={[...new Set(consolidatedItems.map(item => item.office))].length.toString()} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-gray-700">Executive Summary (AI Generated)</h3>
                        <button onClick={handleGenerateSummary} disabled={loadingSummary} className="btn text-xs bg-orange-500 hover:bg-orange-600 text-white font-semibold py-1 px-3 rounded-md disabled:bg-gray-400">
                            {loadingSummary ? 'Generating...' : summaryData ? 'Regenerate Summary' : 'Generate Summary'}
                        </button>
                    </div>
                    {loadingSummary && <Loader text="Generating AI summary..." />}
                    {summaryError && <div className="text-red-600 text-xs p-2 bg-red-50 rounded">{summaryError}</div>}
                    {summaryData ? (
                        <div className="text-sm text-gray-600 space-y-3">
                            <p className="whitespace-pre-wrap">{summaryData.summary}</p>
                            <div className="border-t pt-3">
                                <h4 className="font-semibold text-gray-800 mb-1">Strategic Analysis:</h4>
                                <p className="italic">{summaryData.analysis}</p>
                            </div>
                        </div>
                    ) : !loadingSummary && (
                         <div className="text-center py-8 text-gray-500">
                            <p>Click "Generate Summary" to get AI-powered insights on the consolidated data.</p>
                        </div>
                    )}
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-gray-700 mb-2">Budget by Procurement Mode</h3>
                    <PieChart data={procurementModeData} />
                </div>
            </div>
        </div>
    );
});

export default DashboardView;
