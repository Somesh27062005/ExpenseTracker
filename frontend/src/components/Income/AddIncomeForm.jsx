import React, { useState } from 'react';
import Input from '../Inputs/Input';
import EmojiPickerPopup from '../EmojiPickerPopup';
import { INCOME_PAYMENT_METHODS, INCOME_SOURCES } from '../../utils/data';
import { formatDateForInput, getTodayInputDate } from '../../utils/helper';
import { LuLoaderCircle } from 'react-icons/lu';

const AddIncomeForm = ({ onAddIncome, initialData = null, isSubmitting = false }) => {
    const isEditMode = Boolean(initialData?._id);

    const [income, setIncome] = useState({
        source: initialData?.source || "",
        amount: initialData?.amount ?? "",
        date: initialData?.date ? formatDateForInput(initialData.date) : getTodayInputDate(),
        icon: initialData?.icon || "",
        paymentMethod: initialData?.paymentMethod || "Bank Transfer",
        notes: initialData?.notes || "",
    });

    const handleChange = (key, value) => setIncome((prev) => ({ ...prev, [key]: value }));

    const paymentOptions = INCOME_PAYMENT_METHODS.includes(income.paymentMethod)
        ? INCOME_PAYMENT_METHODS
        : [income.paymentMethod, ...INCOME_PAYMENT_METHODS];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isSubmitting) {
            onAddIncome(income);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <EmojiPickerPopup
                icon={income.icon}
                onSelect={(selectedIcon) => handleChange('icon', selectedIcon)}
            />

            <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Quick Sources</p>
                <div className="flex flex-wrap gap-2">
                    {INCOME_SOURCES.map((item) => (
                        <button
                            key={item}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleChange("source", item)}
                            className={`text-xs px-3 py-1 rounded-full border cursor-pointer transition-colors ${
                                income.source.toLowerCase() === item.toLowerCase()
                                    ? "bg-primary text-white border-primary"
                                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-purple-50"
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            <Input
                value={income.source}
                onChange={({ target }) => handleChange("source", target.value)}
                label="Income Source"
                placeholder="Salary, Freelance, Bonus, etc."
                type="text"
                disabled={isSubmitting}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Input
                    value={income.amount}
                    onChange={({ target }) => handleChange("amount", target.value)}
                    label="Amount"
                    placeholder="0.00"
                    type="number"
                    min="0.01"
                    step="0.01"
                    disabled={isSubmitting}
                />

                <Input
                    value={income.date}
                    onChange={({ target }) => handleChange("date", target.value)}
                    label="Date"
                    placeholder=""
                    type="date"
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <label className="text-[13px] text-slate-800">Payment Method</label>
                <select
                    value={income.paymentMethod}
                    onChange={({ target }) => handleChange("paymentMethod", target.value)}
                    disabled={isSubmitting}
                    className="input-box cursor-pointer disabled:opacity-70"
                >
                    {paymentOptions.map((method) => (
                        <option key={method} value={method}>
                            {method}
                        </option>
                    ))}
                </select>
            </div>

            <Input
                value={income.notes}
                onChange={({ target }) => handleChange("notes", target.value)}
                label="Notes (Optional)"
                placeholder="Client invoice, bonus cycle, etc."
                type="text"
                disabled={isSubmitting}
            />

            <div className="flex justify-end mt-6">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="add-btn add-btn-fill"
                >
                    {isSubmitting && <LuLoaderCircle className="animate-spin text-base" />}
                    <span>
                        {isSubmitting
                            ? isEditMode
                                ? "Updating..."
                                : "Adding..."
                            : isEditMode
                            ? "Update Income"
                            : "Add Income"}
                    </span>
                </button>
            </div>
        </form>
    );
};

export default AddIncomeForm;
