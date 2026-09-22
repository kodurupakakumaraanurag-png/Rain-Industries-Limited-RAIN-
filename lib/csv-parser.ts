import Papa from 'papaparse';
import { z } from 'zod';

export const LeadCsvSchema = z.object({
  companyName: z.string().min(1, 'Company Name is required'),
  industryDomain: z.string().default('Manufacturing'),
  locationCity: z.string().default('Not specified'),
  websiteUrl: z.string().optional().nullable(),
  contactPocName: z.string().default('Not specified'),
  designationRole: z.string().default('Decision Maker'),
  phoneNumber: z.string().optional().nullable(),
  emailAddress: z.string().optional().nullable(),
  businessOverview: z.string().optional().nullable(),
  problemFriction: z.string().optional().nullable(),
  projectRequirement: z.string().optional().nullable(),
  placementOpportunity: z.string().optional().nullable(),
  priorityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  pipelineStatus: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']).default('NEW'),
  nextAction: z.string().optional().nullable(),
  dateAdded: z.string().default(() => new Date().toISOString().split('T')[0]),
  leadSource: z.string().default('Google Sheet Import'),
  contactMethod: z.string().default('Email'),
  digitalPresenceScore: z.coerce.number().min(0).max(5).default(0),
  hiringActivityScore: z.coerce.number().min(0).max(5).default(0),
  techStackFitScore: z.coerce.number().min(0).max(5).default(0),
  fundingRevenueScore: z.coerce.number().min(0).max(5).default(0),
  projectUrgencyScore: z.coerce.number().min(0).max(5).default(0),
  budgetClarityScore: z.coerce.number().min(0).max(5).default(0),
  projectAllocationStatus: z.string().default('Available for Selection'),
});

export type LeadCsvInput = z.infer<typeof LeadCsvSchema>;

export interface CsvParseResult {
  validRows: LeadCsvInput[];
  invalidRows: { rowNumber: number; data: any; errors: string[] }[];
  totalRows: number;
}

export function parseLeadsCsv(csvContent: string): CsvParseResult {
  const parseResult = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const validRows: LeadCsvInput[] = [];
  const invalidRows: { rowNumber: number; data: any; errors: string[] }[] = [];

  parseResult.data.forEach((row: any, index: number) => {
    // Map CSV header variants to dossier keys if needed
    const mappedRow = {
      companyName: row['Company Name'] || row['companyName'] || row['Company'],
      industryDomain: row['Industry Domain'] || row['industryDomain'] || row['Industry'] || 'Manufacturing',
      locationCity: row['Location / City'] || row['locationCity'] || row['Location'] || row['City'] || 'Not specified',
      websiteUrl: row['Website URL'] || row['websiteUrl'] || row['Website'] || '',
      contactPocName: row['Contact POC Name'] || row['contactPocName'] || row['Contact Name'] || row['Contact'] || 'Not specified',
      designationRole: row['Designation / Role'] || row['designationRole'] || row['Designation'] || row['Role'] || 'Decision Maker',
      phoneNumber: row['Phone Number'] || row['phoneNumber'] || row['Phone'] || '',
      emailAddress: row['Email Address'] || row['emailAddress'] || row['Email'] || '',
      businessOverview: row['Business Overview'] || row['businessOverview'] || row['Overview'] || '',
      problemFriction: row['Problem / Friction'] || row['problemFriction'] || row['Problem'] || '',
      projectRequirement: row['Project Requirement'] || row['projectRequirement'] || row['Requirement'] || '',
      placementOpportunity: row['Placement Opportunity'] || row['placementOpportunity'] || row['Opportunity'] || '',
      priorityLevel: (row['Priority Level'] || row['priorityLevel'] || row['Priority'] || 'MEDIUM').toUpperCase(),
      pipelineStatus: (row['Pipeline Status'] || row['pipelineStatus'] || row['Status'] || 'NEW').toUpperCase(),
      nextAction: row['Next Action'] || row['nextAction'] || '',
      dateAdded: row['Date Added'] || row['dateAdded'] || new Date().toISOString().split('T')[0],
      leadSource: row['Lead Source'] || row['leadSource'] || 'Google Sheet Import',
      contactMethod: row['Contact Method'] || row['contactMethod'] || 'Email',
      digitalPresenceScore: row['Digital Presence Score'] || row['digitalPresenceScore'] || 0,
      hiringActivityScore: row['Hiring Activity Score'] || row['hiringActivityScore'] || 0,
      techStackFitScore: row['Tech Stack Fit Score'] || row['techStackFitScore'] || 0,
      fundingRevenueScore: row['Funding / Revenue Score'] || row['fundingRevenueScore'] || 0,
      projectUrgencyScore: row['Project Urgency Score'] || row['projectUrgencyScore'] || 0,
      budgetClarityScore: row['Budget Clarity Score'] || row['budgetClarityScore'] || 0,
      projectAllocationStatus: row['Project Allocation Status'] || row['projectAllocationStatus'] || 'Available for Selection',
    };

    const validated = LeadCsvSchema.safeParse(mappedRow);
    if (validated.success) {
      validRows.push(validated.data);
    } else {
      const errors = validated.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      invalidRows.push({
        rowNumber: index + 1,
        data: row,
        errors,
      });
    }
  });

  return {
    validRows,
    invalidRows,
    totalRows: parseResult.data.length,
  };
}
