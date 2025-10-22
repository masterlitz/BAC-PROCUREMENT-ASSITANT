

import React from 'react';
import { MenuItem, LogicTree, DocumentChecklists, TimelineConfig, ChangelogEntry } from './types';

export const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: '3.10',
    date: 'October 14, 2025',
    changes: [
      'Data Integrity: Fixed multiple critical bugs caused by duplicate item IDs in the procurement catalog, which led to incorrect items being added to purchase requests.',
      'Enhancement: Improved and standardized several item codes to be unique and more descriptive, enhancing data consistency and search functionality across the catalog.',
    ],
  },
  {
    version: '3.9',
    date: 'July 24, 2025',
    changes: [
      'New Feature: Automated APP-CSE Generator - The PPMP Consolidator now includes a new "APP-CSE" view. This powerful tool automatically scans all uploaded PPMPs, identifies Common-Use Supplies and Equipment based on the official PS-DBM catalog, and generates a consolidated APP-CSE ready for export to PDF or Excel.',
    ],
  },
  {
    version: '3.8',
    date: 'July 23, 2025',
    changes: [
      'Enhancement: In-Place Editing for PPMP Consolidator - The "Documents" view in the PPMP Consolidator now features a fully editable interface. Users can now click on any field in the PPMP form to make corrections or add details directly before exporting, ensuring the final PDF is accurate and compliant.',
    ],
  },
  {
    version: '3.7',
    date: 'July 22, 2025',
    changes: [
      'New Feature: GPPB-Compliant PPMP Export - The PPMP Consolidator now exports department PPMPs in the official GPPB template format, ensuring compliance and standardization. This can be found in the "Documents" view within the consolidator.',
    ],
  },
  {
    version: '3.6',
    date: 'July 21, 2025',
    changes: [
      'New Feature: PDF Export in Market Scoping - The AI Market Scoping Desk now includes an "Export PDF" feature, allowing users to generate a professional report of their research findings.',
    ],
  },
  {
    version: '3.5',
    date: 'July 20, 2025',
    changes: [
      'New Feature: Directory Tab - Added a comprehensive, searchable directory of all city government offices under "Guides & Checklists" for easy access to contact information.',
      'Enhancement: Interactive Infographics - The infographics calendar is now interactive! Hover over a scheduled date to see a tooltip with project titles. Added multi-month navigation to view upcoming activities.',
      'Enhancement: Procurement Catalog Search - The catalog now features a global "All Categories" search option, making it easier to find any item across the entire database.',
      'Enhancement: Dashboard Utilities - Added "Print" and "Export as Image" buttons to the Procurement Schedule on the dashboard for better reporting and sharing.',
      'Data Update: Catalog Expansion - Added a new "Office Equipment" category with items like digital photocopiers. Also added new office supplies based on recent requests.',
      'Compliance Update: Generic Naming - Updated several catalog items to use generic, non-brand-specific names and codes to align with procurement law standards.',
      'UX Improvement: Market Scoping Links - Items in the catalog with a market scoping reference now have a clickable "Market Scoping" button for direct access to the source document.',
      'Layout Improvement: Enhanced the PDF export design in the AI Market Scoping Desk to match the professional format of the Procurement Catalog reports, including page headers and footers.',
    ],
  },
  {
    version: '3.4',
    date: 'July 18, 2025',
    changes: [
      'New Feature: AI Contract Auditor - A new tool under "AI & Automation" to scan draft contracts for risky clauses, ambiguities, and compliance with R.A. 12009.',
      'New Feature: Supplier Performance Module (Beta) - Introduced a new module to track and rate supplier performance on timeliness, quality, and compliance.',
      'Enhancement: Upgraded Market Scoping - The tool now uses advanced AI search grounding to provide more accurate, real-time pricing and directly cites sources for a better audit trail.',
      'Enhancement: The Document Generator now includes templates for "Notice to Proceed" and "Contract Agreements".',
      'UI Fix: Resolved a layout issue on the Dashboard for ultra-wide screen resolutions.',
      'Data Update: UACS codes in the Procurement Catalog have been updated to align with the latest COA circular.',
    ],
  },
  {
    version: '3.3',
    date: 'July 17, 2025',
    changes: [
      'Feature: Expanded User Access - Standard users can now access the full "Guides & Checklists" section.',
      'Feature: Enhanced Mobile Experience - Improved mobile navigation with a new slide-out menu header and better responsive layouts for smaller screens.',
      'Enhancement: PPMP Consolidator Overhaul - The consolidator now starts fresh with a new "Upload Hub". Added PDF and Excel export capabilities to all relevant views (Dashboard, Projects, Documents).',
      'Enhancement: Data Visualization - The "Total Budget by Office" chart on the Consolidator Dashboard now displays all offices in a scrollable, interactive format.',
      'Data Integrity: Standardized numerous office names (e.g., BCYDO, MITCS, DSSD) for accurate compliance tracking and updated several procurement catalogs, including a full overhaul of "Construction and Electrical Supplies".',
      'Code Quality: Refactored core application components for improved maintainability and performance.',
    ],
  },
  {
    version: '3.2',
    date: 'July 16, 2025',
    changes: [
      'Major Catalog Expansion: Added over 150 new items across Janitorial, Electrical, and Food & Groceries categories.',
      'New Feature: \'Request New Item\' allows users to generate a formal PDF request for adding items to the catalog.',
      'Bug Fix: Resolved a critical error (`atob`) that prevented PDF generation and export across the application.',
      'Data Overhaul: Updated \'Representation Expense\' category and converted all catalog prices to whole numbers for consistency.',
    ],
  },
  {
    version: '3.1',
    date: 'July 15, 2025',
    changes: [
      'Added Changelog and App Update modal for tracking version changes.',
      'Enhanced Login page with a new background image and improved layout.',
      'Updated Document Generator with more robust export options.',
      'Improved AI Assistant context awareness for uploaded documents.',
    ],
  },
  {
    version: '3.0',
    date: 'July 1, 2025',
    changes: [
      'Initial release of the BAC Procurement Assistant V3.',
      'Integrated new AI models for faster and more accurate document processing.',
      'Launched the full Procurement Catalog with PR generation.',
      'Added User Management and role-based access control.',
    ],
  },
  {
    version: '2.5',
    date: 'June 15, 2025',
    changes: [
      'Beta release of the AI Document Reader and Comparator.',
      'Introduced the Timeline Calculator for goods and infrastructure projects.',
    ],
  },
];

