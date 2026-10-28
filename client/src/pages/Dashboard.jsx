import { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Wallet, ListOrdered, ArrowRight, TrendingUp } from 'lucide-react';
import { getDashboardSummary } from '../api/expenses.api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const { openAddModal } = useOutletContext();
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    totalRecords: 0,
    averageExpense: 0,
    monthlyExpenses: 0,
    categoryBreakdown: [],
    recentExpenses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDashboardSummary();
      if (res.success && res.data) {
        setSummary(res.data);
      }
    } catch (err) {
      setError('Unable to load dashboard summary metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    const handleUpdate = () => fetchSummary();
    window.addEventListener('expense-updated', handleUpdate);
    return () => window.removeEventListener('expense-updated', handleUpdate);
  }, [fetchSummary]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
        <p>Loading your financial dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      {error && <div className="auth-alert-error">{error}</div>}

      {/* Overview Metric Cards Row (Matching Image 1) */}
      <div className="metrics-row">
        {/* Total Records - Dark Navy Card */}
        <div className="metric-card-dark">
          <div>
            <div className="metric-label">Total Records</div>
            <div className="metric-value">{summary.totalRecords.toLocaleString()}</div>
            <div className="metric-subtext">records made</div>
          </div>
          <div className="card-badge-icon">
            <ListOrdered size={32} />
          </div>
        </div>

        {/* Total Expenses - Light Blue Card */}
        <div className="metric-card-light">
          <div>
            <div className="metric-label">Total Expenses</div>
            <div className="metric-value">₹{summary.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div className="metric-subtext">total spent</div>
          </div>
          <div className="card-badge-icon-blue">
            <Wallet size={32} />
          </div>
        </div>

        {/* Current Month Spending */}
        <div className="metric-card-white">
          <div>
            <div className="metric-label">This Month Spending</div>
            <div className="metric-value">₹{summary.monthlyExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '0.4rem', fontWeight: 600 }}>
              Active Calendar Month
            </div>
          </div>
          <div className="card-badge-icon-blue" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <TrendingUp size={28} />
          </div>
        </div>
      </div>

      {/* Visual Analytics & Breakdown */}
      {summary.categoryBreakdown.length > 0 && (
        <div className="chart-card">
          <div className="card-header-row">
            <h3 className="card-heading">Category Spending Distribution</h3>
            <span style={{ fontSize: '0.88rem', color: '#64748b' }}>Amounts in ₹</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.categoryBreakdown} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  formatter={(val) => [`₹${val}`, 'Spent']}
                  contentStyle={{ borderRadius: 10, border: '1px solid #cbd5e1' }}
                />
                <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Transaction History Section (Matching Image 1) */}
      <div className="recent-card">
        <div className="card-header-row">
          <h2 className="card-heading">Recent Transaction History</h2>
          <Link to="/expenses" className="view-all-link">
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {summary.recentExpenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <p>No transactions recorded yet.</p>
            <button
              type="button"
              className="btn-add-expense"
              style={{ margin: '1rem auto 0 auto' }}
              onClick={openAddModal}
            >
              + Add First Expense
            </button>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="table-clean">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentExpenses.map((expense) => (
                  <tr key={expense._id}>
                    <td style={{ fontWeight: 600 }}>{expense.title}</td>
                    <td>
                      <span className="category-tag">{expense.category}</span>
                    </td>
                    <td>{formatDate(expense.date)}</td>
                    <td className="table-amount">
                      ₹{Number(expense.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
