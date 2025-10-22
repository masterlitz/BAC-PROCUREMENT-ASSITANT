export interface MockProcurementRequest {
    prNumber: string;
    projectTitle: string;
    endUser: string;
    abc: number;
    status: 'For BAC Review' | 'For Post-Qualification' | 'Awarded' | 'Notice to Proceed Issued' | 'Completed';
    lastUpdated: string;
}

export const mockProcurementData: MockProcurementRequest[] = [
    {
        prNumber: "2025-07-0005",
        projectTitle: "Procurement of Various Office Supplies",
        endUser: "City Mayor's Office",
        abc: 48205.00,
        status: "Notice to Proceed Issued",
        lastUpdated: "2025-07-11"
    },
    {
        prNumber: "BAC-PB-25-10-0066",
        projectTitle: "Purchase of 1 Unit Brand New Water Filtration Truck",
        endUser: "DRRMO",
        abc: 6525000.00,
        status: "For Post-Qualification",
        lastUpdated: "2025-10-17"
    },
    {
        prNumber: "BAC-PB-25-08-0046",
        projectTitle: "Security Services for Bacolod City College 3",
        endUser: "BCC",
        abc: 2146544.00,
        status: "Awarded",
        lastUpdated: "2025-09-28"
    },
    {
        prNumber: "AGRI-2026-001",
        projectTitle: "Various Agricultural and Marine Supplies",
        endUser: "City Department of Agriculture",
        abc: 1600000.00,
        status: "For BAC Review",
        lastUpdated: "2025-10-20"
    }
];
