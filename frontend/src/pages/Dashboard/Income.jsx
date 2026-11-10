import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import IncomeOverview from '../../components/Income/IncomeOverview';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Modal from '../../components/Modal';
import AddIncomeForm from '../../components/Income/AddIncomeForm';
import toast from 'react-hot-toast';
import IncomeList from '../../components/Income/IncomeList';
import DeleteAlert from '../../components/DeleteAlert';
import TransactionFilterBar from '../../components/Filters/TransactionFilterBar';
import PeriodDetailsCard from '../../components/Filters/PeriodDetailsCard';
import { useUserAuth } from '../../hooks/useUserAuth';
import {
    formatDateForInput,
    formatMonthLabel,
    getAvailableYears,
    getCurrentMonthKey,
    getCurrentYear,
} from '../../utils/helper';
import { LuLoaderCircle } from 'react-icons/lu';

const Income = () => {
    useUserAuth();

    const [incomeData, setIncomeData] = useState([]);
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

    const fetchIncomeDetails = useCallback(async ({ silent = false } = {}) => {
        if (!silent) {
            setLoading(true);
        }
        try {
            const response = await axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME);
            if (response.data) {
                setIncomeData(response.data);
            }
        } catch (error) {
            console.error("Error fetching income details:", error);
            if (!silent) {
                toast.error("Failed to fetch income records.");
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchIncomeDetails();
    }, [fetchIncomeDetails]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (
                document.visibilityState === "visible" &&
                !formModal.show &&
                !openDeleteAlert.show
            ) {
                fetchIncomeDetails({ silent: true });
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () =>
            document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [fetchIncomeDetails, formModal.show, openDeleteAlert.show]);

    const availableYears = useMemo(
        () => getAvailableYears(incomeData, selectedYear),
        [incomeData, selectedYear]
    );

    const filteredIncome = useMemo(() => {
        const query = search.trim().toLowerCase();

        const filtered = incomeData.filter((item) => {
            if (query) {
                const matchSource = item.source?.toLowerCase().includes(query);
                const matchNotes = item.notes?.toLowerCase().includes(query);
                const matchMethod = item.paymentMethod?.toLowerCase().includes(query);
                if (!matchSource && !matchNotes && !matchMethod) return false;
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
    }, [incomeData, search, viewMode, selectedMonth, selectedYear]);

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

    const handleSaveIncome = async (income) => {
        const { source, amount, date, icon, paymentMethod, notes } = income;

        if (!source.trim()) {
            toast.error("Source is required.");
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
            source,
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
                await axiosInstance.put(API_PATHS.INCOME.UPDATE_INCOME(editingId), payload);
                toast.success("Income updated successfully");
            } else {
                await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, payload);
                toast.success("Income added successfully");
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

            await fetchIncomeDetails({ silent: true });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save income");
        } finally {
            setSubmitting(false);
        }
    };

    const deleteIncome = async (id) => {
        setDeleting(true);
        try {
            await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));
            setOpenDeleteAlert({ show: false, data: null });
            toast.success("Income details deleted successfully");
            await fetchIncomeDetails({ silent: true });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete income");
        } finally {
            setDeleting(false);
        }
    };

    const handleDownloadIncomeDetails = async () => {
        if (downloading) return;
        setDownloading(true);
        try {
            const params = {};
            if (viewMode === "month") params.month = selectedMonth;
            if (viewMode === "year") params.year = String(selectedYear);
            if (search.trim()) params.search = search.trim();

            const response = await axiosInstance.get(
                API_PATHS.INCOME.DOWNLOAD_INCOME,
                { params, responseType: "blob" }
            );

            const filename =
                viewMode === "month"
                    ? `income_${selectedMonth}.xlsx`
                    : viewMode === "year"
                    ? `income_${selectedYear}.xlsx`
                    : "income_details.xlsx";

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Income spreadsheet downloaded");
        } catch (error) {
            console.error("Error downloading income details:", error);
            toast.error("Failed to download income details. Please try again later.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <DashboardLayout activeMenu="Income">
            <div className="my-5 mx-auto space-y-6">
                <IncomeOverview
                    transactions={filteredIncome}
                    viewMode={viewMode}
                    periodLabel={periodLabel}
                    selectedYear={selectedYear}
                    onAddIncome={() => setFormModal({ show: true, data: null })}
                />

                <TransactionFilterBar
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search source, notes, payment..."
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
                    type="income"
                    viewMode={viewMode}
                    transactions={filteredIncome}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onSelectMonth={handleSelectMonthFromYearly}
                />

                {loading && incomeData.length === 0 ? (
                    <div className="card py-14 flex flex-col items-center justify-center gap-2 text-gray-500">
                        <LuLoaderCircle className="animate-spin text-2xl text-primary" />
                        <p className="text-sm">Loading income records...</p>
                    </div>
                ) : (
                    <IncomeList
                        transactions={filteredIncome}
                        periodLabel={periodLabel}
                        onEdit={(incomeItem) =>
                            setFormModal({ show: true, data: incomeItem })
                        }
                        onDelete={(id) => {
                            setOpenDeleteAlert({ show: true, data: id });
                        }}
                        onDownload={handleDownloadIncomeDetails}
                        isDownloading={downloading}
                    />
                )}
            </div>

            <Modal
                isOpen={formModal.show}
                onClose={() => !submitting && setFormModal({ show: false, data: null })}
                title={formModal.data ? "Edit Income" : "Add Income"}
            >
                <AddIncomeForm
                    key={formModal.data?._id || "new-income"}
                    initialData={formModal.data}
                    onAddIncome={handleSaveIncome}
                    isSubmitting={submitting}
                />
            </Modal>

            <Modal
                isOpen={openDeleteAlert.show}
                onClose={() => !deleting && setOpenDeleteAlert({ show: false, data: null })}
                title="Delete Income"
            >
                <DeleteAlert
                    content="Are you sure you want to delete this income record?"
                    onDelete={() => deleteIncome(openDeleteAlert.data)}
                    isDeleting={deleting}
                />
            </Modal>
        </DashboardLayout>
    );
};

export default Income;
