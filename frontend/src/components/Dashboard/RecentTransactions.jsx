import React from 'react';
import { LuArrowRight } from 'react-icons/lu';
import TransactionInfoCard from '../Cards/TransactionInfoCard';
import { formatDateDisplay } from '../../utils/helper';

const RecentTransactions = ({ transactions = [], onSeeMore }) => {
    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <h5 className="text-lg">Recent Transactions</h5>

                <button type="button" className="card-btn" onClick={onSeeMore}>
                    See All <LuArrowRight className="text-base" />
                </button>
            </div>

            <div className="mt-6">
                {!transactions || transactions.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-400">
                        No transactions recorded yet. Add your first income or expense!
                    </div>
                ) : (
                    transactions.slice(0, 5).map((item) => (
                        <TransactionInfoCard
                            key={item._id}
                            title={item.type === 'expense' ? item.category : item.source}
                            icon={item.icon}
                            date={formatDateDisplay(item.date)}
                            amount={item.amount}
                            type={item.type}
                            paymentMethod={item.paymentMethod}
                            notes={item.notes}
                            hideDeleteBtn
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default RecentTransactions;
