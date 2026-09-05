import { Repeat, X } from 'lucide-react';

interface RecurringModalHeaderProps {
  onClose: () => void;
}

export const RecurringModalHeader: React.FC<RecurringModalHeaderProps> = ({ onClose }) => (
  <div className="px-5 lg:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
        <Repeat className="w-[18px] h-[18px]" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">Recurring activities</h2>
        <p className="text-sm text-gray-400 mt-0.5">Your activity templates that log themselves</p>
      </div>
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
