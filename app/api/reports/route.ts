import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      totalLeads,
      leadsByStatus,
      leadsByPriority,
      leadsBySource,
      leadsByIndustry,
      opportunities,
      users,
      leadScores,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.groupBy({ by: ['pipelineStatus'], _count: { id: true } }),
      prisma.lead.groupBy({ by: ['priorityLevel'], _count: { id: true } }),
      prisma.lead.groupBy({ by: ['leadSource'], _count: { id: true } }),
      prisma.lead.groupBy({ by: ['industryDomain'], _count: { id: true } }),
      prisma.opportunity.findMany({
        include: {
          owner: { select: { id: true, name: true } },
          company: { select: { name: true } },
        },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          role: true,
          assignedLeads: { select: { id: true, pipelineStatus: true, totalLeadScore: true } },
          opportunities: { select: { id: true, amount: true, stage: true } },
        },
      }),
      prisma.lead.findMany({
        select: {
          id: true,
          companyName: true,
          totalLeadScore: true,
          digitalPresenceScore: true,
          hiringActivityScore: true,
          techStackFitScore: true,
          fundingRevenueScore: true,
          projectUrgencyScore: true,
          budgetClarityScore: true,
        },
      }),
    ]);

    // 1. Stage Funnel Data
    const stageOrder = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
    const funnelData = stageOrder.map((stage) => {
      const opps = opportunities.filter((o) => o.stage === stage);
      const leadCount = leadsByStatus.find((l) => l.pipelineStatus === stage)?._count.id || 0;
      const totalAmount = opps.reduce((sum, o) => sum + (o.amount || 0), 0);
      return {
        stage,
        leads: leadCount,
        deals: opps.length,
        value: totalAmount,
      };
    });

    // 2. Sales Rep Leaderboard
    const repLeaderboard = users
      .filter((u) => u.role !== 'VIEWER')
      .map((user) => {
        const totalWon = user.opportunities
          .filter((o) => o.stage === 'WON')
          .reduce((sum, o) => sum + o.amount, 0);
        const pipeline = user.opportunities
          .filter((o) => o.stage !== 'LOST')
          .reduce((sum, o) => sum + o.amount, 0);
        const wonCount = user.opportunities.filter((o) => o.stage === 'WON').length;
        const totalAssigned = user.assignedLeads.length;

        return {
          id: user.id,
          name: user.name,
          role: user.role,
          leadsCount: totalAssigned,
          wonCount,
          wonRevenue: totalWon,
          pipelineRevenue: pipeline,
          conversionRate: totalAssigned > 0 ? Math.round((wonCount / totalAssigned) * 100) : 0,
        };
      })
      .sort((a, b) => b.wonRevenue - a.wonRevenue);

    // 3. Lead Score Tier Distribution
    const scoreTiers = {
      hot: leadScores.filter((l) => l.totalLeadScore >= 24).length,
      warm: leadScores.filter((l) => l.totalLeadScore >= 18 && l.totalLeadScore < 24).length,
      moderate: leadScores.filter((l) => l.totalLeadScore >= 12 && l.totalLeadScore < 18).length,
      cold: leadScores.filter((l) => l.totalLeadScore < 12).length,
    };

    // 4. Dimension averages
    const totalCount = leadScores.length || 1;
    const dimensionAverages = {
      digitalPresence: (leadScores.reduce((s, l) => s + l.digitalPresenceScore, 0) / totalCount).toFixed(1),
      hiringActivity: (leadScores.reduce((s, l) => s + l.hiringActivityScore, 0) / totalCount).toFixed(1),
      techStackFit: (leadScores.reduce((s, l) => s + l.techStackFitScore, 0) / totalCount).toFixed(1),
      fundingRevenue: (leadScores.reduce((s, l) => s + l.fundingRevenueScore, 0) / totalCount).toFixed(1),
      projectUrgency: (leadScores.reduce((s, l) => s + l.projectUrgencyScore, 0) / totalCount).toFixed(1),
      budgetClarity: (leadScores.reduce((s, l) => s + l.budgetClarityScore, 0) / totalCount).toFixed(1),
    };

    return NextResponse.json({
      funnelData,
      repLeaderboard,
      scoreTiers,
      dimensionAverages,
      leadsBySource: leadsBySource.map((s) => ({ name: s.leadSource, count: s._count.id })),
      leadsByIndustry: leadsByIndustry.map((i) => ({ name: i.industryDomain, count: i._count.id })),
      leadsByPriority: leadsByPriority.map((p) => ({ name: p.priorityLevel, count: p._count.id })),
    });
  } catch (error: any) {
    console.error('Error generating reports:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
