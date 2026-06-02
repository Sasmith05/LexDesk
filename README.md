# LexDesk — Legal Practice Management System

LexDesk is a full-stack legal practice management platform designed for advocates and legal offices to manage clients, court cases, legal workflows, billing ledgers, and office operations digitally.

Built using modern full-stack technologies like Next.js, Prisma, PostgreSQL, and Tailwind CSS, the application follows a scalable SaaS-style architecture suitable for real-world legal management systems.

---

# 🚀 Features

## Authentication & Access Control

* Secure login and authentication system using **NextAuth**.
* **Role-Based Access Control (RBAC)**: Distinguishes permissions between roles (e.g., `admin`, `advocate`, and `staff`).
* Auto-redirection and session-protected route guards.

## Dashboard & Analytics

* Premium dashboard overview displaying real-time practice stats.
* Dynamic interactive data charts using **Recharts**:
  * **Monthly Case & Revenue Trend**: Area charts showing client litigations and billing revenue.
  * **Case Status Split**: Pie chart indicating the distribution of open, pending, and closed cases.
* Fully responsive sidebar navigation drawer for all devices.

## Client Directory

* Centralized record directory to log clients.
* Full CRUD operations: Add new clients, view details, search, update info, or remove records.
* Links clients dynamically to associated lawsuits, notary registers, and invoices.

## Court Case Management

* Track legal cases, court names, jurisdictions, and schedules.
* Hearing date tracking and scheduling controls.
* Filter cases by specific date ranges and search by title, court, or client.

## Notary Register & Property Log

* Dedicated notary journal module to log legal documents (GPA, Sale Deeds, Affidavits).
* Logs executants, witnesses, collected notary fees, and stamp duty values.
* Automatically updates notary ledger values dynamically.

## Invoicing & Billing System

* Full invoicing management: Add items, quantities, and unit prices (computes tax and discounts automatically).
* Manage payment status (Paid, Unpaid, Overdue) and methods (UPI, Cash, Bank Transfer, Cheque).
* Filter and search client ledgers easily.

## Report Generation & Print Layouts

* Generate printable case schedules, invoice ledger sheets, and notary registry reports.
* Includes custom print-only CSS templates (hides UI buttons, navigation panels, and sidebar during print).

## Modern Responsive UI

* Sleek glassmorphism details, dark mode sidebar, and premium layouts.
* **100% Mobile Responsive Layout**: Features mobile navigation bars, touch-dismissible drawers, and horizontal scrolling on wide data tables to support phone and tablet screens seamlessly.

---

# 🛠️ Tech Stack

## Frontend
* **Next.js** (App Router & React 19)
* **Tailwind CSS v4** (Modern utility styles)
* **Lucide React** (Vector icons)
* **Recharts** (Visual analytics)

## Backend
* **Next.js Route Handlers** (REST APIs)
* **NextAuth** (Authentication & Session provider)

## Database
* **PostgreSQL** (Database engine)
* **Prisma ORM** (Database schema & client query builder)
* **Supabase** (PostgreSQL hosting)

## Deployment
* **Vercel**

---

# 📂 Folder Structure

```bash
src/
 ├── app/         # Next.js App Router (pages, APIs, layouts, globals.css)
 ├── components/  # Reusable UI widgets, sidebar navigation, and charts
 ├── hooks/       # Custom React state hooks
 ├── lib/         # Prisma client instantiation and server utilities
 └── prisma/      # Schema definition files and seeds
```

---

# ⚙️ Installation

Clone the repository:
```bash
git clone https://github.com/Sasmith05/LexDesk.git
```

Go to project folder:
```bash
cd LexDesk
```

Install dependencies:
```bash
npm install
```

Generate Prisma Client:
```bash
npx prisma generate
```

Run development server:
```bash
npm run dev
```

Open:
[http://localhost:3000](http://localhost:3000)

---

# 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

---

# 🌐 Deployment

The project is configured for deployment using:
* **Vercel** (Frontend Hosting)
* **Supabase** (Cloud PostgreSQL Database)

---

# 📸 Screenshots

*(To add screenshots, capture your application screen and place the files inside the `/public` folder, then reference them here)*

### Login Page
![Login View](/public/login_page_preview.png)

### Dashboard
![Dashboard View](/public/dashboard_preview.png)

### Invoicing & Billing
![Invoices View](/public/invoices_preview.png)

---

# 🎯 Project Goal

The goal of LexDesk is to digitize traditional legal office workflows and provide a centralized, secure, and highly responsive platform for managing legal records, clients, cases, billing statements, and notary activities.

---

# 👨‍💻 Author

**Sasmith05**
* GitHub: [https://github.com/Sasmith05](https://github.com/Sasmith05)
