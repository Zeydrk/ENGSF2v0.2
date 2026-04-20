import React, { useEffect, useState } from 'react';
import { 
  FiTruck, 
  FiSearch, 
  FiEdit2, 
  FiEye,
  FiPlus,
  FiX,
  FiSave,
  FiTrash2,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiPackage
} from 'react-icons/fi';
import { usePackage } from '../../hooks/usePackage';

const Packages = () => {
  const packgApi = usePackage();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingPackage, setViewingPackage] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    seller_Name: "",
    package_Name: "",
    buyer_Name: "",
    dropOff_Date: "",
    package_Size: "S",
    price: "",
    handling_Fee: "",
    payment_Method: "cash",
    // Removed payment_Status and package_Status from form
  });

  const statusOptions = ['All', 'claimed', 'unclaimed'];
  const sizeOptions = ['All', 'S', 'M', 'L'];
  const paymentMethods = ['cash', 'gcash'];

  // Load packages and sellers on component mount
  useEffect(() => {
    loadData();
  }, []);

async function loadData() {
  setLoading(true);
  console.log('Loading packages and sellers...'); // Debug log
  try {
    await packgApi.getAllPackage();
    await packgApi.getAllSellers();
    console.log('Packages loaded:', packgApi.packages.length); // Debug log
  } catch (error) {
    console.error('Error loading data:', error);
  }
  setLoading(false);
}

  function resetForm() {
    setFormData({
      seller_Name: "",
      package_Name: "",
      buyer_Name: "",
      dropOff_Date: "",
      package_Size: "S",
      price: "",
      handling_Fee: "",
      payment_Method: "cash",
    });
    setErrorMessage('');
  }

  // Filter packages based on search term, status, and size
  const filteredPackages = packgApi.packages.filter(pkg => {
    const matchesSearch = pkg.package_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.buyer_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.seller_Name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || pkg.package_Status === selectedStatus;
    const matchesSize = selectedSize === 'All' || pkg.package_Size === selectedSize;
    
    return matchesSearch && matchesStatus && matchesSize;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPackages = filteredPackages.slice(startIndex, startIndex + itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error message when user changes input
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  // Toggle payment status
  const handleTogglePaymentStatus = async (pkg) => {
    try {
      const newPaymentStatus = pkg.payment_Status === 'paid' ? 'unpaid' : 'paid';
      
      // If trying to mark as unpaid and package is claimed, show error
      if (newPaymentStatus === 'unpaid' && pkg.package_Status === 'claimed') {
        setErrorMessage("Cannot mark as unpaid because package is already claimed. Please unclaim it first.");
        return;
      }
      
      await packgApi.updatePackage({ 
        id: pkg.id, 
        seller_Name: pkg.seller_Name,
        package_Name: pkg.package_Name,
        buyer_Name: pkg.buyer_Name,
        dropOff_Date: pkg.dropOff_Date,
        package_Size: pkg.package_Size,
        price: pkg.price,
        handling_Fee: pkg.handling_Fee,
        payment_Method: pkg.payment_Method,
        payment_Status: newPaymentStatus,
        package_Status: pkg.package_Status
      });
      
      await loadData();
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating payment status:', error);
      setErrorMessage(error.message || 'Error updating payment status');
    }
  };

  // Toggle package status
  const handleTogglePackageStatus = async (pkg) => {
    try {
      const newPackageStatus = pkg.package_Status === 'claimed' ? 'unclaimed' : 'claimed';
      
      // Validation: Cannot claim if unpaid
      if (newPackageStatus === 'claimed' && pkg.payment_Status !== 'paid') {
        setErrorMessage("Package cannot be claimed because payment is not completed.");
        return;
      }
      
      await packgApi.updatePackage({ 
        id: pkg.id, 
        seller_Name: pkg.seller_Name,
        package_Name: pkg.package_Name,
        buyer_Name: pkg.buyer_Name,
        dropOff_Date: pkg.dropOff_Date,
        package_Size: pkg.package_Size,
        price: pkg.price,
        handling_Fee: pkg.handling_Fee,
        payment_Method: pkg.payment_Method,
        payment_Status: pkg.payment_Status,
        package_Status: newPackageStatus
      });
      
      await loadData();
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating package status:', error);
      setErrorMessage(error.message || 'Error updating package status');
    }
  };

  // Open form for adding new package
  const handleAddPackage = () => {
    setEditingPackage(null);
    resetForm();
    setIsFormOpen(true);
  };

  // Open form for editing package
  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      seller_Name: pkg.seller_Name || "",
      package_Name: pkg.package_Name || "",
      buyer_Name: pkg.buyer_Name || "",
      dropOff_Date: pkg.dropOff_Date || "",
      package_Size: pkg.package_Size || "S",
      price: pkg.price || "",
      handling_Fee: pkg.handling_Fee || "",
      payment_Method: pkg.payment_Method || "cash",
    });
    setIsFormOpen(true);
    setErrorMessage('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    try {
      const priceNumber = parseFloat(formData.price) || 0;
      const handlingFeeNumber = parseFloat(formData.handling_Fee) || 0;

      if (editingPackage) {
        // Update existing package - keep existing statuses
        await packgApi.updatePackage({ 
          id: editingPackage.id, 
          ...formData, 
          price: priceNumber,
          handling_Fee: handlingFeeNumber,
          payment_Status: editingPackage.payment_Status, // Keep existing status
          package_Status: editingPackage.package_Status  // Keep existing status
        });
      } else {
        // Add new package - default to unpaid and unclaimed
        await packgApi.createPackage({ 
          ...formData, 
          price: priceNumber,
          handling_Fee: handlingFeeNumber,
          payment_Status: "unpaid", // Default for new packages
          package_Status: "unclaimed" // Default for new packages
        });
      }
      
      setIsFormOpen(false);
      resetForm();
      
      // Reload data to get updates
      await loadData();
      setCurrentPage(1);
    } catch (error) {
      console.error('Error saving package:', error);
      setErrorMessage('Error saving package. Please try again.');
    }
  };

  // Handle delete package
