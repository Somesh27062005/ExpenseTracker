import React, { useCallback, useContext, useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/UserContext';
import {
    formatCurrency,
    formatMonthLabel,
    getCurrentMonthKey,
} from '../../utils/helper';
import { BUDGET_CATEGORY_SUGGESTIONS } from '../../utils/data';
import Modal from '../../components/Modal';
import DeleteAlert from '../../components/DeleteAlert';
import Input from '../../components/Inputs/Input';
import MonthPicker from '../../components/Inputs/MonthPicker';
import toast from 'react-hot-toast';
import {
    LuPlus,
    LuTarget,
    LuPencil,
    LuTrash2,
    LuTriangleAlert,
    LuCircleCheck,
    LuLoaderCircle,
} from 'react-icons/lu';

const BudgetForm = ({ defaultMonth, initialData, onSubmit, isSubmitting = false }) => {
    const [category, setCategory] = useState(initialData?.category || "Overall");
    const [limit, setLimit] = useState(initialData?.limit ?? "");
    const [month, setMonth] = useState(initialData?.month || defaultMonth);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isSubmitting) {
            onSubmit({ category, limit, month });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 items-start mb-1">
                <div className="mb-4">
                    <MonthPicker
                        value={month}
                        onChange={setMonth}
                        label="Budget Month"
                        showSteppers={false}
                        align="left"
                        disabled={isSubmitting}
                    />
                </div>

                <Input
                    value={limit}
                    onChange={({ target }) => setLimit(target.value)}
                    label="Monthly Spending Limit"
                    placeholder="500"
                    type="number"
                    min="1"
                    step="1"
                    disabled={isSubmitting}
                />
            </div>

            <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Quick Categories</p>
                <div className="flex flex-wrap gap-2">
                    {BUDGET_CATEGORY_SUGGESTIONS.map((item) => (
                        <button
                            key={item}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => setCategory(item)}
                            className={`text-xs px-3 py-1 rounded-full border cursor-pointer transition-colors ${
                                category.toLowerCase() === item.toLowerCase()
                                    ? "bg-primary text-white border-primary"
                                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-purple-50"
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            <Input
                value={category}
                onChange={({ target }) => setCategory(target.value)}
                label="Category (or 'Overall' for total monthly limit)"
                placeholder="Food, Rent, Overall..."
                type="text"
                disabled={isSubmitting}
            />

            <div className="flex justify-end mt-6">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="add-btn add-btn-fill"
                >
                    {isSubmitting && <LuLoaderCircle className="animate-spin text-base" />}
                    <span>
                        {isSubmitting
                            ? "Saving..."
                            : initialData?._id
                            ? "Update Budget"
                            : "Save Budget"}
                    </span>
                </button>
            </div>
        </form>
    );
};

const Budgets = () => {
    useUserAuth();
    const { user } = useContext(UserContext);
    const currency = user?.currency || "USD";

    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
    const [summary, setSummary] = useState({
        month: selectedMonth,
        totalBudgeted: 0,
        totalMonthlySpent: 0,
        budgets: [],
        categoryBreakdown: [],
    });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [formModal, setFormModal] = useState({ show: false, data: null });
    const [deleteAlert, setDeleteAlert] = useState({ show: false, id: null });

    const fetchBudgets = useCallback(async (targetMonth) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_PATHS.BUDGETS.GET_BUDGETS, {
                params: { month: targetMonth },
            });
            if (response.data) {
                setSummary(response.data);
            }
        } catch (error) {
            console.error("Error fetching budgets:", error);
            toast.error("Failed to fetch monthly budgets.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBudgets(selectedMonth);
    }, [selectedMonth, fetchBudgets]);

    const handleSaveBudget = async ({ category, limit, month }) => {
        if (!category.trim()) {
            toast.error("Category is required.");
            return;
        }
        if (!limit || isNaN(limit) || Number(limit) < 1) {
            toast.error("Budget limit must be at least 1.");
            return;
        }
        if (!/^\d{4}-\d{2}$/.test(month)) {
            toast.error("Please select a valid month.");
            return;
        }

        setSubmitting(true);
        try {
            await axiosInstance.post(API_PATHS.BUDGETS.UPSERT_BUDGET, {
                category: category.trim(),
                limit: Number(limit),
                month,
            });
            toast.success("Budget saved successfully");
            setFormModal({ show: false, data: null });
            if (month !== selectedMonth) {
                setSelectedMonth(month);
            } else {
                fetchBudgets(selectedMonth);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save budget");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteBudget = async (id) => {
        setDeleting(true);
        try {
            await axiosInstance.delete(API_PATHS.BUDGETS.DELETE_BUDGET(id));
            setDeleteAlert({ show: false, id: null });
            toast.success("Budget deleted successfully");
            fetchBudgets(selectedMonth);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete budget");
        } finally {
            setDeleting(false);
        }
    };

    const budgets = summary?.budgets || [];
    const categoryBreakdown = summary?.categoryBreakdown || [];
    const alerts = budgets.filter((b) => b.status === "warning" || b.status === "exceeded");
    const totalRemaining = (summary.totalBudgeted || 0) - (summary.totalMonthlySpent || 0);
    const formattedMonth = formatMonthLabel(selectedMonth);

    const getBarColor = (status) => {
        if (status === "exceeded") return "bg-red-500";
        if (status === "warning") return "bg-amber-500";
        return "bg-emerald-500";
    };

    const getStatusBadge = (status) => {
        if (status === "exceeded") {
            return (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-red-50 text-red-600">
                    <LuTriangleAlert className="text-xs" /> Exceeded
                </span>
            );
        }
        if (status === "warning") {
            return (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
                    <LuTriangleAlert className="text-xs" /> Near Limit
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                <LuCircleCheck className="text-xs" /> On Track
            </span>
        );
    };

    return (
        <DashboardLayout activeMenu="Budgets">
            <div className="my-5 mx-auto space-y-6">
                {/* Header */}
                <div className="card">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Monthly Budgets &amp; Spending Limits
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Choose a month to inspect expenses against your &quot;Overall&quot; or category spending caps.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                                    Budget Month:
                                </span>
                                <MonthPicker
                                    value={selectedMonth}
                                    onChange={setSelectedMonth}
                                    align="right"
                                />
                            </div>
                            <button
                                type="button"
                                className="add-btn add-btn-fill self-start sm:self-auto"
                                onClick={() => setFormModal({ show: true, data: null })}
                            >
                                <LuPlus className="text-base" />
                                Set Budget
                            </button>
                        </div>
                    </div>

                    {/* Monthly Summary Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100">
                        <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100">
                            <p className="text-xs text-purple-700 font-medium">
                                Budget Limit ({formattedMonth})
                            </p>
                            <p className="text-xl font-semibold text-gray-900 mt-1">
                                {formatCurrency(summary.totalBudgeted || 0, currency)}
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/60">
                            <p className="text-xs text-gray-500 font-medium">
                                Expenses in {formattedMonth}
                            </p>
                            <p className="text-xl font-semibold text-gray-900 mt-1">
                                {formatCurrency(summary.totalMonthlySpent || 0, currency)}
                            </p>
                        </div>

                        <div
                            className={`p-4 rounded-xl border ${
                                totalRemaining >= 0
                                    ? "bg-emerald-50/70 border-emerald-100"
                                    : "bg-red-50/70 border-red-100"
                            }`}
                        >
                            <p
                                className={`text-xs font-medium ${
                                    totalRemaining >= 0 ? "text-emerald-700" : "text-red-600"
                                }`}
                            >
                                {totalRemaining >= 0 ? "Remaining Budget" : "Over Budget"}
                            </p>
                            <p
                                className={`text-xl font-semibold mt-1 ${
                                    totalRemaining >= 0 ? "text-emerald-700" : "text-red-600"
                                }`}
                            >
                                {formatCurrency(Math.abs(totalRemaining), currency)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Alert Banner */}
                {alerts.length > 0 && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-5 py-3.5 text-sm">
                        <LuTriangleAlert className="text-lg shrink-0 mt-0.5 text-amber-600" />
                        <div>
                            <span className="font-semibold">Spending Alert:</span>{" "}
                            {alerts
                                .map((a) => `${a.category} has reached ${a.percentage}%`)
                                .join(" · ")}
                        </div>
                    </div>
                )}

                {/* Budgets Grid */}
                {loading && budgets.length === 0 ? (
                    <div className="card py-14 flex flex-col items-center justify-center gap-2 text-gray-500">
                        <LuLoaderCircle className="animate-spin text-2xl text-primary" />
                        <p className="text-sm">Loading budgets for {formattedMonth}...</p>
                    </div>
                ) : budgets.length === 0 ? (
                    <div className="card py-14 text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-purple-50 text-primary flex items-center justify-center mb-3">
                            <LuTarget className="text-2xl" />
                        </div>
                        <h4 className="text-base font-medium text-gray-800">
                            No budgets set for {formattedMonth}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                            Create an &quot;Overall&quot; limit or category budgets like Food, Rent, and Groceries to track spending for {formattedMonth}.
                        </p>
                        <button
                            type="button"
                            onClick={() => setFormModal({ show: true, data: null })}
                            className="add-btn add-btn-fill mx-auto mt-4"
                        >
                            <LuPlus className="text-base" />
                            Create First Budget
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {budgets.map((budget) => (
                            <div key={budget._id} className="card p-5 space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h5 className="text-base font-semibold text-gray-900">
                                                {budget.category}
                                            </h5>
                                            {getStatusBadge(budget.status)}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {formatMonthLabel(budget.month)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setFormModal({ show: true, data: budget })}
                                            className="p-1.5 text-gray-400 hover:text-purple-600 cursor-pointer"
                                            title="Edit budget"
                                        >
                                            <LuPencil size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDeleteAlert({ show: true, id: budget._id })
                                            }
                                            className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer"
                                            title="Delete budget"
                                        >
                                            <LuTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                                        <span>
                                            Spent:{" "}
                                            <strong className="text-gray-900">
                                                {formatCurrency(budget.spent, currency)}
                                            </strong>
                                        </span>
                                        <span className="font-medium">{budget.percentage}%</span>
                                    </div>

                                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${getBarColor(
                                                budget.status
                                            )}`}
                                            style={{
                                                width: `${Math.min(100, budget.percentage)}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-xs mt-2">
                                        <span className="text-gray-500">
                                            Limit: {formatCurrency(budget.limit, currency)}
                                        </span>
                                        <span
                                            className={`font-medium ${
                                                budget.remaining >= 0
                                                    ? "text-emerald-600"
                                                    : "text-red-500"
                                            }`}
                                        >
                                            {budget.remaining >= 0
                                                ? `${formatCurrency(budget.remaining, currency)} left`
                                                : `${formatCurrency(
                                                      Math.abs(budget.remaining),
                                                      currency
                                                  )} over`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Monthly Category Spending Overview */}
                {categoryBreakdown.length > 0 && (
                    <div className="card">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <div>
                                <h4 className="text-base font-medium text-gray-900">
                                    Expenses by Category — {formattedMonth}
                                </h4>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Actual spending logged in {formattedMonth}. Click any category to set or adjust its cap.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {categoryBreakdown.map((item) => {
                                const matchingBudget = budgets.find(
                                    (b) =>
                                        b.category.trim().toLowerCase() ===
                                        String(item.name || "").trim().toLowerCase()
                                );

                                return (
                                    <button
                                        key={item.name}
                                        type="button"
                                        onClick={() =>
                                            setFormModal({
                                                show: true,
                                                data: matchingBudget || {
                                                    category: item.name,
                                                    limit: "",
                                                    month: selectedMonth,
                                                },
                                            })
                                        }
                                        className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200/70 bg-gray-50/70 hover:bg-purple-50/60 hover:border-purple-200 transition-colors cursor-pointer text-left"
                                    >
                                        <div className="min-w-0 pr-2">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {item.name}
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                                {matchingBudget
                                                    ? `Budgeted: ${formatCurrency(
                                                          matchingBudget.limit,
                                                          currency
                                                      )}`
                                                    : "No budget cap · Click to set"}
                                            </p>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 shrink-0">
                                            {formatCurrency(item.amount, currency)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={formModal.show}
                onClose={() => !submitting && setFormModal({ show: false, data: null })}
                title={formModal.data?._id ? "Edit Monthly Budget" : "Set Monthly Budget"}
            >
                <BudgetForm
                    key={`${formModal.data?._id || formModal.data?.category || "new"}-${selectedMonth}`}
                    defaultMonth={selectedMonth}
                    initialData={formModal.data}
                    onSubmit={handleSaveBudget}
                    isSubmitting={submitting}
                />
            </Modal>

            <Modal
                isOpen={deleteAlert.show}
                onClose={() => !deleting && setDeleteAlert({ show: false, id: null })}
                title="Delete Budget"
            >
                <DeleteAlert
                    content="Are you sure you want to remove this budget limit?"
                    onDelete={() => handleDeleteBudget(deleteAlert.id)}
                    isDeleting={deleting}
                />
            </Modal>
        </DashboardLayout>
    );
};

export default Budgets;