export const MENU_ITEMS: MenuItem[] = [
    { isHeader: true, id: 'header-core', label: 'Core Tools' },
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
        description: "Your central hub for all procurement tools and analytics."
    },
    {
        id: 'advisor',
        label: 'Mode Advisor',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        description: "Determine the correct procurement mode using a manual wizard or AI analysis."
    },
    {
        id: 'scoping',
        label: 'Market Scoping',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        description: "Use AI to research market prices and find supplier quotes for your items."
    },
    {
        id: 'catalog',
        label: 'Procurement Catalog',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
        description: "Browse a catalog of items, generate purchase requests, and view analytics."
    },
     {
        id: 'bac-analytics',
        label: 'BAC Analytics',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>,
        description: "View interactive dashboards and data on procurement performance."
    },

    { isHeader: true, id: 'header-display', label: 'Live Display' },
    {
        id: 'infographics',
        label: 'Infographics Dashboard',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122l-2.52 1.89C3.935 23.088 2.25 21.534 2.25 19.5V8.25a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0120.25 8.25v7.5a2.25 2.25 0 01-2.25 2.25H15m0-18h-5.25m5.25 0h3.75M15 3V4.5m0 15.75v-1.5" /></svg>,
        description: "View real-time BAC schedules and analytics on a dynamic display."
    },

    { isHeader: true, id: 'header-planning', label: 'Planning & Timelines' },
    {
        id: 'planning',
        label: 'Planning Cycle',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z" /></svg>,
        description: "Understand the annual procurement planning cycle and modernization roadmap."
    },
    {
        id: 'ppmp-consolidator',
        label: 'PPMP Consolidator',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25v8.25A2.25 2.25 0 0118 20.25h-7.5A2.25 2.25 0 018.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 00-2.25 2.25v6" /></svg>,
        description: "Consolidate, analyze, edit, and export all department PPMPs in one place.",
        adminOnly: true,
    },
    {
        id: 'ppmp-generator',
        label: 'PPMP Generator',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        description: "Use AI to generate a draft Project Procurement Management Plan from a description."
    },
    {
        id: 'timeline-calc',
        label: 'Timeline Calculator',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        description: "Calculate procurement timelines for goods and infrastructure projects."
    },
    

    { isHeader: true, id: 'header-guides', label: 'Guides & Checklists' },
    {
        id: 'flow',
        label: 'Process Flow',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>,
        description: "Explore the end-to-end procurement lifecycle with an interactive guide."
    },
    {
        id: 'checklist',
        label: 'Checklists',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        description: "Access document checklists for various procurement modes."
    },
    {
        id: 'agreements',
        label: 'Special Agreements',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
        description: "View guidelines for Pakyaw and Framework agreements."
    },
    {
        id: 'downloadable-forms',
        label: 'Downloadable Forms',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>,
        description: "Access official GPPB forms and bidding document templates."
    },
    {
        id: 'directory',
        label: 'Directory',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5v21m-8.25-6.75h16.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v.01M3.75 6v.01M3.75 9v.01M3.75 12v.01M3.75 15v.01M3.75 18v.01M7.5 3v.01M7.5 6v.01M7.5 9v.01M7.5 12v.01M7.5 15v.01M7.5 18v.01M11.25 3v.01M11.25 6v.01M11.25 9v.01M11.25 12v.01M11.25 15v.01M11.25 18v.01M15 3v.01M15 6v.01M15 9v.01M15 12v.01M15 15v.01M15 18v.01M18.75 3v.01M18.75 6v.01M18.75 9v.01M18.75 12v.01M18.75 15v.01M18.75 18v.01M22.5 3v.01M22.5 6v.01M22.5 9v.01M22.5 12v.01M22.5 15v.01M22.5 18v.01" /></svg>,
        description: "Find contact information for Bacolod City government offices."
    },
    {
        id: 'catalog-tutorial',
        label: 'Catalog Tutorial',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        description: "Learn how to use the Procurement Catalog and request new items."
    },

    { isHeader: true, id: 'header-ai-automation', label: 'AI & Automation' },
    {
        id: 'supplier-performance',
        label: 'Supplier Performance',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
        description: "Track and rate supplier performance on timeliness, quality, and compliance.",
        adminOnly: true,
    },
    {
        id: 'comparator',
        label: 'Compliance Check',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" /></svg>,
        description: "Compare a Purchase Request against a PPMP to ensure compliance."
    },
    {
        id: 'item-catalog-assistant',
        label: 'Item Catalog Assistant',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0h9.75m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>,
        description: "Scan a document, compare items to the catalog, clean duplicates, and generate an exportable variance report."
    },
    {
        id: 'auditor',
        label: 'Document Checker',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        description: "Check documents for typos, grammatical errors, and numerical accuracy."
    },
    {
        id: 'contract-auditor',
        label: 'Contract Auditor',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.5h1.832c.414 0 .79-.143 1.087-.393l.001-.001c.338-.266.616-.589.828-.944l.468-1.036c.14-.309.14-.657 0-.966l-.468-1.036a1.875 1.875 0 00-.828-.944l.001-.001c-.297-.25-.673-.393-1.087-.393h-1.832c-.414 0-.79.143-1.087.393l-.001.001c-.338.266-.616.589-.828.944l-.468 1.036c-.14.309-.14.657 0 .966l.468 1.036c.212.355.49.678.828.944l-.001.001c.297.25.673-.393 1.087.393z" /></svg>,
        description: "Scan draft contracts for risky clauses, ambiguities, and compliance with R.A. 12009."
    },
    {
        id: 'specification-generator',
        label: 'Specification Generator',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" /></svg>,
        description: "Generate consistent, structured prompts for AI to create detailed item specifications."
    },
    {
        id: 'resolution-generator',
        label: 'Document Generator',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>,
        description: "Auto-populate and generate various official procurement documents."
    },
     {
        id: 'rfq-generator',
        label: 'RFQ Generator',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
        description: "Extract data from RFQ documents to create social media announcements."
    },
    {
        id: 'post-generator',
        label: 'Post Generator',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg>,
        description: "Generate social media posts for Notice of Awards from Purchase Orders."
    },
    {
        id: 'trivia-generator',
        label: 'Trivia Generator',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a7.5 7.5 0 00-7.5 0c.883.342 1.83.574 2.82.723a9.037 9.037 0 014.16 0c.99-.149 1.937-.381 2.82-.723M16.5 9.75A4.5 4.5 0 0012 5.25a4.5 4.5 0 00-4.5 4.5M12 18h.008v.008H12V18z" /></svg>,
        description: "Create engaging social media trivia about procurement laws and processes."
    },
    {
        id: 'web-scraper',
        label: 'Web Scraper',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 7.5v6l5.25-3-5.25-3z" /></svg>,
        description: "Summarize web articles or videos into social media posts."
    },
    {
        id: 'ppmp-exporter',
        label: 'PPMP Exporter',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>,
        description: "Extract data from a PPMP document and export it to an editable CSV file."
    },
    {
        id: 'pdf-to-image',
        label: 'PDF to Image Converter',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m0-3l-3-3m0 0l-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" /></svg>,
        description: "Convert pages of a PDF document into downloadable PNG images."
    },
    {
        id: 'qr-maker',
        label: 'QR Maker',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
        description: "Generate and print multiple QR codes on a single page."
    },
     {
        id: 'email-composer',
        label: 'Email Composer',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
        description: "Compose and send emails directly from the application."
    },
    { isHeader: true, id: 'header-admin', label: 'Admin', adminOnly: true },
    {
        id: 'user-management',
        label: 'User Management',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.284-2.72c-2.502 0-4.533 2.03-4.533 4.533s2.031 4.533 4.533 4.533c2.502 0 4.533-2.03 4.533-4.533S14.502 18 12 18zm-7.284-2.72a3 3 0 00-4.682 2.72 9.094 9.094 0 003.741.479m-4.259 2.72C3.142 16.66 2 14.89 2 13c0-5.523 4.477-10 10-10s10 4.477 10 10c0 1.89-1.142 3.66-2.904 4.479" /></svg>,
        adminOnly: true,
        description: "Manage user accounts, roles, and permissions."
    },
];

