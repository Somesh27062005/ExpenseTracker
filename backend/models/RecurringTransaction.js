const mongoose = require("mongoose");

const RecurringTransactionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, enum: ["income", "expense"], required: true },
        title: { type: String, required: true, trim: true }, // source or category
        amount: { type: Number, required: true, min: 0.01 },
        frequency: { type: String, enum: ["weekly", "monthly", "yearly"], default: "monthly" },
        nextDueDate: { type: Date, required: true },
        icon: { type: String, default: "" },
        paymentMethod: { type: String, trim: true, default: "" },
        notes: { type: String, trim: true, default: "" },
        isActive: { type: Boolean, default: true },
        lastProcessedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

RecurringTransactionSchema.index({ userId: 1, isActive: 1, nextDueDate: 1 });

module.exports = mongoose.model("RecurringTransaction", RecurringTransactionSchema);
