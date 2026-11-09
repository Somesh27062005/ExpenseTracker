import React from 'react';

const InfoCard = ({ icon, label, value, color, subtext }) => {
    return (
        <div className="flex items-center gap-5 bg-white p-5 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
            <div
                className={`w-14 h-14 flex items-center justify-center text-[26px] text-white ${color} rounded-full drop-shadow-xl shrink-0`}
            >
                {icon}
            </div>
            <div className="min-w-0">
                <h6 className="text-sm text-gray-500 mb-1 truncate">{label}</h6>
                <span className="text-[22px] font-semibold text-gray-900 block truncate">
                    {value}
                </span>
                {subtext && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{subtext}</p>
                )}
            </div>
        </div>
    );
};

export default InfoCard;
