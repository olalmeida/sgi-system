import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useBudgets } from '../../hooks/useBudgets';
import { useLogistics } from '../../hooks/useLogistics';
import { useTransactions } from '../../hooks/useTransactions';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function AnalyticsDashboard() {
  const { t } = useTranslation();
  const { transactions } = useTransactions(100);
  const { budgets } = useBudgets();
  const { processes } = useLogistics();

  // Financial Data Processing
  const financialData = useMemo(() => {
    const data: Record<string, { name: string; income: number; expense: number }> = {};

    transactions.forEach((t) => {
      const date = new Date(t.created_at);
      const key = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      if (!data[key]) {
        data[key] = { name: key, income: 0, expense: 0 };
      }

      if (t.type === 'income') {
        data[key].income += t.amount;
      } else {
        data[key].expense += t.amount;
      }
    });

    return Object.values(data)
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
      .slice(-7);
  }, [transactions]);

  // Budget Distribution
  const budgetData = useMemo(() => {
    return budgets
      .map((b) => ({
        name: b.name,
        value: b.total_amount,
      }))
      .slice(0, 5);
  }, [budgets]);

  // Logistics status distribution
  const logisticsData = useMemo(() => {
    const counts: Record<string, number> = {};
    processes.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: t(`logistics.${name}`),
      value,
    }));
  }, [processes, t]);

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-grid">
        {/* Income vs Expenses Bar Chart */}
        <div className="stat-card" style={{ gridColumn: 'span 2', height: '400px' }}>
          <h3>{t('reports.incomeVsExpense')}</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar
                dataKey="income"
                name={t('finance.income')}
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name={t('finance.expense')}
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Allocation Pie Chart */}
        <div className="stat-card" style={{ height: '400px' }}>
          <h3>{t('reports.budgetDistribution')}</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={budgetData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {budgetData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Logistics Status Pie Chart */}
        <div className="stat-card" style={{ height: '400px' }}>
          <h3>{t('reports.logisticsDistribution')}</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={logisticsData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {logisticsData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
