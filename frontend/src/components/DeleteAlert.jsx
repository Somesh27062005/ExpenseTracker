import React from 'react';
import { LuLoaderCircle } from 'react-icons/lu';

const DeleteAlert = ({ content, onDelete, confirmLabel = "Delete", isDeleting = false }) => {
    return (
        <div>
            <p className="text-sm text-gray-700">{content}</p>

            <div className="flex justify-end mt-6">
                <button
                    type="button"
                    disabled={isDeleting}
                    className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-full px-5 py-2 cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={onDelete}
                >
                    {isDeleting && <LuLoaderCircle className="animate-spin text-base" />}
                    <span>{isDeleting ? "Deleting..." : confirmLabel}</span>
                </button>
            </div>
        </div>
    );
};

export default DeleteAlert;
