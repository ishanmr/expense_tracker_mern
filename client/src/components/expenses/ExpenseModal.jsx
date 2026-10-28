import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { createExpense, updateExpense } from '../../api/expenses.api';

const CATEGORIES = [
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
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Net Banking',
  'Bank Transfer',
  'Other',
];

const getTodayString = () => new Date().toISOString().split('T')[0];

const ExpenseModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState(() => ({
    title: initialData?.title || '',
    category: initialData?.category || 'Food',
    date: initialData?.date
      ? new Date(initialData.date).toISOString().split('T')[0]
      : getTodayString(),
    amount: initialData?.amount || '',
    paymentMethod: initialData?.paymentMethod || 'UPI',
    description: initialData?.description || '',
  }));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide an expense title.');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }
    if (!formData.category) {
      setError('Please select a category.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };

      if (isEditing) {
        await updateExpense(initialData._id, payload);
      } else {
        await createExpense(payload);
      }

      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save expense record.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? 'Edit Expense Record' : 'Add New Expense Record'}
          </h2>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="auth-alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Expense Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Client Meeting Lunch"
              className="form-input"
              style={{ paddingLeft: '1rem' }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-input"
              style={{ paddingLeft: '1rem' }}
              required
            >
              <option value="" disabled>Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="modal-row-two">
            <div className="form-group">
              <label className="form-label">Expense Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="45.00"
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="form-input"
              style={{ paddingLeft: '1rem' }}
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional details..."
              rows={3}
              className="form-input"
              style={{ paddingLeft: '1rem', resize: 'vertical' }}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-save-modal" disabled={loading}>
              <Check size={18} />
              <span>{loading ? 'Saving...' : 'Save Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
