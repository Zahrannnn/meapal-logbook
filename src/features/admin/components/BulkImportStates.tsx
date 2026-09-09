import React from 'react';
import { Upload, CheckCircle2, Loader2, FileText, AlertCircle } from 'lucide-react';
import type { UploadResult } from './BulkUserImportModal';

/** The drag-and-drop CSV picker plus the selected-file card. */
export const UploadPicker: React.FC<{
  file: File | null;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
}> = ({ file, isUploading, fileInputRef, onFileSelect, onReset }) => (
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
        onChange={onFileSelect}
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
            onClick={onReset}
            className="text-red-600 hover:text-red-700 text-sm font-semibold"
          >
            Remove
          </button>
        </div>
      </div>
    )}
  </div>
);

export const UploadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-4" />
    <p className="text-gray-900 font-semibold text-lg mb-1">Uploading and processing...</p>
    <p className="text-gray-500 text-sm">Please wait while the backend imports users</p>
  </div>
);

/** Success/failure banner, the per-row error list and the "upload another" reset. */
export const UploadResultView: React.FC<{
  result: UploadResult;
  onReset: () => void;
}> = ({ result, onReset }) => (
  <div className="space-y-4">
    {result.success ? (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-green-900 mb-2">Import Successful</h3>
        <p className="text-green-700 mb-2">{result.message}</p>
        {result.successCount !== undefined && (
          <p className="text-green-600 font-semibold">
            {result.successCount} users imported successfully
            {result.failedCount && result.failedCount > 0
              ? `, ${result.failedCount} failed`
              : ''}
          </p>
        )}
      </div>
    ) : (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-red-900 mb-2">Import Failed</h3>
        <p className="text-red-700">{result.message}</p>
      </div>
    )}

    {result.errors && result.errors.length > 0 && (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-h-64 overflow-y-auto">
        <h4 className="font-semibold text-red-900 mb-2">Errors:</h4>
        <ul className="text-sm text-red-700 space-y-1">
          {result.errors.map((error, idx) => (
            <li key={idx}>• {error}</li>
          ))}
        </ul>
      </div>
    )}

    <button
      onClick={onReset}
      className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
    >
      Upload Another File
    </button>
  </div>
);
