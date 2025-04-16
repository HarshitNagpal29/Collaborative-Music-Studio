const express = require('express');
const router = express.Router();
const compositionController = require('../controllers/compositionController');

router.get('/', compositionController.getPublicCompositions);
router.get('/:id', compositionController.getCompositionById);
router.post('/', compositionController.createComposition);
router.put('/:id', compositionController.updateComposition);
router.delete('/:id', compositionController.deleteComposition);

module.exports = router;