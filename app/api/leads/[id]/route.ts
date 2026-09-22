import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { calculateTotalLeadScore } from '@/lib/lead-scoring';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, role: true, avatar: true } },
        company: true,
        contact: true,
        opportunities: {
          include: {
            owner: { select: { id: true, name: true } },
          },
        },
        activities: {
          orderBy: { date: 'desc' },
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
          include: {
            assignedTo: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error: any) {
    console.error('Error fetching lead detail:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    const body = await request.json();

    const existingLead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const digitalPresenceScore = body.digitalPresenceScore !== undefined ? Number(body.digitalPresenceScore) : existingLead.digitalPresenceScore;
    const hiringActivityScore = body.hiringActivityScore !== undefined ? Number(body.hiringActivityScore) : existingLead.hiringActivityScore;
    const techStackFitScore = body.techStackFitScore !== undefined ? Number(body.techStackFitScore) : existingLead.techStackFitScore;
    const fundingRevenueScore = body.fundingRevenueScore !== undefined ? Number(body.fundingRevenueScore) : existingLead.fundingRevenueScore;
    const projectUrgencyScore = body.projectUrgencyScore !== undefined ? Number(body.projectUrgencyScore) : existingLead.projectUrgencyScore;
    const budgetClarityScore = body.budgetClarityScore !== undefined ? Number(body.budgetClarityScore) : existingLead.budgetClarityScore;

    const totalLeadScore = calculateTotalLeadScore({
      digitalPresenceScore,
      hiringActivityScore,
      techStackFitScore,
      fundingRevenueScore,
      projectUrgencyScore,
      budgetClarityScore,
    });

    const updatedLead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        companyName: body.companyName ?? existingLead.companyName,
        industryDomain: body.industryDomain ?? existingLead.industryDomain,
        locationCity: body.locationCity ?? existingLead.locationCity,
        websiteUrl: body.websiteUrl !== undefined ? body.websiteUrl : existingLead.websiteUrl,
        contactPocName: body.contactPocName ?? existingLead.contactPocName,
        designationRole: body.designationRole ?? existingLead.designationRole,
        phoneNumber: body.phoneNumber !== undefined ? body.phoneNumber : existingLead.phoneNumber,
        emailAddress: body.emailAddress !== undefined ? body.emailAddress : existingLead.emailAddress,
        businessOverview: body.businessOverview !== undefined ? body.businessOverview : existingLead.businessOverview,
        problemFriction: body.problemFriction !== undefined ? body.problemFriction : existingLead.problemFriction,
        projectRequirement: body.projectRequirement !== undefined ? body.projectRequirement : existingLead.projectRequirement,
        placementOpportunity: body.placementOpportunity !== undefined ? body.placementOpportunity : existingLead.placementOpportunity,
        priorityLevel: body.priorityLevel ?? existingLead.priorityLevel,
        pipelineStatus: body.pipelineStatus ?? existingLead.pipelineStatus,
        nextAction: body.nextAction !== undefined ? body.nextAction : existingLead.nextAction,
        dateAdded: body.dateAdded ?? existingLead.dateAdded,
        leadSource: body.leadSource ?? existingLead.leadSource,
        contactMethod: body.contactMethod ?? existingLead.contactMethod,
        projectAllocationStatus: body.projectAllocationStatus ?? existingLead.projectAllocationStatus,
        assignedToId: body.assignedToId !== undefined ? body.assignedToId : existingLead.assignedToId,
        digitalPresenceScore,
        hiringActivityScore,
        techStackFitScore,
        fundingRevenueScore,
        projectUrgencyScore,
        budgetClarityScore,
        totalLeadScore,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        company: true,
      },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'LEAD_UPDATED',
      entity: 'Lead',
      entityId: params.id,
      metadata: {
        companyName: updatedLead.companyName,
        previousStatus: existingLead.pipelineStatus,
        newStatus: updatedLead.pipelineStatus,
        totalLeadScore,
      },
    });

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();

    const existingLead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    await prisma.lead.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'LEAD_DELETED',
      entity: 'Lead',
      entityId: params.id,
      metadata: { companyName: existingLead.companyName },
    });

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
