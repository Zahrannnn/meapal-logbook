import React, { useState, useRef } from 'react';
import { X, Upload, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackendTeam } from '../../../lib/api';
import { toast } from '@/lib/toast';
import { uploadUsersCsv } from '../services/bulk-import.service';
import { UploadPicker, UploadResultView, UploadingState } from './BulkImportStates';

interface BulkUserImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: BackendTeam[];
  onSuccess: () => void;
}

export interface UploadResult {
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
      const data = await uploadUsersCsv(file);

      setUploadResult({
        success: true,
        message: data.message || 'Users added successfully',
        errors: data.data?.errors || []
      });

      if (data.data?.successCount || data.data?.success) {
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
              {!uploadResult && (
                <UploadPicker
                  file={file}
                  isUploading={isUploading}
                  fileInputRef={fileInputRef}
                  onFileSelect={handleFileSelect}
                  onReset={handleReset}
                />
              )}

              {isUploading && <UploadingState />}

              {uploadResult && <UploadResultView result={uploadResult} onReset={handleReset} />}
            </div>

            {/* Footer */}
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
