import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Expense } from '../types';

export const exportToCSV = (expenses: Expense[]) => {
    if (expenses.length === 0) {
        alert('No expenses to export');
        return;
    }

    // Create CSV header
    const headers = ['Date', 'Type', 'Category', 'Sub-Category', 'Amount (₹)'];
    
    // Create CSV rows
    const rows = expenses.map(expense => [
        new Date(expense.date).toLocaleDateString('en-IN'),
        expense.type === 'income' ? 'Income' : 'Expenditure',
        expense.category,
        expense.subCategory,
        expense.amount.toFixed(2)
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToPDF = (expenses: Expense[], summary: { totalSpent: number; totalIncome: number; netBalance: number; categoryBreakdown: Record<string, number> }) => {
    if (expenses.length === 0) {
        alert('No expenses to export');
        return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Expense Report', 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 30);
    
    // Add summary
    doc.setFontSize(14);
    doc.text('Summary', 14, 40);
    doc.setFontSize(11);
    doc.text(`Total Income: ₹${summary.totalIncome.toFixed(2)}`, 14, 48);
    doc.text(`Total Expenditure: ₹${summary.totalSpent.toFixed(2)}`, 14, 54);
    doc.setFontSize(12);
    const balanceColor = summary.netBalance >= 0 ? [39, 174, 96] : [231, 76, 60];
    doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2]);
    doc.text(`Net Balance: ₹${summary.netBalance.toFixed(2)}`, 14, 62);
    doc.setTextColor(0, 0, 0);
    
    // Add category breakdown
    let yPosition = 70;
    doc.setFontSize(11);
    doc.text('Category Breakdown:', 14, yPosition);
    yPosition += 8;
    
    Object.entries(summary.categoryBreakdown).forEach(([category, amount]) => {
        doc.text(`  ${category}: ₹${(amount as number).toFixed(2)}`, 14, yPosition);
        yPosition += 6;
    });

    // Add expense details table
    yPosition += 10;
    
    const tableData = expenses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(expense => [
            new Date(expense.date).toLocaleDateString('en-IN'),
            expense.type === 'income' ? 'Income' : 'Expenditure',
            expense.category,
            expense.subCategory,
            `₹${expense.amount.toFixed(2)}`
        ]);

    autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Type', 'Category', 'Sub-Category', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [52, 152, 219],
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 10,
            cellPadding: 3
        },
        columnStyles: {
            3: { halign: 'right' }
        }
    });

    // Save the PDF
    doc.save(`expense_report_${new Date().toISOString().split('T')[0]}.pdf`);
};
