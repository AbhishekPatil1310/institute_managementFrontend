import React, { useState } from 'react';
import api from '../../../services/api';
import { Download, Calendar, FileSpreadsheet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const ReportDownloader = () => {
  const [dateRange, setDateRange] = useState({ fromDate: '', toDate: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    const { fromDate, toDate } = dateRange;

    if (!fromDate || !toDate) {
      setStatus({ type: 'error', message: 'Please select both start and end dates.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Replace with your actual API endpoint
      const response = await api.get('api/admins/reports/download', {
        params: { fromDate, toDate },
        responseType: 'blob', // Required for binary files
      });

      // Create a URL for the downloaded blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Filename formatting
      const filename = `Academic_Report_${fromDate}_to_${toDate}.xlsx`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setStatus({ type: 'success', message: 'Report downloaded successfully!' });
    } catch (error) {
      console.error('Export error:', error);
      setStatus({ 
        type: 'error', 
        message: 'Failed to generate report. Please check server connection.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg text-green-600">
          <FileSpreadsheet size={24} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Export Admin Data</h2>
      </div>

      <form onSubmit={handleDownload} className="space-y-5">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <Calendar size={14} /> From Date
            </label>
            <input
              type="date"
              name="fromDate"
              value={dateRange.fromDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <Calendar size={14} /> To Date
            </label>
            <input
              type="date"
              name="toDate"
              value={dateRange.toDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-white transition-all ${
            loading 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
          }`}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Download size={20} />
          )}
          {loading ? 'Processing...' : 'Download Excel Report'}
        </button>
      </form>

      {status.message && (
        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
          status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {status.message}
        </div>
      )}
    </div>
  );
};

export default ReportDownloader;