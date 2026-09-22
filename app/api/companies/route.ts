import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const industry = searchParams.get('industry') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { location: { contains: search } },
        { industry: { contains: search } },
      ];
    }
    if (industry && industry !== 'ALL') where.industry = industry;
    if (status && status !== 'ALL') where.status = status;

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
          contacts: { select: { id: true, firstName: true, lastName: true, email: true, jobTitle: true } },
          leads: { select: { id: true, companyName: true, totalLeadScore: true, pipelineStatus: true } },
          opportunities: { select: { id: true, title: true, amount: true, stage: true } },
          _count: {
            select: { contacts: true, leads: true, opportunities: true, activities: true },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return NextResponse.json({ companies, total });
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();

    const { name, industry, website, location, phone, email, description, employeeCount, annualRevenue, status = 'ACTIVE' } = body;

    if (!name || !industry) {
      return NextResponse.json({ error: 'Company name and industry are required' }, { status: 400 });
    }

    const company = await prisma.company.create({
      data: {
        name,
        industry,
        website,
        location,
        phone,
        email,
        description,
        employeeCount: employeeCount ? Number(employeeCount) : null,
        annualRevenue: annualRevenue ? Number(annualRevenue) : null,
        status,
      },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'COMPANY_CREATED',
      entity: 'Company',
      entityId: company.id,
      metadata: { name: company.name, industry: company.industry },
    });

    return NextResponse.json({ success: true, company }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating company:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
