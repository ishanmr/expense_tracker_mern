const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  logout,
} = require('../controllers/authController');
const {
  registerValidator,
  loginValidator,
} = require('../validators/authValidator');
const validate = require('../middleware/validateMiddleware');
const authenticate = require('../middleware/authMiddleware');

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);

module.exports = router;
