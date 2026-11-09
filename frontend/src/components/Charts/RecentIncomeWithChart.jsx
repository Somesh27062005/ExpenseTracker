import React, { useContext, useMemo } from 'react';
import CustomPieChart from './CustomPieChart';
import { UserContext } from '../../context/UserContext';
import { formatCurrency } from '../../utils/helper';

const COLORS = ["#875CF5", "#FA2C37", "#FF6900", "#4f39f6", "#10b981"];

const RecentIncomeWithChart = ({ data = [], totalIncome = 0 }) => {
    const { user } = useContext(UserContext);

    const chartData = useMemo(() => {
        const grouped = new Map();
        (data || []).forEach((item) => {
            const key = item?.source || "Other";
            grouped.set(key, (grouped.get(key) || 0) + Number(item?.amount || 0));
        });

        return Array.from(grouped.entries())
            .map(([name, amount]) => ({ name, amount }))
            .slice(0, 5);
    }, [data]);

    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <h5 className="text-lg">Last 60 Days Income</h5>
            </div>

            <CustomPieChart
                data={chartData}
                label="Total Income"
                totalAmount={formatCurrency(totalIncome, user?.currency)}
                showTextAnchor
                colors={COLORS}
            />
        </div>
    );
};

export default RecentIncomeWithChart;
