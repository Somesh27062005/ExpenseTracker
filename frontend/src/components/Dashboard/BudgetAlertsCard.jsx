import React, { useContext } from 'react';
import { LuArrowRight, LuTarget, LuTriangleAlert } from 'react-icons/lu';
import { UserContext } from '../../context/UserContext';
import { formatCurrency } from '../../utils/helper';

const BudgetAlertsCard = ({ budgetSummary, onManageBudgets }) => {
    const { user } = useContext(UserContext);
    const budgets = budgetSummary?.budgets || [];
    const alerts = budgets.filter((b) => b.status === "warning" || b.status === "exceeded");

    const getBarColor = (status) => {
        if (status === "exceeded") return "bg-red-500";
        if (status === "warning") return "bg-amber-500";
        return "bg-emerald-500";
    };

    const getBadgeStyle = (status) => {
        if (status === "exceeded") return "bg-red-50 text-red-600";
        if (status === "warning") return "bg-amber-50 text-amber-700";
        return "bg-emerald-50 text-emerald-700";
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-purple-50 text-primary flex items-center justify-center shrink-0">
                        <LuTarget className="text-lg" />
                    </div>
                    <div>
                        <h5 className="text-lg">Monthly Budgets</h5>
                        {budgetSummary?.month && (
                            <p className="text-xs text-gray-400">
                                Tracking period: {budgetSummary.month}
                            </p>
                        )}
                    </div>
                </div>

                <button type="button" className="card-btn" onClick={onManageBudgets}>
                    Manage Budgets <LuArrowRight className="text-base" />
                </button>
            </div>

            {alerts.length > 0 && (
                <div className="mt-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200/80 text-amber-800 rounded-xl px-4 py-3 text-xs md:text-sm">
                    <LuTriangleAlert className="text-base shrink-0 mt-0.5 text-amber-600" />
                    <p>
                        <span className="font-semibold">{alerts.length} budget alert(s):</span>{" "}
                        {alerts
                            .map((a) => `${a.category} (${a.percentage}%)`)
                            .join(", ")}
                    </p>
                </div>
            )}

            {budgets.length === 0 ? (
                <div className="py-8 text-center">
                    <p className="text-sm text-gray-400">
                        No budgets configured for this month yet.
                    </p>
                    <button
                        type="button"
                        onClick={onManageBudgets}
                        className="mt-3 text-xs font-medium text-purple-600 hover:underline cursor-pointer"
                    >
                        Set monthly spending limits →
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                    {budgets.slice(0, 4).map((budget) => (
                        <div
                            key={budget._id}
                            className="p-4 rounded-xl border border-gray-100 bg-gray-50/60"
                        >
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-sm font-medium text-gray-800 truncate">
                                    {budget.category}
                                </span>
                                <span
                                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getBadgeStyle(
                                        budget.status
                                    )}`}
                                >
                                    {budget.percentage}%
                                </span>
                            </div>

                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${getBarColor(budget.status)}`}
                                    style={{ width: `${Math.min(100, budget.percentage)}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                                <span>
                                    Spent:{" "}
                                    <strong className="text-gray-800">
                                        {formatCurrency(budget.spent, user?.currency)}
                                    </strong>
                                </span>
                                <span>
                                    Limit: {formatCurrency(budget.limit, user?.currency)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BudgetAlertsCard;
