const RecurringTransaction = require("../models/RecurringTransaction");
const Income = require("../models/Income");
const Expense = require("../models/Expense");

const advanceDate = (date, frequency) => {
    const next = new Date(date);
    if (frequency === "weekly") {
        next.setUTCDate(next.getUTCDate() + 7);
    } else if (frequency === "yearly") {
        next.setUTCFullYear(next.getUTCFullYear() + 1);
    } else {
        const currentDay = next.getUTCDate();
        next.setUTCMonth(next.getUTCMonth() + 1);
        if (next.getUTCDate() < currentDay) {
            next.setUTCDate(0);
        }
    }
    return next;
};

const syncUserRecurringTransactions = async (userId) => {
    const now = new Date();
    // End of today UTC so transactions due today are generated when opening the app today
    const endOfToday = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
    );

    const dueRules = await RecurringTransaction.find({
        userId,
        isActive: true,
        nextDueDate: { $lte: endOfToday },
    });

    let generatedCount = 0;

    for (const rule of dueRules) {
        let iterations = 0;
        let currentDue = new Date(rule.nextDueDate);

        while (currentDue <= endOfToday && iterations < 12) {
            if (rule.type === "income") {
                await Income.create({
                    userId,
                    icon: rule.icon || "",
                    source: rule.title,
                    amount: rule.amount,
                    date: currentDue,
                    paymentMethod: rule.paymentMethod || "Bank Transfer",
                    notes: rule.notes ? `${rule.notes} (Auto-logged)` : "Recurring income",
                });
            } else {
                await Expense.create({
                    userId,
                    icon: rule.icon || "",
                    category: rule.title,
                    amount: rule.amount,
                    date: currentDue,
                    paymentMethod: rule.paymentMethod || "UPI / Card",
                    notes: rule.notes ? `${rule.notes} (Auto-logged)` : "Recurring expense",
                });
            }

            generatedCount += 1;
            iterations += 1;
            currentDue = advanceDate(currentDue, rule.frequency);
        }

        rule.nextDueDate = currentDue;
        rule.lastProcessedAt = now;
        await rule.save();
    }

    return generatedCount;
};

exports.syncUserRecurringTransactions = syncUserRecurringTransactions;

// Get All Recurring Rules (syncs due items first)
exports.getRecurringTransactions = async (req, res) => {
    try {
        const generatedCount = await syncUserRecurringTransactions(req.user.id);
        const rules = await RecurringTransaction.find({ userId: req.user.id }).sort({
            isActive: -1,
            nextDueDate: 1,
        });
        res.status(200).json({ rules, generatedCount });
    } catch (error) {
        res.status(500).json({ message: "Error fetching recurring transactions", error: error.message });
    }
};

// Create Recurring Rule
exports.addRecurringTransaction = async (req, res) => {
    try {
        const { type, title, amount, frequency, nextDueDate, icon, paymentMethod, notes } = req.body;

        if (!["income", "expense"].includes(type)) {
            return res.status(400).json({ message: "Type must be income or expense" });
        }
        if (!title || !String(title).trim()) {
            return res.status(400).json({ message: "Title is required" });
        }
        const parsedAmount = Number(amount);
        if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than 0" });
        }
        const parsedDue = new Date(nextDueDate || Date.now());
        if (Number.isNaN(parsedDue.getTime())) {
            return res.status(400).json({ message: "Valid next due date is required" });
        }

        const rule = await RecurringTransaction.create({
            userId: req.user.id,
            type,
            title: String(title).trim(),
            amount: parsedAmount,
            frequency: ["weekly", "monthly", "yearly"].includes(frequency) ? frequency : "monthly",
            nextDueDate: parsedDue,
            icon: icon || "",
            paymentMethod: paymentMethod ? String(paymentMethod).trim() : "",
            notes: notes ? String(notes).trim() : "",
        });

        await syncUserRecurringTransactions(req.user.id);
        const refreshed = await RecurringTransaction.findById(rule._id);

        res.status(201).json(refreshed);
    } catch (error) {
        res.status(500).json({ message: "Error creating recurring transaction", error: error.message });
    }
};

// Update Recurring Rule (including Pause / Resume)
exports.updateRecurringTransaction = async (req, res) => {
    try {
        const rule = await RecurringTransaction.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!rule) {
            return res.status(404).json({ message: "Recurring transaction not found" });
        }

        const { type, title, amount, frequency, nextDueDate, icon, paymentMethod, notes, isActive } = req.body;

        if (type !== undefined) {
            if (!["income", "expense"].includes(type)) {
                return res.status(400).json({ message: "Invalid type" });
            }
            rule.type = type;
        }
        if (title !== undefined) {
            if (!String(title).trim()) {
                return res.status(400).json({ message: "Title is required" });
            }
            rule.title = String(title).trim();
        }
        if (amount !== undefined) {
            const parsedAmount = Number(amount);
            if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
                return res.status(400).json({ message: "Amount must be greater than 0" });
            }
            rule.amount = parsedAmount;
        }
        if (frequency !== undefined && ["weekly", "monthly", "yearly"].includes(frequency)) {
            rule.frequency = frequency;
        }
        if (nextDueDate !== undefined) {
            const parsedDue = new Date(nextDueDate);
            if (Number.isNaN(parsedDue.getTime())) {
                return res.status(400).json({ message: "Invalid due date" });
            }
            rule.nextDueDate = parsedDue;
        }
        if (icon !== undefined) rule.icon = icon || "";
        if (paymentMethod !== undefined) rule.paymentMethod = String(paymentMethod).trim();
        if (notes !== undefined) rule.notes = String(notes).trim();
        if (isActive !== undefined) rule.isActive = Boolean(isActive);

        await rule.save();
        res.status(200).json(rule);
    } catch (error) {
        res.status(500).json({ message: "Error updating recurring transaction", error: error.message });
    }
};

// Delete Recurring Rule
exports.deleteRecurringTransaction = async (req, res) => {
    try {
        const deleted = await RecurringTransaction.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!deleted) {
            return res.status(404).json({ message: "Recurring transaction not found" });
        }

        res.status(200).json({ message: "Recurring transaction deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting recurring transaction", error: error.message });
    }
};

// Manual Sync Trigger
exports.syncRecurringNow = async (req, res) => {
    try {
        const generatedCount = await syncUserRecurringTransactions(req.user.id);
        res.status(200).json({
            message:
                generatedCount > 0
                    ? `Processed ${generatedCount} due recurring transaction(s)`
                    : "All recurring schedules are up to date",
            generatedCount,
        });
    } catch (error) {
        res.status(500).json({ message: "Error syncing recurring transactions", error: error.message });
    }
};
