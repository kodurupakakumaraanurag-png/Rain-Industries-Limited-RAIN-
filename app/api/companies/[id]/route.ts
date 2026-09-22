import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        contacts: true,
        leads: {
          include: {
            assignedTo: { select: { name: true } },
          },
        },
        opportunities: {
          include: {
            owner: { select: { name: true } },
          },
        },
        activities: {
          orderBy: { date: 'desc' },
          include: {
            user: { select: { name: true } },
          },
        },
        tasks: {
          orderBy: { dueDate: 'asc' },
          include: {
            assignedTo: { select: { name: true } },
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (error: any) {
    console.error('Error fetching company detail:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    const body = await request.json();

    const company = await prisma.company.update({
      where: { id: params.id },
      data: {
        name: body.name,
        industry: body.industry,
        website: body.website,
        location: body.location,
        phone: body.phone,
        email: body.email,
        description: body.description,
        employeeCount: body.employeeCount ? Number(body.employeeCount) : null,
        annualRevenue: body.annualRevenue ? Number(body.annualRevenue) : null,
        status: body.status,
      },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'COMPANY_UPDATED',
      entity: 'Company',
      entityId: params.id,
      metadata: { name: company.name },
    });

    return NextResponse.json({ success: true, company });
  } catch (error: any) {
    console.error('Error updating company:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();

    const company = await prisma.company.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'COMPANY_DELETED',
      entity: 'Company',
      entityId: params.id,
      metadata: { name: company.name },
    });

    return NextResponse.json({ success: true, message: 'Company deleted' });
  } catch (error: any) {
    console.error('Error deleting company:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
