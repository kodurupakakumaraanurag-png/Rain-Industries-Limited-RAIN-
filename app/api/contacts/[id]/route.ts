import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        leads: true,
        opportunities: true,
        activities: {
          orderBy: { date: 'desc' },
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ contact });
  } catch (error: any) {
    console.error('Error fetching contact detail:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    const body = await request.json();

    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        jobTitle: body.jobTitle,
        companyId: body.companyId || null,
        email: body.email,
        phone: body.phone,
        linkedinUrl: body.linkedinUrl,
        department: body.department,
        notes: body.notes,
        status: body.status,
      },
      include: {
        company: true,
      },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'CONTACT_UPDATED',
      entity: 'Contact',
      entityId: params.id,
      metadata: { name: `${contact.firstName} ${contact.lastName}`, email: contact.email },
    });

    return NextResponse.json({ success: true, contact });
  } catch (error: any) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();

    const contact = await prisma.contact.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'CONTACT_DELETED',
      entity: 'Contact',
      entityId: params.id,
      metadata: { name: `${contact.firstName} ${contact.lastName}` },
    });

    return NextResponse.json({ success: true, message: 'Contact deleted' });
  } catch (error: any) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
