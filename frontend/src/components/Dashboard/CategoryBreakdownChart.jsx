import React, { useContext } from 'react';
import { LuArrowRight } from 'react-icons/lu';
import { UserContext } from '../../context/UserContext';
import { formatCurrency } from '../../utils/helper';

const BAR_COLORS = [
    "bg-[#875cf5]",
    "bg-orange-500",
    "bg-rose-500",
    "bg-sky-500",
    "bg-emerald-500",
    "bg-amber-500",
];

const CategoryBreakdownChart = ({ data = [], totalSpent = 0, onViewExpenses }) => {
    const { user } = useContext(UserContext);

    const computedTotal =
        totalSpent > 0
            ? totalSpent
            : data.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h5 className="text-lg">Monthly Category Breakdown</h5>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Top spending categories this month
                    </p>
                </div>

                {onViewExpenses && (
                    <button type="button" className="card-btn" onClick={onViewExpenses}>
                        Details <LuArrowRight className="text-base" />
                    </button>
                )}
            </div>

            {!data || data.length === 0 ? (
                <div className="h-[260px] flex items-center justify-center text-sm text-gray-400 text-center">
                    No expenses logged this month yet.
                </div>
            ) : (
                <div className="space-y-4 mt-4">
                    {data.slice(0, 6).map((item, index) => {
                        const pct =
                            computedTotal > 0
                                ? Math.round((Number(item.amount || 0) / computedTotal) * 100)
                                : 0;

                        return (
                            <div key={item.name || index}>
                                <div className="flex items-center justify-between text-sm mb-1.5">
                                    <span className="font-medium text-gray-800 truncate pr-2">
                                        {item.name}
                                    </span>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs text-gray-500">{pct}%</span>
                                        <span className="font-semibold text-gray-900">
                                            {formatCurrency(item.amount, user?.currency)}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${BAR_COLORS[index % BAR_COLORS.length]}`}
                                        style={{ width: `${Math.min(100, Math.max(pct, 2))}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CategoryBreakdownChart;
