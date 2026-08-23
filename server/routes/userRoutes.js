const express = require('express');
const { registerUser, loginUser, getUserById } = require('../controllers/userController');
const authMiddlewares = require('../middleware/authMiddlewares');
const router = express.Router();

router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/getUserById',authMiddlewares,getUserById);

module.exports = router;