const handleDeletePackage = async (packageId) => {
  try {
    console.log('Deleting/Archiving package ID:', packageId); // Debug log
    
    // Call the API to delete/archive the package
    const response = await packgApi.deletePackage({ id: packageId });
    console.log('Delete response:', response); // Debug log
    
    setShowDeleteConfirm(null);
    
    // Show success message
    alert('Package archived successfully');
    
    // IMPORTANT: Wait a bit before reloading to ensure DB is updated
    setTimeout(async () => {
      await loadData();
      console.log('Data reloaded after archiving'); // Debug log
    }, 500);
    
  } catch (error) {
    console.error('Error archiving package:', error);
    alert('Error archiving package. Please try again.');
  }
};

  // Reset form
  const handleCancel = () => {
    setIsFormOpen(false);
    setViewingPackage(null);
    resetForm();
    setEditingPackage(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'claimed': return 'text-green-600 bg-green-100 border-green-200';
      case 'unclaimed': return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'paid': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'unpaid': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSizeColor = (size) => {
    switch (size) {
      case 'S': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'M': return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'L': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r pb-5 from-amber-700 to-orange-800">
              Package Management
            </h1>
            <p className="text-amber-700 mt-1 sm:mt-2 text-sm sm:text-lg">
              Manage package drop-offs and tracking
            </p>
          </div>
          
          {/* Add Package Button */}
          <button
            onClick={handleAddPackage}
            className="bg-linear-to-r from-amber-500 to-orange-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:from-amber-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
          >
            <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Add New Package</span>
          </button>
        </div>
      </div>

      {/* Error Message Display */}
      {errorMessage && (
        <div className="mb-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
                <button
                  onClick={() => setErrorMessage('')}
                  className="mt-1 text-xs text-red-500 hover:text-red-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
            </div>
            <input
              type="text"
              placeholder="Search packages by seller, package name, or buyer..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="block text-black w-full pl-10 sm:pl-12 pr-3 py-2 sm:py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm sm:text-base"
            />
          </div>  
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-linear-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Package ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Package Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Buyer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Drop-off Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Package Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center">
                    <div className="text-amber-500">
                      <FiTruck className="w-8 h-8 mx-auto mb-3 animate-pulse" />
                      <p className="text-lg font-medium">Loading packages...</p>
                    </div>
                  </td>
                </tr>
              ) : currentPackages.length > 0 ? (
                currentPackages.map((pkg) => (
                  <tr 
                    key={pkg.id}
                    className="hover:bg-amber-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 bg-amber-100 px-3 py-1 rounded-full">
                        #{pkg.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-linear-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                          <FiUser className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 block">
                            {pkg.seller_Name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {pkg.package_Name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{pkg.buyer_Name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {formatDate(pkg.dropOff_Date)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
                        ₱{pkg.price?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getSizeColor(pkg.package_Size)}`}>
                        {pkg.package_Size}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePaymentStatus(pkg)}
                        className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-all duration-200 flex items-center space-x-1 ${
                          pkg.payment_Status === 'paid' 
                            ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' 
                            : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                        }`}
                        title={`Click to mark as ${pkg.payment_Status === 'paid' ? 'unpaid' : 'paid'}`}
                      >
                        {pkg.payment_Status === 'paid' ? (
                          <>
                            <FiCheckCircle className="w-3 h-3" />
                            <span>Paid</span>
                          </>
                        ) : (
                          <>
                            <FiXCircle className="w-3 h-3" />
                            <span>Unpaid</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePackageStatus(pkg)}
                        disabled={pkg.payment_Status !== 'paid' && pkg.package_Status === 'unclaimed'}
                        className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-all duration-200 flex items-center space-x-1 ${
                          pkg.package_Status === 'claimed' 
                            ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' 
                            : 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200'
                        } ${
                          pkg.payment_Status !== 'paid' && pkg.package_Status === 'unclaimed'
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                        title={
                          pkg.payment_Status !== 'paid' && pkg.package_Status === 'unclaimed'
                            ? "Cannot claim unpaid package"
                            : `Click to mark as ${pkg.package_Status === 'claimed' ? 'unclaimed' : 'claimed'}`
                        }
                      >
                        {pkg.package_Status === 'claimed' ? (
                          <>
                            <FiPackage className="w-3 h-3" />
                            <span>Claimed</span>
                          </>
                        ) : (
                          <>
                            <FiPackage className="w-3 h-3" />
                            <span>Unclaimed</span>
                          </>
                        )}
                        {pkg.payment_Status !== 'paid' && pkg.package_Status === 'unclaimed' && (
                          <FiAlertCircle className="w-3 h-3 text-red-500 ml-1" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setViewingPackage(pkg)}
                          className="p-2 text-blue-600 hover:text-blue-500 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditPackage(pkg)}
                          className="p-2 text-amber-600 hover:text-amber-500 hover:bg-amber-100 rounded-lg transition-colors duration-200"
                          title="Edit Package"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(pkg.id)}
                          className="p-2 text-red-600 hover:text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          title="Delete Package"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="text-amber-500">
                      <FiTruck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No packages found</p>
                      <p className="text-sm">Try adjusting your search terms or filters</p>
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
              <FiTruck className="w-12 h-12 mx-auto mb-3 animate-pulse" />
              <p className="text-lg font-medium">Loading packages...</p>
            </div>
          </div>
        ) : currentPackages.length > 0 ? (
          currentPackages.map((pkg) => (
            <div 
              key={pkg.id}
              className="bg-white rounded-2xl shadow-lg border border-amber-100 p-4 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-linear-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    <FiTruck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{pkg.package_Name}</h3>
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                      #{pkg.id}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <p className="text-gray-500 text-xs">Seller</p>
                  <p className="font-medium text-black">{pkg.seller_Name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Buyer</p>
                  <p className="font-medium text-black">{pkg.buyer_Name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Drop-off Date</p>
                  <p className="font-medium text-black">{formatDate(pkg.dropOff_Date)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Price</p>
                  <p className="font-semibold text-green-600">₱{pkg.price?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Size</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getSizeColor(pkg.package_Size)}`}>
                    {pkg.package_Size}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Payment Method</p>
                  <p className="font-medium text-xs text-black">{pkg.payment_Method}</p>
                </div>
              </div>

              {/* Status buttons for mobile */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Payment Status</p>
                  <button
                    onClick={() => handleTogglePaymentStatus(pkg)}
                    className={`w-full text-xs font-semibold px-3 py-2 rounded-lg border transition-all duration-200 flex items-center justify-center space-x-1 ${
                      pkg.payment_Status === 'paid' 
                        ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' 
                        : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                    }`}
                    title={`Click to mark as ${pkg.payment_Status === 'paid' ? 'unpaid' : 'paid'}`}
                  >
                    {pkg.payment_Status === 'paid' ? (
                      <>
                        <FiCheckCircle className="w-3 h-3" />
                        <span>Paid</span>
                      </>
                    ) : (
                      <>
                        <FiXCircle className="w-3 h-3" />
                        <span>Unpaid</span>
                      </>
                    )}
                  </button>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Package Status</p>
                  <button
                    onClick={() => handleTogglePackageStatus(pkg)}
                    disabled={pkg.payment_Status !== 'paid' && pkg.package_Status === 'unclaimed'}
                    className={`w-full text-xs font-semibold px-3 py-2 rounded-lg border transition-all duration-200 flex items-center justify-center space-x-1 ${
                      pkg.package_Status === 'claimed' 
                        ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' 
                        : 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200'
                    } ${
                      pkg.payment_Status !== 'paid' && pkg.package_Status === 'unclaimed'
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    title={
                      pkg.payment_Status !== 'paid' && pkg.package_Status === 'unclaimed'
                        ? "Cannot claim unpaid package"
                        : `Click to mark as ${pkg.package_Status === 'claimed' ? 'unclaimed' : 'claimed'}`
                    }
                  >
                    {pkg.package_Status === 'claimed' ? (
                      <>
                        <FiPackage className="w-3 h-3" />
                        <span>Claimed</span>
                      </>
                    ) : (
                      <>
                        <FiPackage className="w-3 h-3" />
                        <span>Unclaimed</span>
                      </>
                    )}
                    {pkg.payment_Status !== 'paid' && pkg.package_Status === 'unclaimed' && (
                      <FiAlertCircle className="w-3 h-3 text-red-500 ml-1" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-amber-100">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewingPackage(pkg)}
                    className="p-1 text-blue-600 hover:text-blue-500 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                    title="View Details"
                  >
                    <FiEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditPackage(pkg)}
                    className="p-1 text-amber-600 hover:text-amber-500 hover:bg-amber-100 rounded-lg transition-colors duration-200"
                    title="Edit Package"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(pkg.id)}
                  className="p-1 text-red-600 hover:text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200"
                  title="Delete Package"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8 text-center">
            <div className="text-amber-500">
              <FiTruck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No packages found</p>
              <p className="text-sm">Try adjusting your search terms or filters</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredPackages.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-4 sm:p-6 mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPackages.length)} of {filteredPackages.length} packages
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

      {/* Package Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="p-4 sm:p-6 border-b border-amber-100 sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {editingPackage ? 'Edit Package' : 'Add New Package'}
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
              {/* Error Message Display */}
              {errorMessage && (
                <div className="col-span-full">
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FiAlertCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{errorMessage}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Seller Name Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seller Name *
                  </label>
                  <select
                    name="seller_Name"
                    value={formData.seller_Name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border text-black border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm sm:text-base"
                  >
                    <option value="">Select a seller</option>
                    {packgApi.sellers.map(seller => (
                      <option key={seller.id} value={seller.seller_Name}>
                        {seller.seller_Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    name="package_Name"
                    value={formData.package_Name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border  text-black border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter package name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buyer Name *
                  </label>
                  <input
                    type="text"
                    name="buyer_Name"
                    value={formData.buyer_Name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border  text-black border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter buyer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Drop-off Date *
                  </label>
                  <input
                    type="date"
                    name="dropOff_Date"
                    value={formData.dropOff_Date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 borderv text-black border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-8 pr-3 sm:px-4 py-2 sm:py-3 border text-black border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm sm:text-base"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Handling Fee
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                    <input
                      type="number"
                      name="handling_Fee"
                      value={formData.handling_Fee}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-3 sm:px-4 py-2 sm:py-3 border  text-black border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm sm:text-base"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Size *
                  </label>
                  <select
                    name="package_Size"
                    value={formData.package_Size}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border  text-black border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm sm:text-base"
                  >
                    <option value="S">Small</option>
                    <option value="M">Medium</option>
                    <option value="L">Large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    name="payment_Method"
                    value={formData.payment_Method}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border  text-black border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm sm:text-base"
                  >
                    <option value="cash">Cash</option>
                    <option value="gcash">GCash</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border text-black border-amber-300 text-amber-700 rounded-xl font-semibold hover:bg-amber-50 transition-colors duration-200 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-linear-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <FiSave className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{editingPackage ? 'Update' : 'Save'} Package</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Package Details Modal (without QR code) */}
      {viewingPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-4 sm:p-6 border-b border-amber-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Package Details</h2>
                <button
                  onClick={() => setViewingPackage(null)}
                  className="p-1 sm:p-2 hover:bg-amber-100 rounded-lg transition-colors duration-200"
                >
                  <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-linear-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-black font-semibold">
                  <FiTruck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{viewingPackage.package_Name}</h3>
                  <p className="text-amber-600 font-medium">ID: {viewingPackage.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Seller</p>
                  <p className="font-semibold">{viewingPackage.seller_Name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Buyer</p>
                  <p className="font-semibold">{viewingPackage.buyer_Name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Drop-off Date</p>
                  <p className="font-semibold">{formatDate(viewingPackage.dropOff_Date)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Price</p>
                  <p className="font-semibold text-green-600">₱{viewingPackage.price?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Package Size</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getSizeColor(viewingPackage.package_Size)}`}>
                    {viewingPackage.package_Size}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500">Handling Fee</p>
                  <p className="font-semibold">₱{viewingPackage.handling_Fee?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Method</p>
                  <p className="font-semibold">{viewingPackage.payment_Method}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Status</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getStatusColor(viewingPackage.payment_Status)}`}>
                    {viewingPackage.payment_Status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500">Package Status</p>
                  <div className="flex items-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getStatusColor(viewingPackage.package_Status)}`}>
                      {viewingPackage.package_Status}
                    </span>
                    {viewingPackage.package_Status === "claimed" && viewingPackage.payment_Status !== "paid" && (
                      <span className="ml-1" title="Package claimed but not paid">
                        <FiAlertCircle className="w-3 h-3 text-red-500" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
                <span>Delete Package</span>
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Are you sure you want to delete this package? This action cannot be undone and all package data will be permanently removed.
              </p>
              <div className="flex space-x-2 sm:space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePackage(showDeleteConfirm)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-linear-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                >
                  Delete Package
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packages;