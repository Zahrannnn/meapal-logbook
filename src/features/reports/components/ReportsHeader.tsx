import React from 'react';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReportsHeaderProps {
  canExport: boolean;
  isExporting: boolean;
  onExportCsv: () => void;
  onExportDetailed: () => void;
  hideDetailedExport?: boolean;
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  canExport,
  isExporting,
  onExportCsv,
  onExportDetailed,
  hideDetailedExport,
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-5 lg:p-6">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          Reports & Export
        </h2>
        <p className="text-gray-500 mt-1.5 text-sm">Generate and export activity reports</p>
      </div>

      <div className="flex gap-3">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onExportCsv} disabled={isExporting || !canExport} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          Export CSV
        </motion.button>
        {!hideDetailedExport && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onExportDetailed} disabled={isExporting || !canExport} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
            Detailed Report
          </motion.button>
        )}
      </div>
    </div>
  </div>
);
