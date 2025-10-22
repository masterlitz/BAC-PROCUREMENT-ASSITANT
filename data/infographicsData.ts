
export interface ScheduleItem {
    date: Date;
    activity: string;
    time: string;
    title: string;
    endUser: string;
    abc: number;
}

export const scheduleData: ScheduleItem[] = [
    { 
        date: new Date('2025-10-17'), 
        activity: 'PRE-PROC', 
        time: '9:30 AM', 
        title: 'Purchase of 1 Unit Brand New Water Filtration Truck used for Clean And safe Drinking Water Rationing in the Event of any Disaster as part of our 24/7 Emergency Response with P.R. No. BAC-PB25-10-0066', 
        endUser: '(DRRMO)', 
        abc: 6525000.00 
    },
    { 
        date: new Date('2025-10-17'), 
        activity: 'PRE-PROC', 
        time: '9:30 AM', 
        title: 'Purchase of 3 Units Ambulance to be used in our 24/7 Emergency Medical Services in Preparation for the Clustering of the Barangays with P.R. No. BAC-PB-25-10-0067', 
        endUser: '(DRRMO)', 
        abc: 11400000.00 
    },
    { 
        date: new Date('2025-10-17'), 
        activity: 'PRE-PROC', 
        time: '9:30 AM', 
        title: 'Purchase of 1 Unit Utility Van (White) to be used in our 24/7 Emergency Response Services in case of Disaster with P.R. No. BAC-PB-25-10-0068', 
        endUser: '(DRRMO)', 
        abc: 1850000.00 
    },
    { 
        date: new Date('2025-10-17'), 
        activity: 'PRE-PROC', 
        time: '9:30 AM', 
        title: 'Improvement of Bacolod City College Fire Protection System at Brgy. Taculing, Bacolod City with P.R. No. BAC-PB-25-10-0069', 
        endUser: '(CEO)', 
        abc: 2860872.00 
    },
    { 
        date: new Date('2025-10-17'), 
        activity: 'PRE-PROC', 
        time: '9:30 AM', 
        title: 'Purchase of Drugs and Medicines for the Clients of Bacolod City Health Office, and its Sixty-One (61) Barangays with P.R. No. BAC-PB-25-10-0070', 
        endUser: '(CHO)', 
        abc: 15199955.00 
    },
    {
        date: new Date('2025-10-17'), 
        activity: 'PRE-PROC', 
        time: '9:30 AM', 
        title: 'Clearing & Desilting of Water Ways @ Mandalagan River Brgy. 1 with P.R. No. BAC-PB-25-10-0071',
        endUser: '(DRRMO/CEO)',
        abc: 7948100.68
    },
    {
        date: new Date('2025-10-17'), 
        activity: 'PRE-PROC', 
        time: '9:30 AM', 
        title: 'Purchase of 1 Unit Backhoe (with Super Long Reach Arm) for Clearing and Desilting of Various Rivers and Waterways with P.R. No. BAC-PB-25-10-0072',
        endUser: '(DRRMF)',
        abc: 17500000.00
    },
    {
        date: new Date('2025-10-17'), 
        activity: 'PRE-PROC', 
        time: '9:30 AM', 
        title: 'Purchase of 1 Unit 6-Wheeler Dump Truck (8CBM) for Hauling/Transporting of Construction Materials with P.R. No. BAC-PB-25-10-0073',
        endUser: '(DRRMF)',
        abc: 8500000.00
    },
    {
        date: new Date('2025-10-17'), 
        activity: 'PRE-PROC', 
        time: '9:30 AM', 
        title: 'Purchase of 1 Set Multi-Platform Lidar System with Drone for Monitoring and Technical Survey of Various Infrastructures / System with P.R. No. BAC-PB-25-10-0074',
        endUser: '(DRRMF)',
        abc: 6500000.00
    },
    {
        date: new Date('2025-10-17'), 
        activity: 'PRE-PROC', 
        time: '9:30 AM', 
        title: 'Purchase of 1 Unit of Mini Amphibious Excavator for Clearing and Desilting Operation of Various Rivers and Waterways with P.R. No. BAC-PB-25-10-0075',
        endUser: '(DRRMF)',
        abc: 19400000.00
    },
    {
        date: new Date('2025-10-17'), 
        activity: 'PRE-PROC', 
        time: '9:30 AM', 
        title: 'Purchase of 1 Set Unmanned Surface Vessel (USV) for Hydrographic Survey for Monitoring and Technical Survey of Various Infrastructures / System with P.R. No. BAC-PB-25-10-0076',
        endUser: '(DRRMF)',
        abc: 4500000.00
    },
    { 
        date: new Date('2025-10-17'), 
        activity: 'PRE-PROC', 
        time: '9:30 AM', 
        title: 'Security Services for Bacolod City College 3 with P.R. No. BAC-PB-25-08-0046', 
        endUser: '(BCC)', 
        abc: 2146544.00 
    },
    { 
        date: new Date('2025-10-17'), 
        activity: 'PRE-PROC', 
        time: '9:30 AM', 
        title: 'Purchase of 92,766 Liters Fuel, Diesel and 7,000 Liters Fuel, Gasoline for the use of Govt./PNP service vehicles of Bacolod City Police Office, TEU, MPU, BCMFC, and PS 1 to 10 Chargeable to Fuel, Oil and Lubricants with P.R. NO. BAC-PB-25-07-0035', 
        endUser: '(BCPO)', 
        abc: 5999960.00 
    },
].sort((a, b) => a.date.getTime() - b.date.getTime());
