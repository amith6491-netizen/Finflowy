import Transaction from '../models/Transaction.js';
import Goal from '../models/Goal.js';
import axios from 'axios';

// In Docker: ML_API_URL=http://ml-service:5001/api/ml (set in docker-compose)
// In local dev: falls back to localhost:5001
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001/api/ml';

// ── Helper ────────────────────────────────────────────────────────────────────
const getUserTransactions = async (userId) => {
  return await Transaction.find({ user: userId });
};

// @desc    Get all transactions for user
// @route   GET /api/finance/transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a transaction
// @route   POST /api/finance/transactions
export const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, date, description } = req.body;
    const transaction = await Transaction.create({
      user: req.user._id,
      amount,
      type,
      category,
      date,
      description
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/finance/transactions/:id
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorised' });
    }
    await transaction.deleteOne();
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ML Model 2 — IsolationForest behavior analysis & alerts
// @route   GET /api/finance/insights
export const getFinancialInsights = async (req, res) => {
  try {
    const transactions = await getUserTransactions(req.user._id);
    const mlResponse = await axios.post(`${ML_API_URL}/behavior-analysis`, {
      userId: req.user._id.toString(),
      transactions
    });
    res.json(mlResponse.data);
  } catch (error) {
    console.error('ML behavior-analysis error:', error.message);
    res.status(500).json({ message: 'Error fetching AI insights' });
  }
};

// @desc    ML Model 1 — LinearRegression expense forecast
// @route   GET /api/finance/insights/forecast
export const getExpenseForecast = async (req, res) => {
  try {
    const transactions = await getUserTransactions(req.user._id);
    const mlResponse = await axios.post(`${ML_API_URL}/predict-expense`, {
      userId: req.user._id.toString(),
      transactions
    });
    res.json(mlResponse.data);
  } catch (error) {
    console.error('ML predict-expense error:', error.message);
    res.status(500).json({ message: 'Error fetching expense forecast' });
  }
};

// @desc    ML Model 4 — KMeans spending pattern clustering
// @route   GET /api/finance/insights/spending-patterns
export const getSpendingPatterns = async (req, res) => {
  try {
    const transactions = await getUserTransactions(req.user._id);
    const mlResponse = await axios.post(`${ML_API_URL}/spending-patterns`, {
      userId: req.user._id.toString(),
      transactions
    });
    res.json(mlResponse.data);
  } catch (error) {
    console.error('ML spending-patterns error:', error.message);
    res.status(500).json({ message: 'Error fetching spending patterns' });
  }
};

// @desc    ML Model 5 — Ridge budget recommendation
// @route   GET /api/finance/insights/budget-recommendation
export const getBudgetRecommendations = async (req, res) => {
  try {
    const transactions = await getUserTransactions(req.user._id);
    const mlResponse = await axios.post(`${ML_API_URL}/budget-recommendation`, {
      userId: req.user._id.toString(),
      transactions
    });
    res.json(mlResponse.data);
  } catch (error) {
    console.error('ML budget-recommendation error:', error.message);
    res.status(500).json({ message: 'Error fetching budget recommendations' });
  }
};

// @desc    Get Goals
// @route   GET /api/finance/goals
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ priorityWeight: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Goal
// @route   POST /api/finance/goals
export const createGoal = async (req, res) => {
  try {
    const { name, targetAmount, deadline, priorityWeight } = req.body;
    const goal = await Goal.create({
      user: req.user._id,
      name,
      targetAmount,
      deadline,
      priorityWeight
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ML Model 3 — GradientBoostingRegressor goal achievement prediction
// @route   GET /api/finance/goals/:id/predict
export const getGoalPrediction = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal || goal.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    const transactions = await getUserTransactions(req.user._id);
    const mlResponse = await axios.post(`${ML_API_URL}/goal-prediction`, {
      goal,
      history: transactions
    });
    goal.probability = mlResponse.data.probability;
    await goal.save();
    res.json({ goal, prediction: mlResponse.data });
  } catch (error) {
    console.error('ML goal-prediction error:', error.message);
    res.status(500).json({ message: 'Error predicting goal trajectory' });
  }
};
