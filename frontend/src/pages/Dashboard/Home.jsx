import React, { useCallback, useContext, useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { useNavigate } from 'react-router-dom';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import InfoCard from '../../components/Cards/InfoCard';
import { formatCurrency } from '../../utils/helper';
import RecentTransactions from '../../components/Dashboard/RecentTransactions';
import FinanceOverview from '../../components/Dashboard/FinanceOverview';
import ExpenseTransactions from '../../components/Dashboard/ExpenseTransactions';
import Last30DaysExpenses from '../../components/Dashboard/Last30DaysExpenses';
import RecentIncomeWithChart from '../../components/Charts/RecentIncomeWithChart';
import RecentIncome from '../../components/Dashboard/RecentIncome';
import IncomeVsExpenseChart from '../../components/Charts/IncomeVsExpenseChart';
import CategoryBreakdownChart from '../../components/Dashboard/CategoryBreakdownChart';
import Modal from '../../components/Modal';
import AddIncomeForm from '../../components/Income/AddIncomeForm';
import AddExpenseForm from '../../components/Expense/AddExpenseForm';
import { UserContext } from '../../context/UserContext';
import toast from 'react-hot-toast';

import {
    LuHandCoins,
    LuWalletMinimal,
    LuPlus,
    LuPiggyBank,
    LuLoaderCircle,
} from 'react-icons/lu';
import { IoMdCard } from 'react-icons/io';

const Home = () => {
    useUserAuth();

    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [quickModalType, setQuickModalType] = useState(null); // "income" | "expense" | null
    const [submittingQuick, setSubmittingQuick] = useState(false);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_PATHS.DASHBOARD.GET_DATA);
            if (response.data) {
                setDashboardData(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            toast.error("Could not load dashboard metrics.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleQuickAddIncome = async (income) => {
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

        setSubmittingQuick(true);
        try {
            await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, {
                source,
                amount,
                date,
                icon,
                paymentMethod: paymentMethod.trim(),
                notes,
            });
            setQuickModalType(null);
            toast.success("Income added successfully");
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add income");
        } finally {
            setSubmittingQuick(false);
        }
    };

    const handleQuickAddExpense = async (expense) => {
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

        setSubmittingQuick(true);
        try {
            await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
                category,
                amount,
                date,
                icon,
                paymentMethod: paymentMethod.trim(),
                notes,
            });
            setQuickModalType(null);
            toast.success("Expense added successfully");
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add expense");
        } finally {
            setSubmittingQuick(false);
        }
    };

    const currency = user?.currency || "USD";
    const currentMonth = dashboardData?.currentMonth || {
        month: "",
        income: 0,
        expenses: 0,
        savings: 0,
        savingsRate: 0,
    };

    return (
        <DashboardLayout activeMenu="Dashboard">
            <div className="my-5 mx-auto space-y-6">
                {/* Welcome & Quick Actions Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                            Welcome back, {user?.fullName?.split(" ")[0] || "there"}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                            {loading && <LuLoaderCircle className="animate-spin text-primary" />}
                            <span>
                                {loading
                                    ? "Refreshing your financial overview..."
                                    : "Here is your financial summary and cashflow health."}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => setQuickModalType("income")}
                            className="add-btn"
                        >
                            <LuPlus className="text-base" />
                            Add Income
                        </button>
                        <button
                            type="button"
                            onClick={() => setQuickModalType("expense")}
                            className="add-btn add-btn-fill"
                        >
                            <LuPlus className="text-base" />
                            Add Expense
                        </button>
                    </div>
                </div>

                {loading && !dashboardData ? (
                    <div className="card py-16 flex flex-col items-center justify-center gap-3 text-gray-500">
                        <LuLoaderCircle className="animate-spin text-3xl text-primary" />
                        <p className="text-sm">Loading dashboard metrics...</p>
                    </div>
                ) : (
                    <>
                        {/* All-Time KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InfoCard
                                icon={<IoMdCard />}
                                label="Total Balance"
                                value={formatCurrency(dashboardData?.totalBalance || 0, currency)}
                                color="bg-primary"
                            />

                            <InfoCard
                                icon={<LuWalletMinimal />}
                                label="Total Income"
                                value={formatCurrency(dashboardData?.totalIncome || 0, currency)}
                                color="bg-orange-500"
                            />

                            <InfoCard
                                icon={<LuHandCoins />}
                                label="Total Expense"
                                value={formatCurrency(dashboardData?.totalExpenses || 0, currency)}
                                color="bg-red-500"
                            />
                        </div>

                        {/* Current Month Snapshot */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="card p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        This Month Income {currentMonth.month ? `(${currentMonth.month})` : ""}
                                    </p>
                                    <p className="text-lg font-semibold text-emerald-600 mt-1">
                                        {formatCurrency(currentMonth.income, currency)}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <LuWalletMinimal className="text-lg" />
                                </div>
                            </div>

                            <div className="card p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        This Month Expenses {currentMonth.month ? `(${currentMonth.month})` : ""}
                                    </p>
                                    <p className="text-lg font-semibold text-red-500 mt-1">
                                        {formatCurrency(currentMonth.expenses, currency)}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                                    <LuHandCoins className="text-lg" />
                                </div>
                            </div>

                            <div className="card p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">This Month Net Savings</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p
                                            className={`text-lg font-semibold ${
                                                currentMonth.savings >= 0 ? "text-gray-900" : "text-red-500"
                                            }`}
                                        >
                                            {formatCurrency(currentMonth.savings, currency)}
                                        </p>
                                        <span
                                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                                currentMonth.savingsRate >= 0
                                                    ? "bg-purple-50 text-purple-700"
                                                    : "bg-red-50 text-red-600"
                                            }`}
                                        >
                                            {currentMonth.savingsRate}% saved
                                        </span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-purple-50 text-primary flex items-center justify-center">
                                    <LuPiggyBank className="text-lg" />
                                </div>
                            </div>
                        </div>

                        {/* 6-Month Cashflow & Category Spending */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <IncomeVsExpenseChart data={dashboardData?.monthlyTrend || []} />

                            <CategoryBreakdownChart
                                data={dashboardData?.categorySpending || []}
                                totalSpent={currentMonth.expenses || 0}
                                onViewExpenses={() => navigate("/expense")}
                            />
                        </div>

                        {/* Core Dashboard Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <RecentTransactions
                                transactions={dashboardData?.recentTransactions || []}
                                onSeeMore={() => navigate("/expense")}
                            />

                            <FinanceOverview
                                totalBalance={dashboardData?.totalBalance || 0}
                                totalIncome={dashboardData?.totalIncome || 0}
                                totalExpense={dashboardData?.totalExpenses || 0}
                            />

                            <ExpenseTransactions
                                transactions={dashboardData?.last30DaysExpenses?.transactions || []}
                                onSeeMore={() => navigate("/expense")}
                            />

                            <Last30DaysExpenses
                                data={dashboardData?.last30DaysExpenses?.transactions || []}
                            />

                            <RecentIncomeWithChart
                                data={dashboardData?.last60DaysIncome?.transactions || []}
                                totalIncome={dashboardData?.totalIncome || 0}
                            />

                            <RecentIncome
                                transactions={dashboardData?.last60DaysIncome?.transactions || []}
                                onSeeMore={() => navigate("/income")}
                            />
                        </div>
                    </>
                )}
            </div>

            <Modal
                isOpen={quickModalType === "income"}
                onClose={() => !submittingQuick && setQuickModalType(null)}
                title="Add Income"
            >
                <AddIncomeForm
                    key="quick-income"
                    onAddIncome={handleQuickAddIncome}
                    isSubmitting={submittingQuick}
                />
            </Modal>

            <Modal
                isOpen={quickModalType === "expense"}
                onClose={() => !submittingQuick && setQuickModalType(null)}
                title="Add Expense"
            >
                <AddExpenseForm
                    key="quick-expense"
                    onAddExpense={handleQuickAddExpense}
                    isSubmitting={submittingQuick}
                />
            </Modal>
        </DashboardLayout>
    );
};

export default Home;
