import React, { useEffect, useRef, useState } from 'react';
import { LuImage, LuX } from 'react-icons/lu';
import { isIconUrl } from '../utils/helper';

const INCOME_ICONS = [
    { emoji: "💼", name: "Salary" },
    { emoji: "💻", name: "Freelance" },
    { emoji: "🏢", name: "Business" },
    { emoji: "📈", name: "Investments" },
    { emoji: "💰", name: "Cash / Bonus" },
    { emoji: "🏦", name: "Bank Interest" },
    { emoji: "🏠", name: "Rental Income" },
    { emoji: "🎁", name: "Gift" },
    { emoji: "🧾", name: "Refund / Invoice" },
    { emoji: "🏆", name: "Reward" },
    { emoji: "💳", name: "Card / Transfer" },
    { emoji: "✨", name: "Other Income" },
];

const EXPENSE_ICONS = [
    { emoji: "🍔", name: "Food & Dining" },
    { emoji: "🛒", name: "Groceries" },
    { emoji: "🏠", name: "Rent & Housing" },
    { emoji: "🚗", name: "Transport" },
    { emoji: "🛍️", name: "Shopping" },
    { emoji: "⚡", name: "Utilities & Bills" },
    { emoji: "📱", name: "Subscriptions" },
    { emoji: "🎬", name: "Entertainment" },
    { emoji: "🏥", name: "Healthcare" },
    { emoji: "✈️", name: "Travel" },
    { emoji: "📚", name: "Education" },
    { emoji: "💳", name: "Other Expense" },
];

const EmojiPickerPopup = ({ icon = "", onSelect, variant = "expense" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef(null);

    const baseIcons = variant === "income" ? INCOME_ICONS : EXPENSE_ICONS;
    const isLegacyImage = isIconUrl(icon);
    const hasCustomEmoji =
        Boolean(icon) &&
        !isLegacyImage &&
        !baseIcons.some((item) => item.emoji === icon);
    const iconOptions = hasCustomEmoji
        ? [{ emoji: icon, name: "Current Icon" }, ...baseIcons]
        : baseIcons;

    const selectedItem = baseIcons.find((item) => item.emoji === icon);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleOutsideClick = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        window.addEventListener("keydown", handleKeyDown, true);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            window.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [isOpen]);

    return (
        <div ref={pickerRef} className="relative inline-block mb-5">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    className="flex items-center gap-3.5 cursor-pointer text-left"
                    onClick={() => setIsOpen((prev) => !prev)}
                    aria-expanded={isOpen}
                    title={selectedItem?.name || "Pick Icon"}
                >
                    <div className="w-12 h-12 flex items-center justify-center text-2xl bg-purple-50 text-primary rounded-lg">
                        {icon ? (
                            isLegacyImage ? (
                                <img src={icon} alt="Selected icon" className="w-8 h-8 object-contain" />
                            ) : (
                                <span className="text-2xl leading-none select-none">{icon}</span>
                            )
                        ) : (
                            <LuImage />
                        )}
                    </div>

                    <div>
                        <span className="text-sm text-gray-700 block">
                            {icon ? "Change Icon" : "Pick Icon"}
                        </span>
                        {selectedItem && (
                            <span className="text-[11px] text-gray-400 block">
                                {selectedItem.name}
                            </span>
                        )}
                    </div>
                </button>

                {icon && (
                    <button
                        type="button"
                        onClick={() => {
                            onSelect("");
                            setIsOpen(false);
                        }}
                        className="text-xs text-gray-400 hover:text-red-500 cursor-pointer transition-colors ml-1"
                    >
                        Clear
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute left-0 top-full mt-2 z-50 w-[264px] max-w-[calc(100vw-4.5rem)] bg-white border border-gray-200 shadow-xl rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">
                            Choose an icon
                        </span>
                        <button
                            type="button"
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close icon picker"
                        >
                            <LuX className="text-xs" />
                        </button>
                    </div>

                    <div className="grid grid-cols-6 gap-1.5">
                        {iconOptions.map((item, idx) => {
                            const isSelected = icon === item.emoji;
                            const colIndex = idx % 6;
                            const tooltipAlign =
                                colIndex === 0
                                    ? "left-0"
                                    : colIndex === 5
                                    ? "right-0"
                                    : "left-1/2 -translate-x-1/2";

                            return (
                                <button
                                    key={item.emoji}
                                    type="button"
                                    onClick={() => {
                                        onSelect(isSelected ? "" : item.emoji);
                                        setIsOpen(false);
                                    }}
                                    title={item.name}
                                    aria-label={item.name}
                                    aria-pressed={isSelected}
                                    className={`group relative w-9 h-9 flex items-center justify-center text-lg rounded-lg border cursor-pointer transition-colors ${
                                        isSelected
                                            ? "border-primary bg-purple-50 ring-2 ring-purple-200"
                                            : "border-transparent bg-slate-50 hover:bg-purple-50 hover:border-purple-200"
                                    }`}
                                >
                                    <span>{item.emoji}</span>
                                    <span
                                        className={`pointer-events-none absolute -top-8 ${tooltipAlign} z-20 px-2 py-0.5 rounded bg-gray-900 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity shadow-sm`}
                                    >
                                        {item.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmojiPickerPopup;
