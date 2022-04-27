const express = require('express');

const charityController = require('../controllers/charity')

const router = express.Router();

router.get('/', charityController.getIndex)
router.get('/detail-project', charityController.getDetailProject)
router.get('/detail-user', charityController.getDetailUser)

module.exports = router;