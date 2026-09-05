import React, { useState, useRef } from 'react';
import { X, Upload, Users, CheckCircle2, Loader2, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackendTeam, cookies } from '../../../lib/api';
import toast from 'react-hot-toast';

interface BulkUserImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: BackendTeam[];
  onSuccess: () => void;
}

interface UploadResult {
  success: boolean;
  message: string;
  successCount?: number;
  failedCount?: number;
  errors?: string[];
}

export const BulkUserImportModal: React.FC<BulkUserImportModalProps> = ({
  isOpen,
  onClose,
  teams,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Please select a valid CSV file');
        return;
      }
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    if (!confirm(`Upload ${file.name} to import users?`)) {
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const API_BASE_URL = `http://${window.location.hostname}:3000/api/v1`;
      const token = cookies.get('authToken');

      const response = await fetch(`${API_BASE_URL}/users/upload-users-csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setUploadResult({
        success: true,
        message: data.message || 'Users added successfully',
        errors: data.data?.errors || []
      });

      if (data.data?.successCount > 0 || data.data?.success > 0) {
        onSuccess();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      setUploadResult({
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 border-b border-purple-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Upload Users</h2>
                    <p className="text-purple-100 text-sm mt-1">Upload a CSV file to multiple users</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">

              {/* File Upload */}
              {!uploadResult && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Upload CSV File
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium mb-1">
                      {file ? file.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-sm text-gray-500">CSV files only</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  {file && !isUploading && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="font-semibold text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <button
                          onClick={handleReset}
                          className="text-red-600 hover:text-red-700 text-sm font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Uploading */}
              {isUploading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-4" />
                  <p className="text-gray-900 font-semibold text-lg mb-1">Uploading and processing...</p>
                  <p className="text-gray-500 text-sm">Please wait while the backend imports users</p>
                </div>
              )}

              {/* Results */}
              {uploadResult && (
                <div className="space-y-4">
                  {uploadResult.success ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                      <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-green-900 mb-2">Import Successful</h3>
                      <p className="text-green-700 mb-2">{uploadResult.message}</p>
                      {uploadResult.successCount !== undefined && (
                        <p className="text-green-600 font-semibold">
                          {uploadResult.successCount} users imported successfully
                          {uploadResult.failedCount && uploadResult.failedCount > 0 
                            ? `, ${uploadResult.failedCount} failed` 
                            : ''}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                      <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-red-900 mb-2">Import Failed</h3>
                      <p className="text-red-700">{uploadResult.message}</p>
                    </div>
                  )}

                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-h-64 overflow-y-auto">
                      <h4 className="font-semibold text-red-900 mb-2">Errors:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {uploadResult.errors.map((error, idx) => (
                          <li key={idx}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={handleReset}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                  >
                    Upload Another File
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {/* {!uploadResult && file && !isUploading && ( */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || teams.length === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload
                </button>
              </div>
            {/* )} */}

            {uploadResult && (
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
