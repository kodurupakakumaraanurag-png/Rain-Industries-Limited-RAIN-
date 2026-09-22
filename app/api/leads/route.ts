import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { calculateTotalLeadScore } from '@/lib/lead-scoring';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const industry = searchParams.get('industry') || '';
    const assignedTo = searchParams.get('assignedTo') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { contactPocName: { contains: search } },
        { industryDomain: { contains: search } },
        { locationCity: { contains: search } },
        { designationRole: { contains: search } },
        { emailAddress: { contains: search } },
      ];
    }

    if (status && status !== 'ALL') {
      where.pipelineStatus = status;
    }

    if (priority && priority !== 'ALL') {
      where.priorityLevel = priority;
    }

    if (industry && industry !== 'ALL') {
      where.industryDomain = industry;
    }

    if (assignedTo && assignedTo !== 'ALL') {
      where.assignedToId = assignedTo;
    }

    const [total, leads, users, industries] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          assignedTo: { select: { id: true, name: true, email: true, role: true } },
          company: { select: { id: true, name: true, industry: true } },
          contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          _count: {
            select: { activities: true, tasks: true, opportunities: true },
          },
        },
      }),
      prisma.user.findMany({
        select: { id: true, name: true, role: true },
        where: { active: true },
      }),
      prisma.lead.groupBy({
        by: ['industryDomain'],
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        users,
        industries: industries.map((i) => i.industryDomain),
      },
    });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();

    const {
      companyName,
      industryDomain = 'Manufacturing',
      locationCity = 'Not specified',
      websiteUrl,
      contactPocName = 'Not specified',
      designationRole = 'Decision Maker',
      phoneNumber,
      emailAddress,
      businessOverview,
      problemFriction,
      projectRequirement,
      placementOpportunity,
      priorityLevel = 'MEDIUM',
      pipelineStatus = 'NEW',
      nextAction,
      dateAdded = new Date().toISOString().split('T')[0],
      leadSource = 'Direct Entry',
      contactMethod = 'Email',
      digitalPresenceScore = 0,
      hiringActivityScore = 0,
      techStackFitScore = 0,
      fundingRevenueScore = 0,
      projectUrgencyScore = 0,
      budgetClarityScore = 0,
      projectAllocationStatus = 'Available for Selection',
      assignedToId,
    } = body;

    if (!companyName) {
      return NextResponse.json({ error: 'Company Name is required' }, { status: 400 });
    }

    const totalLeadScore = calculateTotalLeadScore({
      digitalPresenceScore: Number(digitalPresenceScore) || 0,
      hiringActivityScore: Number(hiringActivityScore) || 0,
      techStackFitScore: Number(techStackFitScore) || 0,
      fundingRevenueScore: Number(fundingRevenueScore) || 0,
      projectUrgencyScore: Number(projectUrgencyScore) || 0,
      budgetClarityScore: Number(budgetClarityScore) || 0,
    });

    // Check if company exists or create
    let company = await prisma.company.findUnique({
      where: { name: companyName },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: companyName,
          industry: industryDomain,
          location: locationCity,
          website: websiteUrl,
          phone: phoneNumber,
          email: emailAddress,
          description: businessOverview,
          status: 'PROSPECT',
        },
      });
    }

    const newLead = await prisma.lead.create({
      data: {
        companyName,
        industryDomain,
        locationCity,
        websiteUrl,
        contactPocName,
        designationRole,
        phoneNumber,
        emailAddress,
        businessOverview,
        problemFriction,
        projectRequirement,
        placementOpportunity,
        priorityLevel,
        pipelineStatus,
        nextAction,
        dateAdded,
        leadSource,
        contactMethod,
        digitalPresenceScore: Number(digitalPresenceScore) || 0,
        hiringActivityScore: Number(hiringActivityScore) || 0,
        techStackFitScore: Number(techStackFitScore) || 0,
        fundingRevenueScore: Number(fundingRevenueScore) || 0,
        projectUrgencyScore: Number(projectUrgencyScore) || 0,
        budgetClarityScore: Number(budgetClarityScore) || 0,
        totalLeadScore,
        projectAllocationStatus,
        companyId: company.id,
        assignedToId: assignedToId || session?.id || null,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        company: true,
      },
    });

    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'LEAD_CREATED',
      entity: 'Lead',
      entityId: newLead.id,
      metadata: { companyName, totalLeadScore, priorityLevel },
    });

    return NextResponse.json({ success: true, lead: newLead }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
