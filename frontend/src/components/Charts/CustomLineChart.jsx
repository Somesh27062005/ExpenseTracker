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
        const heading =
            row.monthFull || row.fullDate || row.category || row.source || row.month;
        const subLabel =
            row.monthFull || row.fullDate ? row.category || row.source : "";
        return (
            <div className="bg-white shadow-md rounded-lg p-2.5 border border-gray-200 max-w-[240px]">
                <p className="text-xs font-semibold text-purple-800 mb-0.5">
                    {heading}
                </p>
                {subLabel && (
                    <p className="text-[11px] text-gray-500 mb-1 truncate">
                        {subLabel}
                    </p>
                )}
                <p className="text-sm text-gray-600">
                    Amount:{" "}
                    <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(row.amount, currency)}
                    </span>
                </p>
                {typeof row.count === "number" && row.count > 0 && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        {row.count} {row.count === 1 ? "record" : "records"}
                    </p>
                )}
            </div>
        );
    }
    return null;
};

const CustomLineChart = ({
    data = [],
    emptyMessage = "No expense data available to chart.",
}) => {
    const { user } = useContext(UserContext);

    const hasValues =
        Array.isArray(data) &&
        data.some((item) => Number(item?.amount || 0) > 0);

    if (!data || data.length === 0 || !hasValues) {
        return (
            <div className="h-[260px] flex items-center justify-center text-sm text-gray-400 text-center px-4">
                {emptyMessage}
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
