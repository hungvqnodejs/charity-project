const express = require('express');

const adminController = require('../controllers/admin')

const router = express.Router();

router.get('/', adminController.dashboard)
router.get('/list-user', adminController.getListUser)
router.get('/list-project', adminController.getListProject)
router.get('/detail-user', adminController.getDetailUser)
router.get('/add-project', adminController.getAddProject)


module.exports = router;