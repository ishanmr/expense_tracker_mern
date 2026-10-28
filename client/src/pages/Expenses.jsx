import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getExpenses, deleteExpense } from '../api/expenses.api';
import ExpenseModal from '../components/expenses/ExpenseModal';
import DeleteDialog from '../components/expenses/DeleteDialog';

const CATEGORIES = [
  'All Categories',
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Housing',
  'Other',
];

const PAYMENT_METHODS = [
  'All Payment Methods',
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Net Banking',
  'Bank Transfer',
  'Other',
];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalRecords: 0 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchExpenseData = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        sortBy,
        order,
      };

      if (search.trim()) params.search = search.trim();
      if (category && category !== 'All Categories') params.category = category;
      if (paymentMethod && paymentMethod !== 'All Payment Methods') params.paymentMethod = paymentMethod;

      const res = await getExpenses(params);
      if (res.success) {
        setExpenses(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      setError('Failed to fetch expense records.');
    } finally {
      setLoading(false);
    }
  }, [search, category, paymentMethod, sortBy, order]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchExpenseData(1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [fetchExpenseData]);

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleDeletePrompt = (expense) => {
    setExpenseToDelete(expense);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      setDeleteLoading(true);
      await deleteExpense(expenseToDelete._id);
      setIsDeleteOpen(false);
      setExpenseToDelete(null);
      fetchExpenseData(pagination.page);
    } catch (err) {
      setError('Unable to delete expense.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="expenses-container">
      {error && <div className="auth-alert-error">{error}</div>}

      <div className="expenses-card">
        {/* Controls Bar (Matching Image 3) */}
        <div className="controls-bar">
          <div className="filters-group">
            {/* Search Input */}
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="filter-select"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                  {cat === 'All Categories' ? '[Category]' : cat}
                </option>
              ))}
            </select>

            {/* Payment Method Filter */}
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="filter-select"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm === 'All Payment Methods' ? '' : pm}>
                  {pm === 'All Payment Methods' ? '[Payment Method]' : pm}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-');
                setSortBy(sb);
                setOrder(ord);
              }}
              className="filter-select"
            >
              <option value="date-desc">Newest Date</option>
              <option value="date-asc">Oldest Date</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>

          {/* Add New Expense Button */}
          <button
            type="button"
            className="btn-add-expense"
            onClick={() => {
              setSelectedExpense(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Add New Expense</span>
          </button>
        </div>

        {/* Expenses Data Table (Matching Image 3) */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <p>Loading expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <p>No matching expenses found.</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>[Title]</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp._id}>
                    <td style={{ fontWeight: 600 }}>{exp.title}</td>
                    <td>
                      <span className="category-tag">{exp.category}</span>
                    </td>
                    <td>{formatDate(exp.date)}</td>
                    <td style={{ fontWeight: 700 }}>
                      ₹{Number(exp.amount).toFixed(2)}
                    </td>
                    <td>
                      <span className="status-badge status-paid">{exp.paymentMethod}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-action-icon"
                          title="Edit Expense"
                          onClick={() => handleEdit(exp)}
                        >
                          <Edit2 size={17} />
                        </button>
                        <button
                          type="button"
                          className="btn-action-icon delete"
                          title="Delete Expense"
                          onClick={() => handleDeletePrompt(exp)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar (Matching Image 3) */}
        {pagination.totalPages > 1 && (
          <div className="pagination-bar">
            <button
              type="button"
              className="btn-page"
              disabled={pagination.page <= 1}
              onClick={() => fetchExpenseData(pagination.page - 1)}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`btn-page ${pageNum === pagination.page ? 'active' : ''}`}
                onClick={() => fetchExpenseData(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              className="btn-page"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchExpenseData(pagination.page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <ExpenseModal
          isOpen={isModalOpen}
          initialData={selectedExpense}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedExpense(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedExpense(null);
            fetchExpenseData(pagination.page);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <DeleteDialog
          isOpen={isDeleteOpen}
          expenseTitle={expenseToDelete?.title}
          expenseAmount={expenseToDelete?.amount}
          loading={deleteLoading}
          onClose={() => {
            setIsDeleteOpen(false);
            setExpenseToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default Expenses;
