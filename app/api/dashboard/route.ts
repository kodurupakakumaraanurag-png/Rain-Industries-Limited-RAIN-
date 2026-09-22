import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();

    // 1. Overall counts
    const [
      totalLeads,
      newLeadsCount,
      qualifiedLeadsCount,
      totalCompanies,
      totalContacts,
      opportunities,
      openTasksCount,
      recentActivities,
      recentLeads,
      leadsByStatus,
      leadsByPriority,
      leadsByIndustry,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { pipelineStatus: 'NEW' } }),
      prisma.lead.count({ where: { pipelineStatus: 'QUALIFIED' } }),
      prisma.company.count(),
      prisma.contact.count(),
      prisma.opportunity.findMany({
        select: {
          id: true,
          amount: true,
          stage: true,
          probability: true,
          status: true,
        },
      }),
      prisma.task.count({ where: { status: { in: ['TODO', 'IN_PROGRESS'] } } }),
      prisma.activity.findMany({
        take: 6,
        orderBy: { date: 'desc' },
        include: {
          company: { select: { name: true } },
          lead: { select: { companyName: true } },
          user: { select: { name: true, role: true } },
        },
      }),
      prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: { select: { name: true } },
        },
      }),
      prisma.lead.groupBy({
        by: ['pipelineStatus'],
        _count: { id: true },
      }),
      prisma.lead.groupBy({
        by: ['priorityLevel'],
        _count: { id: true },
      }),
      prisma.lead.groupBy({
        by: ['industryDomain'],
        _count: { id: true },
      }),
    ]);

    // Financial calculations
    const totalPipelineValue = opportunities
      .filter((o) => o.stage !== 'LOST')
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    const wonPipelineValue = opportunities
      .filter((o) => o.stage === 'WON')
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    const weightedPipelineValue = opportunities
      .filter((o) => o.stage !== 'LOST' && o.stage !== 'WON')
      .reduce((sum, o) => sum + (o.amount * (o.probability / 100) || 0), 0);

    const wonDealsCount = opportunities.filter((o) => o.stage === 'WON').length;
    const lostDealsCount = opportunities.filter((o) => o.stage === 'LOST').length;
    const closedDealsTotal = wonDealsCount + lostDealsCount;
    const winRate = closedDealsTotal > 0 ? Math.round((wonDealsCount / closedDealsTotal) * 100) : 65;

    // Stage breakdown for chart
    const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
    const pipelineStageData = stages.map((stage) => {
      const oppsInStage = opportunities.filter((o) => o.stage === stage);
      const leadCount = leadsByStatus.find((l) => l.pipelineStatus === stage)?._count.id || 0;
      const totalAmount = oppsInStage.reduce((sum, o) => sum + (o.amount || 0), 0);
      return {
        stage,
        leadCount,
        opportunityCount: oppsInStage.length,
        value: totalAmount,
      };
    });

    return NextResponse.json({
      metrics: {
        totalLeads,
        newLeadsCount,
        qualifiedLeadsCount,
        totalCompanies,
        totalContacts,
        totalOpportunities: opportunities.length,
        totalPipelineValue,
        wonPipelineValue,
        weightedPipelineValue,
        winRate,
        openTasksCount,
      },
      charts: {
        pipelineStageData,
        leadsByPriority: leadsByPriority.map((p) => ({
          priority: p.priorityLevel,
          count: p._count.id,
        })),
        leadsByIndustry: leadsByIndustry.map((i) => ({
          industry: i.industryDomain,
          count: i._count.id,
        })),
      },
      recentActivities,
      recentLeads,
    });
  } catch (error: any) {
    console.error('Error in dashboard API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
