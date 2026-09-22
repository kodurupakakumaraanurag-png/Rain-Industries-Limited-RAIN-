import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Papa from 'papaparse';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const industry = searchParams.get('industry');

    const where: any = {};
    if (status && status !== 'ALL') where.pipelineStatus = status;
    if (priority && priority !== 'ALL') where.priorityLevel = priority;
    if (industry && industry !== 'ALL') where.industryDomain = industry;

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: { select: { name: true, email: true } },
      },
    });

    const csvData = leads.map((lead, index) => ({
      'S.No': index + 1,
      'Company Name': lead.companyName,
      'Industry Domain': lead.industryDomain,
      'Location / City': lead.locationCity,
      'Website URL': lead.websiteUrl || '',
      'Contact POC Name': lead.contactPocName,
      'Designation / Role': lead.designationRole,
      'Phone Number': lead.phoneNumber || '',
      'Email Address': lead.emailAddress || '',
      'Business Overview': lead.businessOverview || '',
      'Problem / Friction': lead.problemFriction || '',
      'Project Requirement': lead.projectRequirement || '',
      'Placement Opportunity': lead.placementOpportunity || '',
      'Priority Level': lead.priorityLevel,
      'Pipeline Status': lead.pipelineStatus,
      'Next Action': lead.nextAction || '',
      'Date Added': lead.dateAdded,
      'Lead Source': lead.leadSource,
      'Contact Method': lead.contactMethod,
      'Digital Presence Score (0-5)': lead.digitalPresenceScore,
      'Hiring Activity Score (0-5)': lead.hiringActivityScore,
      'Tech Stack Fit Score (0-5)': lead.techStackFitScore,
      'Funding / Revenue Score (0-5)': lead.fundingRevenueScore,
      'Project Urgency Score (0-5)': lead.projectUrgencyScore,
      'Budget Clarity Score (0-5)': lead.budgetClarityScore,
      'Total Lead Score (0-30)': lead.totalLeadScore,
      'Source Dossier Score': lead.sourceScore || '',
      'Project Allocation Status': lead.projectAllocationStatus,
      'Assigned Rep': lead.assignedTo?.name || 'Unassigned',
      'Converted to Opportunity': lead.converted ? 'YES' : 'NO',
      'Created At': lead.createdAt.toISOString(),
    }));

    const csv = Papa.unparse(csvData);

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="rain_leads_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting leads CSV:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
