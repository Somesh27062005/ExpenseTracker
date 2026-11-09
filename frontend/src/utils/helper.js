import moment from "moment";

export const CURRENCY_OPTIONS = [
    { code: "USD", symbol: "$", label: "USD ($) - US Dollar", locale: "en-US" },
    { code: "INR", symbol: "₹", label: "INR (₹) - Indian Rupee", locale: "en-IN" },
    { code: "EUR", symbol: "€", label: "EUR (€) - Euro", locale: "en-IE" },
    { code: "GBP", symbol: "£", label: "GBP (£) - British Pound", locale: "en-GB" },
];

export const getCurrencyConfig = (currencyCode = "USD") => {
    return (
        CURRENCY_OPTIONS.find((item) => item.code === currencyCode) || CURRENCY_OPTIONS[0]
    );
};

export const getCurrencySymbol = (currencyCode = "USD") => {
    return getCurrencyConfig(currencyCode).symbol;
};

export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const getInitials = (name) => {
    if (!name) return "";

    const words = name.trim().split(/\s+/);
    let initials = "";

    for (let i = 0; i < Math.min(words.length, 2); i++) {
        if (words[i]?.[0]) {
            initials += words[i][0];
        }
    }

    return initials.toUpperCase();
};

export const addThousandSeperator = (num, locale = "en-US") => {
    if (num == null || isNaN(num)) return "";

    const numericValue = Number(num);
    const isNegative = numericValue < 0;
    const absValue = Math.abs(numericValue);

    const formatted = new Intl.NumberFormat(locale, {
        maximumFractionDigits: 2,
    }).format(absValue);

    return isNegative ? `-${formatted}` : formatted;
};

export const formatCurrency = (amount, currencyCode = "USD") => {
    const numericValue = Number(amount ?? 0);
    if (Number.isNaN(numericValue)) return `${getCurrencySymbol(currencyCode)}0`;

    const { symbol, locale } = getCurrencyConfig(currencyCode);
    const isNegative = numericValue < 0;
    const formattedNumber = addThousandSeperator(Math.abs(numericValue), locale);

    return isNegative ? `-${symbol}${formattedNumber}` : `${symbol}${formattedNumber}`;
};

export const formatDateDisplay = (dateValue, formatStr = "Do MMM YYYY") => {
    if (!dateValue) return "";
    return moment.utc(dateValue).format(formatStr);
};

export const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    return moment.utc(dateValue).format("YYYY-MM-DD");
};

export const getTodayInputDate = () => {
    return moment().format("YYYY-MM-DD");
};

export const getCurrentMonthKey = () => {
    return moment().format("YYYY-MM");
};

export const prepareExpenseBarChartData = (data = []) => {
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    return sortedData.map((item) => ({
        month: formatDateDisplay(item?.date, "Do MMM"),
        category: item?.category,
        amount: item?.amount,
    }));
};

export const prepareIncomeBarChartData = (data = []) => {
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    return sortedData.map((item) => ({
        month: formatDateDisplay(item?.date, "Do MMM"),
        amount: item?.amount,
        source: item?.source,
    }));
};

export const prepareExpenseLineChartData = (data = []) => {
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    return sortedData.map((item) => ({
        month: formatDateDisplay(item?.date, "Do MMM"),
        amount: item?.amount,
        category: item?.category,
    }));
};
