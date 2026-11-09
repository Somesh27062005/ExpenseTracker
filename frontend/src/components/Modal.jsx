import React, { useEffect } from 'react';

const Modal = ({ children, isOpen, onClose, title, maxWidth = "max-w-2xl" }) => {
    useEffect(() => {
        if (!isOpen) return undefined;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex justify-center items-center w-full h-full overflow-y-auto overflow-x-hidden bg-black/35 backdrop-blur-[1px] p-4"
            onClick={onClose}
        >
            <div
                className={`relative w-full ${maxWidth} max-h-[90vh] my-auto`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative bg-white rounded-xl shadow-xl border border-gray-200/70 max-h-[90vh] flex flex-col">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-200 shrink-0">
                        <h3 className="text-lg font-medium text-gray-900">
                            {title}
                        </h3>

                        <button
                            type="button"
                            className="text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center cursor-pointer transition-colors"
                            onClick={onClose}
                            aria-label="Close modal"
                        >
                            <svg
                                className="w-3 h-3"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="p-4 md:p-5 space-y-4 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
