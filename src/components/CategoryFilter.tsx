import React, { useMemo } from 'react';
import { Expense } from '../types';

interface CategoryFilterProps {
    expenses: Expense[];
    selectedCategories: string[];
    onCategoryChange: (categories: string[]) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
    expenses, 
    selectedCategories, 
    onCategoryChange 
}) => {
    // Extract unique categories, their subcategories, and totals from expenses
    const categoryData = useMemo(() => {
        const categoriesMap = new Map<string, { subCategories: Set<string>, total: number }>();
        
        expenses.forEach(expense => {
            if (!categoriesMap.has(expense.category)) {
                categoriesMap.set(expense.category, { subCategories: new Set(), total: 0 });
            }
            const categoryInfo = categoriesMap.get(expense.category)!;
            categoryInfo.subCategories.add(expense.subCategory);
            
            // Calculate total based on expense type
            const amount = expense.type === 'income' ? expense.amount : expense.amount;
            categoryInfo.total += amount;
        });

        // Convert to array format and sort
        return Array.from(categoriesMap.entries())
            .map(([category, { subCategories, total }]) => ({
                category,
                subCategories: Array.from(subCategories).sort(),
                total
            }))
            .sort((a, b) => a.category.localeCompare(b.category));
    }, [expenses]);

    const handleCategoryToggle = (category: string) => {
        if (selectedCategories.includes(category)) {
            onCategoryChange(selectedCategories.filter(c => c !== category));
        } else {
            onCategoryChange([...selectedCategories, category]);
        }
    };

    const handleSelectAll = () => {
        if (selectedCategories.length === categoryData.length) {
            onCategoryChange([]);
        } else {
            onCategoryChange(categoryData.map(c => c.category));
        }
    };

    if (categoryData.length === 0) {
        return null;
    }

    return (
        <div className="category-filter">
            <h3>📂 Filter by Category</h3>
            <div className="filter-controls">
                <button 
                    className="select-all-btn" 
                    onClick={handleSelectAll}
                >
                    {selectedCategories.length === categoryData.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="filter-info">
                    {selectedCategories.length === 0 
                        ? 'All categories' 
                        : `${selectedCategories.length} categor${selectedCategories.length > 1 ? 'ies' : 'y'} selected`
                    }
                </span>
            </div>
            <div className="category-checkboxes">
                {categoryData.map(({ category, subCategories, total }) => (
                    <div key={category} className="category-item">
                        <label className="category-checkbox">
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(category)}
                                onChange={() => handleCategoryToggle(category)}
                            />
                            <span className="category-name">{category}</span>
                            <span className="category-total">₹{total.toFixed(2)}</span>
                        </label>
                        {selectedCategories.includes(category) && (
                            <div className="subcategories-list">
                                {subCategories.map(subCategory => (
                                    <div key={subCategory} className="subcategory-item">
                                        <span className="bullet">•</span>
                                        <span>{subCategory}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryFilter;
