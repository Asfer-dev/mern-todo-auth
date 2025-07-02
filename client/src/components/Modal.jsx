import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    isOpen && (
      <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    )
  );
};

export default Modal;
