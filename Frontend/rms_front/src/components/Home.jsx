import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { useProduct } from "../hooks/useProduct";
import AdminLogReport from "./Adminlogreport";
import { 
  FiPackage, 
  FiAlertTriangle, 
  FiTruck, 
  FiDollarSign,
  FiFilter,
  FiPlus,
  FiUsers,
  FiBarChart2,
  FiEye,
  FiCalendar,
  FiTrendingUp,
  FiBell,
  FiShoppingBag
} from 'react-icons/fi';
import { 
  HiOutlineExclamationCircle,
  HiOutlineShoppingBag,
  HiOutlineCube
} from 'react-icons/hi';

ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement);

export default function Home() {
  const productApi = useProduct();
  const [expiryData, setExpiryData] = useState({ labels: [], datasets: [] });
  const [stockData, setStockData] = useState({ labels: [], datasets: [] });
  const [priceDistributionData, setPriceDistributionData] = useState({ labels: [], datasets: [] });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

  // Statistics states
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    expiringSoon: 0,
    totalInventoryValue: 0,
    averagePrice: 0,
    highValueProducts: 0,
  });

  // Filtered products
  const filteredProducts = products.filter(product => {
    if (activeFilter === "lowStock") {
      return product.product_Stock < 10;
    } else if (activeFilter === "expiring") {
      if (!product.product_Expiry) return false;
      const expiryDate = new Date(product.product_Expiry);
      const daysRemaining = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
      return daysRemaining <= 3 && daysRemaining >= 0;
    }
    return true;
  });

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const productsData = await productApi.getAllProducts(1, 100);
        setProducts(productsData?.products || []); 
      } catch (err) {
        setError(err.message || "Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Update dashboard when products change
  useEffect(() => {
    const updateDashboard = () => {
      const now = new Date();
      const safeProducts = Array.isArray(products) ? products : [];
      
      // Calculate statistics
      const totalProducts = safeProducts.length;
      const lowStock = safeProducts.filter(p => p.product_Stock > 0 && p.product_Stock < 10).length;
      const outOfStock = safeProducts.filter(p => p.product_Stock === 0).length;
      
      let expiringSoon = 0;
      let totalInventoryValue = 0;
      let highValueProducts = 0;

      safeProducts.forEach((p) => {
        totalInventoryValue += (p.product_Stock * (p.product_RetailPrice || 0));
        
        if ((p.product_Stock * (p.product_RetailPrice || 0)) > 1000) {
          highValueProducts++;
        }
        
        if (p.product_Expiry) {
          const expiryDate = new Date(p.product_Expiry);
          const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
          if (daysRemaining <= 3 && daysRemaining >= 0) expiringSoon++;
        }
      });

      const averagePrice = totalProducts > 0 ? totalInventoryValue / totalProducts : 0;

      setStats({
        totalProducts,
        lowStock,
        outOfStock,
        expiringSoon,
        totalInventoryValue,
        averagePrice,
        highValueProducts,
      });

      // Charts data
      if (safeProducts.length > 0) {
        let expired = 0, soon = 0, good = 0;

        safeProducts.forEach((p) => {
          if (!p.product_Expiry) {
            good++;
            return;
          }
          const expiryDate = new Date(p.product_Expiry);
          const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
          if (daysRemaining < 0) expired++;
          else if (daysRemaining <= 3) soon++;
          else good++;
        });

        setExpiryData({
          labels: ["Expired", "Expiring Soon", "Good"],
          datasets: [
            {
              label: "Product Expiry Status",
              data: [expired, soon, good],
              backgroundColor: ["#ef4444", "#facc15", "#22c55e"],
              borderWidth: 1,
            },
          ],
        });

        // Stock level chart
        const stockLevels = {
          "Out of Stock": outOfStock,
          "Low Stock (1-9)": lowStock,
          "Medium Stock (10-49)": safeProducts.filter(p => p.product_Stock >= 10 && p.product_Stock < 50).length,
          "High Stock (50+)": safeProducts.filter(p => p.product_Stock >= 50).length,
        };

        setStockData({
          labels: Object.keys(stockLevels),
          datasets: [
            {
              label: "Stock Levels",
              data: Object.values(stockLevels),
              backgroundColor: ["#ef4444", "#facc15", "#3b82f6", "#22c55e"],
              borderWidth: 1,
            },
          ],
        });

        // Price distribution chart
        const priceRanges = {
          "₱0-10": safeProducts.filter(p => (p.product_RetailPrice || 0) <= 10).length,
          "₱11-50": safeProducts.filter(p => (p.product_RetailPrice || 0) > 10 && (p.product_RetailPrice || 0) <= 50).length,
          "₱51-100": safeProducts.filter(p => (p.product_RetailPrice || 0) > 50 && (p.product_RetailPrice || 0) <= 100).length,
          "₱101+": safeProducts.filter(p => (p.product_RetailPrice || 0) > 100).length,
        };

        setPriceDistributionData({
          labels: Object.keys(priceRanges),
          datasets: [
            {
              label: "Price Distribution",
              data: Object.values(priceRanges),
              backgroundColor: ["#86efac", "#4ade80", "#22c55e", "#16a34a"],
              borderWidth: 1,
            },
          ],
        });
      } else {
        setExpiryData({
          labels: ["No Products"],
          datasets: [
            {
              label: "Product Expiry Status",
              data: [1],
              backgroundColor: ["#9ca3af"],
              borderWidth: 1,
            },
          ],
        });
      }

      setLastUpdated(now.toLocaleTimeString());
    };

    updateDashboard();
  }, [products]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { 
        display: true, 
        text: products.length > 0 ? "Product Expiry Overview" : "No Products Available"
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Stat Card Component (from ideal design)
  const StatCard = ({ title, value, icon, trend, color, alert = false }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-cyan-500',
      red: 'from-red-500 to-pink-500',
      amber: 'from-amber-500 to-orange-500',
      green: 'from-green-500 to-emerald-500'
    };

    const trendColors = {
      blue: 'text-blue-500',
      red: 'text-red-500',
      amber: 'text-amber-500',
      green: 'text-green-500'
    };

    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-amber-100 p-6 transform hover:scale-105 transition-all duration-200 ${
        alert ? 'ring-2 ring-red-200' : ''
      }`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
            <p className={`text-sm mt-2 font-medium ${trendColors[color]}`}>
              {trend}
            </p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-md`}>
            {icon}
          </div>
        </div>
      </div>
    );
  };

  // Quick Action Button Component
  const QuickActionButton = ({ icon, label, color, onClick }) => {
    const colorClasses = {
      amber: 'bg-amber-500 hover:bg-amber-600 border-amber-400',
      orange: 'bg-orange-500 hover:bg-orange-600 border-orange-400',
      red: 'bg-red-500 hover:bg-red-600 border-red-400',
      green: 'bg-green-500 hover:bg-green-600 border-green-400'
    };

    return (
      <button
        onClick={onClick}
        className={`${colorClasses[color]} text-white rounded-xl p-4 flex flex-col items-center justify-center space-y-2 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg border`}
      >
        <div className="p-2 bg-white/20 rounded-lg">
          {icon}
        </div>
        <span className="text-sm font-medium text-center">{label}</span>
      </button>
    );
  };

  // Show loading state
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-amber-500"></div>
          <p className="mt-4 text-amber-700 text-lg">Loading inventory dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-3xl mb-4">⚠️</div>
          <p className="text-red-700 text-xl font-bold mb-2">Error loading dashboard</p>
          <p className="text-amber-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
      {/* Header Section */}
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-800 pb-5">
              Inventory Management System
            </h1>
            <p className="text-amber-700 mt-2 text-lg">
              Welcome back! Here's what's happening with your inventory today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-amber-600 font-semibold">{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            {lastUpdated && (
              <p className="text-amber-500 text-sm mt-1">Last updated: {lastUpdated}</p>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <StatCard 
            title="Total Products" 
            value={stats.totalProducts} 
            icon={<FiPackage className="w-6 h-6" />}
            trend="In inventory"
            color="blue"
          />
          <StatCard 
            title="Stock Alerts" 
            value={stats.lowStock + stats.outOfStock} 
            icon={<FiAlertTriangle className="w-6 h-6" />}
            trend={`${stats.outOfStock} out, ${stats.lowStock} low`}
            color="red"
            alert={stats.lowStock + stats.outOfStock > 0}
          />
          <StatCard 
            title="Expiring Soon" 
            value={stats.expiringSoon} 
            icon={<FiCalendar className="w-6 h-6" />}
            trend="Within 3 days"
            color="amber"
          />
          <StatCard 
            title="Inventory Value" 
            value={`₱${stats.totalInventoryValue.toLocaleString()}`} 
            icon={<FiDollarSign className="w-6 h-6" />}
            trend={`Avg: ₱${stats.averagePrice.toFixed(2)}`}
            color="green"
          />
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Charts */}
        <div className="xl:col-span-2 space-y-8">
          {/* Expiry Chart - SMALLER */}
          <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <HiOutlineCube className="w-6 h-6 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-800">Product Expiry Overview</h2>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-64 h-64"> {/* Smaller size */}
                <Doughnut data={expiryData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Stock & Price Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <FiTrendingUp className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Stock Levels</h2>
              </div>
              <div className="h-48">
                <Bar data={stockData} options={barChartOptions} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <FiDollarSign className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">Price Distribution</h2>
              </div>
              <div className="h-48">
                <Bar data={priceDistributionData} options={barChartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions & Filters */}
        <div className="space-y-8">
          {/* Quick Actions - REMOVED "Add Product" and "View All Products" */}
          <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <HiOutlineShoppingBag className="w-6 h-6 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Only 2 buttons now: Low Stock and Expiring Soon */}
              <QuickActionButton 
                icon={<FiAlertTriangle className="w-5 h-5" />}
                label="Low Stock" 
                color="red" 
                onClick={() => setActiveFilter("lowStock")}
              />
              <QuickActionButton 
                icon={<FiCalendar className="w-5 h-5" />}
                label="Expiring Soon" 
                color="green" 
                onClick={() => setActiveFilter("expiring")}
              />
            </div>
          </div>

          {/* Active Filter Display */}
          {activeFilter !== "all" && filteredProducts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <FiBell className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold text-gray-800">
                  {activeFilter === "lowStock" ? "Low Stock Alerts" : "Expiring Soon"}
                </h2>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {filteredProducts.slice(0, 8).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <HiOutlineCube className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="font-medium text-gray-800">{product.product_Name}</p>
                        <p className="text-sm text-gray-600">
                          {activeFilter === "lowStock" 
                            ? `Stock: ${product.product_Stock}` 
                            : `Expires: ${new Date(product.product_Expiry).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <FiEye className="w-4 h-4 text-amber-600" />
                  </div>
                ))}
                {filteredProducts.length > 8 && (
                  <p className="text-sm text-amber-600 text-center">
                    ... and {filteredProducts.length - 8} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* System Info */}
          <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <HiOutlineExclamationCircle className="w-6 h-6 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-800">System Information</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                <span className="font-medium text-gray-800">High Value Products</span>
                <span className="font-bold text-green-600">{stats.highValueProducts}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                <span className="font-medium text-gray-800">Average Product Value</span>
                <span className="font-bold text-blue-600">₱{stats.averagePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                <span className="font-medium text-gray-800">Data Last Updated</span>
                <span className="font-bold text-amber-600">{lastUpdated || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Log Report Section */}
      <div className="mt-8">
        <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <FiBarChart2 className="w-6 h-6 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-800">Admin Activity Logs</h2>
          </div>
          <AdminLogReport />
        </div>
      </div>
    </div>
  );
}