import React, { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
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
import { formatDateForInput, getCurrentMonthKey } from '../../utils/helper';
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

    // Filters & sorting
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [dateRangePreset, setDateRangePreset] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sortBy, setSortBy] = useState("date_desc");

    const fetchExpenseDetails = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE);
            if (response.data) {
                setExpenseData(response.data);
            }
        } catch (error) {
            console.error("Error fetching expense details:", error);
            toast.error("Failed to fetch expense records.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExpenseDetails();
    }, [fetchExpenseDetails]);

    const categoryOptions = useMemo(() => {
        const seen = new Map();
        expenseData.forEach((item) => {
            const trimmed = item.category?.trim();
            if (trimmed) {
                const key = trimmed.toLowerCase();
                if (!seen.has(key)) seen.set(key, trimmed);
            }
        });
        return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
    }, [expenseData]);

    const filteredExpenses = useMemo(() => {
        const query = search.trim().toLowerCase();
        const currentMonth = getCurrentMonthKey();
        const thirtyDaysAgoKey = moment().subtract(30, "days").format("YYYY-MM-DD");

        const filtered = expenseData.filter((item) => {
            if (
                selectedCategory !== "all" &&
                item.category?.trim().toLowerCase() !== selectedCategory.trim().toLowerCase()
            ) {
                return false;
            }

            if (query) {
                const matchCategory = item.category?.toLowerCase().includes(query);
                const matchNotes = item.notes?.toLowerCase().includes(query);
                const matchMethod = item.paymentMethod?.toLowerCase().includes(query);
                if (!matchCategory && !matchNotes && !matchMethod) return false;
            }

            const itemDateKey = formatDateForInput(item.date);
            if (dateRangePreset === "this_month") {
                if (!itemDateKey.startsWith(currentMonth)) return false;
            } else if (dateRangePreset === "month") {
                if (!itemDateKey.startsWith(selectedMonth)) return false;
            } else if (dateRangePreset === "last_30") {
                if (itemDateKey < thirtyDaysAgoKey) return false;
            } else if (dateRangePreset === "custom") {
                if (startDate && itemDateKey < startDate) return false;
                if (endDate && itemDateKey > endDate) return false;
            }

            return true;
        });

        return [...filtered].sort((a, b) => {
            if (sortBy === "date_asc") {
                return new Date(a.date) - new Date(b.date);
            }
            if (sortBy === "amount_desc") {
                return Number(b.amount) - Number(a.amount);
            }
            if (sortBy === "amount_asc") {
                return Number(a.amount) - Number(b.amount);
            }
            return new Date(b.date) - new Date(a.date);
        });
    }, [expenseData, search, selectedCategory, dateRangePreset, selectedMonth, startDate, endDate, sortBy]);

    const hasActiveFilters =
        Boolean(search.trim()) ||
        selectedCategory !== "all" ||
        dateRangePreset !== "all" ||
        sortBy !== "date_desc";

    const handleResetFilters = () => {
        setSearch("");
        setSelectedCategory("all");
        setDateRangePreset("all");
        setSelectedMonth(getCurrentMonthKey());
        setStartDate("");
        setEndDate("");
        setSortBy("date_desc");
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
            fetchExpenseDetails();
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
            fetchExpenseDetails();
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
            const response = await axiosInstance.get(
                API_PATHS.EXPENSE.DOWNLOAD_EXPENSE,
                { responseType: "blob" }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "expense_details.xlsx");
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
                    onExpenseIncome={() => setFormModal({ show: true, data: null })}
                />

                <TransactionFilterBar
                    search={search}
                    onSearchChange={setSearch}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    categoryOptions={categoryOptions}
                    categoryLabel="Category"
                    dateRangePreset={dateRangePreset}
                    onDateRangePresetChange={setDateRangePreset}
                    selectedMonth={selectedMonth}
                    onSelectedMonthChange={setSelectedMonth}
                    startDate={startDate}
                    onStartDateChange={setStartDate}
                    endDate={endDate}
                    onEndDateChange={setEndDate}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                    hasActiveFilters={hasActiveFilters}
                    onResetFilters={handleResetFilters}
                />

                {loading && expenseData.length === 0 ? (
                    <div className="card py-14 flex flex-col items-center justify-center gap-2 text-gray-500">
                        <LuLoaderCircle className="animate-spin text-2xl text-primary" />
                        <p className="text-sm">Loading expense records...</p>
                    </div>
                ) : (
                    <ExpenseList
                        transactions={filteredExpenses}
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
