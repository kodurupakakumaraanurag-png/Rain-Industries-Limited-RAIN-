import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for RAIN Enterprise CRM...');

  // Clean existing tables
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.task.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // Create Password Hashes
  const defaultPassword = await bcrypt.hash('Password123!', 10);

  // 1. Create System Users with Roles
  console.log('👤 Creating enterprise users...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'Rajesh Varma (Admin)',
      email: 'admin@rain-industries.com',
      passwordHash: defaultPassword,
      role: 'ADMIN',
      department: 'Executive Leadership',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      name: 'Ananya Sharma (Sales Manager)',
      email: 'manager@rain-industries.com',
      passwordHash: defaultPassword,
      role: 'SALES_MANAGER',
      department: 'Enterprise Sales',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    },
  });

  const execUser = await prisma.user.create({
    data: {
      name: 'Vikram Reddy (Sales Executive)',
      email: 'executive@rain-industries.com',
      passwordHash: defaultPassword,
      role: 'SALES_EXECUTIVE',
      department: 'Industrial Accounts',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const execUser2 = await prisma.user.create({
    data: {
      name: 'Priya Nair (Sales Executive)',
      email: 'priya@rain-industries.com',
      passwordHash: defaultPassword,
      role: 'SALES_EXECUTIVE',
      department: 'Manufacturing Solutions',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      name: 'Siddharth Mehta (Auditor)',
      email: 'viewer@rain-industries.com',
      passwordHash: defaultPassword,
      role: 'VIEWER',
      department: 'Compliance',
    },
  });

  // 2. Create Seed Companies
  console.log('🏢 Creating manufacturing companies...');
  const rainCompany = await prisma.company.create({
    data: {
      name: 'Rain Industries Limited (RAIN)',
      industry: 'Manufacturing',
      website: 'rain-industries.com',
      location: 'KPHB Main Road, beside Vishwanath Theatre, Kukatpally, Hyderabad – 500085',
      phone: '+91 40 4040 1234',
      email: 'info@rain-industries.com',
      description: 'Rain Industries Limited is a leading vertically integrated producer of carbon and advanced chemical products.',
      employeeCount: 2500,
      annualRevenue: 1500000000,
      status: 'PROSPECT',
    },
  });

  const apexCompany = await prisma.company.create({
    data: {
      name: 'Apex Manufacturing Solutions',
      industry: 'Precision Tooling & Equipment',
      website: 'apexmanufact.com',
      location: 'Industrial Development Area, Nacharam, Hyderabad',
      phone: '+91 40 2715 8890',
      email: 'contact@apexmanufact.com',
      description: 'High-precision manufacturing components and heavy tooling solutions for aerospace and automotive sectors.',
      employeeCount: 450,
      annualRevenue: 120000000,
      status: 'ACTIVE',
    },
  });

  const novaCompany = await prisma.company.create({
    data: {
      name: 'Nova Industrial Systems',
      industry: 'Industrial Automation',
      website: 'novaindustrial.in',
      location: 'Peenya Industrial Area, Bengaluru',
      phone: '+91 80 4112 3344',
      email: 'sales@novaindustrial.in',
      description: 'Smart robotics, SCADA systems, and automated assembly line solutions for smart factories.',
      employeeCount: 680,
      annualRevenue: 280000000,
      status: 'ACTIVE',
    },
  });

  const vertexCompany = await prisma.company.create({
    data: {
      name: 'Vertex Engineering Works',
      industry: 'Heavy Machinery',
      website: 'vertexengg.com',
      location: 'Sanathnagar Industrial Estate, Hyderabad',
      phone: '+91 40 2370 5678',
      email: 'info@vertexengg.com',
      description: 'Custom fabrication, heavy press machinery, and structural engineering components.',
      employeeCount: 320,
      annualRevenue: 85000000,
      status: 'ACTIVE',
    },
  });

  const orionCompany = await prisma.company.create({
    data: {
      name: 'Orion Components Pvt Ltd',
      industry: 'Electronics & Hardware',
      website: 'orioncomponents.co.in',
      location: 'Electronic City, Bengaluru',
      phone: '+91 80 2852 9900',
      email: 'business@orioncomponents.co.in',
      description: 'OEM supplier of high-reliability electronic assemblies and PCB fabrication for industrial controls.',
      employeeCount: 510,
      annualRevenue: 190000000,
      status: 'ACTIVE',
    },
  });

  const bluepeakCompany = await prisma.company.create({
    data: {
      name: 'BluePeak Automation',
      industry: 'Process Control Systems',
      website: 'bluepeakauto.com',
      location: 'Chakan MIDC, Pune',
      phone: '+91 20 6677 4433',
      email: 'corporate@bluepeakauto.com',
      description: 'Automated chemical process valves, sensors, and remote monitoring platforms.',
      employeeCount: 290,
      annualRevenue: 75000000,
      status: 'PROSPECT',
    },
  });

  // 3. Create Contacts
  console.log('🎇 Creating key executive contacts...');
  const rainContact = await prisma.contact.create({
    data: {
      firstName: 'Project Head',
      lastName: 'Decision Maker',
      jobTitle: 'VP of Digital Transformation',
      companyId: rainCompany.id,
      email: 'transformation@rain-industries.com',
      phone: '+91 98490 12345',
      linkedinUrl: 'https://linkedin.com/company/rain-industries-limited',
      department: 'Technology & Operations',
      status: 'ACTIVE',
    },
  });

  const apexContact = await prisma.contact.create({
    data: {
      firstName: 'Suresh',
      lastName: 'Rao',
      jobTitle: 'Chief Technology Officer',
      companyId: apexCompany.id,
      email: 'suresh.rao@apexmanufact.com',
      phone: '+91 98765 43210',
      linkedinUrl: 'https://linkedin.com/in/suresh-rao-apex',
      department: 'Engineering',
      status: 'ACTIVE',
    },
  });

  const novaContact = await prisma.contact.create({
    data: {
      firstName: 'Kavitha',
      lastName: 'Krishnan',
      jobTitle: 'Director of Procurement',
      companyId: novaCompany.id,
      email: 'k.krishnan@novaindustrial.in',
      phone: '+91 99887 76655',
      linkedinUrl: 'https://linkedin.com/in/kavithakrishnan',
      department: 'Procurement',
      status: 'ACTIVE',
    },
  });

  const vertexContact = await prisma.contact.create({
    data: {
      firstName: 'Manish',
      lastName: 'Aggarwal',
      jobTitle: 'Head of Operations',
      companyId: vertexCompany.id,
      email: 'm.aggarwal@vertexengg.com',
      phone: '+91 97112 23344',
      linkedinUrl: 'https://linkedin.com/in/manishaggarwal',
      department: 'Operations',
      status: 'ACTIVE',
    },
  });

  const orionContact = await prisma.contact.create({
    data: {
      firstName: 'Deepak',
      lastName: 'Sharma',
      jobTitle: 'VP of Supply Chain',
      companyId: orionCompany.id,
      email: 'deepak.s@orioncomponents.co.in',
      phone: '+91 98200 11223',
      linkedinUrl: 'https://linkedin.com/in/deepaksharma-orion',
      department: 'Supply Chain',
      status: 'ACTIVE',
    },
  });

  // 4. Create Leads (Including MANDATORY Rain Industries Seed Lead)
  console.log('📌 Creating enterprise leads...');
  
  // Mandatory Rain Industries Dossier Seed Lead
  const rainLead = await prisma.lead.create({
    data: {
      companyName: 'Rain Industries Limited (RAIN)',
      industryDomain: 'Manufacturing',
      locationCity: 'KPHB Main Road, beside Vishwanath Theatre, Kukatpally, Hyderabad – 500085',
      websiteUrl: 'rain-industries.com',
      contactPocName: 'Not publicly listed',
      designationRole: 'Project Head / Decision Maker',
      phoneNumber: 'Not publicly listed',
      emailAddress: 'Not publicly listed',
      businessOverview: 'Rain Industries Limited is an active enterprise in the manufacturing sector requiring modernization through full-stack web solutions.',
      problemFriction: 'Legacy workflow, manual processes, or lack of automated CRM pipeline.',
      projectRequirement: 'Custom enterprise web application and management system.',
      placementOpportunity: 'High-leverage live industry project for portfolio demonstration.',
      priorityLevel: 'MEDIUM',
      pipelineStatus: 'NEW',
      nextAction: 'Identify IT, Digital Transformation, Operations or Technology decision makers and approach them with enterprise automation, AI, analytics and integration solutions instead of basic website development.',
      dateAdded: '2026-09-21',
      leadSource: 'Google Sheet Import',
      contactMethod: 'LinkedIn / Email',
      
      // Dossier component scores (0/5 initial as per dossier)
      digitalPresenceScore: 0,
      hiringActivityScore: 0,
      techStackFitScore: 0,
      fundingRevenueScore: 0,
      projectUrgencyScore: 0,
      budgetClarityScore: 0,
      
      totalLeadScore: 0,       // Calculated score sum
      sourceScore: 18,         // Source dossier score preserved
      
      projectAllocationStatus: 'Available for Selection',
      companyId: rainCompany.id,
      contactId: rainContact.id,
      assignedToId: managerUser.id,
    },
  });

  // Additional 15 realistic synthetic leads across manufacturing spectrum
  const syntheticLeadsData = [
    {
      companyName: 'Apex Manufacturing Solutions',
      industryDomain: 'Precision Tooling & Equipment',
      locationCity: 'Hyderabad, Telangana',
      websiteUrl: 'apexmanufact.com',
      contactPocName: 'Suresh Rao',
      designationRole: 'Chief Technology Officer',
      phoneNumber: '+91 98765 43210',
      emailAddress: 'suresh.rao@apexmanufact.com',
      businessOverview: 'Specialist in precision computer numerical control (CNC) machining and component fabrication.',
      problemFriction: 'Inability to track custom component quote lifecycles and manual lead scoring across regional agents.',
      projectRequirement: 'Automated CRM with CPQ (Configure Price Quote) integration and IoT machine telemetry feed.',
      placementOpportunity: 'Full Stack Enterprise SaaS Contract',
      priorityLevel: 'HIGH',
      pipelineStatus: 'QUALIFIED',
      nextAction: 'Deliver technical architecture proposal and custom workflow demo',
      dateAdded: '2026-09-15',
      leadSource: 'LinkedIn',
      contactMethod: 'Video Call',
      digitalPresenceScore: 4,
      hiringActivityScore: 3,
      techStackFitScore: 5,
      fundingRevenueScore: 4,
      projectUrgencyScore: 4,
      budgetClarityScore: 4,
      totalLeadScore: 24,
      projectAllocationStatus: 'Assigned',
      companyId: apexCompany.id,
      contactId: apexContact.id,
      assignedToId: execUser.id,
    },
    {
      companyName: 'Nova Industrial Systems',
      industryDomain: 'Industrial Automation',
      locationCity: 'Bengaluru, Karnataka',
      websiteUrl: 'novaindustrial.in',
      contactPocName: 'Kavitha Krishnan',
      designationRole: 'Director of Procurement',
      phoneNumber: '+91 99887 76655',
      emailAddress: 'k.krishnan@novaindustrial.in',
      businessOverview: 'Turnkey industrial robotics system integrator for automotive OEMs.',
      problemFriction: 'Fragmented lead management between field engineers and corporate sales team.',
      projectRequirement: 'Mobile-responsive CRM with real-time field activity reporting and offline sync capability.',
      priorityLevel: 'URGENT',
      pipelineStatus: 'PROPOSAL',
      nextAction: 'Review commercial contract terms and SLA schedule',
      dateAdded: '2026-09-10',
      leadSource: 'Website',
      contactMethod: 'In-person Meeting',
      digitalPresenceScore: 5,
      hiringActivityScore: 4,
      techStackFitScore: 4,
      fundingRevenueScore: 5,
      projectUrgencyScore: 5,
      budgetClarityScore: 4,
      totalLeadScore: 27,
      projectAllocationStatus: 'Assigned',
      companyId: novaCompany.id,
      contactId: novaContact.id,
      assignedToId: execUser.id,
    },
    {
      companyName: 'Vertex Engineering Works',
      industryDomain: 'Heavy Machinery',
      locationCity: 'Hyderabad, Telangana',
      websiteUrl: 'vertexengg.com',
      contactPocName: 'Manish Aggarwal',
      designationRole: 'Head of Operations',
      phoneNumber: '+91 97112 23344',
      emailAddress: 'm.aggarwal@vertexengg.com',
      businessOverview: 'Heavy structural steel fabricator servicing infrastructure projects nationwide.',
      problemFriction: 'Relying on spreadsheet tracking for multi-crore tender submissions.',
      projectRequirement: 'Enterprise tender pipeline manager with deadline notifications and automated risk scoring.',
      priorityLevel: 'MEDIUM',
      pipelineStatus: 'NEGOTIATION',
      nextAction: 'Finalize pricing discount structure for multi-year software licensing',
      dateAdded: '2026-09-02',
      leadSource: 'Referral',
      contactMethod: 'Phone Call',
      digitalPresenceScore: 3,
      hiringActivityScore: 2,
      techStackFitScore: 4,
      fundingRevenueScore: 4,
      projectUrgencyScore: 3,
      budgetClarityScore: 3,
      totalLeadScore: 19,
      projectAllocationStatus: 'Assigned',
      companyId: vertexCompany.id,
      contactId: vertexContact.id,
      assignedToId: execUser2.id,
    },
    {
      companyName: 'Orion Components Pvt Ltd',
      industryDomain: 'Electronics & Hardware',
      locationCity: 'Bengaluru, Karnataka',
      websiteUrl: 'orioncomponents.co.in',
      contactPocName: 'Deepak Sharma',
      designationRole: 'VP of Supply Chain',
      phoneNumber: '+91 98200 11223',
      emailAddress: 'deepak.s@orioncomponents.co.in',
      businessOverview: 'Manufacturer of high-frequency power electronics and surface-mount device assemblies.',
      problemFriction: 'Slow response time to customer inquiry due to manual lead routing.',
      projectRequirement: 'AI-assisted lead scoring, automated vendor portal integration, and lead distribution engine.',
      priorityLevel: 'HIGH',
      pipelineStatus: 'WON',
      nextAction: 'Commence onboarding and data migration kickoff',
      dateAdded: '2026-08-20',
      leadSource: 'Email Campaign',
      contactMethod: 'Email',
      digitalPresenceScore: 4,
      hiringActivityScore: 5,
      techStackFitScore: 4,
      fundingRevenueScore: 5,
      projectUrgencyScore: 4,
      budgetClarityScore: 4,
      totalLeadScore: 26,
      projectAllocationStatus: 'Allocated',
      companyId: orionCompany.id,
      contactId: orionContact.id,
      assignedToId: managerUser.id,
    },
    {
      companyName: 'BluePeak Automation',
      industryDomain: 'Process Control Systems',
      locationCity: 'Pune, Maharashtra',
      websiteUrl: 'bluepeakauto.com',
      contactPocName: 'Rajesh Kulkarni',
      designationRole: 'Managing Director',
      phoneNumber: '+91 98220 55443',
      emailAddress: 'r.kulkarni@bluepeakauto.com',
      businessOverview: 'Flow control instrumentation for chemical processing plants.',
      problemFriction: 'High customer churn due to delayed follow-ups on maintenance contract renewals.',
      projectRequirement: 'CRM with contract lifecycle tracking, automated task reminders, and executive analytics dashboard.',
      priorityLevel: 'LOW',
      pipelineStatus: 'CONTACTED',
      nextAction: 'Schedule technical workshop with VP of Engineering',
      dateAdded: '2026-09-18',
      leadSource: 'Google Sheet Import',
      contactMethod: 'LinkedIn',
      digitalPresenceScore: 2,
      hiringActivityScore: 2,
      techStackFitScore: 3,
      fundingRevenueScore: 3,
      projectUrgencyScore: 2,
      budgetClarityScore: 2,
      totalLeadScore: 14,
      projectAllocationStatus: 'Available for Selection',
      companyId: bluepeakCompany.id,
      assignedToId: execUser2.id,
    },
    {
      companyName: 'Titan Heavy Tech Ltd',
      industryDomain: 'Heavy Machinery',
      locationCity: 'Coimbatore, Tamil Nadu',
      websiteUrl: 'titanheavytech.com',
      contactPocName: 'Natarajan Swamy',
      designationRole: 'General Manager - Marketing',
      phoneNumber: '+91 94430 88776',
      emailAddress: 'natarajan@titanheavytech.com',
      businessOverview: 'Manufacturer of industrial boilers, heat exchangers, and pressure vessels.',
      problemFriction: 'Lack of visibility into international sales agent activities and deal pipelines.',
      projectRequirement: 'Global multi-currency enterprise CRM with partner portal access control.',
      priorityLevel: 'HIGH',
      pipelineStatus: 'QUALIFIED',
      nextAction: 'Send NDA and security questionnaire',
      dateAdded: '2026-09-12',
      leadSource: 'Trade Show',
      contactMethod: 'In-person Meeting',
      digitalPresenceScore: 3,
      hiringActivityScore: 4,
      techStackFitScore: 4,
      fundingRevenueScore: 4,
      projectUrgencyScore: 3,
      budgetClarityScore: 4,
      totalLeadScore: 22,
      projectAllocationStatus: 'Assigned',
      assignedToId: execUser.id,
    },
    {
      companyName: 'Quantum Polymer Corp',
      industryDomain: 'Chemicals & Polymers',
      locationCity: 'Vadodara, Gujarat',
      websiteUrl: 'quantumpolymer.in',
      contactPocName: 'Bhavesh Patel',
      designationRole: 'Head of Sales & Marketing',
      phoneNumber: '+91 98980 33221',
      emailAddress: 'bhavesh.p@quantumpolymer.in',
      businessOverview: 'Specialty engineered polymers and high-temperature composite materials.',
      problemFriction: 'ERP data disconnected from front-line sales representatives.',
      projectRequirement: 'Next.js based responsive CRM app integrated with SAP S/4HANA OData services.',
      priorityLevel: 'URGENT',
      pipelineStatus: 'PROPOSAL',
      nextAction: 'Present SAP integration proof-of-concept',
      dateAdded: '2026-09-08',
      leadSource: 'Website',
      contactMethod: 'Email',
      digitalPresenceScore: 4,
      hiringActivityScore: 4,
      techStackFitScore: 5,
      fundingRevenueScore: 5,
      projectUrgencyScore: 5,
      budgetClarityScore: 5,
      totalLeadScore: 28,
      projectAllocationStatus: 'Assigned',
      assignedToId: managerUser.id,
    },
    {
      companyName: 'ElectroMax Systems',
      industryDomain: 'Electronics & Hardware',
      locationCity: 'Noida, Uttar Pradesh',
      websiteUrl: 'electromaxsys.com',
      contactPocName: 'Alok Gupta',
      designationRole: 'Chief Executive Officer',
      phoneNumber: '+91 98100 44556',
      emailAddress: 'alok.g@electromaxsys.com',
      businessOverview: 'Smart grid metering systems and industrial power quality controllers.',
      problemFriction: 'Evaluating multiple CRM vendors, budget not yet fully allocated.',
      projectRequirement: 'Lightweight cloud CRM with quick setup and minimal per-user licensing fees.',
      priorityLevel: 'LOW',
      pipelineStatus: 'LOST',
      nextAction: 'Archive lead and re-engage in Q1 2027',
      dateAdded: '2026-08-01',
      leadSource: 'Google Sheet Import',
      contactMethod: 'Phone Call',
      digitalPresenceScore: 2,
      hiringActivityScore: 1,
      techStackFitScore: 2,
      fundingRevenueScore: 2,
      projectUrgencyScore: 1,
      budgetClarityScore: 1,
      totalLeadScore: 9,
      projectAllocationStatus: 'Archived',
      assignedToId: execUser2.id,
    },
  ];

  for (const item of syntheticLeadsData) {
    await prisma.lead.create({ data: item });
  }

  // 5. Create Opportunities
  console.log('💰 Creating sales opportunities...');
  const apexOpp = await prisma.opportunity.create({
    data: {
      title: 'Apex CNC Tooling Automation Suite',
      companyId: apexCompany.id,
      contactId: apexContact.id,
      amount: 4500000,
      probability: 75,
      stage: 'QUALIFIED',
      expectedCloseDate: '2026-11-15',
      ownerId: execUser.id,
      description: 'Full custom CRM deployment with automated quote generator and SAP integration.',
    },
  });

  const novaOpp = await prisma.opportunity.create({
    data: {
      title: 'Nova Mobile CRM & Field Service Portal',
      companyId: novaCompany.id,
      contactId: novaContact.id,
      amount: 8200000,
      probability: 85,
      stage: 'PROPOSAL',
      expectedCloseDate: '2026-10-30',
      ownerId: execUser.id,
      description: 'Field engineer mobile portal for telemetry logging, spare parts ordering, and lead management.',
    },
  });

  const vertexOpp = await prisma.opportunity.create({
    data: {
      title: 'Vertex Structural Tender Management System',
      companyId: vertexCompany.id,
      contactId: vertexContact.id,
      amount: 3200000,
      probability: 60,
      stage: 'NEGOTIATION',
      expectedCloseDate: '2026-12-01',
      ownerId: execUser2.id,
      description: 'Multi-crore tender pipeline platform with compliance tracking.',
    },
  });

  const orionOpp = await prisma.opportunity.create({
    data: {
      title: 'Orion Supply Chain & Lead Distribution Engine',
      companyId: orionCompany.id,
      contactId: orionContact.id,
      amount: 6000000,
      probability: 100,
      stage: 'WON',
      expectedCloseDate: '2026-09-18',
      ownerId: managerUser.id,
      description: 'Enterprise contract signed for automated lead scoring and supply chain partner portal.',
    },
  });

  // 6. Create Activities
  console.log('📅 Creating activity timeline logs...');
  await prisma.activity.create({
    data: {
      type: 'MEETING',
      subject: 'Initial Digital Transformation Strategy Workshop',
      description: 'Met with Project Head to review Rain Industries legacy CRM friction and define modern Next.js web portal requirements.',
      leadId: rainLead.id,
      companyId: rainCompany.id,
      userId: managerUser.id,
      date: new Date('2026-09-21T10:30:00Z'),
      status: 'COMPLETED',
    },
  });

  await prisma.activity.create({
    data: {
      type: 'DEMO',
      subject: 'Apex CNC Tooling CRM Live Demonstration',
      description: 'Demonstrated interactive Kanban pipeline, lead scoring sliders, and CSV import to CTO Suresh Rao.',
      companyId: apexCompany.id,
      contactId: apexContact.id,
      opportunityId: apexOpp.id,
      userId: execUser.id,
      date: new Date('2026-09-19T14:00:00Z'),
      status: 'COMPLETED',
    },
  });

  await prisma.activity.create({
    data: {
      type: 'PROPOSAL',
      subject: 'Sent Nova Industrial Systems Commercial Proposal',
      description: 'Transmitted formal proposal detailing 8.2M INR deployment with SLA guarantees.',
      companyId: novaCompany.id,
      contactId: novaContact.id,
      opportunityId: novaOpp.id,
      userId: execUser.id,
      date: new Date('2026-09-17T16:45:00Z'),
      status: 'COMPLETED',
    },
  });

  await prisma.activity.create({
    data: {
      type: 'CALL',
      subject: 'Vertex Tender System Pricing Clarification',
      description: 'Discussed volume discount options with Operations Head Manish Aggarwal.',
      companyId: vertexCompany.id,
      contactId: vertexContact.id,
      opportunityId: vertexOpp.id,
      userId: execUser2.id,
      date: new Date('2026-09-20T11:15:00Z'),
      status: 'COMPLETED',
    },
  });

  // 7. Create Tasks (including OVERDUE tasks for alert testing!)
  console.log('✅ Creating operational tasks...');
  await prisma.task.create({
    data: {
      title: 'Rain Industries: Map IT & Digital Transformation Decision Makers',
      description: 'Identify IT, Digital Transformation, Operations decision makers at Rain Industries Kukatpally campus and send enterprise automation dossier.',
      assignedToId: managerUser.id,
      leadId: rainLead.id,
      companyId: rainCompany.id,
      dueDate: '2026-09-25',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
    },
  });

  await prisma.task.create({
    data: {
      title: 'Prepare Apex Technical Architecture Specification',
      description: 'Draft cloud architecture blueprint including Next.js, Prisma, and PostgreSQL deployment topology.',
      assignedToId: execUser.id,
      companyId: apexCompany.id,
      dueDate: '2026-09-23',
      priority: 'HIGH',
      status: 'TODO',
    },
  });

  // OVERDUE TASK for alert test
  await prisma.task.create({
    data: {
      title: 'Send Revised MSA to Nova Procurement',
      description: 'Update Section 4.2 clause on IP ownership and re-send Master Services Agreement to Kavitha Krishnan.',
      assignedToId: execUser.id,
      companyId: novaCompany.id,
      dueDate: '2026-09-20', // Past date relative to Sept 22
      priority: 'URGENT',
      status: 'OVERDUE',
    },
  });

  await prisma.task.create({
    data: {
      title: 'Schedule Orion Kickoff & User Onboarding',
      description: 'Set up initial admin accounts and import legacy CSV leads for Orion Components.',
      assignedToId: managerUser.id,
      companyId: orionCompany.id,
      dueDate: '2026-09-24',
      priority: 'MEDIUM',
      status: 'COMPLETED',
    },
  });

  // 8. Create Notifications
  console.log('🔔 Creating notification feed...');
  await prisma.notification.create({
    data: {
      userId: managerUser.id,
      title: 'New Enterprise Lead Added',
      message: 'Rain Industries Limited (RAIN) was imported into the CRM pipeline.',
      type: 'INFO',
      link: `/leads/${rainLead.id}`,
    },
  });

  await prisma.notification.create({
    data: {
      userId: execUser.id,
      title: 'Task Overdue Notice',
      message: 'Task "Send Revised MSA to Nova Procurement" is overdue!',
      type: 'ALERT',
      link: '/tasks',
    },
  });

  await prisma.notification.create({
    data: {
      userId: managerUser.id,
      title: 'Deal Closed - WON!',
      message: 'Orion Supply Chain & Lead Distribution Engine (₹60,00,000) marked as WON.',
      type: 'SUCCESS',
      link: `/opportunities/${orionOpp.id}`,
    },
  });

  // 9. Create Audit Logs
  console.log('📋 Creating compliance audit logs...');
  await prisma.auditLog.create({
    data: {
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      action: 'SYSTEM_INITIALIZATION',
      entity: 'System',
      entityId: 'RAIN_CRM_SYSTEM',
      metadata: JSON.stringify({ message: 'Initialized RAIN Enterprise CRM database schema and seed environment.' }),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      action: 'LEAD_CREATED',
      entity: 'Lead',
      entityId: rainLead.id,
      metadata: JSON.stringify({ companyName: 'Rain Industries Limited (RAIN)', priority: 'MEDIUM', source: 'Google Sheet Import' }),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: managerUser.id,
      actorEmail: managerUser.email,
      action: 'OPPORTUNITY_WON',
      entity: 'Opportunity',
      entityId: orionOpp.id,
      metadata: JSON.stringify({ opportunityTitle: 'Orion Supply Chain & Lead Distribution Engine', amount: 6000000 }),
    },
  });

  console.log('✅ Database seeding complete! RAIN Enterprise CRM is ready for operation.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
