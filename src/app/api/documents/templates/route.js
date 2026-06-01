import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Default Preset Legal Templates to Seed
const defaultTemplates = [
  {
    title: "General Power of Attorney (GPA)",
    description: "Standard GPA template for authorizing legal representation, property management, and financial dealings.",
    bodyText: `GENERAL POWER OF ATTORNEY

KNOW ALL MEN BY THESE PRESENTS that I, {{clientName}}, residing at {{clientAddress}} (hereinafter referred to as the "Principal"), do hereby appoint, nominate, and constitute {{attorneyName}}, residing at {{attorneyAddress}}, as my true and lawful Attorney-in-Fact, to act in my name, place, and stead.

The Attorney-in-Fact is authorized to execute, sign, seal, and deliver any contracts, deeds, and documents, to appear before any court of law, government tribunals, and registry office in connection with my properties and legal representation, and to perform all acts necessary as fully as I might or could do if personally present.

I hereby ratify and confirm all lawful acts, deeds, and things done by my said Attorney-in-Fact by virtue of these presents.

IN WITNESS WHEREOF, I have executed this General Power of Attorney on this {{date}} at {{place}}.

_______________________
Principal: {{clientName}}
Phone: {{clientPhone}}

_______________________
Attorney-in-Fact: {{attorneyName}}

WITNESSES:
1. {{witnessOne}}
2. {{witnessTwo}}`
  },
  {
    title: "Residential Lease / Rental Agreement",
    description: "Standard landlord-tenant lease contract including monthly rent details, deposit, and term parameters.",
    bodyText: `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement is entered into on this {{date}} between {{landlordName}}, residing at {{landlordAddress}} (hereinafter referred to as the "Lessor"), and {{clientName}}, residing at {{clientAddress}} (hereinafter referred to as the "Lessee").

WHEREAS, the Lessor is the owner of the residential property situated at {{propertyAddress}}; and
WHEREAS, the Lessee desires to rent the said property for residential purposes.

NOW, THEREFORE, IT IS AGREED AS FOLLOWS:
1. TERM: This lease shall commence on {{leaseStartDate}} and continue for a period of 11 months.
2. RENT: The Lessee agrees to pay a monthly rent of {{monthlyRent}} on or before the 5th of each calendar month.
3. SECURITY DEPOSIT: The Lessee has deposited a sum of {{securityDeposit}} as an interest-free security deposit, refundable upon vacancy.
4. UTILITIES: The Lessee shall be liable to pay electricity, water, and maintenance charges during the lease term.

IN WITNESS WHEREOF, the parties hereto have signed this agreement on the day and year first written above.

_______________________
Lessor: {{landlordName}}

_______________________
Lessee: {{clientName}}
Phone: {{clientPhone}}

WITNESSES:
1. {{witnessOne}}
2. {{witnessTwo}}`
  },
  {
    title: "Affidavit of Income & Declared Assets",
    description: "A sworn declaration of annual financial income, active assets, and employment standings.",
    bodyText: `AFFIDAVIT OF DECLARED INCOME & ASSETS

I, {{clientName}}, residing at {{clientAddress}}, do hereby solemnly affirm, declare, and state as follows:

1. That I am a citizen of India and currently employed as/engaged in {{profession}}.
2. That my gross annual income from all legitimate sources for the financial year is {{annualIncome}}.
3. That the statements made regarding my income and assets are true, accurate, and correct to the best of my personal knowledge and belief.
4. That I make this solemn affirmation in connection with {{affidavitPurpose}} and verify that no material fact has been concealed.

Solemnly affirmed at {{place}} on this {{date}}.

_______________________
Deponent: {{clientName}}
Phone: {{clientPhone}}

VERIFICATION:
Verified at {{place}} on this {{date}} that the contents of the above affidavit are true and correct, and nothing material has been concealed therefrom.

_______________________
Deponent: {{clientName}}`
  },
  {
    title: "General Litigation Court Affidavit",
    description: "Standard legal court affidavit formatted for litigations, claims, and case pleadings.",
    bodyText: `BEFORE THE HONORABLE COURT OF {{courtName}}

In the Matter of:
{{caseTitle}}
(Case Reference ID: {{caseRefId}})

AFFIDAVIT

I, {{clientName}}, residing at {{clientAddress}}, do hereby solemnly affirm and declare on oath as follows:

1. That I am the Plaintiff/Petitioner in the above-captioned matter and am fully conversant with the facts and circumstances of the case.
2. That the statements made in the accompanying petition/application are true and correct to my knowledge and belief.
3. That I have read and understood the contents of this affidavit, and I declare under oath that the statements contained herein are true.

Deponent:
_______________________
{{clientName}}

Solemnly affirmed and signed before me on this {{date}} at {{place}}.

_______________________
Authorized Notary / Commissioner of Oaths`
  }
];

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch templates
    let templates = await prisma.documentTemplate.findMany({
      orderBy: { title: "asc" }
    });

    // 2. If table is empty, auto-seed default preset templates
    if (templates.length === 0) {
      console.log("No legal document templates found. Seeding default presets...");
      await prisma.documentTemplate.createMany({
        data: defaultTemplates
      });
      
      templates = await prisma.documentTemplate.findMany({
        orderBy: { title: "asc" }
      });
    }

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Failed to fetch/seed templates:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, bodyText } = body;

    if (!title || !bodyText) {
      return NextResponse.json({ error: "Title and Body Text are required" }, { status: 400 });
    }

    const newTemplate = await prisma.documentTemplate.create({
      data: {
        title,
        description: description || "",
        bodyText
      }
    });

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error("Failed to create document template:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
