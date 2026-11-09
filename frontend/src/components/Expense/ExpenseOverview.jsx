import React, { useMemo } from 'react';
import { prepareExpenseLineChartData } from '../../utils/helper';
import { LuPlus } from 'react-icons/lu';
import CustomLineChart from '../Charts/CustomLineChart';

const ExpenseOverview = ({ transactions = [], onExpenseIncome }) => {
    const chartData = useMemo(
        () => prepareExpenseLineChartData(transactions),
        [transactions]
    );

    return (
        <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h5 className="text-lg">Expense Overview</h5>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Track your spending trends over time and gain insights into where your money goes.
                    </p>
                </div>

                <button type="button" className="add-btn self-start sm:self-auto" onClick={onExpenseIncome}>
                    <LuPlus className="text-lg" />
                    Add Expense
                </button>
            </div>

            <div className="mt-8">
                <CustomLineChart data={chartData} />
            </div>
        </div>
    );
};

export default ExpenseOverview;
