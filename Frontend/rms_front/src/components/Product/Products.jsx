import React, { useEffect, useState } from "react";
import { useProduct } from "../../hooks/useProduct";
import { useRef } from "react";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import { Link } from 'react-router-dom';
import { 
  FiHome,
  FiUsers,
  FiTruck,
  FiPackage,
  FiSearch, 
  FiFilter, 
  FiEdit2, 
  FiEye,
  FiPlus,
  FiX,
  FiSave,
  FiArchive,
  FiShoppingBag,
  FiCalendar,
  FiDollarSign,
  FiShoppingCart,
  FiRefreshCw,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import "react-toastify/dist/ReactToastify.css";
import './product.css';

export default function ProductsWithTable() {
  const productApi = useProduct();

  // UI state
  const [loading, setLoading] = useState(false);
  const [filteredResults, setFilteredResults] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [form, setForm] = useState({
    p_Name: "",
    p_Desc: "",
    p_Retail: "",
    p_Buying: "",
    p_Stock: "",
    p_Cat: "",
    p_Expiry: "",
  });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Pagination & mode
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10); // Changed to 10 for better pagination
  const [mode, setMode] = useState("product");

  // New design states
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(null);
  const [showUnarchiveConfirm, setShowUnarchiveConfirm] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null); // Added from new design

  // Full lists from hook
  const products = productApi.products || [];
  const archived = productApi.archived || [];

  // Debounce
  const debounceRef = useRef(null);

  // etc
  const [errors, setErrors] = useState({});

  // Reset pagination & filters on mode change
  useEffect(() => {
    setPage(1);
    setError(null);
    setFilteredResults(null);
    refresh(1);
  }, [mode]);

  async function refresh(currentPage = page) {
    setLoading(true);
    setError(null);
    try {
      const data =
        mode === "product"
          ? await productApi.getAllProducts(currentPage, limit)
          : await productApi.archivedProducts(currentPage, limit);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  // --- Search handler ---
 async function handleSearch(e) {
  const value = e.target.value.toLowerCase();
  setSearchText(value);

  clearTimeout(debounceRef.current);

  debounceRef.current = setTimeout(() => {
    applyFilters(value, selectedCategory);
  }, 300);
}

  // --- Category dropdown handler ---
 async function handleDropDown(option) {
  setSelectedCategory(option);
  applyFilters(searchText, option);
}

async function applyFilters(newSearch, newCategory) {
  setLoading(true);
  try {
    if(mode === "product"){
    await productApi.searchProduct( newSearch || "", newCategory || "",);
    setPage(1);
    setTotalPages(1);
    setFilteredResults(null);
  }else if (mode === "archive"){
    await productApi.searchArchivedProduct(newSearch || "", newCategory || "");
    setPage(1);
    setTotalPages(1);
    setFilteredResults(null);
  }
    
  } catch (err) {
    setError(err?.message || "Search failed");
  } finally {
    setLoading(false);
  }
}

  function resetForm() {
    setForm({
      p_Name: "",
      p_Desc: "",
      p_Retail: "",
      p_Buying: "",
      p_Stock: "",
      p_Cat: "",
      p_Expiry: "",
    });
  }

function validateProduct(payload) {
  const newErrors = {};

  // Expiry
  const today = new Date();
  const expiry = new Date(payload.product_Expiry);
  const diff = (expiry - today) / (1000 * 60 * 60 * 24);

  if (expiry < today) {
    newErrors.product_Expiry = "Product is Expired.";
  } else if (diff <= 5) {
    newErrors.product_Expiry = "Expiry must be more than 5 days from today.";
  }

  // Retail price
  if (!payload.product_RetailPrice || payload.product_RetailPrice <= 0) {
    newErrors.product_RetailPrice = "Retail price must be greater than 0.";
  }

  // Buying price
  if (!payload.product_BuyingPrice || payload.product_BuyingPrice <= 0) {
    newErrors.product_BuyingPrice = "Buying price must be greater than 0.";
  }

  // Retail price must be higher than buying price
  if (payload.product_RetailPrice <= payload.product_BuyingPrice) {
    newErrors.product_RetailPrice = "Retail price must be higher than buying price.";
    newErrors.product_BuyingPrice = "Buying price must be lower than retail price.";
  }

  // Stock
  if (!payload.product_Stock || payload.product_Stock <= 0) {
    newErrors.product_Stock = "Stock must be greater than 0.";
  }

  // Name
  if (!payload.product_Name.trim()) {
    newErrors.product_Name = "Product name is required.";
  }

  // Description
  if (!payload.product_Description.trim()) {
    newErrors.product_Description = "Description is required.";
  }

  // Category
  if (!payload.product_Category.trim()) {
    newErrors.product_Category = "Category is required.";
  }

  return newErrors;
}

  // --- CRUD handlers ---
async function handleCreate(e) {
  e.preventDefault();

  const payload = {
    product_Name: form.p_Name.trim(),
    product_Description: form.p_Desc.trim(),
    product_RetailPrice: parseFloat(form.p_Retail),
    product_BuyingPrice: parseFloat(form.p_Buying),
    product_Stock: parseFloat(form.p_Stock),
    product_Category: form.p_Cat.trim(),
    product_Expiry: new Date(form.p_Expiry).toISOString().split("T")[0],
  };

  const validationErrors = validateProduct(payload);

  // Frontend check for duplicate name
  const duplicate = tableData.some(
    (p) =>
      p.product_Name.toLowerCase() === payload.product_Name.toLowerCase()
  );
  if (duplicate) {
    validationErrors.product_Name = "Product name already exists!";
  }

  setErrors(validationErrors);

  if (Object.keys(validationErrors).length > 0) {
    // Show toast for immediate feedback
    if (validationErrors.product_Name) {
      toast.error(validationErrors.product_Name, {
        className: "alert alert-error text-white",
      });
    }
    return;
  }

  try {
    const response = await productApi.createProduct(payload);
    resetForm();
    setShowProductForm(false);
    refresh();
    toast.success("Product created successfully!", {
     className: "alert alert-success text-white",
    });
  } catch (err) {
    const msg = err?.response?.data?.message || "Create failed";
    toast.error(msg, {
     className: "alert alert-error text-white",
    });
    setError(msg);
  }
}

  async function handleDelete(id, stock) {
  if (stock > 0) {
    toast.error("Cannot delete a product with stock", {
       className: "alert alert-error text-white",
    });
    return;
  }
  try {
    await productApi.deleteProduct({ id });
    toast.success("Product deleted successfully", {
   className: "alert alert-success text-white",
    });
    refresh();
  } catch (err) {
    toast.error(err.message || "Delete failed", {
  className: "alert alert-error text-white",
    });
    setError(err.message || "Delete failed");
  }
}

 async function handleArchive(id) {
  // Find the product to check its stock
  const productToArchive = products.find(p => p.id === id);
  
  // Check if product exists and has stock
  if (productToArchive && productToArchive.product_Stock > 0) {
    toast.error("Cannot archive a product with stock remaining. Please sell or transfer all stock first.", {
      className: "alert alert-error text-white",
    });
    return;
  }
  
  try {
    await productApi.archiveProduct({ id });
    toast.success("Product archived successfully", {
      className: "alert alert-success text-white",
    });
    refresh();
  } catch (err) {
    toast.error(err.message || "Archive failed", {
      className: "alert alert-error text-white",
    });
    setError(err.message || "Archive failed");
  }
}
  async function handleAddBack(id) {
    try {
      await productApi.archiveAddBack({ id });
      toast.success("Product added back successfully", {
      className: "alert alert-success text-white",
    });
      refresh();
    } catch (err) {
      toast.error(err.message || "Adding back failed", {
       className: "alert alert-error text-white",
    });
    setError(err.message || "Adding back  failed");
    }
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      p_Name: product?.product_Name ?? "",
      p_Desc: product?.product_Description ?? "",
      p_Retail:
        product?.product_RetailPrice !== undefined ? String(product.product_RetailPrice) : "",
      p_Buying:
        product?.product_BuyingPrice !== undefined ? String(product.product_BuyingPrice) : "",
      p_Stock: product?.product_Stock !== undefined ? String(product.product_Stock) : "",
      p_Cat: product?.product_Category ?? "",
      p_Expiry: product?.product_Expiry
        ? new Date(product.product_Expiry).toISOString().split("T")[0]
        : "",
    });
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editing) return;
    const payload = {
      id: editing.id,
      product_Name: form.p_Name.trim(),
      product_Description: form.p_Desc.trim(),
      product_RetailPrice: parseFloat(form.p_Retail),
      product_BuyingPrice: parseFloat(form.p_Buying),
      product_Stock: parseFloat(form.p_Stock),
      product_Category: form.p_Cat.trim(),
      product_Expiry: form.p_Expiry,
    };

     const validationErrors = validateProduct(payload);
      setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
    return;
  }
    try {
      await productApi.updateProduct(payload);
      setEditing(null);
      resetForm();
       toast.success("Product Updated successfully", {
      className: "alert alert-success text-white",
    });
     refresh();
    } catch (err) {
      toast.error(err.message || "Update failed", {
       className: "alert alert-error text-white",
    });
    setError(err.message || "Update failed");
    }
  }

  // --- New design helper functions ---
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === tableData.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(tableData.map(p => p.id));
    }
  };

