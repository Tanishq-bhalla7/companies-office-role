"use client";

import { useState } from 'react';

export default function Home() {
  // State for search
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for the selected company & contact details
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [saveStatus, setSaveStatus] = useState('');

  // 1. Search Function
  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setError('');
    setResults([]);
    setSelectedCompany(null); // Reset selection on new search

    try {
      const res = await fetch(`/api/search?name=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        // The NZ API usually returns a list of items. 
        // Adjust 'data.items' if the structure is different based on the specific endpoint you used.
        setResults(data.items || data.list || []); 
      }
    } catch (err) {
      setError('Failed to fetch companies.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Save to Zoho Function
  const handleSaveToZoho = async () => {
    if (!selectedCompany || !formData.lastName) {
      alert("Please select a company and enter at least a Last Name.");
      return;
    }

    setSaveStatus('Saving...');

    try {
      const payload = {
        companyName: selectedCompany.name, // Ensure this matches NZ API property
        nzbn: selectedCompany.nzbn,       // Ensure this matches NZ API property
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      };

      const res = await fetch('/api/create-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.success) {
        setSaveStatus('Success! Record created in Zoho.');
        // Optional: Clear form
        setFormData({ firstName: '', lastName: '', email: '' });
        setSelectedCompany(null);
      } else {
        setSaveStatus(`Error: ${result.error}`);
      }
    } catch (err) {
      setSaveStatus('System Error: Could not save.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-blue-100 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">NZ Companies Search</h1>
          <p className="text-gray-500 text-center mt-2">
            Find a company and create a Zoho Contact.
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Company Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Spark New Zealand"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {loading ? '...' : 'Search'}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        {/* Results List */}
        {results.length > 0 && !selectedCompany && (
          <div className="mb-6 border rounded max-h-48 overflow-y-auto">
            {results.map((company, index) => (
              <div 
                key={index} 
                onClick={() => setSelectedCompany(company)}
                className="p-3 border-b hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div className="font-semibold text-gray-800">{company.name}</div>
                <div className="text-xs text-gray-500">NZBN: {company.nzbn}</div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Company Form */}
        {selectedCompany && (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-blue-800 text-sm">Selected: {selectedCompany.name}</h3>
              <button onClick={() => setSelectedCompany(null)} className="text-xs text-gray-500 hover:text-red-500">Change</button>
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="First Name"
                className="w-full p-2 border rounded text-sm"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
              <input
                type="text"
                placeholder="Last Name (Required)"
                className="w-full p-2 border rounded text-sm"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full p-2 border rounded text-sm"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <button
              onClick={handleSaveToZoho}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Create Zoho Record
            </button>
            
            {saveStatus && (
              <p className={`text-center text-xs mt-2 font-bold ${saveStatus.includes('Success') ? 'text-green-600' : 'text-orange-600'}`}>
                {saveStatus}
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6">
           <p className="text-xs text-gray-400">Powered by Next.js & Zoho</p>
        </div>

      </div>
    </div>
  );
}