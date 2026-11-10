import React, { useContext, useMemo } from 'react';
import { LuPlus } from 'react-icons/lu';
import CustomLineChart from '../Charts/CustomLineChart';
import { UserContext } from '../../context/UserContext';
import {
    formatCurrency,
    prepareDailyChartData,
    prepareExpenseLineChartData,
    prepareYearlyMonthlyChartData,
} from '../../utils/helper';

const ExpenseOverview = ({
    transactions = [],
    viewMode = "all",
    periodLabel = "All Time",
    selectedYear,
    onExpenseIncome,
    onAddExpense,
}) => {
    const { user } = useContext(UserContext);
    const currency = user?.currency || "USD";
    const handleAddClick = onAddExpense || onExpenseIncome;

    const chartData = useMemo(() => {
        if (viewMode === "year") {
            return prepareYearlyMonthlyChartData(transactions, selectedYear);
        }
        if (viewMode === "month") {
            return prepareDailyChartData(transactions, "expense");
        }
        return prepareExpenseLineChartData(transactions);
    }, [transactions, viewMode, selectedYear]);

    const summary = useMemo(() => {
        const total = transactions.reduce(
            (sum, item) => sum + Number(item?.amount || 0),
            0
        );
        const activeMonths =
            viewMode === "year"
                ? chartData.filter((item) => item.count > 0).length
                : 0;

        return {
            total,
            activeMonths,
        };
    }, [transactions, viewMode, chartData]);

    const subtitle =
        viewMode === "month"
            ? `Monthly expense details and daily trend for ${periodLabel}.`
            : viewMode === "year"
            ? `Yearly expense details and month-by-month trend for ${periodLabel}.`
            : "Track your spending trends over time and gain insights into where your money goes.";

    const emptyMessage =
        viewMode === "all"
            ? "No expense data available to chart."
            : `No expenses recorded for ${periodLabel}.`;

    return (
        <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-lg">Expense Overview</h5>
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                            {periodLabel}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
                </div>

                <button
                    type="button"
                    className="add-btn self-start sm:self-auto"
                    onClick={handleAddClick}
                >
                    <LuPlus className="text-lg" />
                    Add Expense
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-100">
                    <p className="text-xs font-medium text-red-600">
                        Total Expenses ({periodLabel})
                    </p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                        {formatCurrency(summary.total, currency)}
                    </p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/70">
                    <p className="text-xs font-medium text-gray-500">
                        {viewMode === "year" ? "Active Months / Records" : "Records"}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                        {viewMode === "year"
                            ? `${summary.activeMonths} / 12 mo · ${transactions.length}`
                            : `${transactions.length} ${transactions.length === 1 ? "record" : "records"}`}
                    </p>
                </div>
            </div>

            <div className="mt-6">
                <CustomLineChart data={chartData} emptyMessage={emptyMessage} />
            </div>
        </div>
    );
};

export default ExpenseOverview;
