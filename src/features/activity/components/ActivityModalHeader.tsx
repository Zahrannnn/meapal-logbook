import { X } from 'lucide-react';

interface ActivityModalHeaderProps {
  isEditing: boolean;
  onClose: () => void;
}

export const ActivityModalHeader = ({ isEditing, onClose }: ActivityModalHeaderProps) => (
  <div className="px-5 lg:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
    <div>
      <h2 className="text-lg font-bold text-gray-900">{isEditing ? 'Edit activity' : 'Log an activity'}</h2>
      <p className="text-sm text-gray-400 mt-0.5">
        {isEditing ? 'Update the details of this entry' : 'What did you work on?'}
      </p>
    </div>
    <button
      onClick={onClose}
      aria-label="Close"
      className="p-2 -mr-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
    >
      <X className="w-5 h-5" />
    </button>
  </div>
);
