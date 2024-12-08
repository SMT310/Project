// components/common/Modal.jsx
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-70 flex justify-center items-center z-50 pointer-events-auto">
            {/* Overlay to block interactions */}
            <div
                className="absolute inset-0 z-40 bg-transparent pointer-events-auto"
                onClick={onClose} // Close the modal when overlay is clicked
            ></div>

            {/* Modal Content */}
            <div className="relative z-50 bg-white rounded-lg w-10/12 max-w-xl p-8 shadow-lg pointer-events-auto">
                <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                    onClick={onClose}
                >
                    ✕
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
