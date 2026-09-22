import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedToId = searchParams.get('assignedToId');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (priority && priority !== 'ALL') where.priority = priority;
    if (assignedToId && assignedToId !== 'ALL') where.assignedToId = assignedToId;

    const [tasks, leads, companies, users] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          lead: { select: { id: true, companyName: true } },
          company: { select: { id: true, name: true } },
        },
      }),
      prisma.lead.findMany({ select: { id: true, companyName: true }, orderBy: { companyName: 'asc' } }),
      prisma.company.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
      prisma.user.findMany({ select: { id: true, name: true }, where: { active: true } }),
    ]);

    return NextResponse.json({ tasks, leads, companies, users });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();

    const {
      title,
      description,
      assignedToId,
      leadId,
      companyId,
      dueDate = new Date().toISOString().split('T')[0],
      priority = 'MEDIUM',
      status = 'TODO',
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        assignedToId: assignedToId || session?.id || null,
        leadId: leadId || null,
        companyId: companyId || null,
        dueDate,
        priority,
        status,
      },
      include: {
        assignedTo: { select: { name: true } },
      },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'TASK_CREATED',
      entity: 'Task',
      entityId: task.id,
      metadata: { title, priority, dueDate },
    });

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
