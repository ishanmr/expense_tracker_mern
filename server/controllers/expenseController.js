const { Expense } = require('../models/Expense');
const ApiError = require('../utils/ApiError');

// Create a new expense
const createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, description, paymentMethod, date } = req.body;

    const expense = await Expense.create({
      title,
      amount,
      category,
      description: description || '',
      paymentMethod,
      date,
      user: req.user._id, // Enforce ownership from verified JWT
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// List expenses with pagination, filtering, search, sorting
const getExpenses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      paymentMethod,
      startDate,
      endDate,
      search,
      sortBy = 'date',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query strictly scoped to current authenticated user
    const query = { user: req.user._id };

    if (category) {
      query.category = category;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of the day if just a date string is provided
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search && search.trim() !== '') {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: sanitized, $options: 'i' } },
        { description: { $regex: sanitized, $options: 'i' } },
      ];
    }

    // Sorting
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOption = { [sortBy]: sortOrder };

    const [expenses, totalRecords] = await Promise.all([
      Expense.find(query).sort(sortOption).skip(skip).limit(limitNum),
      Expense.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalRecords / limitNum);

    res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single expense
const getExpenseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findOne({ _id: id, user: req.user._id });
    if (!expense) {
      return next(ApiError.notFound('Expense not found or access denied'));
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// Update expense
const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, amount, category, description, paymentMethod, date } = req.body;

    const expense = await Expense.findOne({ _id: id, user: req.user._id });
    if (!expense) {
      return next(ApiError.notFound('Expense not found or access denied'));
    }

    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = description;
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;
    if (date !== undefined) expense.date = date;

    await expense.save();

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// Delete expense
const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findOneAndDelete({ _id: id, user: req.user._id });
    if (!expense) {
      return next(ApiError.notFound('Expense not found or access denied'));
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
