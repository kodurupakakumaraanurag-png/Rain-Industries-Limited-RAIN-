# RAIN Enterprise CRM - Rain Industries Limited (RAIN)

An enterprise-grade Customer Relationship Management (CRM) and sales operations platform engineered specifically for **Rain Industries Limited (RAIN)** and industrial manufacturing conglomerates.

Built with **Next.js 14 (App Router)**, **Prisma ORM**, **SQLite**, **Tailwind CSS**, **Lucide Icons**, and **Recharts**.

---

## 🌟 Key Features

### 1. 26-Field Manufacturing Lead Dossier Intelligence
- **Full Dossier Profile**: Captures extensive manufacturing intelligence:
  - *Company Name*, *Industry Domain*, *Location / City*, *Website URL*, *Key Executive POC*, *Designation / Role*, *Phone*, *Email*.
  - *Business Overview*, *Operational Friction / Pain Points*, *Project Requirement Scope*, *Placement / High-Leverage Opportunity*, *Next Action Strategy*.
  - *Priority Level* (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), *Pipeline Stage* (`NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL`, `NEGOTIATION`, `WON`, `LOST`).
  - *Lead Source*, *Contact Method*, *Date Added*, *Project Allocation Status*.

### 2. 6-Dimension Algorithmic Lead Scoring Engine (0-30 Total Points)
- Real-time scoring calculation across 6 strategic enterprise dimensions (0-5 each):
  1. **Digital Presence & Stack Fit**
  2. **Hiring Activity & Expansion**
  3. **Tech Stack & Integration Fit**
  4. **Funding & Annual Revenue**
  5. **Project Urgency & Timeline**
  6. **Budget Clarity & Allocation**
- **Algorithmic Categorization**:
  - `Hot / High Priority (24-30 pts, Grade A+)`
  - `Warm / Solid Opportunity (18-23 pts, Grade A)`
  - `Moderate / Nurturing Required (12-17 pts, Grade B)`
  - `Cold / Unqualified (< 12 pts, Grade C)`

### 3. Bulk CSV Import / Export System
- One-click **CSV Import** with header mapping, Zod validation, and error reporting.
- Sample CSV template download directly from the UI.
- Full **CSV Export** exporting all 26 dossier fields with clean column formatting.

### 4. 1-Click Lead Conversion to Pipeline Opportunity
- Convert qualified leads into active deal opportunities with auto-creation of linked Company and Contact records.

### 5. Interactive 7-Stage Kanban Opportunity Pipeline
- Visual Kanban board with stage columns: `NEW` ➔ `CONTACTED` ➔ `QUALIFIED` ➔ `PROPOSAL` ➔ `NEGOTIATION` ➔ `WON` ➔ `LOST`.
- Deal valuations, win probabilities, target close dates, and stage progression controls.

### 6. Industrial Accounts & Decision-Maker Directories
- Centralized management of manufacturing conglomerates, parent companies, subsidiaries, and key POCs.

### 7. Operational Activity Feed & Task Management
- Log meetings, technical discovery workshops, calls, proposal presentations, and notes.
- Operational task management with status tracking (`TODO`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE`) and priority alerts.

### 8. Executive Analytics & Visual Reporting (Recharts)
- Visual deal conversion funnel, 6D scoring radar profile, rep performance leaderboard, and revenue metrics.

### 9. Role-Based Access Control (RBAC) & Immutable Audit Trail
- Roles: `ADMIN`, `SALES_MANAGER`, `SALES_EXECUTIVE`, `VIEWER`.
- Full audit log tracking every CRM state transition, login, and deletion.

---

## 👥 Demo Personas & Credentials

All accounts use default password: `Password123!`

| Role | Name | Email | Permissions |
|---|---|---|---|
| **ADMIN** | Rajesh Varma | `admin@rain-industries.com` | Full administrative control, user management, audit logs |
| **SALES MANAGER** | Ananya Sharma | `manager@rain-industries.com` | Pipeline oversight, lead allocation, audit logs |
| **SALES EXECUTIVE** | Vikram Reddy | `executive@rain-industries.com` | Dossier editing, deal management, activity logging |
| **VIEWER / AUDITOR** | Siddharth Mehta | `viewer@rain-industries.com` | Read-only compliance & audit log inspection |

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database & ORM**: SQLite + Prisma ORM
- **Styling**: Tailwind CSS (Dark Theme + Glassmorphism)
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **CSV Parsing**: PapaParse
- **Validation**: Zod
- **Authentication**: Secure HTTP-only session cookies with bcryptjs password hashing

---

## 🚀 Quickstart & Local Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database & Seed Real Manufacturing Data**:
   ```bash
   npm run db:seed
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) and sign in using any demo account persona.

---

## 🏛️ Corporate Identity

**Rain Industries Limited (RAIN)**  
Headquarters: KPHB Main Road, Kukatpally, Hyderabad, Telangana – 500085  
NSE / BSE Ticker: `RAIN`
