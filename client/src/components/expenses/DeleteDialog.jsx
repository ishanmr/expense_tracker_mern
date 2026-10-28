const DeleteDialog = ({ isOpen, onClose, onConfirm, expenseTitle, expenseAmount, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-body" style={{ padding: '2rem' }}>
          <div className="delete-dialog-content">
            <h3 className="delete-dialog-title">Delete Expense Record?</h3>
            <p className="delete-dialog-message">
              Are you sure you want to permanently remove this expense? This action cannot be undone.
            </p>
            {expenseTitle && (
              <div className="delete-dialog-highlight">
                "{expenseTitle}" — ₹{Number(expenseAmount || 0).toFixed(2)}
              </div>
            )}
          </div>

          <div className="modal-actions" style={{ justifyContent: 'center' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="button" className="btn-danger" onClick={onConfirm} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete Expense'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteDialog;
