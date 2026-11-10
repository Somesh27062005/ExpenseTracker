import React, { useMemo } from 'react';
import { LuArrowRight } from 'react-icons/lu';
import { prepareExpenseBarChartData } from '../../utils/helper';
import CustomBarChart from '../Charts/CustomBarChart';

const Last30DaysExpenses = ({ data = [], onSeeMore }) => {
    const chartData = useMemo(() => prepareExpenseBarChartData(data), [data]);

    return (
        <div className="card col-span-1">
            <div className="flex items-center justify-between">
                <h5 className="text-lg">Last 30 Days Expenses</h5>

                {onSeeMore && (
                    <button type="button" className="card-btn" onClick={onSeeMore}>
                        See All <LuArrowRight className="text-base" />
                    </button>
                )}
            </div>

            <CustomBarChart
                data={chartData}
                emptyMessage="No expenses recorded in the last 30 days."
            />
        </div>
    );
};

export default Last30DaysExpenses;
