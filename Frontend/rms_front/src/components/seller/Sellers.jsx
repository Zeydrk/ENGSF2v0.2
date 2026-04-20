import React, { useEffect, useState } from 'react';
import { useSeller } from '../../hooks/useSeller';
import { 
  FiSearch, 
  FiEdit2, 
  FiPlus,
  FiX,
  FiSave,
  FiTrash2,
  FiMail,
  FiPhone,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw
} from 'react-icons/fi';

const Sellers = () => {
  const { 
    sellers, 
    getAllSellers, 
    createSeller, 
    updateSeller, 
    deleteSeller, 
    claimSeller,
  } = useSeller();
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showClaimConfirm, setShowClaimConfirm] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    seller_Name: "",
    seller_Email: "",
    seller_Phone: "",
  });

  // Load sellers on component mount
  useEffect(() => {
    loadSellers();
  }, []);

  async function loadSellers() {
    setLoading(true);
    await getAllSellers();
    setLoading(false);
  }

  function resetForm() {
    setFormData({ 
      seller_Name: "", 
      seller_Email: "", 
      seller_Phone: "" 
    });
  }

  // Filter sellers based on search term
  const filteredSellers = sellers.filter(seller =>
    seller.seller_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.id?.toString().includes(searchTerm) ||
    seller.seller_Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.seller_Phone?.includes(searchTerm)
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSellers = filteredSellers.slice(startIndex, startIndex + itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open form for adding new seller
  const handleAddSeller = () => {
    setEditingSeller(null);
    resetForm();
    setIsFormOpen(true);
  };

  // Open form for editing seller
  const handleEditSeller = (seller) => {
    setEditingSeller(seller);
    setFormData({
      seller_Name: seller.seller_Name || "",
      seller_Email: seller.seller_Email || "",
      seller_Phone: seller.seller_Phone || "",
    });
    setIsFormOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSeller) {
        // Update existing seller
        await updateSeller({ 
          id: editingSeller.id, 
          ...formData 
        });
        alert('Seller updated successfully!');
      } else {
        // Add new seller
        await createSeller(formData);
        alert(`Seller added successfully!`);
      }
      
      setIsFormOpen(false);
      resetForm();
      setCurrentPage(1); // Reset to first page after adding/editing
    } catch (error) {
      console.error('Error saving seller:', error);
      alert(error.response?.data?.error || 'Error saving seller. Please try again.');
    }
  };

  // Handle delete seller
  const handleDeleteSeller = async (sellerId) => {
    try {
      await deleteSeller(sellerId);
      setShowDeleteConfirm(null);
      // Adjust current page if needed after deletion
      if (currentSellers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Error deleting seller:', error);
      alert('Error deleting seller. Please try again.');
    }
  };

  // Handle claim seller (cashout)
  const handleClaimSeller = async (sellerId) => {
    try {
      await claimSeller(sellerId);
      setShowClaimConfirm(null);
    } catch (error) {
      console.error('Error processing claim:', error);
      alert(error.response?.data?.error || 'Error processing claim. Please try again.');
    }
  };

  // Reset form
  const handleCancel = () => {
    setIsFormOpen(false);
    resetForm();
    setEditingSeller(null);
  };

  // Generate page numbers for pagination
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

  const formatBalance = (balance) => {
    return `₱${parseFloat(balance || 0).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r pb-5 from-amber-700 to-orange-800">
              Seller Management
            </h1>
            <p className="text-amber-700 mt-1 sm:mt-2 text-sm sm:text-lg">
              Manage all your sellers and their contact information
            </p>
          </div>
          
          {/* Add Seller Button */}
          <button
            onClick={handleAddSeller}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:from-amber-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
          >
            <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Add Seller</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
            </div>
            <input
              type="text"
              placeholder="Search sellers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="block w-full pl-10 sm:pl-12 pr-3 py-2 sm:py-3 border border-amber-200 rounded-xl bg-amber-50 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm sm:text-base text-black"
            />
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Seller ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Seller Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Cashout
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="text-amber-500">
                      <FiUsers className="w-8 h-8 mx-auto mb-3 animate-pulse" />
                      <p className="text-lg font-medium">Loading sellers...</p>
                    </div>
                  </td>
                </tr>
              ) : currentSellers.length > 0 ? (
                currentSellers.map((seller) => (
                  <tr 
                    key={seller.id}
                    className="hover:bg-amber-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 bg-amber-100 px-3 py-1 rounded-full">
                        #{seller.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                          {seller.seller_Name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 block">
                            {seller.seller_Name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiMail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {seller.seller_Email || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiPhone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">{seller.seller_Phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-green-600">
                          {formatBalance(seller.balance)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditSeller(seller)}
                          className="p-2 text-amber-600 hover:text-amber-500 hover:bg-amber-100 rounded-lg transition-colors duration-200"
                          title="Edit Seller"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(seller.id)}
                          className="p-2 text-red-600 hover:text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          title="Delete Seller"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setShowClaimConfirm(seller.id)}
                        className="px-3 py-1 text-xs font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200"
                        title="Cashout - Reset balance and delete claimed packages"
                      >
                        Cashout
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-amber-500">
                      <FiUsers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No sellers found</p>
                      <p className="text-sm">Try adjusting your search terms</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8 text-center">
            <div className="text-amber-500">
              <FiUsers className="w-12 h-12 mx-auto mb-3 animate-pulse" />
              <p className="text-lg font-medium">Loading sellers...</p>
            </div>
          </div>
        ) : currentSellers.length > 0 ? (
          currentSellers.map((seller) => (
            <div 
              key={seller.id}
              className="bg-white rounded-2xl shadow-lg border border-amber-100 p-4 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {seller.seller_Name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{seller.seller_Name}</h3>
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                      #{seller.id}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditSeller(seller)}
                    className="p-1 text-amber-600 hover:text-amber-500 hover:bg-amber-100 rounded-lg transition-colors duration-200"
                    title="Edit Seller"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(seller.id)}
                    className="p-1 text-red-600 hover:text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200"
                    title="Delete Seller"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <FiMail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span className="truncate">{seller.seller_Email || 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiPhone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span>{seller.seller_Phone || 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm text-green-600 font-semibold">
                  <span>{formatBalance(seller.balance)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-amber-100">
                <div></div>
                <button
                  onClick={() => setShowClaimConfirm(seller.id)}
                  className="px-3 py-1 text-xs font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200"
                  title="Cashout"
                >
                  Cashout
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8 text-center">
            <div className="text-amber-500">
              <FiUsers className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No sellers found</p>
              <p className="text-sm">Try adjusting your search terms</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredSellers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-4 sm:p-6 mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSellers.length)} of {filteredSellers.length} sellers
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                }`}
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg transition-all duration-200 font-medium ${
                    currentPage === page
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  currentPage === totalPages 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                }`}
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seller Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="p-4 sm:p-6 border-b border-amber-100 sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {editingSeller ? 'Edit Seller' : 'Add New Seller'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-1 sm:p-2 hover:bg-amber-100 rounded-lg transition-colors duration-200"
                >
                  <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seller Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="seller_Name"
                    value={formData.seller_Name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 text-black transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter seller name"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FiUsers className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="seller_Email"
                    value={formData.seller_Email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 text-black transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter email address"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FiMail className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="seller_Phone"
                    value={formData.seller_Phone}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 text-black transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter phone number"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FiPhone className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-amber-300 text-amber-700 rounded-xl font-semibold hover:bg-amber-50 transition-colors duration-200 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <FiSave className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{editingSeller ? 'Update' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-4 sm:p-6 border-b border-red-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center space-x-2">
                <FiTrash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                <span>Delete Seller</span>
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Are you sure you want to delete this seller? This action cannot be undone and all seller data will be permanently removed.
              </p>
              <div className="flex space-x-2 sm:space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteSeller(showDeleteConfirm)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                >
                  Delete Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Claim Confirmation Modal */}
      {showClaimConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-4 sm:p-6 border-b border-amber-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                <span>Cashout Seller</span>
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Confirm cashout? This will reset the seller's balance to zero and delete all claimed packages.
              </p>
              <div className="flex space-x-2 sm:space-x-3">
                <button
                  onClick={() => setShowClaimConfirm(null)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleClaimSeller(showClaimConfirm)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                >
                  Confirm Cashout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sellers;