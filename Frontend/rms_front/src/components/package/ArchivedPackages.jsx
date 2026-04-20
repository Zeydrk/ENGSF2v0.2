import React, { useEffect, useState } from 'react';
import { 
  FiTruck, 
  FiSearch, 
  FiEye,
  FiRotateCcw,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiPackage
} from 'react-icons/fi';

const ArchivedPackages = () => {
  const [archivedPackages, setArchivedPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Load archived packages
  const loadArchivedPackages = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/packages/archived/all');
      const data = await response.json();
      setArchivedPackages(data);
    } catch (error) {
      console.error('Error loading archived packages:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadArchivedPackages();
  }, []);

  // Filter packages based on search term
  const filteredPackages = archivedPackages.filter(pkg => {
    return pkg.package_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           pkg.buyer_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           pkg.seller_Name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPackages = filteredPackages.slice(startIndex, startIndex + itemsPerPage);

  // Handle restore package
  const handleRestorePackage = async (packageId) => {
    try {
      const response = await fetch('http://localhost:3000/packages/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: packageId }),
      });
      
      if (!response.ok) throw new Error('Failed to restore package');
      
      alert('Package restored successfully');
      await loadArchivedPackages();
      setShowRestoreConfirm(null);
    } catch (error) {
      console.error('Error restoring package:', error);
      alert('Error restoring package. Please try again.');
    }
  };

  // Handle permanent delete
const handlePermanentDelete = async (packageId) => {
  try {
    // Option A: Using the same endpoint with permanent flag
    const response = await fetch('http://localhost:3000/packages/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        id: packageId, 
        permanent: true  // Add this flag
      }),
    });
    
    // Option B: Using separate endpoint
    // const response = await fetch('http://localhost:3000/packages/delete-permanent', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ id: packageId }),
    // });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete package permanently');
    }
    
    alert('Package permanently deleted');
    await loadArchivedPackages();
    setShowDeleteConfirm(null);
  } catch (error) {
    console.error('Error deleting package:', error);
    alert(`Error: ${error.message}`);
  }
};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r pb-5 from-gray-700 to-gray-800">
              Archived Packages
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-lg">
              View and manage archived packages
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search archived packages..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="block text-black w-full pl-10 sm:pl-12 pr-3 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Packages Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">
                  Package ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">
                  Package Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">
                  Buyer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">
                  Archived At
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <FiPackage className="w-8 h-8 mx-auto mb-3 animate-pulse" />
                      <p className="text-lg font-medium">Loading archived packages...</p>
                    </div>
                  </td>
                </tr>
              ) : currentPackages.length > 0 ? (
                currentPackages.map((pkg) => (
                  <tr 
                    key={pkg.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                        #{pkg.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {pkg.package_Name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{pkg.seller_Name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{pkg.buyer_Name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {formatDate(pkg.archivedAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {pkg.archiveReason || 'manual_delete'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowRestoreConfirm(pkg.id)}
                          className="p-2 text-green-600 hover:text-green-500 hover:bg-green-100 rounded-lg transition-colors duration-200"
                          title="Restore Package"
                        >
                          <FiRotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(pkg.id)}
                          className="p-2 text-red-600 hover:text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          title="Delete Permanently"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {/* View details logic here */}}
                          className="p-2 text-blue-600 hover:text-blue-500 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <FiPackage className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No archived packages found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredPackages.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPackages.length)} of {filteredPackages.length} packages
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg transition-all duration-200 font-medium ${
                    currentPage === page
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  currentPage === totalPages 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                <FiRotateCcw className="w-6 h-6 text-green-500" />
                <span>Restore Package</span>
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to restore this package? It will be moved back to the active packages list.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRestoreConfirm(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRestorePackage(showRestoreConfirm)}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600"
                >
                  Restore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-red-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                <FiTrash2 className="w-6 h-6 text-red-500" />
                <span>Permanent Delete</span>
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                ⚠️ <strong>Warning:</strong> This will permanently delete the package from the database. This action cannot be undone!
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePermanentDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivedPackages;