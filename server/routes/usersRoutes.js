const express = require('express');
const router = express.Router({ mergeParams: true });
const { getAllUsers, createUser } = require('../controllers/UsersController');
const { protect } = require('../middleware/auth');

router.route('/')
    .get(protect, getAllUsers);
router.route('/create')
    .post(createUser);

module.exports = router;
