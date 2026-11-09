import React, { useContext } from 'react';
import CustomPieChart from '../Charts/CustomPieChart';
import { UserContext } from '../../context/UserContext';
import { formatCurrency } from '../../utils/helper';

const COLORS = ["#875CF5", "#FA2C37", "#FF6900"];

const FinanceOverview = ({ totalBalance = 0, totalIncome = 0, totalExpense = 0 }) => {
    const { user } = useContext(UserContext);

    const balanceData = [
        { name: "Total Balance", amount: Math.max(0, totalBalance) },
        { name: "Total Expenses", amount: totalExpense },
        { name: "Total Income", amount: totalIncome },
    ];

    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <h5 className="text-lg">Financial Overview</h5>
            </div>

            <CustomPieChart
                data={balanceData}
                label="Total Balance"
                totalAmount={formatCurrency(totalBalance, user?.currency)}
                colors={COLORS}
                showTextAnchor
            />
        </div>
    );
};

export default FinanceOverview;
