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

export const EXPENSE_PAYMENT_METHODS = [
    "Cash",
    "Debit Card",
    "Credit Card",
    "Bank Transfer",
    "Digital Wallet",
    "Other",
];

export const INCOME_PAYMENT_METHODS = [
    "Bank Transfer",
    "Direct Deposit",
    "Cash",
    "Cheque",
    "Digital Wallet",
    "Other",
];

export const SORT_OPTIONS = [
    { value: "date_desc", label: "Newest First" },
    { value: "date_asc", label: "Oldest First" },
    { value: "amount_desc", label: "Highest Amount" },
    { value: "amount_asc", label: "Lowest Amount" },
];
