import {
    LuLayoutDashboard,
    LuHandCoins,
    LuWalletMinimal,
    LuSettings,
    LuLogOut,
} from 'react-icons/lu';

export const SIDE_MENU_DATA = [
    {
        id: '01',
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/dashboard",
    },
    {
        id: '02',
        label: "Income",
        icon: LuWalletMinimal,
        path: "/income",
    },
    {
        id: '03',
        label: "Expense",
        icon: LuHandCoins,
        path: "/expense",
    },
    {
        id: '04',
        label: "Settings",
        icon: LuSettings,
        path: "/settings",
    },
    {
        id: '05',
        label: "Logout",
        icon: LuLogOut,
        path: "logout",
    },
];

export const EXPENSE_CATEGORIES = [
    "Food",
    "Groceries",
    "Rent",
    "Transport",
    "Utilities",
    "Shopping",
    "Entertainment",
    "Health",
    "Education",
    "Travel",
    "Other",
];

export const PRESET_PAYMENT_METHODS = [
    "Cash",
    "UPI",
];

export const PAYMENT_METHODS = [
    ...PRESET_PAYMENT_METHODS,
    "Others",
];

export const EXPENSE_PAYMENT_METHODS = PAYMENT_METHODS;

export const INCOME_PAYMENT_METHODS = PAYMENT_METHODS;

export const SORT_OPTIONS = [
    { value: "date_desc", label: "Newest First" },
    { value: "date_asc", label: "Oldest First" },
    { value: "amount_desc", label: "Highest Amount" },
    { value: "amount_asc", label: "Lowest Amount" },
];
