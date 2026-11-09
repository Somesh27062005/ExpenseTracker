import React, { useContext } from 'react';
import {
    LuUtensils,
    LuTrendingUp,
    LuTrendingDown,
    LuTrash2,
    LuPencil,
} from 'react-icons/lu';
import { UserContext } from '../../context/UserContext';
import { formatCurrency, isIconUrl } from '../../utils/helper';

const TransactionInfoCard = ({
    title,
    icon,
    date,
    amount,
    type,
    paymentMethod,
    notes,
    hideDeleteBtn,
    onDelete,
    onEdit,
}) => {
    const { user } = useContext(UserContext);
    const isIncome = String(type).toLowerCase() === "income";

    const getAmountStyles = () =>
        isIncome ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500";

    return (
        <div className="group relative flex items-center justify-between gap-3 mt-2 p-3 rounded-lg hover:bg-gray-100/60 transition-colors">
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-11 h-11 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full shrink-0">
                    {icon ? (
                        isIconUrl(icon) ? (
                            <img src={icon} alt={title} className="w-6 h-6 object-contain" />
                        ) : (
                            <span className="text-xl leading-none select-none">{icon}</span>
                        )
                    ) : (
                        <LuUtensils />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-gray-800 font-medium truncate">{title}</p>
                        {paymentMethod && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                {paymentMethod}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{date}</p>
                    {notes && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{notes}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {onEdit && (
                    <button
                        type="button"
                        className="text-gray-400 hover:text-purple-600 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                        onClick={onEdit}
                        aria-label="Edit transaction"
                        title="Edit"
                    >
                        <LuPencil size={16} />
                    </button>
                )}

                {!hideDeleteBtn && onDelete && (
                    <button
                        type="button"
                        className="text-gray-400 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                        onClick={onDelete}
                        aria-label="Delete transaction"
                        title="Delete"
                    >
                        <LuTrash2 size={16} />
                    </button>
                )}

                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md ${getAmountStyles()}`}>
                    <h6 className="text-xs font-medium whitespace-nowrap">
                        {isIncome ? "+" : "-"} {formatCurrency(amount, user?.currency)}
                    </h6>
                    {isIncome ? <LuTrendingUp /> : <LuTrendingDown />}
                </div>
            </div>
        </div>
    );
};

export default TransactionInfoCard;
