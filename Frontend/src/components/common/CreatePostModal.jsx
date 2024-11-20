// components/common/Modal.jsx
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-lg w-11/12 max-w-md p-6 relative">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-black"
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
