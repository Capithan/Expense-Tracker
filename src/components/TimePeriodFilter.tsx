import React, { useMemo } from 'react';
import { Expense } from '../types';

interface TimePeriodFilterProps {
    expenses: Expense[];
    selectedPeriods: string[];
    onPeriodChange: (periods: string[]) => void;
}

const TimePeriodFilter: React.FC<TimePeriodFilterProps> = ({ 
    expenses, 
    selectedPeriods, 
    onPeriodChange 
}) => {
    // Extract unique month-year combinations from expenses
    const availablePeriods = useMemo(() => {
        const periodsSet = new Set<string>();
        
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            periodsSet.add(monthYear);
        });

        // Sort periods in descending order (newest first)
        return Array.from(periodsSet).sort((a, b) => b.localeCompare(a));
    }, [expenses]);

    // Format period for display (e.g., "2024-01" -> "January 2024")
    const formatPeriod = (period: string): string => {
        const [year, month] = period.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const handlePeriodToggle = (period: string) => {
        if (selectedPeriods.includes(period)) {
            onPeriodChange(selectedPeriods.filter(p => p !== period));
        } else {
            onPeriodChange([...selectedPeriods, period]);
        }
    };

    const handleSelectAll = () => {
        if (selectedPeriods.length === availablePeriods.length) {
            onPeriodChange([]);
        } else {
            onPeriodChange([...availablePeriods]);
        }
    };

    if (availablePeriods.length === 0) {
        return null;
    }

    return (
        <div className="time-period-filter">
            <h3>📅 Filter by Time Period</h3>
            <div className="filter-controls">
                <button 
                    className="select-all-btn" 
                    onClick={handleSelectAll}
                >
                    {selectedPeriods.length === availablePeriods.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="filter-info">
                    {selectedPeriods.length === 0 
                        ? 'All periods' 
                        : `${selectedPeriods.length} period${selectedPeriods.length > 1 ? 's' : ''} selected`
                    }
                </span>
            </div>
            <div className="period-checkboxes">
                {availablePeriods.map(period => (
                    <label key={period} className="period-checkbox">
                        <input
                            type="checkbox"
                            checked={selectedPeriods.includes(period)}
                            onChange={() => handlePeriodToggle(period)}
                        />
                        <span>{formatPeriod(period)}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default TimePeriodFilter;