export const LOGIC_TREE: LogicTree = {
    start: {
        text: 'What is the Approved Budget for the Contract (ABC)?',
        type: 'input',
        thresholds: [
            { limit: 200000, next: 'svp_direct' },
            { limit: 2000000, next: 'svp' },
        ],
        defaultNext: 'competitive_bidding_check',
    },
    svp_direct: {
        text: 'Are the items readily available "off-the-shelf" goods or services?',
        type: 'boolean',
        yes: 'direct_acquisition',
        no: 'svp',
    },
    svp: {
        result: 'Small Value Procurement',
        description: 'For procurement of goods, infrastructure projects, and consulting services, where the amount involved does not exceed PhP 2,000,000.00 for a First Class City like Bacolod.',
        reference: 'R.A. 12009, Section 34',
    },
    direct_acquisition: {
        result: 'Direct Acquisition',
        description: 'For procurement of goods and services that are sold by an exclusive dealer or manufacturer, which has no suitable substitute.',
        reference: 'R.A. 12009, Section 32',
    },
    competitive_bidding_check: {
        text: 'What type of procurement is this?',
        type: 'options',
        options: {
            'Goods & Services': 'competitive_bidding_goods',
            'Infrastructure': 'competitive_bidding_infra',
        }
    },
    competitive_bidding_goods: {
        result: 'Competitive Bidding (Goods & Services)',
        description: 'The default mode of procurement. This process is open to all interested and eligible bidders.',
        reference: 'R.A. 12009, Section 27',
    },
    competitive_bidding_infra: {
        result: 'Competitive Bidding (Infrastructure)',
        description: 'The default mode of procurement for infrastructure projects. This process is open to all interested and eligible bidders.',
        reference: 'R.A. 12009, Section 27',
    },
};

