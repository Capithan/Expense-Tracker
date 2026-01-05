import React from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseSummary from './components/ExpenseSummary';
import ExpenseCharts from './components/ExpenseCharts';
import { useExpenses } from './hooks/useExpenses';
import './App.css';

function App() {
  const { expenses, addExpense, removeExpense, getSummary, clearAllExpenses } = useExpenses();

  const handleAddExpense = (expenseData: { amount: number; category: string; subCategory: string; date?: Date; type: 'income' | 'expenditure' }) => {
    addExpense(expenseData);
  };

  const summary = getSummary();

  return (
    <div className="App">
      <h1>💰 Expense Tracker</h1>
      <ExpenseForm onAddExpense={handleAddExpense} />
      <ExpenseCharts expenses={expenses} categoryBreakdown={summary.categoryBreakdown} />
      <ExpenseSummary 
        summary={summary} 
        expenses={expenses}
        onRemoveExpense={removeExpense}
        onClearAll={clearAllExpenses}
      />
    </div>
  );
}

export default App;
