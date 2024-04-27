const express = require('express');
let User = require('../models/user');
const userController = require('../controllers/userController');
const { authMiddleWare } = require("../middleware/AuthMiddleware");

const fs = require('fs');

const router = express.Router();

router.get('/:id', userController.getUser);
router.get('/', userController.getAllUsers)
router.put('/:id',authMiddleWare, userController.updateUser);
router.delete('/:id',authMiddleWare, userController.deleteUser);
router.put('/:id/follow',authMiddleWare, userController.followUser);
router.put('/:id/unfollow',authMiddleWare, userController.unfollowUser);

module.exports = router;
