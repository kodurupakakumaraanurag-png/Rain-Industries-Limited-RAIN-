import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const leadId = searchParams.get('leadId');
    const companyId = searchParams.get('companyId');
    const opportunityId = searchParams.get('opportunityId');

    const where: any = {};
    if (type && type !== 'ALL') where.type = type;
    if (leadId) where.leadId = leadId;
    if (companyId) where.companyId = companyId;
    if (opportunityId) where.opportunityId = opportunityId;

    const [activities, leads, companies, opportunities] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { date: 'desc' },
        include: {
          user: { select: { id: true, name: true, role: true, avatar: true } },
          lead: { select: { id: true, companyName: true } },
          company: { select: { id: true, name: true } },
          opportunity: { select: { id: true, title: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.lead.findMany({ select: { id: true, companyName: true }, orderBy: { companyName: 'asc' } }),
      prisma.company.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
      prisma.opportunity.findMany({ select: { id: true, title: true }, orderBy: { title: 'asc' } }),
    ]);

    return NextResponse.json({ activities, leads, companies, opportunities });
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();

    const { type, subject, description, companyId, contactId, leadId, opportunityId, date, status = 'COMPLETED' } = body;

    if (!type || !subject) {
      return NextResponse.json({ error: 'Type and Subject are required' }, { status: 400 });
    }

    const activity = await prisma.activity.create({
      data: {
        type,
        subject,
        description,
        companyId: companyId || null,
        contactId: contactId || null,
        leadId: leadId || null,
        opportunityId: opportunityId || null,
        userId: session?.id || null,
        date: date ? new Date(date) : new Date(),
        status,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'ACTIVITY_LOGGED',
      entity: 'Activity',
      entityId: activity.id,
      metadata: { type, subject },
    });

    return NextResponse.json({ success: true, activity }, { status: 201 });
  } catch (error: any) {
    console.error('Error logging activity:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
