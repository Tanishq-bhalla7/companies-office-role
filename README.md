# Company Role Search (Vercel + Zoho CRM)

This is a Vercel-ready Next.js widget app for searching NZ company roles (mock search currently) and importing selected entities to Zoho CRM.

## 1) Install and run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 2) Environment variables

Copy `.env.example` to `.env.local` and fill values:

- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN`
- Optional domains: `ZOHO_ACCOUNTS_DOMAIN`, `ZOHO_API_DOMAIN`

## 3) Field mapping

All payload mapping is centralized in `lib/field-mapping.js` and can be overridden by env vars in `.env.local`.

Default mapping used:

- Contact module: `Contacts`
  - `First_Name` <- person first name
  - `Last_Name` <- person last name
- Account module: `Accounts`
  - `Account_Name` <- company name
  - `NZBN` <- nzbn
  - `Billing_Street` <- registered address
  - `Status` <- company status
  - `Description` <- role + incorporation date (combined by default)

If you have a contact lookup field on Account, set:

- `ZOHO_FIELD_ACCOUNT_CONTACT_LOOKUP=Your_Lookup_API_Name`

Then each imported account is linked to the created contact.

## 4) Deploy to Vercel

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add all required env vars in Vercel Project Settings.
4. Deploy.

## 5) Use as external CRM widget

For Zoho CRM client script/widget embedding, host this app on Vercel and load it inside your CRM widget container (iframe or web tab, based on your CRM setup). The app calls its own secure API route (`/api/import`) so secrets are never exposed in the browser.
