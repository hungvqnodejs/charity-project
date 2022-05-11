const express = require('express');

const charityController = require('../controllers/charity')

const router = express.Router();

router.get('/', charityController.getIndex)
router.get('/detail-project/:id', charityController.getDetailProject)
router.get('/detail-user', charityController.getDetailUser)

router.post('/detail-project', charityController.postDetailProject)

module.exports = router;