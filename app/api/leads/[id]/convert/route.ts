import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    const body = await request.json().catch(() => ({}));

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        contact: true,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (lead.converted) {
      return NextResponse.json({ error: 'Lead is already converted' }, { status: 400 });
    }

    // 1. Find or create company
    let companyId = lead.companyId;
    if (!companyId) {
      let company = await prisma.company.findUnique({
        where: { name: lead.companyName },
      });
      if (!company) {
        company = await prisma.company.create({
          data: {
            name: lead.companyName,
            industry: lead.industryDomain,
            location: lead.locationCity,
            website: lead.websiteUrl,
            phone: lead.phoneNumber,
            email: lead.emailAddress,
            description: lead.businessOverview,
            status: 'ACTIVE',
          },
        });
      }
      companyId = company.id;
    }

    // 2. Find or create contact if name provided
    let contactId = lead.contactId;
    if (!contactId && lead.contactPocName && lead.contactPocName !== 'Not publicly listed' && lead.contactPocName !== 'Not specified') {
      const nameParts = lead.contactPocName.split(' ');
      const firstName = nameParts[0] || 'Executive';
      const lastName = nameParts.slice(1).join(' ') || 'Contact';
      const email = lead.emailAddress && lead.emailAddress.includes('@')
        ? lead.emailAddress
        : `${firstName.toLowerCase()}.${Date.now()}@${lead.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

      const contact = await prisma.contact.create({
        data: {
          firstName,
          lastName,
          jobTitle: lead.designationRole || 'Decision Maker',
          email,
          phone: lead.phoneNumber,
          companyId,
          status: 'ACTIVE',
        },
      });
      contactId = contact.id;
    }

    // 3. Create Opportunity
    const opportunityTitle = body.title || `${lead.companyName} - Enterprise Modernization`;
    const opportunityAmount = body.amount ? Number(body.amount) : 2500000;
    const probability = body.probability ? Number(body.probability) : 60;
    const stage = body.stage || 'QUALIFIED';

    const opportunity = await prisma.opportunity.create({
      data: {
        title: opportunityTitle,
        amount: opportunityAmount,
        probability,
        stage,
        companyId: companyId!,
        contactId,
        leadId: lead.id,
        ownerId: lead.assignedToId || session?.id || null,
        description: body.description || lead.projectRequirement || lead.problemFriction || 'Converted from Lead dossier',
      },
    });

    // 4. Update Lead record
    const updatedLead = await prisma.lead.update({
      where: { id: lead.id },
      data: {
        converted: true,
        convertedAt: new Date(),
        pipelineStatus: 'QUALIFIED',
        companyId,
        contactId,
        projectAllocationStatus: 'Assigned',
      },
    });

    // 5. Create Activity record
    await prisma.activity.create({
      data: {
        type: 'NOTE',
        subject: 'Lead Converted to Enterprise Opportunity',
        description: `Lead converted to Opportunity "${opportunityTitle}" valued at ₹${opportunityAmount.toLocaleString('en-IN')}. Stage: ${stage}`,
        leadId: lead.id,
        companyId,
        contactId,
        opportunityId: opportunity.id,
        userId: session?.id || null,
        status: 'COMPLETED',
      },
    });

    // 6. Log Audit Event
    await logAuditEvent({
      actorId: session?.id,
      actorEmail: session?.email || 'system',
      action: 'LEAD_CONVERTED',
      entity: 'Lead',
      entityId: lead.id,
      metadata: {
        companyName: lead.companyName,
        opportunityId: opportunity.id,
        opportunityAmount,
      },
    });

    return NextResponse.json({
      success: true,
      opportunity,
      lead: updatedLead,
    });
  } catch (error: any) {
    console.error('Error converting lead:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
