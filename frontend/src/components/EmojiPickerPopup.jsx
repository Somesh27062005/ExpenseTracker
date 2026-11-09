import React, { useEffect, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { LuImage, LuX } from 'react-icons/lu';

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

    return (
        <div ref={pickerRef} className="relative inline-block mb-5">
            <button
                type="button"
                className="flex items-center gap-4 cursor-pointer text-left"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
            >
                <div className="w-12 h-12 flex items-center justify-center text-2xl bg-purple-50 text-primary rounded-lg">
                    {icon ? (
                        <img src={icon} alt="icon" className="w-10 h-10" />
                    ) : (
                        <LuImage />
                    )}
                </div>

                <span className="text-sm text-gray-700">
                    {icon ? "Change Icon" : "Pick Icon"}
                </span>
            </button>

            {isOpen && (
                <div className="absolute left-0 top-full mt-2 z-50 w-[320px] max-w-[calc(100vw-4.5rem)] bg-white shadow-2xl rounded-xl">
                    <button
                        type="button"
                        className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full absolute -top-2.5 -right-2.5 z-10 cursor-pointer shadow-sm hover:bg-gray-50 text-gray-600"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close emoji picker"
                    >
                        <LuX className="text-xs" />
                    </button>

                    <EmojiPicker
                        open={isOpen}
                        width="100%"
                        height={320}
                        previewConfig={{ showPreview: false }}
                        lazyLoadEmojis
                        onEmojiClick={(emoji) => {
                            onSelect(emoji?.imageUrl || "");
                            setIsOpen(false);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default EmojiPickerPopup;
