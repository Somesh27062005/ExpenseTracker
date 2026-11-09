import {
    LuLayoutDashboard,
    LuHandCoins,
    LuWalletMinimal,
    LuTarget,
    LuRepeat,
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
        label: "Budgets",
        icon: LuTarget,
        path: "/budgets",
    },
    {
        id: '05',
        label: "Recurring",
        icon: LuRepeat,
        path: "/recurring",
    },
    {
        id: '06',
        label: "Settings",
        icon: LuSettings,
        path: "/settings",
    },
    {
        id: '07',
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

export const BUDGET_CATEGORY_SUGGESTIONS = [
    "Overall",
    ...EXPENSE_CATEGORIES,
];

export const INCOME_SOURCES = [
    "Salary",
    "Freelance",
    "Business",
    "Investments",
    "Bonus",
    "Rental",
    "Gift",
    "Other",
];

export const EXPENSE_PAYMENT_METHODS = [
    "UPI / Card",
    "Cash",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "Net Banking",
    "Wallet",
];

export const INCOME_PAYMENT_METHODS = [
    "Bank Transfer",
    "UPI",
    "Cash",
    "Cheque",
    "PayPal / Stripe",
    "Direct Deposit",
];

export const SORT_OPTIONS = [
    { value: "date_desc", label: "Newest First" },
    { value: "date_asc", label: "Oldest First" },
    { value: "amount_desc", label: "Highest Amount" },
    { value: "amount_asc", label: "Lowest Amount" },
];
