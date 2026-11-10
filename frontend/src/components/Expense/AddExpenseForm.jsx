import React, { useState } from 'react';
import Input from '../Inputs/Input';
import PaymentMethodSelect from '../Inputs/PaymentMethodSelect';
import EmojiPickerPopup from '../EmojiPickerPopup';
import { formatDateForInput, getTodayInputDate } from '../../utils/helper';
import { LuLoaderCircle } from 'react-icons/lu';

const AddExpenseForm = ({ onAddExpense, initialData = null, isSubmitting = false }) => {
    const isEditMode = Boolean(initialData?._id);

    const [expense, setExpense] = useState({
        category: initialData?.category || "",
        amount: initialData?.amount ?? "",
        date: initialData?.date ? formatDateForInput(initialData.date) : getTodayInputDate(),
        icon: initialData?.icon || "",
        paymentMethod: initialData?.paymentMethod || "Cash",
        notes: initialData?.notes || "",
    });

    const handleChange = (key, value) => setExpense((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isSubmitting) {
            onAddExpense(expense);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <EmojiPickerPopup
                icon={expense.icon}
                onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
            />

            <Input
                value={expense.category}
                onChange={({ target }) => handleChange('category', target.value)}
                label="Category"
                placeholder="Food, Rent, Groceries, etc."
                type="text"
                disabled={isSubmitting}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Input
                    value={expense.amount}
                    onChange={({ target }) => handleChange('amount', target.value)}
                    label="Amount"
                    placeholder="0.00"
                    type="number"
                    min="0.01"
                    step="0.01"
                    disabled={isSubmitting}
                />

                <Input
                    value={expense.date}
                    onChange={({ target }) => handleChange('date', target.value)}
                    label="Date"
                    placeholder=""
                    type="date"
                    disabled={isSubmitting}
                />
            </div>

            <PaymentMethodSelect
                value={expense.paymentMethod}
                onChange={(method) => handleChange("paymentMethod", method)}
                disabled={isSubmitting}
            />

            <Input
                value={expense.notes}
                onChange={({ target }) => handleChange("notes", target.value)}
                label="Notes (Optional)"
                placeholder="Merchant, bill details, etc."
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
                            ? "Update Expense"
                            : "Add Expense"}
                    </span>
                </button>
            </div>
        </form>
    );
};

export default AddExpenseForm;
