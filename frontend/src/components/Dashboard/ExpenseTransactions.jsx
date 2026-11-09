import React from 'react';
import { LuArrowRight } from 'react-icons/lu';
import TransactionInfoCard from '../Cards/TransactionInfoCard';
import { formatDateDisplay } from '../../utils/helper';

const ExpenseTransactions = ({ transactions = [], onSeeMore }) => {
    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <h5 className="text-lg">Expenses</h5>

                <button type="button" className="card-btn" onClick={onSeeMore}>
                    See All <LuArrowRight className="text-base" />
                </button>
            </div>

            <div className="mt-6">
                {!transactions || transactions.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-400">
                        No expenses in the last 30 days.
                    </div>
                ) : (
                    transactions.slice(0, 4).map((expense) => (
                        <TransactionInfoCard
                            key={expense._id}
                            title={expense.category}
                            icon={expense.icon}
                            date={formatDateDisplay(expense.date)}
                            amount={expense.amount}
                            type="expense"
                            paymentMethod={expense.paymentMethod}
                            notes={expense.notes}
                            hideDeleteBtn
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ExpenseTransactions;
