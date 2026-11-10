import React, { useState } from 'react';
import moment from 'moment';
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

    const toggleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const resolvedType =
        type === 'password' ? (showPassword ? 'text' : 'password') : type;

    const formattedDatePreview =
        type === "date" && typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
            ? moment.utc(value, "YYYY-MM-DD", true).isValid()
                ? moment.utc(value, "YYYY-MM-DD").format("Do MMMM YYYY")
                : ""
            : "";

    return (
        <div>
            {(label || formattedDatePreview) && (
                <div className="flex items-center justify-between gap-2 min-h-[20px]">
                    {label && <label className="text-[13px] text-slate-800">{label}</label>}
                    {formattedDatePreview && (
                        <span className="text-[11px] font-medium text-purple-600 truncate">
                            {formattedDatePreview}
                        </span>
                    )}
                </div>
            )}

            <div className={`input-box ${disabled ? "opacity-70" : ""}`}>
                <input
                    type={resolvedType}
                    inputMode={resolvedType === "number" ? "decimal" : undefined}
                    onWheel={resolvedType === "number" ? (e) => e.currentTarget.blur() : undefined}
                    placeholder={placeholder}
                    className="w-full bg-transparent outline-none"
                    value={value ?? ""}
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
