

// FIX: Add missing React import to resolve React.ReactNode type.
import React from 'react';

export type TabKey = 'dashboard' | 'advisor' | 'scoping' | 'flow' | 'timeline-calc' | 'checklist' | 'agreements' | 'comparator' | 'post-generator' | 'planning' | 'resolution-generator' | 'auditor' | 'trivia-generator' | 'web-scraper' | 'ppmp-exporter' | 'rfq-generator' | 'ppmp-generator' | 'account' | 'user-management' | 'downloadable-forms' | 'specification-generator' | 'bac-analytics' | 'catalog' | 'qr-maker' | 'email-composer' | 'pdf-to-image' | 'ppmp-consolidator' | 'item-catalog-assistant' | 'contract-auditor' | 'supplier-performance' | 'directory' | 'infographics' | 'catalog-tutorial';

export type ModalKey = 'analytics' | 'catalog' | 'qr-maker' | 'email-composer' | 'ppmp-consolidator' | 'changelog' | 'infographics' | 'system-auditor' | null;

export type NonNullableModalKey = NonNullable<ModalKey>;

export interface ChatMessage {
    id: number;
    sender: 'user' | 'ai';
    text: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export interface MenuItem {
    id: TabKey | string;
    label: string;
    icon?: React.ReactNode;
    isHeader?: boolean;
    adminOnly?: boolean;
    description?: string;
}

export interface LogicStep {
    text?: string;
    type?: 'options' | 'boolean' | 'input';
    options?: { [key: string]: string };
    yes?: string;
    no?: string;
    thresholds?: { limit: number; next: string }[];
    defaultNext?: string;
    result?: string;
    description?: string;
    reference?: string;
}

export interface LogicTree {
    [key: string]: LogicStep;
}

export interface ChecklistData {
    [category: string]: string[];
}

export interface DocumentChecklists {
    [key: string]: ChecklistData;
}

export interface TimelineStage {
    id: string;
    name: string;
    duration: number;
    condition?: boolean;
}

export interface TimelineConfig {
    [key:string]: {
        stages: TimelineStage[];
    };
}

export interface ExtractedItem {
    description: string;
    uom: string;
    qty: string;
    unitCost: string;
    amount: string;
}

export interface ExtractedDocInfo {
    Description?: string;
    Purpose?: string;
    'Source of Funds'?: string;
    'MOOE No.'?: string;
    'Responsibility Center'?: string;
    'Account Code'?: string;
    'Received Date'?: string;
    'PR Number'?: string;
    ABC?: string;
    'OBR Amount'?: string;
    RecommendedMode?: string;
    Justification?: string;
    items?: ExtractedItem[];
}

export interface SupplierQuote {
    supplier: string;
    price: number;
    link: string;
    imageUrl: string;
    source?: string; // Added for citing sources
    title?: string;  // Added for citing sources
}

export interface MarketItemVariant {
  itemCode: string;
  description: string; 
  price: number;
  unit: string;
  stockStatus: string; 
  technicalSpecifications?: string;
}

export interface VariantMarketItem {
  id: number;
  isVariant: true;
  name: string;
  baseDescription: string;
  category: string;
  uacsCode: string;
  imageUrl?: string;
  variants: MarketItemVariant[];
}

export interface MarketItem {
  id: number;
  isVariant?: false;
  name: string;
  description: string;
  category: string;
  uacsCode: string;
  quantity: number; 
  unit: string;
  price: number;
  referenceLinks: string[];
  itemCode?: string;
  technicalSpecifications?: string;
  imageUrl?: string;
}

export type CatalogItem = MarketItem | VariantMarketItem;


export interface ScopingResult {
  id: number;
  name: string;
  description: string;
  category: string;
  uacsCode: string;
  quantity: number;
  unit: string;
  quotes: SupplierQuote[];
  averagePrice: number;
  markupPercentage: number;
  catalogPrice: number;
}

export interface ComparisonFinding {
  category: string;
  status: 'match' | 'mismatch' | 'info';
  ppmpValue: string;
  prValue: string;
  notes: string;
}

export interface ComparisonResult {
  conclusion: 'Consistent' | 'Discrepancies Found';
  summary: string;
  findings: ComparisonFinding[];
  prNumber?: string;
}

export interface CatalogComparisonFinding {
  prItemDescription: string;
  prUnitCost: number;
  catalogItemName: string;
  catalogUnitCost: number;
  variancePercentage: number;
  status: 'Match' | 'Overpriced' | 'Underpriced' | 'Not found';
}

export interface CatalogComparisonResult {
  prNumber: string;
  summary: string;
  findings: CatalogComparisonFinding[];
}

export interface DocumentCheckFinding {
  category: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

export interface DocumentCheckResult {
  overallStatus: 'Approved' | 'Needs Review' | 'Critical Issues';
  summary: string;
  findings: DocumentCheckFinding[];
}

export interface AuditFinding {
  type: 'Typographical' | 'Grammatical' | 'Clarity' | 'Formatting' | 'Completeness' | 'Numerical';
  location: string;
  original: string;
  suggestion: string;
  explanation: string;
}

export interface DocumentAuditResult {
  overallStatus: 'Excellent' | 'Good' | 'Needs Improvement';
  summary: string;
  findings: AuditFinding[];
}

// New types for Duplicate Item Audit
export interface DuplicateItem {
    itemCode: string;
    name: string;
    price: string;
}

export interface DuplicateItemGroup {
    suggestedName: string;
    items: DuplicateItem[];
}

export interface DuplicateItemAuditResult {
    summary: string;
    duplicates: DuplicateItemGroup[];
}

export interface BrandAuditFinding {
  itemDescription: string;
  identifiedBrand: string | 'None';
  status: 'compliant' | 'potential_issue';
  explanation: string;
  recommendedGenericName: string;
}

export interface BrandAuditResult {
  overallConclusion: 'Compliant' | 'Potential Issues Found';
  summary: string;
  findings: BrandAuditFinding[];
}

// New Types for Contract Auditor
export interface ContractFinding {
    clause_text: string;
    risk_level: 'High' | 'Medium' | 'Low' | 'Info';
    category: 'Ambiguity' | 'Unfair Term' | 'Missing Information' | 'Compliance' | 'Contradiction';
    issue: string;
    recommendation: string;
}

export interface ContractAuditResult {
    overall_assessment: string;
    executive_summary: string;
    findings: ContractFinding[];
}

// New Types for System Development Auditor
export interface SystemAuditFinding {
    requirement: string;
    featureStatus: 'Implemented' | 'Partially Implemented' | 'Missing' | 'Discrepancy';
    analysis: string;
    recommendation: string;
}

export interface SystemAuditResult {
    overallAssessment: string;
    summary: string;
    findings: SystemAuditFinding[];
}


export interface SocialMediaPostItem {
  referenceNo: string;
  projectTitle: string;
  supplier: string;
  contractPrice: string;
  dateOfIssuance: string;
  communique: string;
  hashtags: string;
}

export interface SocialMediaTrivia {
  triviaQuestion: string;
  triviaAnswer: string;
  explanation: string;
  hashtags: string;
}

export interface ScrapedVideoData {
  title: string;
  summary: string;
  thumbnailUrl: string;
  videoUrl: string;
  hashtags: string;
}

export interface ScrapedFacebookPost {
  text: string;
  date: string;
  link: string;
}

export interface PpmpItem {
  isCategory: boolean;
  description: string; // Holds category name or item description
  
