import React, { useState, useMemo } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseSummary from './components/ExpenseSummary';
import ExpenseCharts from './components/ExpenseCharts';
import TimePeriodFilter from './components/TimePeriodFilter';
import CategoryFilter from './components/CategoryFilter';
import { useExpenses } from './hooks/useExpenses';
import { Expense } from './types';
import './App.css';

function App() {
  const { expenses, addExpense, removeExpense, getSummary, clearAllExpenses } = useExpenses();
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleAddExpense = (expenseData: { amount: number; category: string; subCategory: string; date?: Date; type: 'income' | 'expenditure' }) => {
    addExpense(expenseData);
  };

  // Filter expenses based on selected time periods and categories
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Time period filter
      const periodMatch = selectedPeriods.length === 0 || (() => {
        const date = new Date(expense.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return selectedPeriods.includes(monthYear);
      })();

      // Category filter
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(expense.category);

      return periodMatch && categoryMatch;
    });
  }, [expenses, selectedPeriods, selectedCategories]);

  // Generate summary from filtered expenses
  const filteredSummary = useMemo(() => {
    const totalSpent = filteredExpenses
      .filter((expense: Expense) => expense.type === 'expenditure')
      .reduce((total: number, expense: Expense) => total + expense.amount, 0);
    
    const totalIncome = filteredExpenses
      .filter((expense: Expense) => expense.type === 'income')
      .reduce((total: number, expense: Expense) => total + expense.amount, 0);
    
    const netBalance = totalIncome - totalSpent;
    
    const categoryBreakdown: Record<string, number> = {};
    const subCategoryBreakdown: Record<string, number> = {};

    filteredExpenses.forEach((expense: Expense) => {
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
  }, [filteredExpenses]);

  return (
    <div className="App">
      <h1>💰 Expense Tracker</h1>
      <ExpenseForm onAddExpense={handleAddExpense} />
      <div className="filters-container">
        <TimePeriodFilter 
          expenses={expenses}
          selectedPeriods={selectedPeriods}
          onPeriodChange={setSelectedPeriods}
        />
        <CategoryFilter 
          expenses={expenses}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
        />
      </div>
      <ExpenseCharts expenses={filteredExpenses} categoryBreakdown={filteredSummary.categoryBreakdown} />
      <ExpenseSummary 
        summary={filteredSummary} 
        expenses={filteredExpenses}
        onRemoveExpense={removeExpense}
        onClearAll={clearAllExpenses}
      />
    </div>
  );
}

export default App;
