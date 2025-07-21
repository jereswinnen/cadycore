'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BibData {
  bib_number: string;
  photo_count: number;
  latest_upload: string | null;
  has_survey: boolean;
  has_payment: boolean;
  is_paid: boolean;
  payment_amount: number;
}

export default function AdminDashboard() {
  const [bibs, setBibs] = useState<BibData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchBibs();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchBibs(true); // Silent refresh
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchBibs = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError('');
      } else {
        setRefreshing(true);
      }

      const response = await fetch('/api/admin/bibs');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bibs');
      }

      setBibs(data.data || []);
      setLastUpdated(new Date());
      if (!silent) {
        setError('');
      }
    } catch (err: any) {
      if (!silent) {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredBibs = bibs.filter(bib =>
    bib.bib_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusBadge = (bib: BibData) => {
    if (bib.is_paid) {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">Paid</span>;
    }
    if (bib.has_payment) {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">Payment Pending</span>;
    }
    if (bib.has_survey) {
      return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">Survey Complete</span>;
    }
    if (bib.photo_count > 0) {
      return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">Photos Available</span>;
    }
    return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">No Photos</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
          <button
            onClick={fetchBibs}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Admin Dashboard
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Manage race photos and monitor bib number status
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Link
                  href="/admin/upload"
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Upload Photos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{bibs.length}</div>
            <div className="text-sm text-gray-600">Total Bibs</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {bibs.filter(b => b.photo_count > 0).length}
            </div>
            <div className="text-sm text-gray-600">With Photos</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {bibs.filter(b => b.has_survey).length}
            </div>
            <div className="text-sm text-gray-600">Surveys Complete</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">
              {bibs.filter(b => b.is_paid).length}
            </div>
            <div className="text-sm text-gray-600">Paid</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search bib numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => fetchBibs()}
                disabled={refreshing}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                    Refreshing...
                  </>
                ) : (
                  'Refresh'
                )}
              </button>
            </div>
            
            {/* Live Update Status */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${refreshing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span>Auto-refreshes every 30 seconds</span>
                {refreshing && <span className="ml-2 text-blue-600">• Updating now</span>}
              </div>
              {lastUpdated && (
                <span>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bibs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bib Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Photos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBibs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'No bibs match your search.' : 'No bibs found. Upload some photos to get started!'}
                    </td>
                  </tr>
                ) : (
                  filteredBibs.map((bib) => (
                    <tr key={bib.bib_number} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {bib.bib_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {bib.photo_count} photo{bib.photo_count !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(bib)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {bib.is_paid ? formatCurrency(bib.payment_amount) : '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(bib.latest_upload)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/photo/${bib.bib_number}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          target="_blank"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/upload?bib=${bib.bib_number}`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Add Photos
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}