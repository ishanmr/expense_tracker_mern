const mongoose = require('mongoose');
const { Expense } = require('../models/Expense');

// Dashboard summary aggregation
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { startDate, endDate } = req.query;

    // Filter match object for the selected period
    const matchPeriod = { user: userId };
    if (startDate || endDate) {
      matchPeriod.date = {};
      if (startDate) {
        matchPeriod.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchPeriod.date.$lte = end;
      }
    }

    // Current month boundaries
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Parallel aggregations for performance
    const [periodStats, currentMonthStats, categoryBreakdown, recentExpenses] = await Promise.all([
      // 1. Overall / Period summary (total, count, avg)
      Expense.aggregate([
        { $match: matchPeriod },
        {
          $group: {
            _id: null,
            totalExpenses: { $sum: '$amount' },
            totalRecords: { $sum: 1 },
            averageExpense: { $avg: '$amount' },
          },
        },
      ]),

      // 2. Current calendar month spending
      Expense.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
          },
        },
        {
          $group: {
            _id: null,
            monthlyExpenses: { $sum: '$amount' },
          },
        },
      ]),

      // 3. Category breakdown for the selected period
      Expense.aggregate([
        { $match: matchPeriod },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
        {
          $project: {
            _id: 0,
            category: '$_id',
            total: { $round: ['$total', 2] },
            count: 1,
          },
        },
      ]),

      // 4. Latest 5 expenses
      Expense.find({ user: userId })
        .sort({ date: -1, createdAt: -1 })
        .limit(5)
        .select('_id title amount category paymentMethod date description'),
    ]);

    const periodTotal = periodStats[0]?.totalExpenses || 0;
    const periodCount = periodStats[0]?.totalRecords || 0;
    const periodAverage = periodStats[0]?.averageExpense || 0;
    const monthlyTotal = currentMonthStats[0]?.monthlyExpenses || 0;

    res.status(200).json({
      success: true,
      data: {
        totalExpenses: Math.round(periodTotal * 100) / 100,
        totalRecords: periodCount,
        averageExpense: Math.round(periodAverage * 100) / 100,
        monthlyExpenses: Math.round(monthlyTotal * 100) / 100,
        categoryBreakdown,
        recentExpenses,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
};
