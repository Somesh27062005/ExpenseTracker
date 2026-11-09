import React, { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
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
import { useUserAuth } from '../../hooks/useUserAuth';
import { formatDateForInput, getCurrentMonthKey } from '../../utils/helper';
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

    // Filters & sorting
    const [search, setSearch] = useState("");
    const [selectedSource, setSelectedSource] = useState("all");
    const [dateRangePreset, setDateRangePreset] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sortBy, setSortBy] = useState("date_desc");

    const fetchIncomeDetails = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME);
            if (response.data) {
                setIncomeData(response.data);
            }
        } catch (error) {
            console.error("Error fetching income details:", error);
            toast.error("Failed to fetch income records.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIncomeDetails();
    }, [fetchIncomeDetails]);

    const sourceOptions = useMemo(() => {
        const seen = new Map();
        incomeData.forEach((item) => {
            const trimmed = item.source?.trim();
            if (trimmed) {
                const key = trimmed.toLowerCase();
                if (!seen.has(key)) seen.set(key, trimmed);
            }
        });
        return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
    }, [incomeData]);

    const filteredIncome = useMemo(() => {
        const query = search.trim().toLowerCase();
        const currentMonth = getCurrentMonthKey();
        const thirtyDaysAgoKey = moment().subtract(30, "days").format("YYYY-MM-DD");

        const filtered = incomeData.filter((item) => {
            if (
                selectedSource !== "all" &&
                item.source?.trim().toLowerCase() !== selectedSource.trim().toLowerCase()
            ) {
                return false;
            }

            if (query) {
                const matchSource = item.source?.toLowerCase().includes(query);
                const matchNotes = item.notes?.toLowerCase().includes(query);
                const matchMethod = item.paymentMethod?.toLowerCase().includes(query);
                if (!matchSource && !matchNotes && !matchMethod) return false;
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
    }, [incomeData, search, selectedSource, dateRangePreset, selectedMonth, startDate, endDate, sortBy]);

    const hasActiveFilters =
        Boolean(search.trim()) ||
        selectedSource !== "all" ||
        dateRangePreset !== "all" ||
        sortBy !== "date_desc";

    const handleResetFilters = () => {
        setSearch("");
        setSelectedSource("all");
        setDateRangePreset("all");
        setSelectedMonth(getCurrentMonthKey());
        setStartDate("");
        setEndDate("");
        setSortBy("date_desc");
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

        const payload = { source, amount, date, icon, paymentMethod, notes };
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
            fetchIncomeDetails();
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
            fetchIncomeDetails();
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
            const response = await axiosInstance.get(
                API_PATHS.INCOME.DOWNLOAD_INCOME,
                { responseType: "blob" }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "income_details.xlsx");
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
                    onAddIncome={() => setFormModal({ show: true, data: null })}
                />

                <TransactionFilterBar
                    search={search}
                    onSearchChange={setSearch}
                    selectedCategory={selectedSource}
                    onCategoryChange={setSelectedSource}
                    categoryOptions={sourceOptions}
                    categoryLabel="Source"
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

                {loading && incomeData.length === 0 ? (
                    <div className="card py-14 flex flex-col items-center justify-center gap-2 text-gray-500">
                        <LuLoaderCircle className="animate-spin text-2xl text-primary" />
                        <p className="text-sm">Loading income records...</p>
                    </div>
                ) : (
                    <IncomeList
                        transactions={filteredIncome}
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
