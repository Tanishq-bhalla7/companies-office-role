export const crmFieldMapping = {
  accountModule: process.env.ZOHO_ACCOUNT_MODULE || 'Accounts',
  contactModule: process.env.ZOHO_CONTACT_MODULE || 'Contacts',
  account: {
    name: process.env.ZOHO_FIELD_ACCOUNT_NAME || 'Account_Name',
    nzbn: process.env.ZOHO_FIELD_ACCOUNT_NZBN || 'NZBN',
    address: process.env.ZOHO_FIELD_ACCOUNT_ADDRESS || 'Billing_Street',
    status: process.env.ZOHO_FIELD_ACCOUNT_STATUS || 'Status',
    role: process.env.ZOHO_FIELD_ACCOUNT_ROLE || 'Description',
    incorporationDate: process.env.ZOHO_FIELD_ACCOUNT_INCORP_DATE || 'Description',
    contactLookupField: process.env.ZOHO_FIELD_ACCOUNT_CONTACT_LOOKUP || '',
  },
  contact: {
    firstName: process.env.ZOHO_FIELD_CONTACT_FIRST_NAME || 'First_Name',
    lastName: process.env.ZOHO_FIELD_CONTACT_LAST_NAME || 'Last_Name',
  },
};

const addIfPresent = (record, key, value) => {
  if (!key || value === undefined || value === null || value === '') {
    return;
  }
  record[key] = value;
};

export const buildContactRecord = ({ firstName, lastName }) => {
  const record = {};
  addIfPresent(record, crmFieldMapping.contact.firstName, firstName);
  addIfPresent(record, crmFieldMapping.contact.lastName, lastName || 'Unknown');
  return record;
};

export const buildAccountRecord = ({ entity, contactId }) => {
  const record = {};

  addIfPresent(record, crmFieldMapping.account.name, entity.name);
  addIfPresent(record, crmFieldMapping.account.nzbn, entity.nzbn);
  addIfPresent(record, crmFieldMapping.account.address, entity.address);
  addIfPresent(record, crmFieldMapping.account.status, entity.status);

  const roleWithShare = entity.role === 'Shareholder'
    ? `${entity.role}${entity.shareAllocation ? ` (${entity.shareAllocation})` : ''}`
    : entity.role;

  if (crmFieldMapping.account.role === crmFieldMapping.account.incorporationDate) {
    addIfPresent(record, crmFieldMapping.account.role, `${roleWithShare || ''} | Incorporated: ${entity.incorporationDate || ''}`.trim());
  } else {
    addIfPresent(record, crmFieldMapping.account.role, roleWithShare);
    addIfPresent(record, crmFieldMapping.account.incorporationDate, entity.incorporationDate);
  }

  if (crmFieldMapping.account.contactLookupField && contactId) {
    record[crmFieldMapping.account.contactLookupField] = {
      id: contactId,
    };
  }

  return record;
};
