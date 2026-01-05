import { Expense } from '../types';

const STORAGE_KEY = 'expense-tracker-data';
const MIGRATION_KEY = 'expense-tracker-migration-v1';

export const migrateNegativeToExpenditure = (): boolean => {
    // Check if migration already ran
    const migrationDone = localStorage.getItem(MIGRATION_KEY);
    if (migrationDone === 'true') {
        return false; // Already migrated
    }

    try {
        const savedExpenses = localStorage.getItem(STORAGE_KEY);
        if (!savedExpenses) {
            // No data to migrate
            localStorage.setItem(MIGRATION_KEY, 'true');
            return false;
        }

        const expenses = JSON.parse(savedExpenses);
        let migrationPerformed = false;

        const migratedExpenses = expenses.map((expense: any) => {
            // If the expense doesn't have a type field, add it
            if (!expense.type) {
                // If amount is negative, convert to positive and mark as expenditure
                if (expense.amount < 0) {
                    migrationPerformed = true;
                    return {
                        ...expense,
                        amount: Math.abs(expense.amount),
                        type: 'expenditure',
                        date: expense.date // Preserve the date
                    };
                }
                // Positive amounts default to expenditure
                return {
                    ...expense,
                    type: 'expenditure',
                    date: expense.date
                };
            }
            return expense;
        });

        if (migrationPerformed) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedExpenses));
            console.log('Data migration completed: Negative amounts converted to expenditure');
        }

        // Mark migration as complete
        localStorage.setItem(MIGRATION_KEY, 'true');
        return migrationPerformed;
    } catch (error) {
        console.error('Error during data migration:', error);
        return false;
    }
};
