import React, { useState } from 'react';

interface ExpenseFormProps {
    onAddExpense: (expense: { amount: number; category: string; subCategory: string; date?: Date; type: 'income' | 'expenditure' }) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense }) => {
    const [type, setType] = useState<'income' | 'expenditure'>('expenditure');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !category || !subCategory || !date) {
            alert('Please fill in all fields');
            return;
        }
        onAddExpense({ 
            amount: parseFloat(amount), 
            category, 
            subCategory,
            date: new Date(date),
            type
        });
        setAmount('');
        setCategory('');
        setSubCategory('');
        setDate(new Date().toISOString().split('T')[0]);
    };

    return (
        <form onSubmit={handleSubmit} className="expense-form">
            <div className="form-group">
                <label>Transaction Type:</label>
                <div className="radio-group">
                    <label className="radio-label">
                        <input
                            type="radio"
                            value="expenditure"
                            checked={type === 'expenditure'}
                            onChange={(e) => setType(e.target.value as 'expenditure')}
                        />
                        <span>💸 Expenditure</span>
                    </label>
                    <label className="radio-label">
                        <input
                            type="radio"
                            value="income"
                            checked={type === 'income'}
                            onChange={(e) => setType(e.target.value as 'income')}
                        />
                        <span>💰 Income</span>
                    </label>
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="amount">Amount (₹):</label>
                <input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="category">Category:</label>
                <input
                    id="category"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Food, Transport"
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="subCategory">Sub-Category:</label>
                <input
                    id="subCategory"
                    type="text"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    placeholder="e.g., Groceries, Gas"
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="date">Date:</label>
                <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Add Expense</button>
        </form>
    );
};

export default ExpenseForm;
