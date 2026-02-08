import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type {
  TransactionWithDetails,
  BudgetWithCurrency,
  LogisticsProcess,
} from '../types/database';

interface ExportData {
  transactions: TransactionWithDetails[];
  budgets: BudgetWithCurrency[];
  processes: LogisticsProcess[];
  title?: string;
  filename?: string;
  t: (key: string) => string;
}

export const exportToPDF = async ({
  transactions,
  budgets,
  title,
  t,
}: Omit<ExportData, 'processes'>) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(31, 41, 55); // #1f2937
  doc.text(title || 'Gestio System Report', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // #6b7280
  doc.text(`Fecha de generación: ${date}`, 14, 30);
  doc.text(
    '--------------------------------------------------------------------------------------------------',
    14,
    35
  );

  // Financial Summary Table
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text(t('nav.finance'), 14, 45);

  const transactionData = transactions.map((tr) => [
    new Date(tr.created_at).toLocaleDateString(),
    tr.description,
    tr.type === 'income' ? t('finance.income') : t('finance.expense'),
    `${tr.amount} ${tr.currency?.code || tr.currency_code}`,
  ]);

  autoTable(doc, {
    startY: 50,
    head: [[t('finance.date'), t('finance.description'), t('finance.type'), t('finance.amount')]],
    body: transactionData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] }, // blue-500
  });

  // Budgets Table
  const docWithTable = doc as typeof doc & { lastAutoTable?: { finalY: number } };
  const nextY = (docWithTable.lastAutoTable?.finalY || 50) + 15;

  doc.text(t('nav.budgets'), 14, nextY);

  const budgetData = budgets.map((b) => [
    b.name,
    `${b.total_amount} ${b.currency?.code || b.currency_code}`,
    `${b.spent_amount} ${b.currency?.code || b.currency_code}`,
    `${((b.spent_amount / b.total_amount) * 100).toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: nextY + 5,
    head: [[t('budgets.name'), t('budgets.totalAmount'), t('budgets.spent'), '%']],
    body: budgetData,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] }, // emerald-500
  });

  doc.save(`Gestio_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = async ({
  transactions,
  budgets,
  processes,
  filename,
  t,
}: ExportData) => {
  const wb = XLSX.utils.book_new();

  // Transactions Sheet
  const transactionItems = transactions.map((tr) => ({
    [t('finance.date')]: new Date(tr.created_at).toLocaleDateString(),
    [t('finance.description')]: tr.description || 'N/A',
    [t('finance.type')]: tr.type === 'income' ? t('finance.income') : t('finance.expense'),
    [t('finance.amount')]: tr.amount,
    [t('finance.currency')]: tr.currency?.code || tr.currency_code,
    [t('finance.budget')]: tr.budget?.name || 'N/A',
  }));
  const wsTransactions = XLSX.utils.json_to_sheet(transactionItems);
  XLSX.utils.book_append_sheet(wb, wsTransactions, t('nav.finance'));

  // Budgets Sheet
  const budgetItems = budgets.map((b) => ({
    [t('budgets.name')]: b.name,
    [t('budgets.totalAmount')]: b.total_amount,
    [t('budgets.spent')]: b.spent_amount,
    [t('finance.currency')]: b.currency?.code || b.currency_code,
    '% Executed': b.total_amount > 0 ? (b.spent_amount / b.total_amount) * 100 : 0,
  }));
  const wsBudgets = XLSX.utils.json_to_sheet(budgetItems);
  XLSX.utils.book_append_sheet(wb, wsBudgets, t('nav.budgets'));

  // Logistics Sheet
  const logisticsItems = processes.map((p) => ({
    [t('logistics.processName')]: p.name,
    [t('logistics.status')]: t(`logistics.${p.status}`),
    [t('finance.date')]: new Date(p.created_at).toLocaleDateString(),
  }));
  const wsLogistics = XLSX.utils.json_to_sheet(logisticsItems);
  XLSX.utils.book_append_sheet(wb, wsLogistics, t('nav.logistics'));

  XLSX.writeFile(wb, filename || `Gestio_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
};
