import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { parseLeadsCsv } from '@/lib/csv-parser';
import { calculateTotalLeadScore } from '@/lib/lead-scoring';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const contentType = request.headers.get('content-type') || '';

    let csvContent = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No CSV file uploaded' }, { status: 400 });
      }
      csvContent = await file.text();
    } else {
      const body = await request.json();
      csvContent = body.csvContent;
      if (!csvContent) {
        return NextResponse.json({ error: 'csvContent string is required' }, { status: 400 });
      }
    }

    const { validRows, invalidRows, totalRows } = parseLeadsCsv(csvContent);

    if (validRows.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid lead rows found in CSV',
          invalidRows,
          totalRows,
        },
        { status: 400 }
      );
    }

    const createdLeads = [];

    for (const row of validRows) {
      const totalLeadScore = calculateTotalLeadScore({
        digitalPresenceScore: row.digitalPresenceScore,
        hiringActivityScore: row.hiringActivityScore,
        techStackFitScore: row.techStackFitScore,
        fundingRevenueScore: row.fundingRevenueScore,
        projectUrgencyScore: row.projectUrgencyScore,
        budgetClarityScore: row.budgetClarityScore,
      });

      // Find or create company
      let company = await prisma.company.findUnique({
        where: { name: row.companyName },
      });

      if (!company) {
        company = await prisma.company.create({
          data: {
            name: row.companyName,
            industry: row.industryDomain,
            location: row.locationCity,
            website: row.websiteUrl,
            phone: row.phoneNumber,
            email: row.emailAddress,
            description: row.businessOverview,
            status: 'PROSPECT',
          },
        });
      }

      const newLead = await prisma.lead.create({
        data: {
          companyName: row.companyName,
          industryDomain: row.industryDomain,
          locationCity: row.locationCity,
          websiteUrl: row.websiteUrl,
          contactPocName: row.contactPocName,
          designationRole: row.designationRole,
          phoneNumber: row.phoneNumber,
          emailAddress: row.emailAddress,
          businessOverview: row.businessOverview,
          problemFriction: row.problemFriction,
          projectRequirement: row.projectRequirement,
          placementOpportunity: row.placementOpportunity,
          priorityLevel: row.priorityLevel,
          pipelineStatus: row.pipelineStatus,
          nextAction: row.nextAction,
          dateAdded: row.dateAdded,
          leadSource: row.leadSource,
          contactMethod: row.contactMethod,
          digitalPresenceScore: row.digitalPresenceScore,
          hiringActivityScore: row.hiringActivityScore,
          techStackFitScore: row.techStackFitScore,
          fundingRevenueScore: row.fundingRevenueScore,
          projectUrgencyScore: row.projectUrgencyScore,
          budgetClarityScore: row.budgetClarityScore,
          totalLeadScore,
          projectAllocationStatus: row.projectAllocationStatus,
          companyId: company.id,
          assignedToId: session?.id || null,
        },
      });

      createdLeads.push(newLead);
    }

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'LEADS_CSV_IMPORTED',
      entity: 'Lead',
      entityId: 'bulk',
      metadata: {
        importedCount: createdLeads.length,
        invalidCount: invalidRows.length,
        totalRows,
      },
    });

    return NextResponse.json({
      success: true,
      importedCount: createdLeads.length,
      invalidCount: invalidRows.length,
      invalidRows,
      totalRows,
      message: `Successfully imported ${createdLeads.length} leads.`,
    });
  } catch (error: any) {
    console.error('Error importing leads CSV:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
