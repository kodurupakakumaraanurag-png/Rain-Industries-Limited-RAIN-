import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        contact: true,
        lead: true,
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        activities: {
          orderBy: { date: 'desc' },
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json({ opportunity });
  } catch (error: any) {
    console.error('Error fetching opportunity detail:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    const body = await request.json();

    const existing = await prisma.opportunity.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const stage = body.stage ?? existing.stage;
    const status = stage === 'WON' ? 'WON' : stage === 'LOST' ? 'LOST' : 'OPEN';

    const opportunity = await prisma.opportunity.update({
      where: { id: params.id },
      data: {
        title: body.title ?? existing.title,
        companyId: body.companyId ?? existing.companyId,
        contactId: body.contactId !== undefined ? body.contactId : existing.contactId,
        amount: body.amount !== undefined ? Number(body.amount) : existing.amount,
        probability: body.probability !== undefined ? Number(body.probability) : existing.probability,
        stage,
        status,
        expectedCloseDate: body.expectedCloseDate !== undefined ? body.expectedCloseDate : existing.expectedCloseDate,
        ownerId: body.ownerId !== undefined ? body.ownerId : existing.ownerId,
        description: body.description !== undefined ? body.description : existing.description,
      },
      include: {
        company: true,
        owner: { select: { id: true, name: true } },
      },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: stage !== existing.stage ? 'OPPORTUNITY_STAGE_CHANGED' : 'OPPORTUNITY_UPDATED',
      entity: 'Opportunity',
      entityId: params.id,
      metadata: {
        title: opportunity.title,
        previousStage: existing.stage,
        newStage: stage,
        amount: opportunity.amount,
      },
    });

    return NextResponse.json({ success: true, opportunity });
  } catch (error: any) {
    console.error('Error updating opportunity:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();

    const opportunity = await prisma.opportunity.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'OPPORTUNITY_DELETED',
      entity: 'Opportunity',
      entityId: params.id,
      metadata: { title: opportunity.title },
    });

    return NextResponse.json({ success: true, message: 'Opportunity deleted' });
  } catch (error: any) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
