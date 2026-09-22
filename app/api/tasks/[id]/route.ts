import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    const body = await request.json();

    const existing = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        title: body.title ?? existing.title,
        description: body.description !== undefined ? body.description : existing.description,
        assignedToId: body.assignedToId !== undefined ? body.assignedToId : existing.assignedToId,
        dueDate: body.dueDate ?? existing.dueDate,
        priority: body.priority ?? existing.priority,
        status: body.status ?? existing.status,
      },
      include: {
        assignedTo: { select: { name: true } },
      },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: body.status && body.status !== existing.status ? 'TASK_STATUS_CHANGED' : 'TASK_UPDATED',
      entity: 'Task',
      entityId: params.id,
      metadata: { title: task.title, previousStatus: existing.status, newStatus: task.status },
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();

    await prisma.task.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'TASK_DELETED',
      entity: 'Task',
      entityId: params.id,
    });

    return NextResponse.json({ success: true, message: 'Task deleted' });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
