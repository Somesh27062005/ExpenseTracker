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

export const formatDateDisplay = (dateValue, formatStr = "Do MMMM YYYY") => {
    if (!dateValue) return "";
    return moment.utc(dateValue).format(formatStr);
};

export const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    return moment.utc(dateValue).format("YYYY-MM-DD");
};

export const SHORT_MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const FULL_MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export const getTodayInputDate = () => {
    return moment().format("YYYY-MM-DD");
};

export const getCurrentMonthKey = () => {
    return moment().format("YYYY-MM");
};

export const getCurrentYear = () => {
    return moment().year();
};

export const formatMonthLabel = (monthKey) => {
    if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) return "";
    return moment.utc(`${monthKey}-01`, "YYYY-MM-DD").format("MMMM YYYY");
};

export const getAvailableYears = (transactions = [], fallbackYear = getCurrentYear()) => {
    const years = new Set([Number(fallbackYear)]);
    (transactions || []).forEach((item) => {
        const key = formatDateForInput(item?.date);
        const yearNum = Number(key.slice(0, 4));
        if (!Number.isNaN(yearNum) && yearNum > 1900) {
            years.add(yearNum);
        }
    });
    return Array.from(years).sort((a, b) => b - a);
};

export const isIconUrl = (value) => {
    return typeof value === "string" && /^(https?:\/\/|\/|data:image\/)/i.test(value.trim());
};

export const prepareExpenseBarChartData = (data = []) => {
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    return sortedData.map((item) => ({
        month: formatDateDisplay(item?.date, "Do MMM"),
        fullDate: formatDateDisplay(item?.date),
        category: item?.category,
        amount: item?.amount,
    }));
};

export const prepareIncomeBarChartData = (data = []) => {
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    return sortedData.map((item) => ({
        month: formatDateDisplay(item?.date, "Do MMM"),
        fullDate: formatDateDisplay(item?.date),
        amount: item?.amount,
        source: item?.source,
    }));
};

export const prepareExpenseLineChartData = (data = []) => {
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    return sortedData.map((item) => ({
        month: formatDateDisplay(item?.date, "Do MMM"),
        fullDate: formatDateDisplay(item?.date),
        amount: item?.amount,
        category: item?.category,
    }));
};

export const prepareDailyChartData = (data = [], type = "income") => {
    const labelField = type === "expense" ? "category" : "source";
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    const grouped = new Map();

    sortedData.forEach((item) => {
        const dateKey = formatDateForInput(item?.date);
        if (!dateKey) return;

        if (!grouped.has(dateKey)) {
            grouped.set(dateKey, {
                dateKey,
                month: formatDateDisplay(dateKey, "Do MMM"),
                fullDate: formatDateDisplay(dateKey),
                amount: 0,
                count: 0,
                names: [],
            });
        }

        const bucket = grouped.get(dateKey);
        bucket.amount += Number(item?.amount || 0);
        bucket.count += 1;
        const labelVal = String(item?.[labelField] || "").trim();
        if (labelVal && !bucket.names.includes(labelVal)) {
            bucket.names.push(labelVal);
        }
    });

    return Array.from(grouped.values()).map((bucket) => ({
        month: bucket.month,
        fullDate: bucket.fullDate,
        amount: Number(bucket.amount.toFixed(2)),
        count: bucket.count,
        [labelField]: bucket.names.join(", "),
    }));
};

export const prepareYearlyMonthlyChartData = (data = [], year = getCurrentYear()) => {
    const numericYear = Number(year) || getCurrentYear();
    const buckets = SHORT_MONTH_NAMES.map((shortName, index) => ({
        monthKey: `${numericYear}-${String(index + 1).padStart(2, "0")}`,
        month: shortName,
        monthName: FULL_MONTH_NAMES[index],
        monthFull: `${FULL_MONTH_NAMES[index]} ${numericYear}`,
        amount: 0,
        count: 0,
    }));

    (data || []).forEach((item) => {
        const dateKey = formatDateForInput(item?.date);
        if (!dateKey || !dateKey.startsWith(`${numericYear}-`)) return;

        const monthIdx = Number(dateKey.slice(5, 7)) - 1;
        if (monthIdx >= 0 && monthIdx < 12) {
            buckets[monthIdx].amount += Number(item?.amount || 0);
            buckets[monthIdx].count += 1;
        }
    });

    return buckets.map((b) => ({
        ...b,
        amount: Number(b.amount.toFixed(2)),
    }));
};

export const buildCategoryBreakdown = (data = [], field = "category") => {
    const grouped = new Map();
    let total = 0;

    (data || []).forEach((item) => {
        const amount = Number(item?.amount || 0);
        const rawName = String(item?.[field] || "Other").trim() || "Other";
        const key = rawName.toLowerCase();
        total += amount;

        if (!grouped.has(key)) {
            grouped.set(key, {
                name: rawName,
                amount: 0,
                count: 0,
            });
        }
        const entry = grouped.get(key);
        entry.amount += amount;
        entry.count += 1;
    });

    return Array.from(grouped.values())
        .map((entry) => ({
            ...entry,
            amount: Number(entry.amount.toFixed(2)),
            percentage: total > 0 ? Math.round((entry.amount / total) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount);
};
