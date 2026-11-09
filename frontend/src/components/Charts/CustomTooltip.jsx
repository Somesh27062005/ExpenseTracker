import React, { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { formatCurrency } from '../../utils/helper';

const CustomTooltip = ({ active, payload }) => {
    const { user } = useContext(UserContext);

    if (active && payload && payload.length) {
        return (
            <div className="bg-white shadow-md rounded-lg p-2.5 border border-gray-200">
                <p className="text-xs font-semibold text-purple-800 mb-1">
                    {payload[0].name}
                </p>
                <p className="text-sm text-gray-600">
                    Amount:{" "}
                    <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(payload[0].value, user?.currency)}
                    </span>
                </p>
            </div>
        );
    }
    return null;
};

export default CustomTooltip;
