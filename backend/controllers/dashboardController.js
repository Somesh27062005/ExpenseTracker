const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { Types } = require("mongoose");

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Dashboard Data
exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        const userObjectId = new Types.ObjectId(String(userId));

        const now = new Date();
        const currentYear = now.getUTCFullYear();
        const currentMonthIndex = now.getUTCMonth();
        const currentMonthKey = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}`;
        const currentMonthStart = new Date(Date.UTC(currentYear, currentMonthIndex, 1));
        const nextMonthStart = new Date(Date.UTC(currentYear, currentMonthIndex + 1, 1));
        const sixMonthsStart = new Date(Date.UTC(currentYear, currentMonthIndex - 5, 1));

        // Fetch total income & expenses + monthly trends + current month category breakdown
        const [
            totalIncomeAgg,
            totalExpenseAgg,
            last60DaysIncomeTransactions,
            last30DaysExpenseTransactions,
            recentIncomes,
            recentExpenses,
            monthlyIncomeAgg,
            monthlyExpenseAgg,
            currentMonthCategoryAgg,
        ] = await Promise.all([
            Income.aggregate([
                { $match: { userId: userObjectId } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
            Expense.aggregate([
                { $match: { userId: userObjectId } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
            Income.find({
                userId,
                date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
            }).sort({ date: -1 }),
            Expense.find({
                userId,
                date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            }).sort({ date: -1 }),
            Income.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(5),
            Expense.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(5),
            Income.aggregate([
                { $match: { userId: userObjectId, date: { $gte: sixMonthsStart, $lt: nextMonthStart } } },
                {
                    $group: {
                        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
                        total: { $sum: "$amount" },
                    },
                },
            ]),
            Expense.aggregate([
                { $match: { userId: userObjectId, date: { $gte: sixMonthsStart, $lt: nextMonthStart } } },
                {
                    $group: {
                        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
                        total: { $sum: "$amount" },
                    },
                },
            ]),
            Expense.aggregate([
                {
                    $match: {
                        userId: userObjectId,
                        date: { $gte: currentMonthStart, $lt: nextMonthStart },
                    },
                },
                {
                    $group: {
                        _id: { $toLower: { $trim: { input: "$category" } } },
                        displayName: { $first: "$category" },
                        total: { $sum: "$amount" },
                    },
                },
                { $sort: { total: -1 } },
            ]),
        ]);

        const incomeLast60Days = last60DaysIncomeTransactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
        );

        const expensesLast30Days = last30DaysExpenseTransactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
        );

        const lastTransactions = [
            ...recentIncomes.map((txn) => ({
                ...txn.toObject(),
                type: "income",
            })),
            ...recentExpenses.map((txn) => ({
                ...txn.toObject(),
                type: "expense",
            })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Build last 6 months trend map
        const incomeMonthMap = new Map();
        monthlyIncomeAgg.forEach((m) => {
            const key = `${m._id.year}-${String(m._id.month).padStart(2, "0")}`;
            incomeMonthMap.set(key, m.total);
        });

        const expenseMonthMap = new Map();
        monthlyExpenseAgg.forEach((m) => {
            const key = `${m._id.year}-${String(m._id.month).padStart(2, "0")}`;
            expenseMonthMap.set(key, m.total);
        });

        const monthlyTrend = [];
        for (let offset = 5; offset >= 0; offset--) {
            const d = new Date(Date.UTC(currentYear, currentMonthIndex - offset, 1));
            const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
            monthlyTrend.push({
                monthKey: key,
                month: MONTH_NAMES[d.getUTCMonth()],
                income: incomeMonthMap.get(key) || 0,
                expense: expenseMonthMap.get(key) || 0,
            });
        }

        const currentMonthIncome = incomeMonthMap.get(currentMonthKey) || 0;
        const currentMonthExpenses = expenseMonthMap.get(currentMonthKey) || 0;
        const currentMonthSavings = currentMonthIncome - currentMonthExpenses;
        const savingsRate =
            currentMonthIncome > 0
                ? Math.round((currentMonthSavings / currentMonthIncome) * 100)
                : 0;

        res.json({
            totalBalance: (totalIncomeAgg[0]?.total || 0) - (totalExpenseAgg[0]?.total || 0),
            totalIncome: totalIncomeAgg[0]?.total || 0,
            totalExpenses: totalExpenseAgg[0]?.total || 0,
            last30DaysExpenses: {
                total: expensesLast30Days,
                transactions: last30DaysExpenseTransactions,
            },
            last60DaysIncome: {
                total: incomeLast60Days,
                transactions: last60DaysIncomeTransactions,
            },
            recentTransactions: lastTransactions,
            currentMonth: {
                month: currentMonthKey,
                start: currentMonthStart,
                income: currentMonthIncome,
                expenses: currentMonthExpenses,
                savings: currentMonthSavings,
                savingsRate,
            },
            monthlyTrend,
            categorySpending: currentMonthCategoryAgg.map((c) => ({
                name: c.displayName,
                amount: c.total,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
