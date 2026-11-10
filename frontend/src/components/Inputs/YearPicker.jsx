import React, { useEffect, useRef, useState } from 'react';
import {
    LuCalendar,
    LuChevronDown,
    LuChevronLeft,
    LuChevronRight,
} from 'react-icons/lu';
import { getCurrentYear } from '../../utils/helper';

const YearPicker = ({
    value,
    onChange,
    label,
    showSteppers = true,
    align = "left",
    disabled = false,
    yearsWithData = [],
}) => {
    const containerRef = useRef(null);
    const currentYear = getCurrentYear();
    const numericValue = Number(value);
    const safeYear =
        !Number.isNaN(numericValue) && numericValue >= 1900 && numericValue <= 2999
            ? numericValue
            : currentYear;

    const getDecadeBase = (yr) => Math.floor(yr / 10) * 10 - 1;

    const [isOpen, setIsOpen] = useState(false);
    const [rangeStart, setRangeStart] = useState(() => getDecadeBase(safeYear));

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
            setRangeStart(getDecadeBase(safeYear));
        }
        setIsOpen((prev) => !prev);
    };

    const handleStepYear = (delta) => {
        if (disabled) return;
        const nextYear = safeYear + delta;
        setRangeStart(getDecadeBase(nextYear));
        onChange(nextYear);
    };

    const handleSelectYear = (year) => {
        onChange(year);
        setIsOpen(false);
    };

    const dataYearSet = new Set((yearsWithData || []).map(Number));
    const yearsGrid = Array.from({ length: 12 }, (_, idx) => rangeStart + idx);

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
                        onClick={() => handleStepYear(-1)}
                        className="p-2.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 border-r border-gray-200 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Previous year"
                        aria-label="Previous year"
                    >
                        <LuChevronLeft className="text-base" />
                    </button>
                )}

                <button
                    type="button"
                    disabled={disabled}
                    onClick={handleToggleOpen}
                    className="flex items-center justify-between gap-2.5 px-3.5 py-2 text-sm font-medium text-gray-800 hover:bg-purple-50/70 cursor-pointer transition-colors flex-1 min-w-[130px] disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-expanded={isOpen}
                    aria-haspopup="dialog"
                >
                    <span className="flex items-center gap-2">
                        <LuCalendar className="text-primary text-base shrink-0" />
                        <span>{safeYear}</span>
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
                        onClick={() => handleStepYear(1)}
                        className="p-2.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 border-l border-gray-200 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Next year"
                        aria-label="Next year"
                    >
                        <LuChevronRight className="text-base" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div
                    role="dialog"
                    aria-label="Choose year"
                    className={`absolute top-full mt-2 z-30 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-4 ${
                        align === "right" ? "left-0 sm:left-auto sm:right-0" : "left-0"
                    }`}
                >
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                        <button
                            type="button"
                            onClick={() => setRangeStart((y) => y - 10)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                            aria-label="Previous years"
                        >
                            <LuChevronLeft className="text-base" />
                        </button>
                        <span className="text-sm font-semibold text-gray-900">
                            {yearsGrid[0]} – {yearsGrid[yearsGrid.length - 1]}
                        </span>
                        <button
                            type="button"
                            onClick={() => setRangeStart((y) => y + 10)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                            aria-label="Next years"
                        >
                            <LuChevronRight className="text-base" />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {yearsGrid.map((yr) => {
                            const isSelected = yr === safeYear;
                            const isCurrent = yr === currentYear;
                            const hasData = dataYearSet.has(yr);

                            return (
                                <button
                                    key={yr}
                                    type="button"
                                    onClick={() => handleSelectYear(yr)}
                                    className={`py-2 px-2 rounded-lg text-xs font-medium cursor-pointer transition-colors flex flex-col items-center justify-center gap-0.5 ${
                                        isSelected
                                            ? "bg-primary text-white shadow-sm"
                                            : isCurrent
                                            ? "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <span>{yr}</span>
                                    {hasData && (
                                        <span
                                            className={`w-1 h-1 rounded-full ${
                                                isSelected ? "bg-white/80" : "bg-primary"
                                            }`}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => handleSelectYear(currentYear)}
                            className="text-xs font-medium text-purple-600 hover:text-purple-800 cursor-pointer"
                        >
                            Jump to {currentYear}
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

export default YearPicker;
