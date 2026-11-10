import React, { useContext, useMemo } from 'react';
import { UserContext } from '../../context/UserContext';
import {
    buildCategoryBreakdown,
    formatCurrency,
    formatMonthLabel,
    prepareYearlyMonthlyChartData,
} from '../../utils/helper';

const BAR_COLORS = [
    "bg-[#875cf5]",
    "bg-emerald-500",
    "bg-sky-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-orange-500",
];

const PeriodDetailsCard = ({
    type = "income",
    viewMode = "all",
    transactions = [],
    selectedMonth,
    selectedYear,
    onSelectMonth,
}) => {
    const { user } = useContext(UserContext);
    const currency = user?.currency || "USD";
    const isExpense = type === "expense";
    const fieldName = isExpense ? "category" : "source";
    const fieldLabel = isExpense ? "Categories" : "Sources";

    const yearlyMonths = useMemo(() => {
        if (viewMode !== "year") return [];
        return prepareYearlyMonthlyChartData(transactions, selectedYear);
    }, [viewMode, transactions, selectedYear]);

    const breakdown = useMemo(() => {
        if (viewMode === "all") return [];
        return buildCategoryBreakdown(transactions, fieldName);
    }, [viewMode, transactions, fieldName]);

    if (viewMode === "all") {
        return null;
    }

    if (viewMode === "month" && breakdown.length === 0) {
        return null;
    }

    const periodTitle =
        viewMode === "month"
            ? formatMonthLabel(selectedMonth)
            : String(selectedYear);

    return (
        <div className="card space-y-6">
            {viewMode === "year" && (
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
                        <div>
                            <h5 className="text-lg">
                                Monthly Breakdown ({selectedYear})
                            </h5>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Month-by-month {type} totals for {selectedYear}. Click any month to inspect its details.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {yearlyMonths.map((m) => {
                            const hasEntries = m.count > 0;
                            return (
                                <button
                                    key={m.monthKey}
                                    type="button"
                                    onClick={() => onSelectMonth && onSelectMonth(m.monthKey)}
                                    className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                                        hasEntries
                                            ? "bg-purple-50/40 border-purple-200/80 hover:bg-purple-50 hover:border-purple-300"
                                            : "bg-gray-50/60 border-gray-200/60 hover:bg-gray-100/70"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span
                                            className={`text-sm font-medium ${
                                                hasEntries ? "text-gray-900" : "text-gray-500"
                                            }`}
                                        >
                                            {m.monthName}
                                        </span>
                                        <span className="text-[11px] text-gray-400 shrink-0">
                                            {m.count} {m.count === 1 ? "rec" : "recs"}
                                        </span>
                                    </div>
                                    <p
                                        className={`text-base font-semibold mt-1.5 ${
                                            hasEntries
                                                ? isExpense
                                                    ? "text-red-600"
                                                    : "text-emerald-600"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {formatCurrency(m.amount, currency)}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {breakdown.length > 0 && (
                <div className={viewMode === "year" ? "pt-5 border-t border-gray-100" : ""}>
                    <div className="mb-4">
                        <h5 className="text-lg">
                            {fieldLabel} in {periodTitle}
                        </h5>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Distribution across {breakdown.length}{" "}
                            {breakdown.length === 1
                                ? isExpense
                                    ? "category"
                                    : "source"
                                : isExpense
                                ? "categories"
                                : "sources"}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {breakdown.map((item, index) => (
                            <div key={item.name}>
                                <div className="flex items-center justify-between text-sm mb-1.5 gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-medium text-gray-800 truncate">
                                            {item.name}
                                        </span>
                                        <span className="text-[11px] text-gray-400 shrink-0">
                                            ({item.count} {item.count === 1 ? "record" : "records"})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs text-gray-500">
                                            {item.percentage}%
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            {formatCurrency(item.amount, currency)}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${BAR_COLORS[index % BAR_COLORS.length]}`}
                                        style={{
                                            width: `${Math.min(100, Math.max(item.percentage, 2))}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PeriodDetailsCard;
