const express = require('express');
const { body, check } = require("express-validator");

const charityController = require('../controllers/charity')
const isAuthBackHistory = require('../middleware/is-auth-backHistory');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', charityController.getIndex)
router.get('/detail-project/:id',  charityController.getDetailProject)
router.get('/detail-user', isAuth, charityController.getDetailUser)
router.get('/detail-user/donate', isAuth, charityController.getDonateUser)
router.get('/pay', isAuth, charityController.getPaySuccess)

router.post('/', charityController.postIndex)
router.post('/detail-project', isAuthBackHistory, charityController.postDetailProject)
router.post('/pay', isAuthBackHistory, charityController.postPay)
router.post('/detail-user',
[
  body("numberPhone", " Số điện thoại không hợp lệ")
    .isNumeric()
    .isLength({ min: 10, max: 10})
], isAuth, charityController.postDetailUser)

module.exports = router;