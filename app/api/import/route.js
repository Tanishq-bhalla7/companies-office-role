import { NextResponse } from 'next/server';
import { buildAccountRecord, buildContactRecord, crmFieldMapping } from '@/lib/field-mapping';

const requiredEnv = [
  'ZOHO_CLIENT_ID',
  'ZOHO_CLIENT_SECRET',
  'ZOHO_REFRESH_TOKEN',
];

const accountsDomain = process.env.ZOHO_ACCOUNTS_DOMAIN || 'https://accounts.zoho.com';
const apiDomain = process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com';

const assertEnv = () => {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
};

const getAccessToken = async () => {
  const url = `${accountsDomain}/oauth/v2/token`;
  const formData = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    grant_type: 'refresh_token',
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
    cache: 'no-store',
  });

  const json = await response.json();
  if (!response.ok || !json.access_token) {
    throw new Error(`Unable to get Zoho access token: ${json.error || response.statusText}`);
  }

  return json.access_token;
};

const zohoRequest = async ({ accessToken, path, method = 'POST', data }) => {
  const response = await fetch(`${apiDomain}${path}`, {
    method,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
    cache: 'no-store',
  });

  const json = await response.json();
  if (!response.ok) {
    const first = json?.data?.[0];
    throw new Error(first?.message || json?.message || `Zoho request failed (${response.status})`);
  }

  return json;
};

const createContact = async ({ accessToken, person }) => {
  const contactRecord = buildContactRecord(person);
  const payload = {
    data: [contactRecord],
    trigger: [],
  };

  const response = await zohoRequest({
    accessToken,
    path: `/crm/v6/${crmFieldMapping.contactModule}`,
    data: payload,
  });

  const contactId = response?.data?.[0]?.details?.id;
  if (!contactId) {
    throw new Error('Zoho did not return a Contact ID.');
  }

  return contactId;
};

const createAccounts = async ({ accessToken, entities, contactId }) => {
  const accountRecords = entities.map((entity) => buildAccountRecord({ entity, contactId }));
  const payload = {
    data: accountRecords,
    trigger: [],
  };

  const response = await zohoRequest({
    accessToken,
    path: `/crm/v6/${crmFieldMapping.accountModule}`,
    data: payload,
  });

  return response?.data || [];
};

export async function POST(request) {
  try {
    assertEnv();
    const body = await request.json();

    const person = body?.person;
    const entities = body?.entities;

    if (!person?.firstName || !person?.lastName) {
      return NextResponse.json({ error: 'First name and last name are required.' }, { status: 400 });
    }

    if (!Array.isArray(entities) || entities.length === 0) {
      return NextResponse.json({ error: 'At least one entity must be selected.' }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    const contactId = await createContact({ accessToken, person });
    const accountResults = await createAccounts({ accessToken, entities, contactId });

    const createdAccounts = accountResults.filter((item) => item.status === 'success').length;

    return NextResponse.json({
      ok: true,
      summary: {
        contactId,
        createdAccounts,
      },
      details: accountResults,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || 'Unexpected import error.',
      },
      { status: 500 },
    );
  }
}
