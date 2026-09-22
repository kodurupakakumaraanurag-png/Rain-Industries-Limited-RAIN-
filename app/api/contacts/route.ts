import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const companyId = searchParams.get('companyId') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { jobTitle: { contains: search } },
        { department: { contains: search } },
      ];
    }
    if (companyId) where.companyId = companyId;

    const [contacts, companies] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { firstName: 'asc' },
        include: {
          company: { select: { id: true, name: true, industry: true } },
          _count: {
            select: { leads: true, opportunities: true, activities: true },
          },
        },
      }),
      prisma.company.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({ contacts, companies });
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();

    const { firstName, lastName, jobTitle, companyId, email, phone, linkedinUrl, department, notes, status = 'ACTIVE' } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'First name, last name, and email are required' }, { status: 400 });
    }

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        jobTitle,
        companyId: companyId || null,
        email,
        phone,
        linkedinUrl,
        department,
        notes,
        status,
      },
      include: {
        company: true,
      },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'CONTACT_CREATED',
      entity: 'Contact',
      entityId: contact.id,
      metadata: { name: `${firstName} ${lastName}`, email },
    });

    return NextResponse.json({ success: true, contact }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
