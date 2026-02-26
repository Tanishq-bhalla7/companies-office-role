import { NextResponse } from 'next/server';

const NZ_COMPANIES_API = 'https://portal.api.business.govt.nz/api/companies-entity-role-search';

export async function POST(request) {
  try {
    const { firstName, lastName, nzbn } = await request.json();
    if (!firstName && !lastName && !nzbn) {
      return NextResponse.json({ error: 'At least one search parameter required.' }, { status: 400 });
    }

    // You must set NZ_COMPANIES_API_KEY in your .env.local
    const apiKey = process.env.NZ_COMPANIES_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'NZ Companies API key missing.' }, { status: 500 });
    }

    const payload = {
      firstName,
      lastName,
      nzbn,
    };

    const response = await fetch(NZ_COMPANIES_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data?.message || 'NZ Companies API error.' }, { status: 500 });
    }

    return NextResponse.json({ results: data });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unexpected error.' }, { status: 500 });
  }
}
