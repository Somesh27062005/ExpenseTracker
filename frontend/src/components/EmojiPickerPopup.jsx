import React, { useEffect, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { LuImage, LuX } from 'react-icons/lu';
import { isIconUrl } from '../utils/helper';

const formatEmojiTitle = (label = "") =>
    label
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());

const EmojiPickerPopup = ({ icon, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef(null);

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

    const handleEmojiHover = (event) => {
        const emojiBtn = event.target.closest?.("button.epr-emoji");
        if (!emojiBtn) return;

        if (!emojiBtn.getAttribute("title")) {
            const rawLabel =
                emojiBtn.getAttribute("aria-label") ||
                emojiBtn.getAttribute("data-full-name") ||
                "";
            if (rawLabel) {
                emojiBtn.setAttribute("title", formatEmojiTitle(rawLabel));
            }
        }
    };

    return (
        <div
            ref={pickerRef}
            className="flex flex-col md:flex-row items-start gap-5 mb-5"
        >
            <div className="flex items-center gap-3 shrink-0">
                <button
                    type="button"
                    className="flex items-center gap-4 cursor-pointer text-left"
                    onClick={() => setIsOpen((prev) => !prev)}
                    aria-expanded={isOpen}
                >
                    <div className="w-12 h-12 flex items-center justify-center text-2xl bg-purple-50 text-primary rounded-lg">
                        {icon ? (
                            isIconUrl(icon) ? (
                                <img src={icon} alt="icon" className="w-10 h-10 object-contain" />
                            ) : (
                                <span className="text-2xl leading-none select-none">{icon}</span>
                            )
                        ) : (
                            <LuImage />
                        )}
                    </div>

                    <span className="text-sm text-gray-700">
                        {icon ? "Change Icon" : "Pick Icon"}
                    </span>
                </button>

                {icon && (
                    <button
                        type="button"
                        onClick={() => {
                            onSelect("");
                            setIsOpen(false);
                        }}
                        className="text-xs text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>

            {isOpen && (
                <div
                    className="relative z-20 w-full max-w-[350px]"
                    onMouseOver={handleEmojiHover}
                >
                    <button
                        type="button"
                        className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full absolute -top-2 -right-2 z-10 cursor-pointer shadow-sm hover:bg-gray-50 text-gray-600"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close emoji picker"
                    >
                        <LuX className="text-xs" />
                    </button>

                    <EmojiPicker
                        open={isOpen}
                        width="100%"
                        height={380}
                        lazyLoadEmojis
                        previewConfig={{
                            showPreview: true,
                            defaultCaption: "Hover an emoji to see its name",
                        }}
                        onEmojiClick={(emoji) => {
                            onSelect(emoji?.imageUrl || emoji?.emoji || "");
                            setIsOpen(false);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default EmojiPickerPopup;
