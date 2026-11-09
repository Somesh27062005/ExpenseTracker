import React, { useContext } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { UserContext } from '../../context/UserContext';
import { formatCurrency } from '../../utils/helper';

const BarChartTooltip = ({ active, payload, currency }) => {
    if (active && payload && payload.length) {
        const row = payload[0].payload;
        return (
            <div className="bg-white shadow-md rounded-lg p-2.5 border border-gray-200">
                <p className="text-xs font-semibold text-purple-800 mb-1">
                    {row.category || row.source || row.month}
                </p>
                <p className="text-sm text-gray-600">
                    Amount:{" "}
                    <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(row.amount, currency)}
                    </span>
                </p>
            </div>
        );
    }
    return null;
};

const CustomBarChart = ({ data = [] }) => {
    const { user } = useContext(UserContext);

    const getBarColor = (index) => {
        return index % 2 === 0 ? "#875cf5" : "#cfbefb";
    };

    if (!data || data.length === 0) {
        return (
            <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">
                No transactions to display for this period.
            </div>
        );
    }

    return (
        <div className="bg-white mt-6">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid stroke="none" />

                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#555' }} stroke="none" />
                    <YAxis tick={{ fontSize: 12, fill: '#555' }} stroke="none" />

                    <Tooltip content={<BarChartTooltip currency={user?.currency} />} />

                    <Bar dataKey="amount" fill="#875cf5" radius={[10, 10, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`${entry.month}-${index}`} fill={getBarColor(index)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CustomBarChart;