  // Fields for both category and item rows for flexibility
  amount?: string;
  
  // Fields primarily for item rows
  papCode?: string;
  specificationDetails?: string;
  earlyProcurementActivity?: string;
  procurementMode?: string;
  quantity?: string;
  uom?: string;
  unitCost?: string;
  estimatedBudget?: string;
  
  jan?: string;
  feb?: string;
  mar?: string;
  
  apr?: string;
  may?: string;
  jun?: string;
  
  jul?: string;
  aug?: string;
  sep?: string;
  
  oct?: string;
  nov?: string;
  dec?: string;
  
  remarks?: string;
}

export interface PpmpProjectItem {
  id: number;
  office: string;
  papCode?: string;
  generalDescription: string;
  specificationDetails?: string;
  uom: string;
  quantity: number;
  procurementMode: string;
  preProcCon?: 'Yes' | 'No' | '';
  procurementStart?: string;
  procurementEnd?: string;
  deliveryImplementation?: string;
  sourceOfFunds?: string;
  estimatedBudget: number;
  supportingDocuments?: string;
  remarks?: string;
  schedule?: {
      jan: number; feb: number; mar: number;
      apr: number; may: number; jun: number;
      jul: number; aug: number; sep: number;
      oct: number; nov: number; dec: number;
  };
  
