import React, { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { LuImage, LuX } from 'react-icons/lu';

const EmojiPickerPopup = ({ icon, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex flex-col md:flex-row items-start gap-5 mb-6">
            <button
                type="button"
                className="flex items-center gap-4 cursor-pointer text-left"
                onClick={() => setIsOpen((prev) => !prev)}
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
                <div className="relative z-20">
                    <button
                        type="button"
                        className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full absolute -top-2 -right-2 z-10 cursor-pointer shadow-sm"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close emoji picker"
                    >
                        <LuX />
                    </button>

                    <EmojiPicker
                        open={isOpen}
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
