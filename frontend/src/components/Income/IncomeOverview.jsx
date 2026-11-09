import React, { useMemo } from 'react';
import { LuPlus } from 'react-icons/lu';
import CustomBarChart from '../Charts/CustomBarChart';
import { prepareIncomeBarChartData } from '../../utils/helper';

const IncomeOverview = ({ transactions = [], onAddIncome }) => {
    const chartData = useMemo(
        () => prepareIncomeBarChartData(transactions),
        [transactions]
    );

    return (
        <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h5 className="text-lg">Income Overview</h5>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Track your earnings over time and analyze your income trends.
                    </p>
                </div>

                <button type="button" className="add-btn self-start sm:self-auto" onClick={onAddIncome}>
                    <LuPlus className="text-lg" />
                    Add Income
                </button>
            </div>

            <div className="mt-8">
                <CustomBarChart data={chartData} />
            </div>
        </div>
    );
};

export default IncomeOverview;