export const DOCUMENT_CHECKLISTS: DocumentChecklists = {
    alternative_modes: {
        'Required Documents': [
            'Approved Purchase Request (PR)',
            'Request for Quotation (RFQ)',
            'Abstract of Quotations',
            'Notice of Award (NOA)',
            'Purchase Order (PO)',
            'Notice to Proceed (NTP)',
        ],
    },
    public_bidding_goods: {
        'Pre-Procurement': [
            'Approved Purchase Request (PR)',
            'Project Procurement Management Plan (PPMP)',
            'Annual Procurement Plan (APP) reference',
        ],
        'Bidding Documents': [
            'Invitation to Bid (IB)',
            'Instruction to Bidders (ITB)',
            'Bid Data Sheet (BDS)',
            'General Conditions of Contract (GCC)',
            'Special Conditions of Contract (SCC)',
            'Schedule of Requirements',
            'Technical Specifications',
            'Bidding Forms',
        ],
        'Post-Qualification': [
            'Abstract of Bids as Read',
            'Post-Qualification Report',
            'BAC Resolution Recommending Award',
            'Notice of Award (NOA)',
            'Performance Security',
            'Contract Agreement',
            'Purchase Order (PO)',
            'Notice to Proceed (NTP)',
        ]
    },
    public_bidding_infra: {
         'Pre-Procurement': [
            'Program of Works and Detailed Engineering Design',
            'Approved Budget for the Contract (ABC)',
            'Project Procurement Management Plan (PPMP)',
            'Annual Procurement Plan (APP) reference',
        ],
        'Bidding Documents': [
            'Invitation to Bid (IB)',
            'Eligibility Requirements',
            'Instruction to Bidders (ITB)',
            'Bid Data Sheet (BDS)',
            'General and Special Conditions of Contract',
            'Specifications and Drawings',
            'Bill of Quantities',
            'Bidding Forms',
        ],
        'Post-Qualification': [
            'Abstract of Bids as Read',
            'Post-Qualification Report',
            'BAC Resolution Recommending Award',
            'Notice of Award (NOA)',
            'Performance Security',
            'Contract Agreement',
            'Notice to Proceed (NTP)',
        ]
    },
    framework_agreement: {
        'Checklist': [
             'Approved Purchase Request (PR) for the initial procurement to establish the Framework Agreement',
             'Project Procurement Management Plan (PPMP) indicating the use of Framework Agreement',
             'Bidding Documents for the Competitive Bidding to select the supplier(s)',
             'BAC Resolution Recommending the Award for the Framework Agreement',
             'Signed Framework Agreement Document',
             'Call-Off Order Form/Template',
             'Notice to Proceed for the Framework Agreement'
        ]
    }
};

