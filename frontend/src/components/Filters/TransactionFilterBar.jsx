import React from 'react';
import { LuSearch, LuFilterX } from 'react-icons/lu';
import MonthPicker from '../Inputs/MonthPicker';
import YearPicker from '../Inputs/YearPicker';
import { getCurrentMonthKey, getCurrentYear } from '../../utils/helper';

const VIEW_MODES = [
    { key: "all", label: "All" },
    { key: "month", label: "Monthly" },
    { key: "year", label: "Yearly" },
];

const TransactionFilterBar = ({
    search = "",
    onSearchChange,
    searchPlaceholder = "Search notes, payment method...",
    viewMode = "all",
    onViewModeChange,
    selectedMonth,
    onSelectedMonthChange,
    selectedYear,
    onSelectedYearChange,
    availableYears = [],
    hasActiveFilters = false,
    onResetFilters,
}) => {
    return (
        <div className="card p-4 md:p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="flex items-center gap-2 bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-0">
                    <LuSearch className="text-gray-400 shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                    />
                </div>

                {/* Period Mode & Picker Controls */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <div
                        role="group"
                        aria-label="Period view mode"
                        className="inline-flex items-center bg-slate-100 border border-gray-200/80 rounded-lg p-1"
                    >
                        {VIEW_MODES.map((mode) => {
                            const isActive = viewMode === mode.key;
                            return (
                                <button
                                    key={mode.key}
                                    type="button"
                                    onClick={() => onViewModeChange(mode.key)}
                                    className={`px-3.5 py-1.5 text-xs sm:text-sm rounded-md cursor-pointer transition-all ${
                                        isActive
                                            ? "bg-white text-purple-700 font-medium shadow-xs"
                                            : "text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    {mode.label}
                                </button>
                            );
                        })}
                    </div>

                    {viewMode === "month" && onSelectedMonthChange && (
                        <MonthPicker
                            value={selectedMonth || getCurrentMonthKey()}
                            onChange={onSelectedMonthChange}
                            align="right"
                        />
                    )}

                    {viewMode === "year" && onSelectedYearChange && (
                        <YearPicker
                            value={selectedYear || getCurrentYear()}
                            onChange={onSelectedYearChange}
                            yearsWithData={availableYears}
                            align="right"
                        />
                    )}

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={onResetFilters}
                            className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-600 cursor-pointer shrink-0 transition-colors"
                            title="Reset view & search"
                            aria-label="Reset view & search"
                        >
                            <LuFilterX className="text-base" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionFilterBar;
