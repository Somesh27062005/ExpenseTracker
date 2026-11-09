import React, { useRef, useState } from 'react';
import { PAYMENT_METHODS, PRESET_PAYMENT_METHODS } from '../../utils/data';

const PaymentMethodSelect = ({
    value = "Cash",
    onChange,
    disabled = false,
    label = "Payment Method",
}) => {
    const [isOtherMode, setIsOtherMode] = useState(
        () => !PRESET_PAYMENT_METHODS.includes(value)
    );
    const customInputRef = useRef(null);

    const handleSelectChange = (e) => {
        const selected = e.target.value;
        if (selected === "Others") {
            setIsOtherMode(true);
            onChange(PRESET_PAYMENT_METHODS.includes(value) || value === "Others" ? "" : value);
            requestAnimationFrame(() => {
                customInputRef.current?.focus();
            });
        } else {
            setIsOtherMode(false);
            onChange(selected);
        }
    };

    const selectValue = isOtherMode ? "Others" : value;
    const customTextValue = value === "Others" ? "" : value;

    return (
        <div>
            {label && <label className="text-[13px] text-slate-800">{label}</label>}

            <select
                value={selectValue}
                onChange={handleSelectChange}
                disabled={disabled}
                className="input-box cursor-pointer disabled:opacity-70"
            >
                {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                        {method}
                    </option>
                ))}
            </select>

            {isOtherMode && (
                <div className="input-box -mt-1">
                    <input
                        ref={customInputRef}
                        type="text"
                        value={customTextValue}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Enter payment method (e.g. Card, Bank Transfer)"
                        disabled={disabled}
                        className="w-full bg-transparent outline-none"
                    />
                </div>
            )}
        </div>
    );
};

export default PaymentMethodSelect;
