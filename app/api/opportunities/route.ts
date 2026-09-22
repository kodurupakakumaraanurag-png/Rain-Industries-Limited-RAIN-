import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const stage = searchParams.get('stage') || '';
    const ownerId = searchParams.get('ownerId') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { company: { name: { contains: search } } },
      ];
    }
    if (stage && stage !== 'ALL') where.stage = stage;
    if (ownerId && ownerId !== 'ALL') where.ownerId = ownerId;

    const [opportunities, companies, contacts, users] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { id: true, name: true, industry: true } },
          contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          owner: { select: { id: true, name: true, email: true } },
          lead: { select: { id: true, companyName: true, totalLeadScore: true } },
        },
      }),
      prisma.company.findMany({ select: { id: true, name: true } }),
      prisma.contact.findMany({ select: { id: true, firstName: true, lastName: true, companyId: true } }),
      prisma.user.findMany({ select: { id: true, name: true, role: true }, where: { active: true } }),
    ]);

    return NextResponse.json({ opportunities, companies, contacts, users });
  } catch (error: any) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();

    const {
      title,
      companyId,
      contactId,
      leadId,
      amount = 0,
      probability = 50,
      stage = 'NEW',
      expectedCloseDate,
      ownerId,
      description,
    } = body;

    if (!title || !companyId) {
      return NextResponse.json({ error: 'Title and Company are required' }, { status: 400 });
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        companyId,
        contactId: contactId || null,
        leadId: leadId || null,
        amount: Number(amount) || 0,
        probability: Number(probability) || 50,
        stage,
        expectedCloseDate,
        ownerId: ownerId || session?.id || null,
        description,
        status: stage === 'WON' ? 'WON' : stage === 'LOST' ? 'LOST' : 'OPEN',
      },
      include: {
        company: true,
        owner: { select: { id: true, name: true } },
      },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'OPPORTUNITY_CREATED',
      entity: 'Opportunity',
      entityId: opportunity.id,
      metadata: { title: opportunity.title, amount: opportunity.amount, stage: opportunity.stage },
    });

    return NextResponse.json({ success: true, opportunity }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
