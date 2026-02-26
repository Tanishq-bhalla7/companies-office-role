'use client';

import React, { useState, useEffect } from 'react';
import { getZohoAccountContext } from '@/lib/zoho-widget';
import {
  Search,
  Filter,
  Building2,
  User,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Briefcase,
  Loader2,
  Download,
  Check,
  X,
} from 'lucide-react';

// --- Helper Components ---
const StatusBadge = ({ status }) => {
  const styles = status === 'Registered'
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : 'bg-slate-100 text-slate-600 border-slate-200';

  const Icon = status === 'Registered' ? CheckCircle2 : XCircle;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};

const RoleBadge = ({ role }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
    <User size={12} />
    {role}
  </span>
);

export default function NZCompanyWidget() {
    // Replace the mock data search with a real API call
    const handleSearch = async (event) => {
      event.preventDefault();
      if (!searchParams.firstName && !searchParams.lastName && !zohoContext.nzbn) {
        setErrorMessage('Please enter a name or NZBN.');
        return;
      }
      setErrorMessage('');
      setLoading(true);
      try {
        const response = await fetch('/api/nz-company-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: searchParams.firstName,
            lastName: searchParams.lastName,
            nzbn: zohoContext.nzbn || '',
          }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || 'NZ Companies search failed.');
        }
        // Map API response to results
        setResults(payload.results?.entities || []);
        setLoading(false);
        setStep('results');
      } catch (error) {
        setErrorMessage(error.message || 'Unable to search registry.');
        setLoading(false);
      }
    };
  const [zohoContext, setZohoContext] = useState({ accountId: '', nzbn: '', accountName: '' });
  const [step, setStep] = useState('search');
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({ firstName: '', lastName: '' });
  const [results, setResults] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filters, setFilters] = useState({ roles: [], status: 'All' });
  const [viewDetails, setViewDetails] = useState(null);
  const [importing, setImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [importSummary, setImportSummary] = useState({
    contactId: '',
    createdAccounts: 0,
  });

  // ...rest of your component code (renderSearchStep, renderResultsStep, etc.)...

  const toggleSelection = (id) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleImport = async () => {
    setImporting(true);
    setErrorMessage('');

    try {
      const entities = results.filter((item) => selectedIds.has(item.id));
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          person: {
            firstName: searchParams.firstName,
            lastName: searchParams.lastName,
          },
          entities,
          zohoContext,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Import to Zoho failed.');
      }

      setImportSummary({
        contactId: payload?.summary?.contactId || '',
        createdAccounts: payload?.summary?.createdAccounts || 0,
      });
      setStep('success');
    } catch (error) {
      setErrorMessage(error.message || 'Unable to import data.');
    } finally {
      setImporting(false);
    }
  };

  const filteredResults = results.filter((item) => {
    const matchRole = filters.roles.length === 0 || filters.roles.includes(item.role);
    const matchStatus = filters.status === 'All'
      || (filters.status === 'Active' && item.status === 'Registered')
      || (filters.status === 'Inactive' && item.status !== 'Registered');
    return matchRole && matchStatus;
  });

  const resetSearch = () => {
    setStep('search');
    setResults([]);
    setSelectedIds(new Set());
    setSearchParams({ firstName: '', lastName: '' });
    setErrorMessage('');
    setImportSummary({ contactId: '', createdAccounts: 0 });
  };

  const renderSearchStep = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
      <div className="bg-blue-50 p-4 rounded-2xl mb-6 shadow-sm">
        <Building2 className="w-12 h-12 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">NZ Companies Search</h2>
      <p className="text-slate-500 mb-8 max-w-md">
        Enter an individual's name to find their directorships and shareholdings from the NZ Companies Office register.
        {zohoContext.accountId && (
          <span className="block mt-2 text-xs text-blue-700 font-semibold">Zoho Account ID: {zohoContext.accountId} | NZBN: {zohoContext.nzbn}</span>
        )}
      </p>

      <form onSubmit={handleSearch} className="w-full max-w-md space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">First Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm text-slate-800 placeholder:text-slate-300"
              placeholder="e.g. John"
              value={searchParams.firstName}
              onChange={(event) => setSearchParams({ ...searchParams, firstName: event.target.value })}
            />
          </div>
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Last Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm text-slate-800 placeholder:text-slate-300"
              placeholder="e.g. Doe"
              value={searchParams.lastName}
              onChange={(event) => setSearchParams({ ...searchParams, lastName: event.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-4"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
          {loading ? 'Searching Registry...' : 'Search Registry'}
        </button>
      </form>
    </div>
  );

  const renderResultsStep = () => (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Search Results</h2>
          <p className="text-sm text-slate-500">
            Found {filteredResults.length} entities for
            {' '}
            <span className="font-semibold text-slate-700">{searchParams.firstName} {searchParams.lastName}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <Filter size={14} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-600">Roles:</span>
            {['Director', 'Shareholder'].map((role) => (
              <button
                key={role}
                onClick={() => {
                  const newRoles = filters.roles.includes(role)
                    ? filters.roles.filter((currentRole) => currentRole !== role)
                    : [...filters.roles, role];
                  setFilters({ ...filters, roles: newRoles });
                }}
                className={`text-xs px-2 py-0.5 rounded-md transition-colors ${filters.roles.includes(role) ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-0">
        {filteredResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Building2 size={48} className="mb-4 opacity-20" />
            <p>No companies found matching your filters.</p>
          </div>
        ) : (
          filteredResults.map((item) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`group relative flex items-start p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-white'}`}
              >
                <div
                  className="pt-1 pr-4 cursor-pointer"
                  onClick={() => toggleSelection(item.id)}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}>
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>

                <div className="flex-1 cursor-pointer" onClick={() => setViewDetails(item)}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{item.name}</h3>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-400" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">NZBN: {item.nzbn}</span>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <RoleBadge role={item.role} />
                    <span className="text-xs text-slate-400">Inc: {item.incorporationDate}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between bg-white sticky bottom-0">
        <button
          onClick={resetSearch}
          className="text-slate-500 hover:text-slate-700 text-sm font-medium px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors"
        >
          Cancel Search
        </button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">
            <strong className="text-slate-800">{selectedIds.size}</strong>
            {' '}
            entities selected
          </span>
          <button
            onClick={handleImport}
            disabled={selectedIds.size === 0 || importing}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium shadow-lg transition-all ${selectedIds.size === 0 ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200 hover:translate-y-[-1px]'}`}
          >
            {importing ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            Import to Zoho
          </button>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
        <CheckCircle2 size={40} />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Import Successful!</h2>
      <p className="text-slate-500 max-w-sm mb-3">
        Created
        {' '}
        <strong className="text-slate-800">{importSummary.createdAccounts || selectedIds.size} Accounts</strong>
        {' '}
        in Zoho CRM and linked
        {' '}
        <strong className="text-slate-800">{searchParams.firstName} {searchParams.lastName}</strong>
        {' '}
        as the contact.
      </p>
      {importSummary.contactId ? (
        <p className="text-xs text-slate-400 mb-8">Contact ID: {importSummary.contactId}</p>
      ) : (
        <div className="mb-8" />
      )}
      <button
        onClick={resetSearch}
        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
      >
        <Search size={18} />
        Start New Search
      </button>
    </div>
  );

  const DetailsModal = () => {
    if (!viewDetails) {
      return null;
    }

    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">Entity Details</h3>
            <button onClick={() => setViewDetails(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/50 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
              <p className="text-xl font-semibold text-slate-800">{viewDetails.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">NZBN</label>
                <p className="font-mono text-sm text-slate-600 mt-1">{viewDetails.nzbn}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                <div className="mt-1"><StatusBadge status={viewDetails.status} /></div>
              </div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
              <div className="flex items-start gap-3">
                <Briefcase className="text-blue-500 mt-0.5" size={16} />
                <div>
                  <p className="text-xs font-bold text-blue-900 uppercase">Individual Role</p>
                  <p className="text-blue-800 font-medium">{viewDetails.individualName}</p>
                  <p className="text-sm text-blue-600">{viewDetails.role} {viewDetails.role === 'Shareholder' && `(${viewDetails.shareAllocation})`}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Address</label>
              <p className="text-slate-600 mt-1">{viewDetails.address}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => {
                if (!selectedIds.has(viewDetails.id)) {
                  toggleSelection(viewDetails.id);
                }
                setViewDetails(null);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedIds.has(viewDetails.id) ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            >
              {selectedIds.has(viewDetails.id) ? 'Selected' : 'Select for Import'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto h-[650px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden font-sans relative">
        <DetailsModal />

        <div className="h-16 bg-white border-b border-slate-100 flex items-center px-6 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">Z</div>
            <span className="font-semibold text-slate-700 tracking-tight">Zoho <span className="text-slate-400">/</span> NZ Companies</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full transition-all ${step === 'search' ? 'w-6 bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`h-2 w-2 rounded-full transition-all ${step === 'results' ? 'w-6 bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`h-2 w-2 rounded-full transition-all ${step === 'success' ? 'w-6 bg-green-500' : 'bg-slate-200'}`} />
          </div>
        </div>

        <div className="h-[calc(100%-64px)] p-6 bg-slate-50/50 relative">
          {step === 'search' && renderSearchStep()}
          {step === 'results' && renderResultsStep()}
          {step === 'success' && renderSuccessStep()}
        </div>
      </div>
    </main>
  );
}
