import React, { useState, useEffect } from 'react';
import { TimelineConfig } from '../types';

interface TimelineCalculatorProps {
    type: 'goods' | 'infra';
    config: TimelineConfig[keyof TimelineConfig];
}

interface StageState {
    duration: number;
    conduct: boolean;
    startDate: string;
    endDate: string;
}

const TimelineCalculator: React.FC<TimelineCalculatorProps> = ({ type, config }) => {
    const initialStageState = config.stages.reduce((acc, stage) => {
        acc[stage.id] = {
            duration: stage.duration,
            conduct: true,
            startDate: '',
            endDate: ''
        };
        return acc;
    }, {} as { [key: string]: StageState });

    const [startDate, setStartDate] = useState('');
    const [stages, setStages] = useState(initialStageState);

    const formatDate = (date: Date): string => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const addCalendarDays = (date: Date, days: number): Date => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    };

    const calculateTimeline = () => {
        if (!startDate) {
            return;
        }

        let currentDate = new Date(new Date(startDate).getTime() + (1000 * 60 * 60 * 24)); // Start on the next day
        const newStages = { ...stages };

        config.stages.forEach(stageInfo => {
            const stageState = newStages[stageInfo.id];
            const duration = stageState.conduct ? stageState.duration : 0;

            if (duration > 0) {
                const start = new Date(currentDate);
                const end = addCalendarDays(start, duration > 0 ? duration - 1 : 0);
                
                newStages[stageInfo.id] = {
                    ...stageState,
                    startDate: formatDate(start),
                    endDate: formatDate(end)
                };
                
                currentDate = addCalendarDays(end, 1);
            } else {
                 newStages[stageInfo.id] = {
                    ...stageState,
                    startDate: 'N/A',
                    endDate: 'N/A'
                };
            }
        });

        setStages(newStages);
    };
    
    useEffect(() => {
        if (startDate) {
            calculateTimeline();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, stages.prebid.conduct, stages.approval.conduct]);


    const handleDurationChange = (id: string, value: string) => {
        const newStages = { ...stages };
        newStages[id].duration = parseInt(value, 10) || 0;
        setStages(newStages);
    };

    const handleConductChange = (id: string, value: boolean) => {
        const newStages = { ...stages };
        newStages[id].conduct = value;
        setStages(newStages);
    };
    
    const startOver = () => {
        setStartDate('');
        setStages(initialStageState);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
                <label htmlFor={`${type}-start-date`} className="font-medium text-gray-700">Select date to begin with:</label>
                <input
                    type="date"
                    id={`${type}-start-date`}
                    className="p-2 border border-gray-300 rounded-md"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <button
                    className="btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg"
                    onClick={calculateTimeline}
                >
                    Compute Timeline
                </button>
                <button
                    className="btn bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
                    onClick={startOver}
                >
                    Start Over
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-orange-100">
                        <tr>
                            <th className="py-2 px-2 text-left text-sm font-semibold text-orange-800">Procurement Stage</th>
                            <th className="py-2 px-2 text-left text-sm font-semibold text-orange-800">Start Date</th>
                            <th className="py-2 px-2 text-left text-sm font-semibold text-orange-800">End Date</th>
                            <th className="py-2 px-2 text-left text-sm font-semibold text-orange-800">Days</th>
                        </tr>
                    </thead>
                    <tbody>
                        {config.stages.map(stageInfo => (
                            <tr key={stageInfo.id} className="border-b border-orange-100">
                                <td className="py-3 px-2 text-sm text-gray-700 font-medium">
                                    {stageInfo.name}
                                    {stageInfo.condition && (
                                        <div className="text-xs font-normal mt-1">
                                            Conduct?
                                            <input type="radio" id={`${type}-${stageInfo.id}-yes`} name={`${type}-${stageInfo.id}`} value="yes" checked={stages[stageInfo.id].conduct} onChange={() => handleConductChange(stageInfo.id, true)} className="ml-2 mr-1 h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500" />
                                            <label htmlFor={`${type}-${stageInfo.id}-yes`} className="mr-2">Yes</label>
                                            <input type="radio" id={`${type}-${stageInfo.id}-no`} name={`${type}-${stageInfo.id}`} value="no" checked={!stages[stageInfo.id].conduct} onChange={() => handleConductChange(stageInfo.id, false)} className="mr-1 h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500" />
                                            <label htmlFor={`${type}-${stageInfo.id}-no`}>No</label>
                                        </div>
                                    )}
                                </td>
                                <td className="py-3 px-2"><input type="text" value={stages[stageInfo.id].startDate} readOnly className="w-full p-1 border-gray-300 rounded-md text-center text-sm bg-gray-100" /></td>
                                <td className="py-3 px-2"><input type="text" value={stages[stageInfo.id].endDate} readOnly className="w-full p-1 border-gray-300 rounded-md text-center text-sm bg-gray-100" /></td>
                                <td className="py-3 px-2"><input type="number" value={stages[stageInfo.id].duration} onChange={(e) => handleDurationChange(stageInfo.id, e.target.value)} onBlur={calculateTimeline} className="w-20 p-1 border border-gray-300 rounded-md text-center text-sm" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TimelineCalculator;