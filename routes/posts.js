const express = require('express');
const postController = require('../controllers/postsController');

const router = express.Router();

router.post('/', postController.createPost);
router.get('/:id', postController.getPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);
router.put('/:id/like', postController.likePost);
router.get('/:id/timeline', postController.getTimeLinePosts);


module.exports = router;
