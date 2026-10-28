import { useState, useEffect } from 'react';
import { getDashboardSummary } from '../api/expenses.api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await getDashboardSummary();
        if (res.success && res.data?.categoryBreakdown) {
          setCategories(res.data.categoryBreakdown);
        }
      } catch (err) {
        setError('Unable to load categories.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
        <p>Loading category data...</p>
      </div>
    );
  }

  return (
    <div className="expenses-container">
      {error && <div className="auth-alert-error">{error}</div>}

      <div className="expenses-card">
        <h2 className="card-heading" style={{ marginBottom: '1.5rem' }}>
          All Spending Categories
        </h2>

        {categories.length === 0 ? (
          <p style={{ color: '#64748b' }}>No category data recorded yet.</p>
        ) : (
          <div className="data-table-wrapper">
            <table className="table-clean">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Number of Records</th>
                  <th>Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.category}>
                    <td>
                      <span className="category-tag">{cat.category}</span>
                    </td>
                    <td>{cat.count} expenses</td>
                    <td className="table-amount">
                      ₹{Number(cat.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

export default Categories;
