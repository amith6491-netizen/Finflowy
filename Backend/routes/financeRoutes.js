import express from 'express';
import { 
  getTransactions, 
  createTransaction,
  deleteTransaction,
  getGoals, 
  createGoal, 
  getFinancialInsights,
  getGoalPrediction,
  getSpendingPatterns,
  getBudgetRecommendations,
  getExpenseForecast
} from '../controllers/financeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/transactions')
  .get(getTransactions)
  .post(createTransaction);

router.route('/transactions/:id')
  .delete(deleteTransaction);

router.route('/goals')
  .get(getGoals)
  .post(createGoal);

router.get('/insights', getFinancialInsights);
router.get('/insights/forecast', getExpenseForecast);
router.get('/insights/spending-patterns', getSpendingPatterns);
router.get('/insights/budget-recommendation', getBudgetRecommendations);
router.get('/goals/:id/predict', getGoalPrediction);

export default router;
