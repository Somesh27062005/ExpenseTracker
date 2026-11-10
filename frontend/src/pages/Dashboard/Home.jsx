import React, { useCallback, useContext, useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { useNavigate } from 'react-router-dom';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import InfoCard from '../../components/Cards/InfoCard';
import {
    formatCurrency,
    formatMonthLabel,
    getCurrentMonthKey,
} from '../../utils/helper';
import RecentTransactions from '../../components/Dashboard/RecentTransactions';
import FinanceOverview from '../../components/Dashboard/FinanceOverview';
import Last30DaysExpenses from '../../components/Dashboard/Last30DaysExpenses';
import RecentIncomeWithChart from '../../components/Charts/RecentIncomeWithChart';
import IncomeVsExpenseChart from '../../components/Charts/IncomeVsExpenseChart';
import { UserContext } from '../../context/UserContext';
import toast from 'react-hot-toast';

import {
    LuHandCoins,
    LuWalletMinimal,
    LuLoaderCircle,
} from 'react-icons/lu';
import { IoMdCard } from 'react-icons/io';

const Home = () => {
    useUserAuth();

    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchDashboardData = useCallback(async ({ silent = false } = {}) => {
        if (!silent) {
            setLoading(true);
        }
        try {
            const response = await axiosInstance.get(API_PATHS.DASHBOARD.GET_DATA, {
                params: { month: getCurrentMonthKey() },
            });
            if (response.data) {
                setDashboardData(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            if (!silent) {
                toast.error("Could not load dashboard metrics.");
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();

        const handleRefresh = () => {
            if (document.visibilityState === "visible") {
                fetchDashboardData({ silent: true });
            }
        };

        window.addEventListener("focus", handleRefresh);
        document.addEventListener("visibilitychange", handleRefresh);
        return () => {
            window.removeEventListener("focus", handleRefresh);
            document.removeEventListener("visibilitychange", handleRefresh);
        };
    }, [fetchDashboardData]);

    const currency = user?.currency || "USD";
    const currentMonth = dashboardData?.currentMonth || {
        month: "",
        monthLabel: "",
        income: 0,
        expenses: 0,
    };
    const currentMonthLabel =
        currentMonth.monthLabel ||
        formatMonthLabel(currentMonth.month || getCurrentMonthKey());

    return (
        <DashboardLayout activeMenu="Dashboard">
            <div className="my-5 mx-auto space-y-6">
                {/* Welcome Header */}
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                        Welcome back, {user?.fullName?.split(" ")[0] || "there"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                        {loading && <LuLoaderCircle className="animate-spin text-primary" />}
                        <span>
                            {loading
                                ? "Refreshing your financial overview..."
                                : `Financial overview for ${currentMonthLabel}.`}
                        </span>
                    </p>
                </div>

                {loading && !dashboardData ? (
                    <div className="card py-16 flex flex-col items-center justify-center gap-3 text-gray-500">
                        <LuLoaderCircle className="animate-spin text-3xl text-primary" />
                        <p className="text-sm">Loading dashboard metrics...</p>
                    </div>
                ) : (
                    <>
                        {/* Summary KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InfoCard
                                icon={<IoMdCard />}
                                label="Total Balance"
                                value={formatCurrency(dashboardData?.totalBalance || 0, currency)}
                                subtext="Overall balance"
                                color="bg-primary"
                            />

                            <InfoCard
                                icon={<LuWalletMinimal />}
                                label="This Month Income"
                                value={formatCurrency(currentMonth.income, currency)}
                                subtext={currentMonthLabel}
                                color="bg-emerald-500"
                            />

                            <InfoCard
                                icon={<LuHandCoins />}
                                label="This Month Expenses"
                                value={formatCurrency(currentMonth.expenses, currency)}
                                subtext={currentMonthLabel}
                                color="bg-red-500"
                            />
                        </div>

                        {/* 6-Month Cashflow */}
                        <IncomeVsExpenseChart data={dashboardData?.monthlyTrend || []} />

                        {/* Recent Transactions & Financial Overview */}
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
                        </div>

                        {/* Last 30 Days Income & Expenses */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <RecentIncomeWithChart
                                data={dashboardData?.last30DaysIncome?.transactions || []}
                                totalIncome={dashboardData?.last30DaysIncome?.total || 0}
                                onSeeMore={() => navigate("/income")}
                            />

                            <Last30DaysExpenses
                                data={dashboardData?.last30DaysExpenses?.transactions || []}
                                onSeeMore={() => navigate("/expense")}
                            />
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Home;