  projectType?: string;
  quantitySize?: string;
}


export interface SavedPpmp {
    name: string; // The short name for the tab, e.g., "CEO"
    headerData: {
        ppmpNo: string;
        fiscalYear: string;
        endUser: string;
        status: 'indicative' | 'final';
    };
    items: PpmpProjectItem[];
    footerData: {
        preparedBy: { name: string; position: string; date: string };
        submittedBy: { name: string; position: string; date: string };
    };
}

export interface PpmpSummaryData {
    summary: string;
    totalBudget: number;
    topCategories: { category: string; budget: number; projectCount: number }[];
    keyProjects: { description: string; office: string; budget: number }[];
    analysis: string;
}


export interface RfqItem {
    itemNo: string;
    description: string;
    qty: string;
    uom: string;
}

export interface ExtractedRfqData {
    prNo: string;
    projectTitle: string;
    endUser: string;
    abc: string;
    items: RfqItem[];
    contactInfo: string;
    hashtags: string;
}

export type DocumentType = 'resolution' | 'rfq' | 'abstract' | 'po' | 'noa' | 'ntp' | 'contract';

export interface ProcurementProjectItem {
    itemNo: number;
    description: string;
    qty: number;
    uom: string;
    brandName?: string;
    unitCost: number;
    totalCost: number;
}

export interface SupplierBid {
    name: string;
    address: string;
    tin?: string;
    contactNo?: string;
    bids: {
        unitPrice: number;
        totalPrice: number;
    }[];
    totalBid: number;
}

export interface ProcurementProjectData {
    // Core Info
    prNo: string;
    projectTitle: string;
    endUser: string;
    location: string;
    abc: number;
    abcInWords: string;
    procurementMode: string;

    // Items
    items: ProcurementProjectItem[];

    // Bidding Info
    suppliers: SupplierBid[];

    // Document Specific Info
    resolutionNo: string;
    resolutionSeries: string;
    resolutionDate: string;
    poNo: string;
    poDate: string;
    deliveryTerm: string;
    paymentTerm: string;
    
    // PO Specific Clauses
    poSanggunianReso?: string;
    poNegotiatedClause?: string;

    // Signatories
    chairperson: string;
    viceChairperson: string;
    members: string[];
    endUserSignatory: string;
    preparedBy: string; // BAC Sec Head
    cityMayor: string;
    poCertifiedCorrectSignatory?: string;
    isApproved: boolean; // For Resolution approval

    // For NOA
    noaDate?: string;
    performanceSecurity?: string;
    
    // For NTP
    ntpDate?: string;

    // For Contract
    contractDate?: string;
    contractVenue?: string;
    witnesses?: string[];
}

export interface PurchaseRequest {
    id: number;
    projectId: number; // Links to PpmpProjectItem.id
    prNumber: string;
    date: string;
    quantity: number;
    actualCost: number; // Total cost for this request
}

// User Authentication
export interface User {
  id: number;
  username: string;
  password?: string; // Included for the user data source file
  role: 'admin' | 'user';
  fullName: string;
  department: string;
  allowedTabs: TabKey[] | 'all';
}

// New types for Item Catalog Assistant
export interface QualityCheck {
  status: 'GOOD' | 'NEEDS_IMPROVEMENT' | 'UNKNOWN';
  notes: string;
}

export interface CatalogAssistantItem {
  originalDescription: string;
  originalUnitCost: number;
  catalogItemName: string;
  catalogUnitCost: number;
  variancePercentage: number;
  status: 'MATCH' | 'HIGH_VARIANCE' | 'NOT_FOUND' | 'DUPLICATE_CHECK';
  notes: string;
  // New Fields for enhanced intelligence
  suggestedCategory: string;
  descriptionQuality: QualityCheck;
  uomQuality: QualityCheck;
  priceFeasibility: QualityCheck;
  uacsCodeSuggestion: string;
  duplicateCount: number; // How many times it appeared in the source doc
  imageUrl?: string;
}

export interface CatalogAssistantResult {
  executiveSummary: string; // Focuses on pricing and matching
  qualityControlSummary: string; // New summary for overall document quality
  actionableRecommendations: string;
  items: CatalogAssistantItem[];
}

export interface PpmpAnalysisFinding {
  findingType: 'Missing Data' | 'Compliance Mismatch' | 'Vague Description' | 'Scheduling Gap' | 'General Suggestion';
  itemDescription: string;
  details: string;
  recommendation: string;
}

export interface PpmpAnalysisResult {
  overallAssessment: 'Good' | 'Needs Review' | 'Has Issues';
  executiveSummary: string;
  keyFindings: PpmpAnalysisFinding[];
}

export interface MockProcurementRequest {
    prNumber: string;
    projectTitle: string;
    endUser: string;
    abc: number;
    status: 'For BAC Review' | 'For Post-Qualification' | 'Awarded' | 'Notice to Proceed Issued' | 'Completed';
    lastUpdated: string;
}