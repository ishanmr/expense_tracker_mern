const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const { getDashboardSummary } = require('../controllers/dashboardController');
const {
  expenseCreateValidator,
  expenseUpdateValidator,
  expenseIdValidator,
  expenseListQueryValidator,
} = require('../validators/expenseValidator');
const validate = require('../middleware/validateMiddleware');
const authenticate = require('../middleware/authMiddleware');

// All expense routes require authentication
router.use(authenticate);

// Dashboard summary endpoint (must be placed before /:id)
router.get('/summary', getDashboardSummary);

// CRUD endpoints
router.post('/', expenseCreateValidator, validate, createExpense);
router.get('/', expenseListQueryValidator, validate, getExpenses);
router.get('/:id', expenseIdValidator, validate, getExpenseById);
router.put('/:id', expenseUpdateValidator, validate, updateExpense);
router.delete('/:id', expenseIdValidator, validate, deleteExpense);

module.exports = router;
