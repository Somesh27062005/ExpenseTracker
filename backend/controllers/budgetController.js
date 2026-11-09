const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const { Types } = require("mongoose");

const getMonthBounds = (monthStr) => {
    const now = new Date();
    const targetMonth = /^\d{4}-\d{2}$/.test(monthStr || "")
        ? monthStr
        : `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

    const [year, month] = targetMonth.split("-").map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    return { month: targetMonth, start, end };
};

const getBudgetSummaryForMonth = async (userId, monthStr) => {
    const { month, start, end } = getMonthBounds(monthStr);
    const userObjectId = new Types.ObjectId(String(userId));

    const [budgets, categoryAgg] = await Promise.all([
        Budget.find({ userId, month }).sort({ createdAt: -1 }),
        Expense.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    date: { $gte: start, $lt: end },
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

    const spentMap = new Map();
    let totalMonthlySpent = 0;

    categoryAgg.forEach((item) => {
        spentMap.set(item._id, item.total);
        totalMonthlySpent += item.total;
    });

    const enrichedBudgets = budgets.map((b) => {
        const key = b.category.trim().toLowerCase();
        const spent = key === "overall" ? totalMonthlySpent : (spentMap.get(key) || 0);
        const remaining = b.limit - spent;
        const percentage = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;

        let status = "safe";
        if (percentage >= 100) status = "exceeded";
        else if (percentage >= 75) status = "warning";

        return {
            _id: b._id,
            category: b.category,
            limit: b.limit,
            month: b.month,
            spent,
            remaining,
            percentage,
            status,
        };
    });

    const overallBudget = enrichedBudgets.find(
        (b) => b.category.trim().toLowerCase() === "overall"
    );
    const categoryBudgetsSum = enrichedBudgets
        .filter((b) => b.category.trim().toLowerCase() !== "overall")
        .reduce((sum, b) => sum + b.limit, 0);

    const totalBudgeted = overallBudget ? overallBudget.limit : categoryBudgetsSum;

    return {
        month,
        totalBudgeted,
        totalMonthlySpent,
        budgets: enrichedBudgets,
        categoryBreakdown: categoryAgg.map((c) => ({
            name: c.displayName,
            amount: c.total,
        })),
    };
};

exports.getBudgetSummaryForMonth = getBudgetSummaryForMonth;

// Get Budgets for Month
exports.getBudgets = async (req, res) => {
    try {
        const summary = await getBudgetSummaryForMonth(req.user.id, req.query.month);
        res.status(200).json(summary);
    } catch (error) {
        res.status(500).json({ message: "Error fetching budgets", error: error.message });
    }
};

// Create or Update Monthly Budget
exports.upsertBudget = async (req, res) => {
    try {
        const { category, limit, month } = req.body;
        const { month: validMonth } = getMonthBounds(month);

        if (!category || !String(category).trim()) {
            return res.status(400).json({ message: "Category is required" });
        }

        const parsedLimit = Number(limit);
        if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
            return res.status(400).json({ message: "Budget limit must be greater than 0" });
        }

        const normalizedCategory = String(category).trim();
        const escapedCategory = normalizedCategory.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const existing = await Budget.findOne({
            userId: req.user.id,
            month: validMonth,
            category: new RegExp(`^${escapedCategory}$`, "i"),
        });

        let budget;
        if (existing) {
            existing.limit = parsedLimit;
            existing.category = normalizedCategory;
            budget = await existing.save();
        } else {
            budget = await Budget.create({
                userId: req.user.id,
                category: normalizedCategory,
                limit: parsedLimit,
                month: validMonth,
            });
        }

        res.status(200).json(budget);
    } catch (error) {
        res.status(500).json({ message: "Error saving budget", error: error.message });
    }
};

// Delete Budget
exports.deleteBudget = async (req, res) => {
    try {
        const deleted = await Budget.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!deleted) {
            return res.status(404).json({ message: "Budget not found" });
        }

        res.status(200).json({ message: "Budget deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting budget", error: error.message });
    }
};
