const express = require('express');
const { body, check } = require("express-validator");

const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.get('/reset', authController.getReset);
router.get('/detail-user/new-password', isAuth, authController.getNewPassword);

router.post('/login', authController.postLogin);
router.post('/signup',
[
  body("userName", " Tên người dùng phải từ 3 kỳ tự trở lên")
      .isString()
      .isLength({ min: 3 })
      .trim(),
  check('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body("numberPhone", " Số điện thoại không hợp lệ")
    .isNumeric()
    .isLength({ min: 10, max: 10})
], authController.postSignup);

router.post('/reset', authController.postReset);
router.post('/logout', authController.postLogout);
router.post('/detail-user/new-password',
[
  body("password").custom((value, { req }) => {
    if (value === req.body.newPassword) {
      throw new Error('Mật khẩu mới không thể trùng với mật khẩu hiện tại');
    }
    return true
}),
  body("newPassword", 'Mật khẩu phải từ 8 đến 12 ký tự').isLength({ min: 8,  max: 12}).isAlphanumeric(),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Mật khẩu nhập lại không khớp với mật khẩu mới');
    }
    return true
})
], isAuth, authController.postNewPassword);

module.exports = router;