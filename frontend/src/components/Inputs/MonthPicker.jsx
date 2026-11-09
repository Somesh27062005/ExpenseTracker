import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import {
    LuCalendar,
    LuChevronDown,
    LuChevronLeft,
    LuChevronRight,
} from 'react-icons/lu';
import { formatMonthLabel, getCurrentMonthKey } from '../../utils/helper';

const MONTH_SHORT_NAMES = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec",
];

const MonthPicker = ({
    value,
    onChange,
    label,
    showSteppers = true,
    align = "left",
    disabled = false,
}) => {
    const containerRef = useRef(null);
    const currentMonthKey = getCurrentMonthKey();
    const safeValue = /^\d{4}-\d{2}$/.test(value || "") ? value : currentMonthKey;
    const [selectedYear, selectedMonthNum] = safeValue.split("-").map(Number);

    const [isOpen, setIsOpen] = useState(false);
    const [viewYear, setViewYear] = useState(selectedYear);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleOutsideClick = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const handleToggleOpen = () => {
        if (disabled) return;
        if (!isOpen) {
            setViewYear(selectedYear);
        }
        setIsOpen((prev) => !prev);
    };

    const handleStepMonth = (delta) => {
        if (disabled) return;
        const nextKey = moment
            .utc(`${safeValue}-01`, "YYYY-MM-DD")
            .add(delta, "months")
            .format("YYYY-MM");
        setViewYear(Number(nextKey.split("-")[0]));
        onChange(nextKey);
    };

    const handleSelectMonth = (monthIndex) => {
        const nextKey = `${viewYear}-${String(monthIndex + 1).padStart(2, "0")}`;
        onChange(nextKey);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative">
            {label && (
                <label className="block text-[13px] text-slate-800 mb-2">
                    {label}
                </label>
            )}

            <div className="inline-flex items-center bg-slate-50 border border-gray-200 rounded-lg overflow-hidden w-full sm:w-auto">
                {showSteppers && (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleStepMonth(-1)}
                        className="p-2.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 border-r border-gray-200 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Previous month"
                        aria-label="Previous month"
                    >
                        <LuChevronLeft className="text-base" />
                    </button>
                )}

                <button
                    type="button"
                    disabled={disabled}
                    onClick={handleToggleOpen}
                    className="flex items-center justify-between gap-2.5 px-3.5 py-2 text-sm font-medium text-gray-800 hover:bg-purple-50/70 cursor-pointer transition-colors flex-1 min-w-[175px] disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-expanded={isOpen}
                    aria-haspopup="dialog"
                >
                    <span className="flex items-center gap-2">
                        <LuCalendar className="text-primary text-base shrink-0" />
                        <span>{formatMonthLabel(safeValue)}</span>
                    </span>
                    <LuChevronDown
                        className={`text-gray-400 text-sm transition-transform shrink-0 ${
                            isOpen ? "rotate-180" : ""
                        }`}
                    />
                </button>

                {showSteppers && (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleStepMonth(1)}
                        className="p-2.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 border-l border-gray-200 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Next month"
                        aria-label="Next month"
                    >
                        <LuChevronRight className="text-base" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div
                    role="dialog"
                    aria-label="Choose month and year"
                    className={`absolute top-full mt-2 z-30 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 ${
                        align === "right" ? "left-0 sm:left-auto sm:right-0" : "left-0"
                    }`}
                >
                    {/* Year switcher */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                        <button
                            type="button"
                            onClick={() => setViewYear((y) => y - 1)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                            aria-label="Previous year"
                        >
                            <LuChevronLeft className="text-base" />
                        </button>
                        <span className="text-sm font-semibold text-gray-900">
                            {viewYear}
                        </span>
                        <button
                            type="button"
                            onClick={() => setViewYear((y) => y + 1)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                            aria-label="Next year"
                        >
                            <LuChevronRight className="text-base" />
                        </button>
                    </div>

                    {/* 12-Month Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {MONTH_SHORT_NAMES.map((monthName, idx) => {
                            const monthKey = `${viewYear}-${String(idx + 1).padStart(2, "0")}`;
                            const isSelected =
                                viewYear === selectedYear && idx + 1 === selectedMonthNum;
                            const isCurrent = monthKey === currentMonthKey;

                            return (
                                <button
                                    key={monthName}
                                    type="button"
                                    onClick={() => handleSelectMonth(idx)}
                                    className={`py-2 px-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                                        isSelected
                                            ? "bg-primary text-white shadow-sm"
                                            : isCurrent
                                            ? "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    {monthName}
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick Jump to Current Month */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => {
                                onChange(currentMonthKey);
                                setIsOpen(false);
                            }}
                            className="text-xs font-medium text-purple-600 hover:text-purple-800 cursor-pointer"
                        >
                            Jump to This Month
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonthPicker;
