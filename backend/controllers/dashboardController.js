const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { Types } = require("mongoose");

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL_MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

// Dashboard Data
exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        const userObjectId = new Types.ObjectId(String(userId));

        const requestedMonth =
            typeof req.query.month === "string" &&
            /^\d{4}-(0[1-9]|1[0-2])$/.test(req.query.month.trim())
                ? req.query.month.trim()
                : null;

        const now = new Date();
        const currentYear = requestedMonth
            ? Number(requestedMonth.split("-")[0])
            : now.getUTCFullYear();
        const currentMonthIndex = requestedMonth
            ? Number(requestedMonth.split("-")[1]) - 1
            : now.getUTCMonth();
        const currentMonthKey = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}`;
        const currentMonthStart = new Date(Date.UTC(currentYear, currentMonthIndex, 1));
        const nextMonthStart = new Date(Date.UTC(currentYear, currentMonthIndex + 1, 1));
        const sixMonthsStart = new Date(Date.UTC(currentYear, currentMonthIndex - 5, 1));
        const last30DaysStart = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30)
        );

        // Fetch total income & expenses + last 30 days + monthly trends
        const [
            totalIncomeAgg,
            totalExpenseAgg,
            last30DaysIncomeTransactions,
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
                date: { $gte: last30DaysStart },
            }).sort({ date: -1, createdAt: -1 }),
            Expense.find({
                userId,
                date: { $gte: last30DaysStart },
            }).sort({ date: -1, createdAt: -1 }),
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

        const incomeLast30Days = last30DaysIncomeTransactions.reduce(
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
        ].sort((a, b) => {
            const dateDiff = new Date(b.date) - new Date(a.date);
            if (dateDiff !== 0) return dateDiff;
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

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
                monthFull: `${FULL_MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
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
            last30DaysIncome: {
                total: incomeLast30Days,
                transactions: last30DaysIncomeTransactions,
            },
            recentTransactions: lastTransactions,
            currentMonth: {
                month: currentMonthKey,
                monthLabel: `${FULL_MONTH_NAMES[currentMonthIndex]} ${currentYear}`,
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
