import React, { useCallback, useContext, useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/UserContext';
import {
    formatCurrency,
    formatDateDisplay,
    formatDateForInput,
    getTodayInputDate,
    isIconUrl,
} from '../../utils/helper';
import {
    EXPENSE_CATEGORIES,
    INCOME_SOURCES,
} from '../../utils/data';
import Modal from '../../components/Modal';
import DeleteAlert from '../../components/DeleteAlert';
import Input from '../../components/Inputs/Input';
import PaymentMethodSelect from '../../components/Inputs/PaymentMethodSelect';
import EmojiPickerPopup from '../../components/EmojiPickerPopup';
import toast from 'react-hot-toast';
import {
    LuPlus,
    LuRepeat,
    LuRefreshCw,
    LuPause,
    LuPlay,
    LuPencil,
    LuTrash2,
    LuCalendar,
    LuUtensils,
    LuLoaderCircle,
} from 'react-icons/lu';

const RecurringForm = ({ initialData, onSubmit, isSubmitting = false }) => {
    const isEditMode = Boolean(initialData?._id);

    const [form, setForm] = useState({
        type: initialData?.type || "expense",
        title: initialData?.title || "",
        amount: initialData?.amount ?? "",
        frequency: initialData?.frequency || "monthly",
        nextDueDate: initialData?.nextDueDate
            ? formatDateForInput(initialData.nextDueDate)
            : getTodayInputDate(),
        icon: initialData?.icon || "",
        paymentMethod: initialData?.paymentMethod || "Cash",
        notes: initialData?.notes || "",
    });

    const handleChange = (key, value) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleTypeSwitch = (nextType) => {
        setForm((prev) => ({
            ...prev,
            type: nextType,
        }));
    };

    const suggestions =
        form.type === "income" ? INCOME_SOURCES : EXPENSE_CATEGORIES;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isSubmitting) {
            onSubmit(form);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Type Toggle */}
            <div className="mb-4">
                <p className="text-[13px] text-slate-800 mb-2">Transaction Type</p>
                <div className="grid grid-cols-2 gap-2.5">
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleTypeSwitch("expense")}
                        className={`py-2 px-4 rounded-lg text-sm font-medium border cursor-pointer transition-colors ${
                            form.type === "expense"
                                ? "bg-red-50 border-red-200 text-red-600"
                                : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                    >
                        Expense
                    </button>
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleTypeSwitch("income")}
                        className={`py-2 px-4 rounded-lg text-sm font-medium border cursor-pointer transition-colors ${
                            form.type === "income"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                    >
                        Income
                    </button>
                </div>
            </div>

            <EmojiPickerPopup
                icon={form.icon}
                onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
            />

            <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">
                    Quick {form.type === "income" ? "Sources" : "Categories"}
                </p>
                <div className="flex flex-wrap gap-2">
                    {suggestions.map((item) => (
                        <button
                            key={item}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleChange("title", item)}
                            className={`text-xs px-3 py-1 rounded-full border cursor-pointer transition-colors ${
                                form.title.toLowerCase() === item.toLowerCase()
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
                value={form.title}
                onChange={({ target }) => handleChange("title", target.value)}
                label={form.type === "income" ? "Income Source" : "Expense Category"}
                placeholder={
                    form.type === "income"
                        ? "Salary, Retainer, etc."
                        : "Rent, Subscriptions, Utilities..."
                }
                type="text"
                disabled={isSubmitting}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Input
                    value={form.amount}
                    onChange={({ target }) => handleChange("amount", target.value)}
                    label="Amount"
                    placeholder="0.00"
                    type="number"
                    min="0.01"
                    step="0.01"
                    disabled={isSubmitting}
                />

                <Input
                    value={form.nextDueDate}
                    onChange={({ target }) => handleChange("nextDueDate", target.value)}
                    label="Next Due Date"
                    type="date"
                    disabled={isSubmitting}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <div>
                    <label className="text-[13px] text-slate-800">Frequency</label>
                    <select
                        value={form.frequency}
                        onChange={({ target }) => handleChange("frequency", target.value)}
                        disabled={isSubmitting}
                        className="input-box cursor-pointer disabled:opacity-70"
                    >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>

                <PaymentMethodSelect
                    value={form.paymentMethod}
                    onChange={(method) => handleChange("paymentMethod", method)}
                    disabled={isSubmitting}
                />
            </div>

            <Input
                value={form.notes}
                onChange={({ target }) => handleChange("notes", target.value)}
                label="Notes (Optional)"
                placeholder="Netflix, Apartment lease, Monthly SIP..."
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
                            : isEditMode
                            ? "Update Schedule"
                            : "Save Schedule"}
                    </span>
                </button>
            </div>
        </form>
    );
};

const toMonthlyEquivalent = (amount, frequency) => {
    const val = Number(amount || 0);
    if (frequency === "weekly") return (val * 52) / 12;
    if (frequency === "yearly") return val / 12;
    return val;
};

const Recurring = () => {
    useUserAuth();
    const { user } = useContext(UserContext);
    const currency = user?.currency || "USD";

    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [formModal, setFormModal] = useState({ show: false, data: null });
    const [deleteAlert, setDeleteAlert] = useState({ show: false, id: null });

    const fetchRecurring = useCallback(async (showGeneratedToast = false) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_PATHS.RECURRING.GET_ALL);
            if (response.data) {
                setRules(response.data.rules || []);
                if (showGeneratedToast && response.data.generatedCount > 0) {
                    toast.success(
                        `Auto-logged ${response.data.generatedCount} due transaction(s)`
                    );
                }
            }
        } catch (error) {
            console.error("Error fetching recurring rules:", error);
            toast.error("Failed to fetch recurring transactions.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecurring(true);
    }, [fetchRecurring]);

    const handleSyncNow = async () => {
        if (syncing) return;
        setSyncing(true);
        try {
            const response = await axiosInstance.post(API_PATHS.RECURRING.SYNC);
            toast.success(response.data?.message || "Schedules synced");
            await fetchRecurring(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to sync schedules");
        } finally {
            setSyncing(false);
        }
    };

    const handleSaveRule = async (form) => {
        if (!form.title.trim()) {
            toast.error("Title is required.");
            return;
        }
        if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
            toast.error("Amount must be greater than 0.");
            return;
        }
        if (!form.nextDueDate) {
            toast.error("Next due date is required.");
            return;
        }

        const payload = {
            ...form,
            title: form.title.trim(),
            amount: Number(form.amount),
        };
        const editingId = formModal.data?._id;

        setSubmitting(true);
        try {
            if (editingId) {
                await axiosInstance.put(API_PATHS.RECURRING.UPDATE(editingId), payload);
                toast.success("Recurring rule updated");
            } else {
                await axiosInstance.post(API_PATHS.RECURRING.ADD, payload);
                toast.success("Recurring rule created");
            }

            setFormModal({ show: false, data: null });
            fetchRecurring(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save rule");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleActive = async (rule) => {
        if (togglingId) return;
        setTogglingId(rule._id);
        try {
            await axiosInstance.put(API_PATHS.RECURRING.UPDATE(rule._id), {
                isActive: !rule.isActive,
            });
            toast.success(rule.isActive ? "Schedule paused" : "Schedule resumed");
            await fetchRecurring(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        } finally {
            setTogglingId(null);
        }
    };

    const handleDeleteRule = async (id) => {
        setDeleting(true);
        try {
            await axiosInstance.delete(API_PATHS.RECURRING.DELETE(id));
            setDeleteAlert({ show: false, id: null });
            toast.success("Recurring schedule deleted");
            fetchRecurring(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete rule");
        } finally {
            setDeleting(false);
        }
    };

    const activeRules = rules.filter((r) => r.isActive);
    const monthlyIncomeEst = activeRules
        .filter((r) => r.type === "income")
        .reduce((sum, r) => sum + toMonthlyEquivalent(r.amount, r.frequency), 0);
    const monthlyExpenseEst = activeRules
        .filter((r) => r.type === "expense")
        .reduce((sum, r) => sum + toMonthlyEquivalent(r.amount, r.frequency), 0);

    return (
        <DashboardLayout activeMenu="Recurring">
            <div className="my-5 mx-auto space-y-6">
                {/* Header */}
                <div className="card">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Recurring Transactions
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Automate rent, salary, subscriptions, and EMIs. Due items auto-log whenever you open your dashboard.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handleSyncNow}
                                disabled={syncing}
                                className="card-btn"
                            >
                                <LuRefreshCw className={`text-base ${syncing ? "animate-spin" : ""}`} />
                                <span>{syncing ? "Syncing..." : "Sync Due Now"}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormModal({ show: true, data: null })}
                                className="add-btn add-btn-fill"
                            >
                                <LuPlus className="text-base" />
                                Add Recurring
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100">
                        <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100">
                            <p className="text-xs text-purple-700 font-medium">Active Schedules</p>
                            <p className="text-xl font-semibold text-gray-900 mt-1">
                                {activeRules.length}{" "}
                                <span className="text-xs font-normal text-gray-500">
                                    / {rules.length} total
                                </span>
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
                            <p className="text-xs text-emerald-700 font-medium">
                                Est. Monthly Recurring Income
                            </p>
                            <p className="text-xl font-semibold text-emerald-700 mt-1">
                                {formatCurrency(monthlyIncomeEst, currency)}
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-red-50/70 border border-red-100">
                            <p className="text-xs text-red-600 font-medium">
                                Est. Monthly Recurring Expense
                            </p>
                            <p className="text-xl font-semibold text-red-600 mt-1">
                                {formatCurrency(monthlyExpenseEst, currency)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Rules List */}
                {loading && rules.length === 0 ? (
                    <div className="card py-14 flex flex-col items-center justify-center gap-2 text-gray-500">
                        <LuLoaderCircle className="animate-spin text-2xl text-primary" />
                        <p className="text-sm">Loading recurring schedules...</p>
                    </div>
                ) : rules.length === 0 ? (
                    <div className="card py-14 text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-purple-50 text-primary flex items-center justify-center mb-3">
                            <LuRepeat className="text-2xl" />
                        </div>
                        <h4 className="text-base font-medium text-gray-800">
                            No recurring rules yet
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                            Schedule repeating bills like Rent, Subscriptions, or monthly Salary so they are tracked automatically.
                        </p>
                        <button
                            type="button"
                            onClick={() => setFormModal({ show: true, data: null })}
                            className="add-btn add-btn-fill mx-auto mt-4"
                        >
                            <LuPlus className="text-base" />
                            Create Recurring Rule
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {rules.map((rule) => {
                            const isIncome = rule.type === "income";
                            const isToggling = togglingId === rule._id;

                            return (
                                <div
                                    key={rule._id}
                                    className={`card p-5 space-y-4 ${
                                        !rule.isActive ? "opacity-70 bg-gray-50/60" : ""
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-700">
                                                {rule.icon ? (
                                                    isIconUrl(rule.icon) ? (
                                                        <img
                                                            src={rule.icon}
                                                            alt={rule.title}
                                                            className="w-6 h-6 object-contain"
                                                        />
                                                    ) : (
                                                        <span className="text-xl leading-none select-none">
                                                            {rule.icon}
                                                        </span>
                                                    )
                                                ) : (
                                                    <LuUtensils />
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h5 className="text-base font-semibold text-gray-900 truncate">
                                                        {rule.title}
                                                    </h5>
                                                    <span
                                                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase ${
                                                            isIncome
                                                                ? "bg-emerald-50 text-emerald-700"
                                                                : "bg-red-50 text-red-600"
                                                        }`}
                                                    >
                                                        {rule.type}
                                                    </span>
                                                    {!rule.isActive && (
                                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                                                            Paused
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                                                    <span className="capitalize font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                                                        {rule.frequency}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <LuCalendar className="text-xs" />
                                                        Next: {formatDateDisplay(rule.nextDueDate)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <p
                                                className={`text-base font-semibold ${
                                                    isIncome ? "text-emerald-600" : "text-red-500"
                                                }`}
                                            >
                                                {isIncome ? "+" : "-"}{" "}
                                                {formatCurrency(rule.amount, currency)}
                                            </p>
                                            {rule.paymentMethod && (
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    {rule.paymentMethod}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {rule.notes && (
                                        <p className="text-xs text-gray-500 border-t border-gray-100 pt-2.5 truncate">
                                            {rule.notes}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                                        <button
                                            type="button"
                                            disabled={isToggling}
                                            onClick={() => handleToggleActive(rule)}
                                            className="card-btn text-xs"
                                        >
                                            {isToggling ? (
                                                <LuLoaderCircle className="animate-spin text-sm" />
                                            ) : rule.isActive ? (
                                                <LuPause className="text-sm" />
                                            ) : (
                                                <LuPlay className="text-sm" />
                                            )}
                                            <span>
                                                {isToggling
                                                    ? "Updating..."
                                                    : rule.isActive
                                                    ? "Pause"
                                                    : "Resume"}
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormModal({ show: true, data: rule })}
                                            className="p-2 text-gray-500 hover:text-purple-600 cursor-pointer"
                                            title="Edit schedule"
                                        >
                                            <LuPencil size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDeleteAlert({ show: true, id: rule._id })
                                            }
                                            className="p-2 text-gray-500 hover:text-red-500 cursor-pointer"
                                            title="Delete schedule"
                                        >
                                            <LuTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Modal
                isOpen={formModal.show}
                onClose={() => !submitting && setFormModal({ show: false, data: null })}
                title={formModal.data ? "Edit Recurring Schedule" : "Add Recurring Schedule"}
            >
                <RecurringForm
                    key={formModal.data?._id || "new-recurring"}
                    initialData={formModal.data}
                    onSubmit={handleSaveRule}
                    isSubmitting={submitting}
                />
            </Modal>

            <Modal
                isOpen={deleteAlert.show}
                onClose={() => !deleting && setDeleteAlert({ show: false, id: null })}
                title="Delete Recurring Rule"
            >
                <DeleteAlert
                    content="Are you sure you want to delete this recurring schedule? Past generated transactions will remain intact."
                    onDelete={() => handleDeleteRule(deleteAlert.id)}
                    isDeleting={deleting}
                />
            </Modal>
        </DashboardLayout>
    );
};

export default Recurring;