const handleBulkArchive = async () => {
  // Check if any selected product has stock
  const productsWithStock = selectedProducts
    .map(id => products.find(p => p.id === id))
    .filter(p => p && p.product_Stock > 0);
  
  if (productsWithStock.length > 0) {
    toast.error(`Cannot archive ${productsWithStock.length} product(s) with stock remaining. Please clear stock first.`, {
      className: "alert alert-error text-white",
    });
    return;
  }

  // Show confirmation dialog
  const confirmBulkArchive = await new Promise((resolve) => {
    // ... rest of the confirmation modal code remains the same ...
  });

  if (!confirmBulkArchive) return;

  try {
    for (const id of selectedProducts) {
      await productApi.archiveProduct({ id });
    }
    toast.success(`${selectedProducts.length} product(s) archived successfully`, {
      className: "alert alert-success text-white",
    });
    setSelectedProducts([]);
    refresh();
  } catch (err) {
    toast.error("Bulk archive failed", {
      className: "alert alert-error text-white",
    });
  }
};

// Update the handleBulkUnarchive function:
const handleBulkUnarchive = async () => {
  // Show confirmation dialog with the same design as individual unarchive
  const confirmBulkUnarchive = await new Promise((resolve) => {
    const toastId = toast(
      (t) => (
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
          <div className="p-4 sm:p-6 border-b border-green-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <FiArchive className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              <span>Restore Products</span>
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Are you sure you want to Restore {selectedProducts.length} product(s)? They will be moved back to active products.
            </p>
            <div className="flex space-x-2 sm:space-x-3">
              <button
                onClick={() => {
                  resolve(false);
                  toast.dismiss(t.id);
                }}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resolve(true);
                  toast.dismiss(t.id);
                }}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
              >
                Restore {selectedProducts.length} Products
              </button>
            </div>
          </div>
        </div>
      ),
      { 
        duration: Infinity, 
        position: "top-center",
        className: "!bg-transparent !shadow-none !p-0",
        bodyClassName: "!p-0",
        closeButton: false
      }
    );
  });

  if (!confirmBulkUnarchive) return;

  try {
    for (const id of selectedProducts) {
      await productApi.archiveAddBack({ id });
    }
    toast.success(`${selectedProducts.length} product(s) restored successfully`, {
      className: "alert alert-success text-white",
    });
    setSelectedProducts([]);
    refresh();
  } catch (err) {
    toast.error("Bulk restore failed", {
      className: "alert alert-error text-white",
    });
  }
};

  const getStatusColor = (stock) => {
    if (stock > 10) return 'text-green-600 bg-green-100 border-green-200';
    if (stock > 0) return 'text-amber-600 bg-amber-100 border-amber-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getStatusText = (stock) => {
    if (stock > 10) return 'In Stock';
    if (stock > 0) return 'Low Stock';
    return 'Out of Stock';
  };

  // Enhanced pagination functions from new design
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, page - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // --- Table data ---
  const tableData = filteredResults ?? (mode === "archive" ? archived : products);
  const showPagination = filteredResults === null;

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-red-50 p-4 sm:p-6 products-container">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl pb-5 sm:text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-700 to-orange-800">
            Product Management
          </h1>
          <p className="text-amber-700 mt-1 sm:mt-2 text-sm sm:text-lg">
            Manage your inventory and product listings
          </p>
        </div>
        
        {/* Buttons Container */}
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          {/* Add Product Button */}
          <button
            onClick={() => setShowProductForm((s) => !s)}
            className="bg-linear-to-r from-amber-500 to-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:from-amber-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
          >
            <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">
              {showProductForm ? "Close Form" : "Add New Product"}
            </span>
          </button>
          
          {/* Refresh Button - Icon Only */}
          <button 
            className="p-2 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors duration-200 flex items-center justify-center w-full sm:w-auto"
            onClick={() => refresh()}
            title="Refresh"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-4 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setMode("product");
              setSelectedProducts([]);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
              mode === "product"
                ? 'bg-amber-500 text-white'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Active Products ({products.length})
          </button>
          <button
            onClick={() => {
              setMode("archive");
              setSelectedProducts([]);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
              mode === "archive"
                ? 'bg-amber-500 text-white'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Archived ({archived.length})
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
            </div>
            <input
              type="text"
              placeholder="Search products by name or code..."
              value={searchText}
              onChange={handleSearch}
              className="block w-full pl-10 sm:pl-12 pr-3 py-2 sm:py-3 border border-amber-200 rounded-xl bg-amber-50 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm sm:text-base text-black"
            />
          </div>
          <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => handleDropDown(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 border border-amber-200 rounded-xl bg-white text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
            >
              <option value="">All Categories</option>
              {[
                "Beverages",
                "Snacks",
                "Dairy",
                "Fruits & Vegetables",
                "Grains & Cereals",
                "Frozen Food",
                "Condiments & Sauces",
                "Cleaning Supplies",
                "Personal Care",
                "Household Essentials",
                "Others",
              ].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-amber-800 font-semibold">
              {selectedProducts.length} product(s) selected
            </p>
            <div className="flex space-x-2">
              {mode === "product" ? (
                <button
                  onClick={handleBulkArchive}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors duration-200 flex items-center space-x-2"
                >
                  <FiArchive className="w-4 h-4" />
                  <span>Archive Selected</span>
                </button>
              ) : (
                <button
                  onClick={handleBulkUnarchive}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
                >
                  <FiArchive className="w-4 h-4" />
                  <span>Restore Selected</span>
                </button>
              )}
              <button
                onClick={() => setSelectedProducts([])}
                className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg font-semibold hover:bg-amber-50 transition-colors duration-200"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
         <table className="w-full min-w-[1200px]">
  <thead>
    <tr className="bg-linear-to-r from-amber-50 to-orange-50 border-b border-amber-100">
      <th className="px-4 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider w-12">
        <input
          type="checkbox"
          checked={selectedProducts.length === tableData.length && tableData.length > 0}
          onChange={toggleSelectAll}
          className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
        />
      </th>
      <th className="px-4 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider w-20">ID</th>
      <th className="px-4 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider w-48">Product Name</th>
      <th className="px-4 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider w-64">Description</th>
      <th className="px-4 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider w-32">Retail Price</th>
      <th className="px-4 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider w-32">Buying Price</th>
      <th className="px-4 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider w-40">Category</th>
      <th className="px-4 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider w-24">Stock</th>
      <th className="px-4 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider w-32">Status</th>
      <th className="px-4 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider w-32">Expiry</th>
      <th className="px-4 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider w-48">Actions</th>
    </tr>
  </thead>

  <tbody className="divide-y divide-amber-100">
    {loading && (
      <tr>
        <td colSpan="12" className="px-6 py-12 text-center">
          <div className="text-amber-500">
            <FiPackage className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Loading products...</p>
          </div>
        </td>
      </tr>
    )}

    {!loading && tableData.length > 0 &&
      tableData.map((item, idx) => (
        <tr
          key={item.id ?? idx}
          className="hover:bg-amber-50 transition-colors duration-150"
        >
          <td className="px-4 py-4 whitespace-nowrap w-12">
            <input
              type="checkbox"
              checked={selectedProducts.includes(item.id)}
              onChange={() => toggleProductSelection(item.id)}
              className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
            />
          </td>

          <td className="px-4 py-4 whitespace-nowrap w-20">
            <span className="text-sm font-medium text-gray-900 bg-amber-100 px-2 py-1 rounded-full">
              {item.id}
            </span>
          </td>

          <td className="px-4 py-4 whitespace-nowrap w-48">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-linear-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                <FiPackage className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-900 truncate">{item.product_Name}</span>
            </div>
          </td>

          <td className="px-4 py-4 w-64">
            <span className="text-sm text-gray-600 line-clamp-2">
              {item.product_Description}
            </span>
          </td>

          <td className="px-4 py-4 whitespace-nowrap w-32">
            <span className="text-sm font-semibold text-green-600">
              ₱{parseFloat(item.product_RetailPrice || 0).toFixed(2)}
            </span>
          </td>

          <td className="px-4 py-4 whitespace-nowrap w-32">
            <span className="text-sm font-semibold text-amber-600">
              ₱{parseFloat(item.product_BuyingPrice || 0).toFixed(2)}
            </span>
          </td>

          <td className="px-4 py-4 whitespace-nowrap w-40">
            <span className="text-sm text-gray-600 truncate">{item.product_Category}</span>
          </td>

          <td className="px-4 py-4 whitespace-nowrap w-24">
            <span className="text-sm text-gray-600">{item.product_Stock}</span>
          </td>

          <td className="px-4 py-4 whitespace-nowrap w-32">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getStatusColor(item.product_Stock)}`}>
              {getStatusText(item.product_Stock)}
            </span>
          </td>

          <td className="px-4 py-4 whitespace-nowrap w-32">
            <span className="text-sm text-gray-600">
              {item.product_Expiry ? new Date(item.product_Expiry).toISOString().split("T")[0] : "N/A"}
            </span>
          </td>

          <td className="px-4 py-4 whitespace-nowrap w-48">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setViewingProduct(item)}
                className="p-1.5 text-blue-600 hover:text-blue-500 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                title="View Details"
              >
                <FiEye className="w-4 h-4" />
              </button>

              <button
                onClick={() => openEdit(item)}
                className="p-1.5 text-amber-600 hover:text-amber-500 hover:bg-amber-100 rounded-lg transition-colors duration-200"
                title="Edit Product"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>

              {mode === "product" ? (
                <>
                   <button
    onClick={() => {
      if (item.product_Stock > 0) {
        toast.error("Cannot archive product with stock. Clear stock first.", {
          className: "alert alert-error text-white",
        });
      } else {
        setShowArchiveConfirm(item.id);
      }
    }}
    disabled={item.product_Stock > 0}
    className={`p-1.5 rounded-lg transition-colors duration-200 ${
      item.product_Stock > 0
        ? 'text-gray-400 cursor-not-allowed bg-gray-100'
        : 'text-amber-600 hover:text-amber-500 hover:bg-amber-100'
    }`}
    title={item.product_Stock > 0 ? "Cannot archive: Stock remaining" : "Archive Product"}
  >
    <FiArchive className="w-4 h-4" />
  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.product_Stock)}
                    className="p-1.5 text-red-600 hover:text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200"
                    title="Delete Product"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowUnarchiveConfirm(item.id)}
                    className="p-1.5 text-green-600 hover:text-green-500 hover:bg-green-100 rounded-lg transition-colors duration-200"
                    title="Restore Product"
                  >
                    <FiArchive className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.product_Stock)}
                    className="p-1.5 text-red-600 hover:text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200"
                    title="Delete Product"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </td>
        </tr>
      ))
    }

    {!loading && tableData.length === 0 && (
      <tr>
        <td colSpan="12" className="px-6 py-12 text-center">
          <div className="text-amber-500">
            <FiPackage className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">
              No {mode === "product" ? "products" : "archived products"} found
            </p>
            <p className="text-sm">Try adjusting your search terms or filters</p>
          </div>
        </td>
      </tr>
    )}
  </tbody>
</table>

        </div>
      </div>

      {/* Mobile Card View - New from design */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8 text-center">
            <div className="text-amber-500">
              <FiPackage className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Loading products...</p>
            </div>
          </div>
        ) : tableData.length > 0 ? (
          tableData.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-2xl shadow-lg border border-amber-100 p-4 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-linear-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    <FiPackage className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{item.product_Name}</h3>
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                      #{item.id}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(item.id)}
                    onChange={() => toggleProductSelection(item.id)}
                    className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <p className="text-gray-500 text-xs">Category</p>
                  <p className="font-medium">{item.product_Category}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Retail Price</p>
                  <p className="font-semibold text-green-600">₱{parseFloat(item.product_RetailPrice || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Stock</p>
                  <p className="font-medium">{item.product_Stock} units</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Status</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getStatusColor(item.product_Stock)}`}>
                    {getStatusText(item.product_Stock)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-amber-100">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewingProduct(item)}
                    className="p-1 text-blue-600 hover:text-blue-500 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                    title="View Details"
                  >
                    <FiEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1 text-amber-600 hover:text-amber-500 hover:bg-amber-100 rounded-lg transition-colors duration-200"
                    title="Edit Product"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </div>
                {mode === "product" ? (
                  <button
                    onClick={() => setShowArchiveConfirm(item.id)}
                    className="p-1 text-amber-600 hover:text-amber-500 hover:bg-amber-100 rounded-lg transition-colors duration-200"
                    title="Archive Product"
                  >
                    <FiArchive className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowUnarchiveConfirm(item.id)}
                    className="p-1 text-green-600 hover:text-green-500 hover:bg-green-100 rounded-lg transition-colors duration-200"
                    title="Unarchive Product"
                  >
                    <FiArchive className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8 text-center">
            <div className="text-amber-500">
              <FiPackage className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No {mode === "product" ? "products" : "archived products"} found</p>
              <p className="text-sm">Try adjusting your search terms or filters</p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Pagination */}
      {showPagination && tableData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-4 sm:p-6 mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-600">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, tableData.length)} of {tableData.length} products
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Previous Button */}
              <button
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  refresh(Math.max(1, page - 1));
                }}
                disabled={page === 1}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  page === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                }`}
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => {
                    setPage(pageNum);
                    refresh(pageNum);
                  }}
                  className={`w-10 h-10 rounded-lg transition-all duration-200 font-medium ${
                    page === pageNum
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  refresh(Math.min(totalPages, page + 1));
                }}
                disabled={page === totalPages}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  page === totalPages 
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

      {/* Product Form Modal */}
      {showProductForm && !editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-amber-100 sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-700 to-orange-800">
                  Add New Product
                </h2>
                <button
                  onClick={() => setShowProductForm(false)}
                  className="p-2 hover:bg-amber-100 rounded-lg transition-colors duration-200"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={form.p_Name}
                    onChange={(e) => setForm((f) => ({ ...f, p_Name: e.target.value }))}
                    className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
                    required
                  />
                  {errors.product_Name && (
                    <p className="text-red-500 text-sm mt-2">{errors.product_Name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product description"
                    value={form.p_Desc}
                    onChange={(e) => setForm((f) => ({ ...f, p_Desc: e.target.value }))}
                    className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
                    required
                  />
                  {errors.product_Description && (
                    <p className="text-red-500 text-sm mt-2">{errors.product_Description}</p>
                  )}
                </div>

                {/* Buying Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buying Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.p_Buying}
                      onChange={(e) => setForm((f) => ({ ...f, p_Buying: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
                      required
                      step="0.01"
                    />
                  </div>
                  {errors.product_BuyingPrice && (
                    <p className="text-red-500 text-sm mt-2">{errors.product_BuyingPrice}</p>
                  )}
                </div>
                    {/* Retail Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retail Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.p_Retail}
                      onChange={(e) => setForm((f) => ({ ...f, p_Retail: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
                      required
                      step="0.01"
                    />
                  </div>
                  {errors.product_RetailPrice && (
                    <p className="text-red-500 text-sm mt-2">{errors.product_RetailPrice}</p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    placeholder="Enter stock quantity"
                    value={form.p_Stock}
                    onChange={(e) => setForm((f) => ({ ...f, p_Stock: e.target.value }))}
                    className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
                    required
                  />
                  {errors.product_Stock && (
                    <p className="text-red-500 text-sm mt-2">{errors.product_Stock}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={form.p_Cat}
                    onChange={(e) => setForm((f) => ({ ...f, p_Cat: e.target.value }))}
                    className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black"
                    required
                  >
                    <option value="">Select Category</option>
                    {[
                      "Beverages",
                      "Snacks",
                      "Dairy",
                      "Fruits & Vegetables",
                      "Grains & Cereals",
                      "Frozen Food",
                      "Condiments & Sauces",
                      "Cleaning Supplies",
                      "Personal Care",
                      "Household Essentials",
                      "Others",
                    ].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.product_Category && (
                    <p className="text-red-500 text-sm mt-2">{errors.product_Category}</p>
                  )}
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={form.p_Expiry}
                    onChange={(e) => setForm((f) => ({ ...f, p_Expiry: e.target.value }))}
                    className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black [color-scheme:light]"
                    required
                  />
                  {errors.product_Expiry && (
                    <p className="text-red-500 text-sm mt-2">{errors.product_Expiry}</p>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-4 border-t border-amber-100">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="flex-1 px-6 py-3 border border-amber-300 text-amber-700 rounded-xl font-semibold hover:bg-amber-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-linear-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FiSave className="w-4 h-4" />
                  <span>Create Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-amber-100 sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-700 to-orange-800">
                  Edit Product
                </h2>
                <button
                  onClick={() => {
                    setEditing(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-amber-100 rounded-lg transition-colors duration-200"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={form.p_Name}
                    onChange={(e) => setForm((f) => ({ ...f, p_Name: e.target.value }))}
                    className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
                    required
                  />
                  {errors.product_Name && (
                    <p className="text-red-500 text-sm mt-2">{errors.product_Name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product description"
                    value={form.p_Desc}
                    onChange={(e) => setForm((f) => ({ ...f, p_Desc: e.target.value }))}
                    className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
                    required
                  />
                  {errors.product_Description && (
                    <p className="text-red-500 text-sm mt-2">{errors.product_Description}</p>
                  )}
                </div>

                {/* Buying Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buying Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.p_Buying}
                      onChange={(e) => setForm((f) => ({ ...f, p_Buying: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
                      required
                      step="0.01"
                    />
                  </div>
                  {errors.product_BuyingPrice && (
                    <p className="text-red-500 text-sm mt-2">{errors.product_BuyingPrice}</p>
                  )}
                </div>
                   {/* Retail Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retail Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.p_Retail}
                      onChange={(e) => setForm((f) => ({ ...f, p_Retail: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
                      required
                      step="0.01"
                    />
                  </div>
                  {errors.product_RetailPrice && (
                    <p className="text-red-500 text-sm mt-2">{errors.product_RetailPrice}</p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    placeholder="Enter stock quantity"
                    value={form.p_Stock}
                    onChange={(e) => setForm((f) => ({ ...f, p_Stock: e.target.value }))}
                    className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
                    required
                  />
                  {errors.product_Stock && (
                    <p className="text-red-500 text-sm mt-2">{errors.product_Stock}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={form.p_Cat}
                    onChange={(e) => setForm((f) => ({ ...f, p_Cat: e.target.value }))}
                    className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black"
                    required
                  >
                    <option value="">Select Category</option>
                    {[
                      "Beverages",
                      "Snacks",
                      "Dairy",
                      "Fruits & Vegetables",
                      "Grains & Cereals",
                      "Frozen Food",
                      "Condiments & Sauces",
                      "Cleaning Supplies",
                      "Personal Care",
                      "Household Essentials",
                      "Others",
                    ].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.product_Category && (
                    <p className="text-red-500 text-sm mt-2">{errors.product_Category}</p>
                  )}
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={form.p_Expiry}
                    onChange={(e) => setForm((f) => ({ ...f, p_Expiry: e.target.value }))}
                    className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black [color-scheme:light]"
                    required
                  />
                  {errors.product_Expiry && (
                    <p className="text-red-500 text-sm mt-2">{errors.product_Expiry}</p>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-4 border-t border-amber-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-amber-300 text-amber-700 rounded-xl font-semibold hover:bg-amber-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-linear-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FiSave className="w-4 h-4" />
                  <span>Update Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Product Details Modal - New from design */}
     {viewingProduct && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
      <div className="p-4 sm:p-6 border-b border-amber-100">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">QR Code</h2>
          <button
            onClick={() => setViewingProduct(null)}
            className="p-1 sm:p-2 hover:bg-amber-100 rounded-lg transition-colors duration-200"
          >
            <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8 flex flex-col items-center justify-center">
        {/* Large QR Code */}
        <div className="p-6 bg-white rounded-xl shadow-inner mb-4">
          <QRCodeSVG
            id={`qr-modal-${viewingProduct.id}`}
            value={viewingProduct.QrCodeValue || `${window.location.origin}/scan/${viewingProduct.id}`}
            size={300} // Enlarged size
            level="H"
            includeMargin={true}
          />
        </div>
        
        {/* QR Code Info */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 mb-2">
            Product ID: <span className="font-semibold">#{viewingProduct.id}</span>
          </p>
          <p className="text-xs text-gray-500">
            Scan this QR code to reduce stock
          </p>
        </div>
      </div>
    </div>
  </div>
)}
      {/* Archive Confirmation Modal */}
     {showArchiveConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
      <div className="p-4 sm:p-6 border-b border-amber-100">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center space-x-2">
          <FiArchive className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
          <span>Archive Product</span>
        </h2>
      </div>

      <div className="p-4 sm:p-6">
        {/* Find the product to display its stock */}
        {(() => {
          const productToArchive = products.find(p => p.id === showArchiveConfirm);
          return productToArchive && productToArchive.product_Stock > 0 ? (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-semibold mb-2">Cannot Archive</p>
              <p className="text-red-600 text-sm">
                This product has <span className="font-bold">{productToArchive.product_Stock}</span> units in stock.
                Please clear all stock before archiving.
              </p>
            </div>
          ) : (
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Are you sure you want to archive this product? Archived products can be restored later.
            </p>
          );
        })()}
        
        <div className="flex space-x-2 sm:space-x-3">
          <button
            onClick={() => setShowArchiveConfirm(null)}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const productToArchive = products.find(p => p.id === showArchiveConfirm);
              if (productToArchive && productToArchive.product_Stock > 0) {
                toast.error("Cannot archive product with stock remaining", {
                  className: "alert alert-error text-white",
                });
                setShowArchiveConfirm(null);
              } else {
                handleArchive(showArchiveConfirm);
                setShowArchiveConfirm(null);
              }
            }}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-linear-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Unarchive Confirmation Modal */}
      {showUnarchiveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-4 sm:p-6 border-b border-green-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center space-x-2">
                <FiArchive className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                <span>Restore Product</span>
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Are you sure you want to restore this product? It will be moved back to active products.
              </p>
              <div className="flex space-x-2 sm:space-x-3">
                <button
                  onClick={() => setShowUnarchiveConfirm(null)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleAddBack(showUnarchiveConfirm);
                    setShowUnarchiveConfirm(null);
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                >
                  Restore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}