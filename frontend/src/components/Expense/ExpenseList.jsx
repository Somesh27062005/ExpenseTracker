import React, { useContext } from 'react';
import { LuDownload, LuLoaderCircle } from 'react-icons/lu';
import TransactionInfoCard from '../Cards/TransactionInfoCard';
import { UserContext } from '../../context/UserContext';
import { formatCurrency, formatDateDisplay } from '../../utils/helper';

const ExpenseList = ({
    transactions = [],
    onDelete,
    onEdit,
    onDownload,
    isDownloading = false,
}) => {
    const { user } = useContext(UserContext);

    const totalFiltered = transactions.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    return (
        <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h5 className="text-lg">All Expenses</h5>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {transactions.length} record(s) · Total:{" "}
                        <span className="font-semibold text-gray-700">
                            {formatCurrency(totalFiltered, user?.currency)}
                        </span>
                    </p>
                </div>

                <button
                    type="button"
                    disabled={isDownloading}
                    className="card-btn self-start sm:self-auto"
                    onClick={onDownload}
                >
                    {isDownloading ? (
                        <LuLoaderCircle className="animate-spin text-base" />
                    ) : (
                        <LuDownload className="text-base" />
                    )}
                    <span>{isDownloading ? "Exporting..." : "Download"}</span>
                </button>
            </div>

            {transactions.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">
                    No matching expense records found.
                </div>
            ) : (
                <div
                    className={`grid grid-cols-1 ${
                        transactions.length > 1 ? "md:grid-cols-2" : ""
                    } gap-x-4 mt-4`}
                >
                    {transactions.map((expense) => (
                        <TransactionInfoCard
                            key={expense._id}
                            title={expense.category}
                            icon={expense.icon}
                            date={formatDateDisplay(expense.date)}
                            amount={expense.amount}
                            type="expense"
                            paymentMethod={expense.paymentMethod}
                            notes={expense.notes}
                            onEdit={onEdit ? () => onEdit(expense) : undefined}
                            onDelete={() => onDelete(expense._id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExpenseList;
