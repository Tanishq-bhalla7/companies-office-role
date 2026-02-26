"use client";
import { useState } from 'react';

export default function CompanyWidget() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states for the Contact
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });

  const searchCompanies = async () => {
    setLoading(true);
    const res = await fetch(`/api/search?name=${query}`);
    const data = await res.json();
    setResults(data.items || []); // Adjust .items based on actual NZ API response structure
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedCompany) return;
    setLoading(true);
    
    const payload = {
      companyName: selectedCompany.name,
      nzbn: selectedCompany.nzbn,
      ...formData
    };

    const res = await fetch('/api/create-contact', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    alert(result.success ? "Saved to Zoho!" : "Error: " + result.error);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-bold">NZ Company Widget</h1>
      
      {/* Search Section */}
      <div className="flex gap-2">
        <input 
          className="border p-2 flex-1 rounded"
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Enter Company Name" 
        />
        <button onClick={searchCompanies} className="bg-blue-600 text-white p-2 rounded">
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {/* Results List */}
      {results.length > 0 && !selectedCompany && (
        <ul className="border rounded max-h-60 overflow-y-auto">
          {results.map((company, i) => (
            <li 
              key={i} 
              className="p-2 hover:bg-gray-100 cursor-pointer border-b"
              onClick={() => setSelectedCompany(company)}
            >
              <div className="font-bold">{company.name}</div>
              <div className="text-sm text-gray-500">NZBN: {company.nzbn}</div>
            </li>
          ))}
        </ul>
      )}

      {/* Selected Company & Contact Form */}
      {selectedCompany && (
        <div className="bg-gray-50 p-4 rounded border">
          <h3 className="font-bold text-green-700 mb-2">Selected: {selectedCompany.name}</h3>
          
          <input 
            className="border p-2 w-full mb-2 rounded"
            placeholder="First Name" 
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          />
          <input 
            className="border p-2 w-full mb-2 rounded"
            placeholder="Last Name" 
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
          />
          <input 
            className="border p-2 w-full mb-2 rounded"
            placeholder="Email" 
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          
          <div className="flex gap-2 mt-2">
             <button onClick={handleSave} className="bg-green-600 text-white p-2 rounded w-full">
              Create Record
            </button>
            <button onClick={() => setSelectedCompany(null)} className="text-gray-500 p-2">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}