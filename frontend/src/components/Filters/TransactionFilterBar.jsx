import React from 'react';
import { LuSearch, LuFilterX } from 'react-icons/lu';
import { SORT_OPTIONS } from '../../utils/data';

const TransactionFilterBar = ({
    search = "",
    onSearchChange,
    selectedCategory = "all",
    onCategoryChange,
    categoryOptions = [],
    categoryLabel = "Category",
    dateRangePreset = "all",
    onDateRangePresetChange,
    startDate = "",
    onStartDateChange,
    endDate = "",
    onEndDateChange,
    sortBy = "date_desc",
    onSortByChange,
    hasActiveFilters = false,
    onResetFilters,
}) => {
    return (
        <div className="card p-4 md:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search Input */}
                <div className="flex items-center gap-2 bg-slate-50 border border-gray-200 rounded-lg px-3 py-2">
                    <LuSearch className="text-gray-400 shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={`Search ${categoryLabel.toLowerCase()}, notes...`}
                        className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                    />
                </div>

                {/* Category / Source Filter */}
                <select
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none cursor-pointer"
                >
                    <option value="all">All {categoryLabel}s</option>
                    {categoryOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                {/* Date Preset Filter */}
                <select
                    value={dateRangePreset}
                    onChange={(e) => onDateRangePresetChange(e.target.value)}
                    className="bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none cursor-pointer"
                >
                    <option value="all">All Dates</option>
                    <option value="this_month">This Month</option>
                    <option value="last_30">Last 30 Days</option>
                    <option value="custom">Custom Range</option>
                </select>

                {/* Sort Select + Reset */}
                <div className="flex items-center gap-2">
                    <select
                        value={sortBy}
                        onChange={(e) => onSortByChange(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none cursor-pointer"
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={onResetFilters}
                            className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-600 cursor-pointer shrink-0 transition-colors"
                            title="Reset filters"
                            aria-label="Reset filters"
                        >
                            <LuFilterX className="text-base" />
                        </button>
                    )}
                </div>
            </div>

            {dateRangePreset === "custom" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 w-20 shrink-0">From Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 w-20 shrink-0">To Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionFilterBar;
