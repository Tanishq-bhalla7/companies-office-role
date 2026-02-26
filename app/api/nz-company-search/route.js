// app/api/search/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  // Endpoint for NZ Companies Office "Entities" search
  const endpoint = `https://api.business.govt.nz/services/v4/companies-office/entities?q=${encodeURIComponent(name)}`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${process.env.NZ_COMPANIES_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) throw new Error(`NZ API Error: ${res.statusText}`);
    const data = await res.json();
    return NextResponse.json(data);
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}