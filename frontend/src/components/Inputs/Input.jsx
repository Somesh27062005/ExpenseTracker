import React, { useRef, useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';

const Input = ({
    value,
    onChange,
    placeholder,
    label,
    type = "text",
    min,
    max,
    step,
    disabled = false,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef(null);

    const toggleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const resolvedType =
        type === 'password' ? (showPassword ? 'text' : 'password') : type;

    const isPickerType = resolvedType === "date" || resolvedType === "month";

    const handlePickerTrigger = () => {
        if (!isPickerType || disabled) return;
        try {
            inputRef.current?.showPicker?.();
        } catch {
            // Fallback silently when showPicker is not supported or blocked
        }
    };

    return (
        <div>
            {label && <label className="text-[13px] text-slate-800">{label}</label>}

            <div
                className={`input-box ${disabled ? "opacity-70" : ""} ${
                    isPickerType && !disabled ? "cursor-pointer" : ""
                }`}
                onClick={handlePickerTrigger}
            >
                <input
                    ref={inputRef}
                    type={resolvedType}
                    inputMode={resolvedType === "number" ? "decimal" : undefined}
                    onWheel={resolvedType === "number" ? (e) => e.currentTarget.blur() : undefined}
                    placeholder={placeholder}
                    className={`w-full bg-transparent outline-none ${
                        isPickerType && !disabled ? "cursor-pointer" : ""
                    }`}
                    value={value}
                    onChange={(e) => onChange(e)}
                    min={min}
                    max={max}
                    step={step}
                    disabled={disabled}
                />

                {type === "password" && (
                    <>
                        {showPassword ? (
                            <FaRegEye
                                size={20}
                                className="text-primary cursor-pointer shrink-0"
                                onClick={toggleShowPassword}
                            />
                        ) : (
                            <FaRegEyeSlash
                                size={20}
                                className="text-slate-400 cursor-pointer shrink-0"
                                onClick={toggleShowPassword}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Input;
