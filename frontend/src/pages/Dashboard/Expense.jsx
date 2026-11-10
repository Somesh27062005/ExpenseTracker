import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useUserAuth } from '../../hooks/useUserAuth';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import ExpenseOverview from '../../components/Expense/ExpenseOverview';
import AddExpenseForm from '../../components/Expense/AddExpenseForm';
import Modal from '../../components/Modal';
import ExpenseList from '../../components/Expense/ExpenseList';
import DeleteAlert from '../../components/DeleteAlert';
import TransactionFilterBar from '../../components/Filters/TransactionFilterBar';
import PeriodDetailsCard from '../../components/Filters/PeriodDetailsCard';
import {
    formatDateForInput,
    formatMonthLabel,
    getAvailableYears,
    getCurrentMonthKey,
    getCurrentYear,
} from '../../utils/helper';
import { LuLoaderCircle } from 'react-icons/lu';

const Expense = () => {
    useUserAuth();

    const [expenseData, setExpenseData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState({
        show: false,
        data: null,
    });
    const [formModal, setFormModal] = useState({
        show: false,
        data: null,
    });

    // Search & Monthly/Yearly Period Views
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
    const [selectedYear, setSelectedYear] = useState(getCurrentYear());

    const fetchExpenseDetails = useCallback(async ({ silent = false } = {}) => {
        if (!silent) {
            setLoading(true);
        }
        try {
            const response = await axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE);
            if (response.data) {
                setExpenseData(response.data);
            }
        } catch (error) {
            console.error("Error fetching expense details:", error);
            if (!silent) {
                toast.error("Failed to fetch expense records.");
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchExpenseDetails();
    }, [fetchExpenseDetails]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (
                document.visibilityState === "visible" &&
                !formModal.show &&
                !openDeleteAlert.show
            ) {
                fetchExpenseDetails({ silent: true });
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () =>
            document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [fetchExpenseDetails, formModal.show, openDeleteAlert.show]);

    const availableYears = useMemo(
        () => getAvailableYears(expenseData, selectedYear),
        [expenseData, selectedYear]
    );

    const filteredExpenses = useMemo(() => {
        const query = search.trim().toLowerCase();

        const filtered = expenseData.filter((item) => {
            if (query) {
                const matchCategory = item.category?.toLowerCase().includes(query);
                const matchNotes = item.notes?.toLowerCase().includes(query);
                const matchMethod = item.paymentMethod?.toLowerCase().includes(query);
                if (!matchCategory && !matchNotes && !matchMethod) return false;
            }

            const itemDateKey = formatDateForInput(item.date);
            if (viewMode === "month") {
                if (!itemDateKey.startsWith(selectedMonth)) return false;
            } else if (viewMode === "year") {
                if (!itemDateKey.startsWith(`${selectedYear}-`)) return false;
            }

            return true;
        });

        return [...filtered].sort((a, b) => {
            const dateDiff = new Date(b.date) - new Date(a.date);
            if (dateDiff !== 0) return dateDiff;
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
    }, [expenseData, search, viewMode, selectedMonth, selectedYear]);

    const periodLabel =
        viewMode === "month"
            ? formatMonthLabel(selectedMonth)
            : viewMode === "year"
            ? `Year ${selectedYear}`
            : "All Time";

    const hasActiveFilters = Boolean(search.trim()) || viewMode !== "all";

    const handleResetFilters = () => {
        setSearch("");
        setViewMode("all");
        setSelectedMonth(getCurrentMonthKey());
        setSelectedYear(getCurrentYear());
    };

    const handleSelectMonthFromYearly = (monthKey) => {
        setSelectedMonth(monthKey);
        setViewMode("month");
    };

    const handleSaveExpense = async (expense) => {
        const { category, amount, date, icon, paymentMethod, notes } = expense;

        if (!category.trim()) {
            toast.error("Category is required.");
            return;
        }
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            toast.error("Amount should be a valid number greater than 0.");
            return;
        }
        if (!date) {
            toast.error("Date is required.");
            return;
        }
        if (!paymentMethod || !paymentMethod.trim()) {
            toast.error("Please enter a payment method.");
            return;
        }

        const payload = {
            category,
            amount,
            date,
            icon,
            paymentMethod: paymentMethod.trim(),
            notes,
        };
        const editingId = formModal.data?._id;

        setSubmitting(true);
        try {
            if (editingId) {
                await axiosInstance.put(API_PATHS.EXPENSE.UPDATE_EXPENSE(editingId), payload);
                toast.success("Expense updated successfully");
            } else {
                await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, payload);
                toast.success("Expense added successfully");
            }

            setFormModal({ show: false, data: null });

            const savedDateKey = formatDateForInput(date) || date;
            if (viewMode === "month" && /^\d{4}-\d{2}/.test(savedDateKey)) {
                const savedMonth = savedDateKey.slice(0, 7);
                if (savedMonth !== selectedMonth) {
                    setSelectedMonth(savedMonth);
                }
            } else if (viewMode === "year" && /^\d{4}/.test(savedDateKey)) {
                const savedYear = Number(savedDateKey.slice(0, 4));
                if (savedYear !== Number(selectedYear)) {
                    setSelectedYear(savedYear);
                }
            }

            await fetchExpenseDetails({ silent: true });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save expense");
        } finally {
            setSubmitting(false);
        }
    };

    const deleteExpense = async (id) => {
        setDeleting(true);
        try {
            await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));
            setOpenDeleteAlert({ show: false, data: null });
            toast.success("Expense details deleted successfully");
            await fetchExpenseDetails({ silent: true });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete expense");
        } finally {
            setDeleting(false);
        }
    };

    const handleDownloadExpenseDetails = async () => {
        if (downloading) return;
        setDownloading(true);
        try {
            const params = {};
            if (viewMode === "month") params.month = selectedMonth;
            if (viewMode === "year") params.year = String(selectedYear);
            if (search.trim()) params.search = search.trim();

            const response = await axiosInstance.get(
                API_PATHS.EXPENSE.DOWNLOAD_EXPENSE,
                { params, responseType: "blob" }
            );

            const filename =
                viewMode === "month"
                    ? `expense_${selectedMonth}.xlsx`
                    : viewMode === "year"
                    ? `expense_${selectedYear}.xlsx`
                    : "expense_details.xlsx";

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Expense spreadsheet downloaded");
        } catch (error) {
            console.error("Error downloading expense details:", error);
            toast.error("Failed to download expense details. Please try again later.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <DashboardLayout activeMenu="Expense">
            <div className="my-5 mx-auto space-y-6">
                <ExpenseOverview
                    transactions={filteredExpenses}
                    viewMode={viewMode}
                    periodLabel={periodLabel}
                    selectedYear={selectedYear}
                    onAddExpense={() => setFormModal({ show: true, data: null })}
                />

                <TransactionFilterBar
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search category, notes, payment..."
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    selectedMonth={selectedMonth}
                    onSelectedMonthChange={setSelectedMonth}
                    selectedYear={selectedYear}
                    onSelectedYearChange={setSelectedYear}
                    availableYears={availableYears}
                    hasActiveFilters={hasActiveFilters}
                    onResetFilters={handleResetFilters}
                />

                <PeriodDetailsCard
                    type="expense"
                    viewMode={viewMode}
                    transactions={filteredExpenses}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onSelectMonth={handleSelectMonthFromYearly}
                />

                {loading && expenseData.length === 0 ? (
                    <div className="card py-14 flex flex-col items-center justify-center gap-2 text-gray-500">
                        <LuLoaderCircle className="animate-spin text-2xl text-primary" />
                        <p className="text-sm">Loading expense records...</p>
                    </div>
                ) : (
                    <ExpenseList
                        transactions={filteredExpenses}
                        periodLabel={periodLabel}
                        onEdit={(expenseItem) =>
                            setFormModal({ show: true, data: expenseItem })
                        }
                        onDelete={(id) => {
                            setOpenDeleteAlert({ show: true, data: id });
                        }}
                        onDownload={handleDownloadExpenseDetails}
                        isDownloading={downloading}
                    />
                )}
            </div>

            <Modal
                isOpen={formModal.show}
                onClose={() => !submitting && setFormModal({ show: false, data: null })}
                title={formModal.data ? "Edit Expense" : "Add Expense"}
            >
                <AddExpenseForm
                    key={formModal.data?._id || "new-expense"}
                    initialData={formModal.data}
                    onAddExpense={handleSaveExpense}
                    isSubmitting={submitting}
                />
            </Modal>

            <Modal
                isOpen={openDeleteAlert.show}
                onClose={() => !deleting && setOpenDeleteAlert({ show: false, data: null })}
                title="Delete Expense"
            >
                <DeleteAlert
                    content="Are you sure you want to delete this expense record?"
                    onDelete={() => deleteExpense(openDeleteAlert.data)}
                    isDeleting={deleting}
                />
            </Modal>
        </DashboardLayout>
    );
};

export default Expense;
