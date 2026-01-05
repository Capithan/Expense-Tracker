import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Expense } from '../types';

interface ExpenseChartsProps {
    expenses: Expense[];
    categoryBreakdown: Record<string, number>;
}

const COLORS = ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];

const ExpenseCharts: React.FC<ExpenseChartsProps> = ({ expenses, categoryBreakdown }) => {
    // Get min and max dates from expenses
    const dateRange = useMemo(() => {
        if (expenses.length === 0) return { min: '', max: '' };
        const dates = expenses.map(e => new Date(e.date).getTime());
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        return {
            min: minDate.toISOString().split('T')[0],
            max: maxDate.toISOString().split('T')[0]
        };
    }, [expenses]);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Filter expenses based on date range
    const filteredExpenses = useMemo(() => {
        if (!startDate && !endDate) return expenses;
        
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date();
            end.setHours(23, 59, 59, 999); // Include the entire end date
            return expenseDate >= start && expenseDate <= end;
        });
    }, [expenses, startDate, endDate]);

    // Recalculate category breakdown for filtered data - separate income and expenditure
    const filteredCategoryBreakdown = useMemo(() => {
        const breakdown: Record<string, number> = {};
        filteredExpenses
            .filter(expense => expense.type === 'expenditure')
            .forEach(expense => {
                breakdown[expense.category] = (breakdown[expense.category] || 0) + expense.amount;
            });
        return breakdown;
    }, [filteredExpenses]);

    // Prepare data for pie chart (expenditure only)
    const pieData = Object.entries(filteredCategoryBreakdown).map(([name, value]) => ({
        name,
        value: value as number
    }));

    // Prepare data for bar chart - income vs expenditure by date
    const transactionsByDate = filteredExpenses.reduce((acc: Record<string, { income: number; expenditure: number }>, expense: Expense) => {
        const date = new Date(expense.date).toLocaleDateString('en-IN');
        if (!acc[date]) {
            acc[date] = { income: 0, expenditure: 0 };
        }
        if (expense.type === 'income') {
            acc[date].income += expense.amount;
        } else {
            acc[date].expenditure += expense.amount;
        }
        return acc;
    }, {});

    const barData = Object.entries(transactionsByDate)
        .map(([date, amounts]) => ({ 
            date, 
            Income: amounts.income,
            Expenditure: amounts.expenditure
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
    };

    if (expenses.length === 0) {
        return null;
    }

    return (
        <div className="expense-charts">
            <h3>📊 Spending Visualization</h3>
            
            <div className="date-range-filter">
                <h4>Filter by Date Range</h4>
                <div className="date-inputs">
                    <div className="date-input-group">
                        <label htmlFor="startDate">Start Date:</label>
                        <input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={dateRange.min}
                            max={dateRange.max}
                        />
                    </div>
                    <div className="date-input-group">
                        <label htmlFor="endDate">End Date:</label>
                        <input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={dateRange.min}
                            max={dateRange.max}
                        />
                    </div>
                    <button onClick={handleReset} className="reset-btn">
                        Reset to All History
                    </button>
                </div>
                {(startDate || endDate) && (
                    <p className="filter-status">
                        Showing: {startDate || 'Beginning'} to {endDate || 'Today'} 
                        ({filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''})
                    </p>
                )}
            </div>
            
            <div className="charts-container">
                <div className="chart-section">
                    <h4>Expenditure by Category</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-section">
                    <h4>Income vs Expenditure</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                            <Legend />
                            <Bar dataKey="Income" fill="#27ae60" name="Income (₹)" />
                            <Bar dataKey="Expenditure" fill="#e74c3c" name="Expenditure (₹)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ExpenseCharts;
