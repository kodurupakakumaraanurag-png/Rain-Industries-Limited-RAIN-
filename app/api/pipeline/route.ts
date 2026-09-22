import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'] as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');

    const where: any = {};
    if (ownerId && ownerId !== 'ALL') {
      where.ownerId = ownerId;
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        company: { select: { id: true, name: true, industry: true, location: true } },
        contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        owner: { select: { id: true, name: true, email: true } },
        lead: { select: { id: true, companyName: true, totalLeadScore: true, priorityLevel: true } },
      },
    });

    // Group into columns
    const columns: Record<string, { stage: string; items: typeof opportunities; totalValue: number; count: number }> = {};

    STAGES.forEach((stage) => {
      const items = opportunities.filter((o) => o.stage === stage);
      const totalValue = items.reduce((sum, o) => sum + (o.amount || 0), 0);
      columns[stage] = {
        stage,
        items,
        totalValue,
        count: items.length,
      };
    });

    const totalPipelineValue = opportunities
      .filter((o) => o.stage !== 'LOST')
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    return NextResponse.json({
      columns,
      totalOpportunities: opportunities.length,
      totalPipelineValue,
    });
  } catch (error: any) {
    console.error('Error fetching pipeline data:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    const { opportunityId, newStage } = await request.json();

    if (!opportunityId || !newStage) {
      return NextResponse.json({ error: 'opportunityId and newStage are required' }, { status: 400 });
    }

    const existing = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const status = newStage === 'WON' ? 'WON' : newStage === 'LOST' ? 'LOST' : 'OPEN';

    const updated = await prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        stage: newStage,
        status,
      },
      include: {
        company: true,
        owner: { select: { name: true } },
      },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'PIPELINE_STAGE_CHANGED',
      entity: 'Opportunity',
      entityId: opportunityId,
      metadata: {
        title: updated.title,
        fromStage: existing.stage,
        toStage: newStage,
        amount: updated.amount,
      },
    });

    return NextResponse.json({ success: true, opportunity: updated });
  } catch (error: any) {
    console.error('Error moving opportunity stage:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
