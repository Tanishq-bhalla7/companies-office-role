// Helper to detect Zoho CRM widget context and fetch Account info
export async function getZohoAccountContext() {
  // Try to get context from Zoho widget JS API if available
  if (typeof window !== 'undefined' && window.ZOHO && window.ZOHO.CRM && window.ZOHO.CRM.API) {
    try {
      const record = await window.ZOHO.CRM.API.getRecord({ Entity: 'Accounts' });
      if (record && record.data && record.data.length > 0) {
        const account = record.data[0];
        return {
          accountId: account.id,
          nzbn: account.NZBN || '',
          accountName: account.Account_Name || '',
        };
      }
    } catch (e) {
      // fallback below
    }
  }
  // Fallback: try to get from URL params
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return {
      accountId: params.get('accountId') || '',
      nzbn: params.get('nzbn') || '',
      accountName: params.get('accountName') || '',
    };
  }
  return { accountId: '', nzbn: '', accountName: '' };
}
