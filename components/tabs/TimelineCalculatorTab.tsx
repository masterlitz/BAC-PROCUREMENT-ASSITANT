import React from 'react';
import TimelineCalculator from '../TimelineCalculator';
import { TIMELINE_CONFIG } from '../../constants';

const TimelineCalculatorTab: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-1">Procurement Timeline - Goods</h3>
                <p className="text-sm text-orange-600 font-semibold mb-4">BETA VERSION 2.0</p>
                <TimelineCalculator type="goods" config={TIMELINE_CONFIG.goods} />
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-1">Procurement Timeline - Infrastructure</h3>
                <p className="text-sm text-orange-600 font-semibold mb-4">BETA VERSION 2.0</p>
                <TimelineCalculator type="infra" config={TIMELINE_CONFIG.infra} />
            </div>
        </div>
    );
};

export default TimelineCalculatorTab;