export const TIMELINE_CONFIG: TimelineConfig = {
    goods: {
        stages: [
            { id: 'advertisement', name: 'Advertisement/Posting of IB', duration: 7, condition: false },
            { id: 'prebid', name: 'Pre-Bid Conference', duration: 1, condition: true },
            { id: 'submission', name: 'Submission and Opening of Bids', duration: 12, condition: false },
            { id: 'evaluation', name: 'Bid Evaluation', duration: 7, condition: false },
            { id: 'postqual', name: 'Post-Qualification', duration: 12, condition: false },
            { id: 'approval', name: 'Contract Approval by Higher Authority', duration: 20, condition: true },
            { id: 'award', name: 'Issuance of Notice of Award', duration: 7, condition: false },
        ]
    },
    infra: {
        stages: [
            { id: 'advertisement', name: 'Advertisement/Posting of IB', duration: 7, condition: false },
            { id: 'eligibility', name: 'Eligibility Check', duration: 1, condition: false },
            { id: 'prebid', name: 'Pre-Bid Conference', duration: 1, condition: true },
            { id: 'submission', name: 'Submission and Opening of Bids', duration: 14, condition: false },
            { id: 'evaluation', name: 'Detailed Bid Evaluation', duration: 7, condition: false },
            { id: 'postqual', name: 'Post-Qualification', duration: 7, condition: false },
            { id: 'approval', name: 'Contract Approval by Higher Authority', duration: 20, condition: true },
            { id: 'award', name: 'Issuance of Notice of Award', duration: 15, condition: false },
        ]
    }
};