import React, { useContext } from 'react';
import {
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Area,
    AreaChart,
} from 'recharts';
import { UserContext } from '../../context/UserContext';
import { formatCurrency } from '../../utils/helper';

const LineChartTooltip = ({ active, payload, currency }) => {
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

const CustomLineChart = ({ data = [] }) => {
    const { user } = useContext(UserContext);

    if (!data || data.length === 0) {
        return (
            <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">
                No expense data available to chart.
            </div>
        );
    }

    return (
        <div className="bg-white">
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="expenseAreaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#875cf5" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#875cf5" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid stroke="none" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#555' }} stroke="none" />
                    <YAxis tick={{ fontSize: 12, fill: '#555' }} stroke="none" />
                    <Tooltip content={<LineChartTooltip currency={user?.currency} />} />

                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#875cf5"
                        fill="url(#expenseAreaGradient)"
                        strokeWidth={3}
                        dot={{ r: 3, fill: '#ab8df8' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CustomLineChart;
