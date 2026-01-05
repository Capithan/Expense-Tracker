export interface Expense {
    id: string;
    amount: number;
    category: string;
    subCategory: string;
    date: Date;
    type: 'income' | 'expenditure';
}

export interface ExpenseSummary {
    totalSpent: number;
    totalIncome: number;
    netBalance: number;
    categoryBreakdown: Record<string, number>;
    subCategoryBreakdown: Record<string, number>;
}
