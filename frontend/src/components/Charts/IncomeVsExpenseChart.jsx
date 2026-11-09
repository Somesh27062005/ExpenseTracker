import React, { useContext } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { UserContext } from '../../context/UserContext';
import { formatCurrency } from '../../utils/helper';

const TrendTooltip = ({ active, payload, label, currency }) => {
    if (active && payload && payload.length) {
        const row = payload[0]?.payload;
        const net = (row?.income || 0) - (row?.expense || 0);
        return (
            <div className="bg-white shadow-md rounded-lg p-3 border border-gray-200 text-xs space-y-1">
                <p className="font-semibold text-gray-800 mb-1">{label}</p>
                <p className="text-purple-600 font-medium">
                    Income: {formatCurrency(row?.income || 0, currency)}
                </p>
                <p className="text-red-500 font-medium">
                    Expense: {formatCurrency(row?.expense || 0, currency)}
                </p>
                <p className={`pt-1 border-t border-gray-100 font-semibold ${net >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    Net: {formatCurrency(net, currency)}
                </p>
            </div>
        );
    }
    return null;
};

const IncomeVsExpenseChart = ({ data = [] }) => {
    const { user } = useContext(UserContext);

    const hasValues = data.some((item) => item.income > 0 || item.expense > 0);

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h5 className="text-lg">6-Month Income vs Expense</h5>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Monthly cashflow comparison over the last 6 months
                    </p>
                </div>
            </div>

            {!hasValues ? (
                <div className="h-[280px] flex items-center justify-center text-sm text-gray-400">
                    Add income and expenses to view your 6-month trend.
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data} barGap={6}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#555' }} stroke="none" />
                        <YAxis tick={{ fontSize: 12, fill: '#555' }} stroke="none" />
                        <Tooltip content={<TrendTooltip currency={user?.currency} />} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar
                            dataKey="income"
                            name="Income"
                            fill="#875cf5"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={32}
                        />
                        <Bar
                            dataKey="expense"
                            name="Expense"
                            fill="#fa2c37"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={32}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default IncomeVsExpenseChart;
