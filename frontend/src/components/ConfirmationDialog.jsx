import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

export default function ConfirmationDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', variant = 'danger', loading = false }) {
  const variants = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    primary: 'bg-primary-700 hover:bg-primary-800 text-white',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6 text-center">
        <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4 ${variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100'}`}>
          <AlertTriangle size={26} className={variant === 'danger' ? 'text-red-600' : 'text-yellow-600'} />
        </div>
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">{title || 'Are you sure?'}</h3>
        <p className="text-sm text-gray-500 mb-6">{message || 'This action cannot be undone.'}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2 ${variants[variant]}`}
          >
            {loading && <LoadingSpinner size="sm" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
