import { useState, useEffect } from 'react';
import { Expense, ExpenseSummary } from '../types';
import { migrateNegativeToExpenditure } from '../utils/dataMigration';

const STORAGE_KEY = 'expense-tracker-data';

export const useExpenses = () => {
    // Load expenses from localStorage on mount
    const [expenses, setExpenses] = useState<Expense[]>(() => {
        // Run migration first
        migrateNegativeToExpenditure();
        
        try {
            const savedExpenses = localStorage.getItem(STORAGE_KEY);
            if (savedExpenses) {
                const parsed = JSON.parse(savedExpenses);
                // Convert date strings back to Date objects
                return parsed.map((expense: any) => ({
                    ...expense,
                    date: new Date(expense.date)
                }));
            }
        } catch (error) {
            console.error('Error loading expenses from localStorage:', error);
        }
        return [];
    });

    // Save expenses to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
        } catch (error) {
            console.error('Error saving expenses to localStorage:', error);
        }
    }, [expenses]);

    const addExpense = (expenseData: Omit<Expense, 'id' | 'date'> & { date?: Date }) => {
        const newExpense: Expense = {
            ...expenseData,
            id: Date.now().toString(),
            date: expenseData.date || new Date(),
            type: expenseData.type || 'expenditure',
        };
        setExpenses((prevExpenses: Expense[]) => [...prevExpenses, newExpense]);
    };

    const removeExpense = (id: string) => {
        setExpenses((prevExpenses: Expense[]) => prevExpenses.filter((expense: Expense) => expense.id !== id));
    };

    const getTotalSpent = () => {
        return expenses.reduce((total: number, expense: Expense) => total + expense.amount, 0);
    };

    const getSummary = (): ExpenseSummary => {
        const totalSpent = expenses
            .filter((expense: Expense) => expense.type === 'expenditure')
            .reduce((total: number, expense: Expense) => total + expense.amount, 0);
        
        const totalIncome = expenses
            .filter((expense: Expense) => expense.type === 'income')
            .reduce((total: number, expense: Expense) => total + expense.amount, 0);
        
        const netBalance = totalIncome - totalSpent;
        
        const categoryBreakdown: Record<string, number> = {};
        const subCategoryBreakdown: Record<string, number> = {};

        expenses.forEach((expense: Expense) => {
            const multiplier = expense.type === 'income' ? 1 : -1;
            categoryBreakdown[expense.category] = 
                (categoryBreakdown[expense.category] || 0) + (expense.amount * multiplier);
            subCategoryBreakdown[expense.subCategory] = 
                (subCategoryBreakdown[expense.subCategory] || 0) + (expense.amount * multiplier);
        });

        return {
            totalSpent,
            totalIncome,
            netBalance,
            categoryBreakdown,
            subCategoryBreakdown,
        };
    };

    const clearAllExpenses = () => {
        if (window.confirm('Are you sure you want to delete all expenses? This cannot be undone.')) {
            setExpenses([]);
        }
    };

    return {
        expenses,
        addExpense,
        removeExpense,
        getTotalSpent,
        getSummary,
        clearAllExpenses,
    };
};
