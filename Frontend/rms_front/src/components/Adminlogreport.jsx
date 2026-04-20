// components/AdminLogReport.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
axios.defaults.withCredentials = true;

export default function AdminLogReport() {
  const [logs, setLogs] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    adminId: '',
    startDate: '',
    endDate: '',
    action: ''
  });
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 30
  });
  const [showExportSuggestion, setShowExportSuggestion] = useState(false);

  // Fetch admins for filter dropdown - using axios with credentials
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get('http://localhost:3000/logs/admins');
        if (response.data) {
          setAdmins(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch admins:', err);
      }
    };

    fetchAdmins();
  }, []);

  // Fetch logs with filters
  const fetchLogs = async (filterParams = {}, page = 1, forExport = false) => {
    try {
      if (!forExport) setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      
      // Use adminId for filtering (from admins table)
      const backendFilters = { ...filterParams };
      
      Object.entries(backendFilters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      if (!forExport) {
        queryParams.append('page', page);
        queryParams.append('limit', pagination.limit);
      } else {
        queryParams.delete('page');
        queryParams.delete('limit');
      }

      const response = await axios.get(`http://localhost:3000/logs?${queryParams}`);
      const data = response.data;
      
      if (response.status === 200) {
        if (forExport) {
          return data.logs || [];
        } else {
          setLogs(data.logs || []);
          setPagination({
            currentPage: data.currentPage || page,
            totalPages: data.totalPages || 1,
            totalItems: data.totalItems || 0,
            limit: pagination.limit
          });
          
          if (data.totalItems > 30) {
            setShowExportSuggestion(true);
          } else {
            setShowExportSuggestion(false);
          }
        }
      } else {
        setError(data.error || 'Failed to fetch logs');
        return [];
      }
    } catch (err) {
      setError('Failed to connect to server');
      return [];
    } finally {
      if (!forExport) setLoading(false);
    }
  };

  // Initial fetch and fetch when filters change
  useEffect(() => {
    fetchLogs(filters, 1);
  }, [filters]);

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchLogs(filters, newPage);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      adminId: '',
      startDate: '',
      endDate: '',
      action: ''
    });
  };

  // Export to PDF function
  const exportToPDF = async () => {
    try {
      setExportLoading(true);
      
      // Fetch ALL logs without pagination for PDF export
      const allLogs = await fetchLogs(filters, 1, true);
      
      if (allLogs.length === 0) {
        setError('No data to export');
        return;
      }
      
      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(0, 0, 0);
      pdf.text('ADMIN ACTIVITY LOGS', 105, 20, { align: 'center' });
      
      // Add generation date
      pdf.setFontSize(11);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, 30, { align: 'center' });
      
      // Add filter information if any filter is active
      let yPos = 45;
      if (filters.adminId || filters.action || filters.startDate || filters.endDate) {
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        let filterText = 'Filters Applied: ';
        const filterParts = [];
        
        // Get admin email from admins table using adminId
        if (filters.adminId) {
          const admin = admins.find(a => a.id.toString() === filters.adminId);
          filterParts.push(`Admin: ${admin?.email || 'Unknown Admin'}`);
        }
        
        if (filters.action) {
          filterParts.push(`Action: ${filters.action}`);
        }
        
        if (filters.startDate) {
          filterParts.push(`From: ${filters.startDate}`);
        }
        
        if (filters.endDate) {
          filterParts.push(`To: ${filters.endDate}`);
        }
        
        filterText += filterParts.join(' | ');
        
        // Split long filter text into multiple lines
        const lines = pdf.splitTextToSize(filterText, 170);
        
        lines.forEach((line) => {
          pdf.text(line, 20, yPos);
          yPos += 7;
        });
        
        yPos += 5;
      }
      
      // Draw header separator
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, yPos, 190, yPos);
      yPos += 10;
      
      // Table headers
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      
      // Header background
      pdf.setFillColor(245, 158, 11); // Amber color
      pdf.rect(20, yPos - 8, 170, 10, 'F');
      
      pdf.setTextColor(255, 255, 255); // White text
      pdf.text('#', 25, yPos);
      pdf.text('Date & Time', 40, yPos);
      pdf.text('Admin', 85, yPos);
      pdf.text('Action', 125, yPos);
      pdf.text('Product', 155, yPos);
      
      yPos += 10;
      pdf.setDrawColor(150, 150, 150);
      pdf.line(20, yPos, 190, yPos);
      yPos += 5;
      
      // Table data
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      allLogs.forEach((log, index) => {
        // Check if we need a new page
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
          
          // Draw header on new page
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setFillColor(245, 158, 11);
          pdf.rect(20, yPos - 8, 170, 10, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.text('#', 25, yPos);
          pdf.text('Date & Time', 40, yPos);
          pdf.text('Admin', 85, yPos);
          pdf.text('Action', 125, yPos);
          pdf.text('Product', 155, yPos);
          yPos += 15;
        }
        
        // Row number
        pdf.text((index + 1).toString(), 25, yPos);
        
        // Date & Time
        const timestamp = `${formatDate(log.timestamp)} ${formatTime(log.timestamp)}`;
        pdf.text(timestamp, 40, yPos);
        
        // Admin email
        const adminEmail = log.admin?.email || 'Unknown Admin';
        const shortAdmin = adminEmail.length > 20 ? adminEmail.substring(0, 17) + '...' : adminEmail;
        pdf.text(shortAdmin, 85, yPos);
        
        // Action
        const actionText = log.action
          .replace('_PRODUCT', '')
          .replace('_', ' ');
        pdf.text(actionText.substring(0, 15), 125, yPos);
        
        // Product name
        const productName = log.product?.product_Name || 'N/A';
        const shortProduct = productName.length > 15 ? productName.substring(0, 12) + '...' : productName;
        pdf.text(shortProduct, 155, yPos);
        
        // Details on next line if there are details
        if (log.actionDetails) {
          yPos += 5;
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          const details = pdf.splitTextToSize(`Details: ${log.actionDetails}`, 160);
          details.forEach((detailLine) => {
            pdf.text(detailLine, 25, yPos);
            yPos += 5;
          });
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
        }
        
        yPos += 10;
        
        // Row separator
        pdf.setDrawColor(230, 230, 230);
        pdf.line(20, yPos - 5, 190, yPos - 5);
      });
      
      // Add page numbers
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Page ${i} of ${totalPages} • Total Records: ${allLogs.length}`,
          105,
          287,
          { align: 'center' }
        );
      }
      
      // Generate filename
      const currentDate = new Date().toISOString().split('T')[0];
      let filename = `Admin-Logs-${currentDate}`;
      if (filters.adminId || filters.action || filters.startDate || filters.endDate) {
        filename += '-Filtered';
      }
      filename += '.pdf';
      
      // Save PDF
      pdf.save(filename);
      
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError('Failed to export PDF: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Get action badge color
  const getActionColor = (action) => {
    const colors = {
      CREATE_PRODUCT: 'bg-green-100 text-green-800',
      UPDATE_PRODUCT: 'bg-blue-100 text-blue-800',
      DELETE_PRODUCT: 'bg-red-100 text-red-800',
      ARCHIVE_PRODUCT: 'bg-yellow-100 text-yellow-800',
      UNARCHIVE_PRODUCT: 'bg-purple-100 text-purple-800',
      ARCHIVE: 'bg-yellow-100 text-yellow-800',
      RESTORE: 'bg-purple-100 text-purple-800',
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  // Format timestamp to time only
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  // Format timestamp to date only
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-amber-600"></div>
          <p className="mt-2 text-gray-700">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error bg-red-50 border border-red-200">
        <span className="text-red-700">Error loading logs: {error}</span>
      </div>
    );
  }

  return (
    <div className="admin-log-report">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-700 font-medium">
            Showing {logs.length} of {pagination.totalItems} activities
          </div>
          <button
            onClick={exportToPDF}
            disabled={exportLoading || pagination.totalItems === 0}
            className="px-4 py-2 text-sm font-medium text-red-800 bg-red-100 border border-red-400 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {exportLoading ? 'Generating PDF...' : 'Export to PDF'}
          </button>
        </div>
      </div>

      {/* Export Suggestion Banner */}
      {showExportSuggestion && (
        <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-blue-900 font-medium">Large dataset detected</p>
                <p className="text-blue-800 text-sm">
                  You have {pagination.totalItems} activities. Export to PDF to view all data at once.
                </p>
              </div>
            </div>
            <button
              onClick={exportToPDF}
              disabled={exportLoading}
              className="px-3 py-1 text-sm font-medium text-white bg-blue-700 rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 transition-colors"
            >
              {exportLoading ? 'Exporting...' : 'Export Full PDF'}
            </button>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-300 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Admin Filter - Uses admins table data */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Filter by Admin
            </label>
            <select 
              value={filters.adminId}
              onChange={(e) => handleFilterChange('adminId', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white text-gray-900"
            >
              <option value="" className="text-gray-700">All Admins</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id} className="text-gray-900">
                  {admin.email}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Filter by Action
            </label>
            <select 
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white text-gray-900"
            >
              <option value="" className="text-gray-700">All Actions</option>
              <option value="CREATE_PRODUCT" className="text-gray-900">CREATE PRODUCT</option>
              <option value="UPDATE_PRODUCT" className="text-gray-900">UPDATE PRODUCT</option>
              <option value="DELETE_PRODUCT" className="text-gray-900">DELETE PRODUCT</option>
              <option value="ARCHIVE_PRODUCT" className="text-gray-900">ARCHIVE PRODUCT</option>
              <option value="ARCHIVE" className="text-gray-900">ARCHIVE</option>
              <option value="UNARCHIVE_PRODUCT" className="text-gray-900">UNARCHIVE PRODUCT</option>
              <option value="RESTORE" className="text-gray-900">RESTORE</option>
            </select>
          </div>

          {/* Start Date Filter */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white text-gray-900"
            />
          </div>

          {/* End Date Filter */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white text-gray-900"
            />
          </div>

          {/* Clear Filters Button */}
          <div className="flex-1 min-w-[100px]">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2.5 text-sm font-medium text-gray-900 bg-gray-200 border border-gray-400 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
        {logs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider border-b border-gray-300">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider border-b border-gray-300">
                      Admin
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider border-b border-gray-300">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider border-b border-gray-300">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider border-b border-gray-300">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-amber-50 transition-colors duration-150">
                      <td className="px-4 py-3 whitespace-nowrap border-b border-gray-200">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(log.timestamp)}
                        </div>
                        <div className="text-xs text-gray-700">
                          {formatTime(log.timestamp)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-b border-gray-200">
                        <div className="text-sm font-medium text-gray-900">
                          {log.admin?.email || 'Unknown Admin'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-b border-gray-200">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getActionColor(log.action)}`}>
                          {log.action.replace('_PRODUCT', '').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-b border-gray-200">
                        <div className="text-sm font-medium text-gray-900">
                          {log.product?.product_Name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        <div className="text-sm text-gray-800 max-w-xs">
                          {log.actionDetails || 'No additional details'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 bg-gray-100 border-t border-gray-300">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-1 text-sm font-medium text-gray-900 bg-white border border-gray-400 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-3 py-1 text-sm font-medium text-gray-900 bg-white border border-gray-400 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-3">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-700 text-lg font-medium mb-2">No activity logs found</p>
            <p className="text-gray-600 text-sm">
              {Object.values(filters).some(filter => filter !== '') 
                ? 'Try adjusting your filters' 
                : 'Admin activities will appear here once they start making changes'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}