import React from 'react';
import { isIconUrl } from '../utils/helper';

const INCOME_ICONS = ["💼", "💻", "🏢", "📈", "💰", "🎁", "🏠", "🏆", "💳", "✨"];
const EXPENSE_ICONS = ["🍔", "🛒", "🏠", "🚗", "🛍️", "⚡", "🎬", "🏥", "✈️", "📚", "🎁", "💳"];

const EmojiPickerPopup = ({ icon = "", onSelect, variant = "expense" }) => {
    const baseIcons = variant === "income" ? INCOME_ICONS : EXPENSE_ICONS;
    const isLegacyImage = isIconUrl(icon);
    const hasCustomEmoji = Boolean(icon) && !isLegacyImage && !baseIcons.includes(icon);
    const iconOptions = hasCustomEmoji ? [icon, ...baseIcons] : baseIcons;

    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
                <p className="text-[13px] text-slate-800">Icon (Optional)</p>
                {icon && (
                    <button
                        type="button"
                        onClick={() => onSelect("")}
                        className="text-xs text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {isLegacyImage && (
                    <button
                        type="button"
                        onClick={() => onSelect("")}
                        title="Click to clear current icon"
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-primary bg-purple-50 ring-2 ring-purple-200 cursor-pointer"
                    >
                        <img src={icon} alt="Selected icon" className="w-6 h-6 object-contain" />
                    </button>
                )}

                {iconOptions.map((item) => {
                    const isSelected = icon === item;
                    return (
                        <button
                            key={item}
                            type="button"
                            onClick={() => onSelect(isSelected ? "" : item)}
                            className={`w-9 h-9 flex items-center justify-center text-lg rounded-lg border cursor-pointer transition-colors ${
                                isSelected
                                    ? "border-primary bg-purple-50 ring-2 ring-purple-200"
                                    : "border-gray-200 bg-slate-50 hover:bg-purple-50/70 hover:border-purple-200"
                            }`}
                            aria-pressed={isSelected}
                            title={isSelected ? "Click to remove icon" : "Select icon"}
                        >
                            {item}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default EmojiPickerPopup;
