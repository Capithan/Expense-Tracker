import React from 'react';
import { Expense, ExpenseSummary as ExpenseSummaryType } from '../types';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';

interface ExpenseSummaryProps {
    summary: ExpenseSummaryType;
    expenses: Expense[];
    onRemoveExpense?: (id: string) => void;
    onClearAll?: () => void;
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ summary, expenses, onRemoveExpense, onClearAll }) => {
    const expensesByCategory = expenses.reduce((acc: Record<string, Expense[]>, expense: Expense) => {
        if (!acc[expense.category]) {
            acc[expense.category] = [];
        }
        acc[expense.category].push(expense);
        return acc;
    }, {} as Record<string, Expense[]>);

    return (
        <div className="expense-summary">
            <h2>Financial Summary</h2>
            <div className="summary-stats">
                <h3 className="total income">Total Income: ₹{summary.totalIncome.toFixed(2)}</h3>
                <h3 className="total expenditure">Total Expenditure: ₹{summary.totalSpent.toFixed(2)}</h3>
                <h3 className={`total balance ${summary.netBalance >= 0 ? 'positive' : 'negative'}`}>
                    Net Balance: ₹{summary.netBalance.toFixed(2)}
                </h3>
            </div>
            
            {expenses.length > 0 && (
                <div className="export-buttons">
                    <button 
                        className="export-btn csv-btn" 
                        onClick={() => exportToCSV(expenses)}
                    >
                        📊 Download CSV
                    </button>
                    <button 
                        className="export-btn pdf-btn" 
                        onClick={() => exportToPDF(expenses, summary)}
                    >
                        📄 Download PDF
                    </button>
                </div>
            )}
            
            <div className="category-breakdown">
                <h4>By Category</h4>
                <ul>
                    {Object.entries(summary.categoryBreakdown).map(([category, amount]) => (
                        <li key={category}>
                            <span>{category}</span>
                            <span>₹{(amount as number).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {expenses.length > 0 && (
                <div className="expenses-list">
                    <h4>All Expenses</h4>
                    {Object.entries(expensesByCategory).map(([category, items]) => (
                        <div key={category} className="category-group">
                            <h5>{category}</h5>
                            <ul>
                                {items.map((item) => (
                                    <li key={item.id} className={`transaction-${item.type}`}>
                                        <div className="expense-info">
                                            <span className="type-badge">{item.type === 'income' ? '💰' : '💸'}</span>
                                            <span>{item.subCategory}</span>
                                            <span className={item.type === 'income' ? 'income-amount' : 'expense-amount'}>
                                                {item.type === 'income' ? '+' : '-'}₹{item.amount.toFixed(2)}
                                            </span>
                                            <span className="date">{new Date(item.date).toLocaleDateString('en-IN')}</span>
                                        </div>
                                        {onRemoveExpense && (
                                            <button 
                                                className="delete-btn" 
                                                onClick={() => onRemoveExpense(item.id)}
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {expenses.length === 0 && (
                <div className="no-expenses">
                    <p>No expenses yet. Start tracking your spending!</p>
                </div>
            )}

            {expenses.length > 0 && onClearAll && (
                <button className="clear-all-btn" onClick={onClearAll}>
                    🗑️ Clear All Expenses
                </button>
            )}
        </div>
    );
};

export default ExpenseSummary;
